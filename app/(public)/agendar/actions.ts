"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";
import { sendAgendamentoConfirmation } from "@/lib/resend";
import { SITE_CONFIG, formatDateTimeBR } from "@/lib/utils";

const AgendarSchema = z.object({
  servico_id: z.string().uuid(),
  data_hora: z.string().datetime(),
  nome: z.string().min(2),
  email: z.string().email(),
  telefone: z.string().min(8),
  observacoes: z.string().optional(),
  codigo_afiliado: z.string().optional(),
});

export type AgendarState = {
  ok: boolean;
  message?: string;
  agendamentoId?: string;
  clientSecret?: string;
  desconto?: number;
};

/**
 * Cria um Agendamento (status pendente) e o PaymentIntent do Stripe.
 *
 * O flow padrão:
 *  1. Validar input
 *  2. Conferir slot livre (corrida)
 *  3. Aplicar desconto da 5ª sessão se aplicável
 *  4. Criar registro `agendamentos` com status='pendente'
 *  5. Criar PaymentIntent Stripe e devolver client_secret
 */
export async function criarAgendamento(
  formData: FormData
): Promise<AgendarState> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = AgendarSchema.safeParse(raw);

  if (!parsed.success) {
    return { ok: false, message: "Dados inválidos." };
  }

  const supabase = createClient();
  const admin = createAdminClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Garante perfil — para guests cria sob demanda via admin client
  let clienteId = user?.id ?? null;

  if (!clienteId) {
    const { data: existente } = await admin
      .from("profiles")
      .select("id")
      .eq("email", parsed.data.email)
      .maybeSingle();

    if (existente) {
      clienteId = existente.id;
    } else {
      // Convidada: cria um auth user "shadow" via admin (sem senha)
      const { data: created, error: createErr } =
        await admin.auth.admin.createUser({
          email: parsed.data.email,
          email_confirm: false,
          user_metadata: { full_name: parsed.data.nome },
        });
      if (createErr || !created.user) {
        return {
          ok: false,
          message: "Não conseguimos criar sua conta. Faça login e tente novamente.",
        };
      }
      clienteId = created.user.id;
      // O trigger handle_new_user já criou o profile.
      await admin
        .from("profiles")
        .update({ phone: parsed.data.telefone })
        .eq("id", clienteId);
    }
  }

  // Confere slot livre (anti-corrida)
  const { data: conflito } = await admin
    .from("agendamentos")
    .select("id")
    .eq("data_hora", parsed.data.data_hora)
    .in("status", ["pendente", "confirmado"])
    .maybeSingle();

  if (conflito) {
    return {
      ok: false,
      message:
        "Esse horário acabou de ser reservado por outra cliente. Escolha outro.",
    };
  }

  // Busca preço e duração do serviço
  const { data: servico } = await admin
    .from("servicos")
    .select("nome, preco, duracao_minutos")
    .eq("id", parsed.data.servico_id)
    .maybeSingle();

  if (!servico) return { ok: false, message: "Serviço não encontrado." };

  // Verifica desconto da 5ª sessão
  let preco = Number(servico.preco);
  let desconto = 0;

  if (clienteId) {
    const { data: profile } = await admin
      .from("profiles")
      .select("total_sessoes")
      .eq("id", clienteId)
      .maybeSingle();
    if (profile && (profile.total_sessoes + 1) % 5 === 0) {
      desconto = preco * 0.2;
      preco = preco - desconto;
    }
  }

  // Cria agendamento (pendente)
  const { data: agend, error: agendErr } = await admin
    .from("agendamentos")
    .insert({
      cliente_id: clienteId,
      servico_id: parsed.data.servico_id,
      data_hora: parsed.data.data_hora,
      status: "pendente",
      valor_pago: preco,
      observacoes: parsed.data.observacoes ?? null,
      codigo_afiliado: parsed.data.codigo_afiliado ?? null,
    })
    .select("id")
    .single();

  if (agendErr || !agend) {
    console.error("[agendamento] criar erro", agendErr);
    return { ok: false, message: "Não foi possível criar o agendamento." };
  }

  // Cria PaymentIntent Stripe
  let clientSecret: string | undefined;
  if (process.env.STRIPE_SECRET_KEY) {
    try {
      const stripe = getStripe();
      const intent = await stripe.paymentIntents.create({
        amount: Math.round(preco * 100),
        currency: "brl",
        payment_method_types: ["card"],
        description: `${servico.nome} — ${formatDateTimeBR(parsed.data.data_hora)}`,
        metadata: {
          agendamento_id: agend.id,
          cliente_email: parsed.data.email,
        },
      });
      clientSecret = intent.client_secret ?? undefined;
      await admin
        .from("agendamentos")
        .update({ stripe_payment_intent: intent.id })
        .eq("id", agend.id);
    } catch (e) {
      console.error("[agendamento] stripe erro", e);
    }
  }

  return {
    ok: true,
    agendamentoId: agend.id,
    clientSecret,
    desconto,
    message: "Agendamento criado. Finalize o pagamento.",
  };
}

/**
 * Após pagamento confirmado pelo Stripe webhook, dispara confirmação por e-mail.
 */
export async function confirmarAgendamento(agendamentoId: string) {
  const admin = createAdminClient();
  const { data: agend } = await admin
    .from("agendamentos")
    .select("data_hora, servico_id, cliente_id")
    .eq("id", agendamentoId)
    .single();

  if (!agend?.cliente_id) return;

  await admin
    .from("agendamentos")
    .update({ status: "confirmado" })
    .eq("id", agendamentoId);

  const { data: cliente } = await admin
    .from("profiles")
    .select("full_name, email")
    .eq("id", agend.cliente_id)
    .maybeSingle();

  const { data: servico } = await admin
    .from("servicos")
    .select("nome")
    .eq("id", agend.servico_id)
    .maybeSingle();

  if (!cliente?.email) {
    console.warn("[email confirmacao] e-mail do cliente ausente — envio ignorado", {
      agendamentoId,
      clienteId: agend.cliente_id,
    });
  } else if (!process.env.RESEND_API_KEY) {
    console.warn(
      "[email confirmacao] RESEND_API_KEY não configurada — envio ignorado",
      { agendamentoId, email: cliente.email }
    );
  } else {
    try {
      const result = await sendAgendamentoConfirmation(cliente.email, {
        nomeCliente: cliente.full_name,
        servico: servico?.nome ?? "Sessão",
        dataHora: formatDateTimeBR(agend.data_hora),
        endereco: SITE_CONFIG.address,
      });
      console.log("[email confirmacao] concluído", {
        agendamentoId,
        email: cliente.email,
        messageId: result.data?.id ?? null,
      });
    } catch (e) {
      console.error("[email confirmacao] falha ao enviar", {
        agendamentoId,
        email: cliente.email,
        error:
          e instanceof Error
            ? { name: e.name, message: e.message, stack: e.stack }
            : e,
      });
    }
  }

  revalidatePath("/cliente/agendamentos");
}

/**
 * Cancela um agendamento se houver mais de 24h até a data.
 * Reembolso integral via Stripe.
 */
export async function cancelarAgendamento(agendamentoId: string) {
  const supabase = createClient();
  const admin = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Faça login para cancelar." };

  const { data: agend } = await admin
    .from("agendamentos")
    .select("data_hora, cliente_id, status, stripe_payment_intent, valor_pago")
    .eq("id", agendamentoId)
    .single();

  if (!agend) return { ok: false, message: "Agendamento não encontrado." };
  if (agend.cliente_id !== user.id) {
    return { ok: false, message: "Você não pode cancelar esse agendamento." };
  }
  if (agend.status === "cancelado" || agend.status === "concluido") {
    return { ok: false, message: "Esse agendamento já foi finalizado." };
  }

  const data = new Date(agend.data_hora);
  const horasAte = (data.getTime() - Date.now()) / (1000 * 60 * 60);

  if (horasAte < 24) {
    return {
      ok: false,
      message:
        "Cancelamentos com menos de 24h não têm reembolso. Para reagendar, fale no WhatsApp.",
    };
  }

  if (agend.stripe_payment_intent && process.env.STRIPE_SECRET_KEY) {
    try {
      const stripe = getStripe();
      await stripe.refunds.create({
        payment_intent: agend.stripe_payment_intent,
      });
    } catch (e) {
      console.error("[cancelamento] reembolso erro", e);
    }
  }

  await admin
    .from("agendamentos")
    .update({ status: "cancelado" })
    .eq("id", agendamentoId);

  revalidatePath("/cliente/agendamentos");
  return {
    ok: true,
    message: "Agendamento cancelado. O reembolso aparece em até 5 dias úteis.",
  };
}
