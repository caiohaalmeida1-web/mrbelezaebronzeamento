"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";

const ItemSchema = z.object({
  id: z.string(),
  quantidade: z.number().int().min(1),
});

const FinalizarSchema = z.object({
  itens: z.array(ItemSchema).min(1),
  endereco: z
    .object({
      cep: z.string(),
      rua: z.string(),
      numero: z.string(),
      complemento: z.string().optional(),
      bairro: z.string(),
      cidade: z.string(),
      estado: z.string(),
    })
    .optional(),
  email: z.string().email(),
  nome: z.string(),
});

export type FinalizarState = {
  ok: boolean;
  message?: string;
  pedidoId?: string;
  clientSecret?: string;
};

export async function finalizarPedido(
  payload: z.infer<typeof FinalizarSchema>
): Promise<FinalizarState> {
  const parsed = FinalizarSchema.safeParse(payload);
  if (!parsed.success)
    return { ok: false, message: "Dados do pedido inválidos." };

  const supabase = createClient();
  const admin = createAdminClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Busca produtos para conferir estoque e preço
  const ids = parsed.data.itens.map((i) => i.id);
  const { data: produtosDb } = await admin
    .from("produtos")
    .select("id, nome, preco, estoque, tipo, disponivel_venda")
    .in("id", ids)
    .eq("ativo", true);

  if (!produtosDb || produtosDb.length === 0) {
    return { ok: false, message: "Produtos não encontrados." };
  }

  let total = 0;
  const itensCalculados: { produto_id: string; quantidade: number; preco_unitario: number }[] = [];

  for (const item of parsed.data.itens) {
    const prod = produtosDb.find((p) => p.id === item.id);
    if (!prod) return { ok: false, message: "Produto inválido." };
    if (!prod.disponivel_venda) {
      return {
        ok: false,
        message: `${prod.nome} não está disponível para venda online.`,
      };
    }
    if (prod.tipo === "fisico" && prod.estoque < item.quantidade) {
      return { ok: false, message: `Estoque insuficiente: ${prod.nome}` };
    }
    total += Number(prod.preco) * item.quantidade;
    itensCalculados.push({
      produto_id: prod.id,
      quantidade: item.quantidade,
      preco_unitario: Number(prod.preco),
    });
  }

  // Cria pedido
  const { data: pedido, error: pedErr } = await admin
    .from("pedidos")
    .insert({
      cliente_id: user?.id ?? null,
      status: "pendente",
      valor_total: total,
      endereco_entrega: parsed.data.endereco ?? null,
    })
    .select("id")
    .single();

  if (pedErr || !pedido) {
    console.error("[checkout] criar pedido", pedErr);
    return { ok: false, message: "Não foi possível criar o pedido." };
  }

  await admin.from("pedido_itens").insert(
    itensCalculados.map((i) => ({
      pedido_id: pedido.id,
      ...i,
    }))
  );

  let clientSecret: string | undefined;
  if (process.env.STRIPE_SECRET_KEY) {
    try {
      const stripe = getStripe();
      const intent = await stripe.paymentIntents.create({
        amount: Math.round(total * 100),
        currency: "brl",
        payment_method_types: ["card"],
        metadata: {
          pedido_id: pedido.id,
          cliente_email: parsed.data.email,
        },
      });
      clientSecret = intent.client_secret ?? undefined;
      await admin
        .from("pedidos")
        .update({ stripe_payment_intent: intent.id })
        .eq("id", pedido.id);
    } catch (e) {
      console.error("[checkout] stripe", e);
    }
  }

  return { ok: true, pedidoId: pedido.id, clientSecret };
}
