"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/** Retorna o client autenticado se o usuário logado for admin. */
async function clientAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return profile?.role === "admin" ? supabase : null;
}

export async function marcarConcluido(agendamentoId: string) {
  const supabase = await clientAdmin();
  if (!supabase) return { ok: false };

  await supabase
    .from("agendamentos")
    .update({ status: "concluido" })
    .eq("id", agendamentoId);

  revalidatePath("/admin/agendamentos");
  revalidatePath("/admin/dashboard");
  return { ok: true };
}

export async function marcarNoShow(agendamentoId: string) {
  const supabase = await clientAdmin();
  if (!supabase) return { ok: false };

  await supabase
    .from("agendamentos")
    .update({ status: "no_show" })
    .eq("id", agendamentoId);
  revalidatePath("/admin/agendamentos");
  return { ok: true };
}
