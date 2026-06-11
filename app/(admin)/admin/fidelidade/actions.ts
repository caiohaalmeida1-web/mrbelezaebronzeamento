"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Regras do programa (500 pontos = R$30). Arquivos "use server"
// só podem exportar funções async, por isso ficam locais.
const PONTOS_RESGATE = 500;
const VALOR_RESGATE_REAIS = 30;

async function isAdmin(): Promise<boolean> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return profile?.role === "admin";
}

/**
 * Resgata 500 pontos = R$30 de desconto para a cliente.
 * O débito é atômico no banco (função resgatar_pontos) e
 * falha se o saldo for insuficiente — saldo nunca fica negativo.
 */
export async function resgatarPontos(clienteId: string) {
  if (!(await isAdmin())) return { ok: false, erro: "Sem permissão" };

  const admin = createAdminClient();
  const { data: sucesso, error } = await admin.rpc("resgatar_pontos", {
    p_cliente_id: clienteId,
    p_pontos: PONTOS_RESGATE,
    p_descricao: `Resgate: R$${VALOR_RESGATE_REAIS} de desconto`,
  });

  if (error) {
    console.error("[fidelidade] resgate erro", error);
    return { ok: false, erro: "Erro ao resgatar. Tente novamente." };
  }
  if (!sucesso) {
    return { ok: false, erro: "Saldo de pontos insuficiente." };
  }

  revalidatePath("/admin/fidelidade");
  revalidatePath("/cliente/pontos");
  return {
    ok: true,
    message: `Resgate feito! Aplique R$${VALOR_RESGATE_REAIS} de desconto na sessão.`,
  };
}
