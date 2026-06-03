"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function marcarConcluido(agendamentoId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") return { ok: false };

  await supabase
    .from("agendamentos")
    .update({ status: "concluido" })
    .eq("id", agendamentoId);

  revalidatePath("/admin/agendamentos");
  revalidatePath("/admin/dashboard");
  return { ok: true };
}

export async function marcarNoShow(agendamentoId: string) {
  const supabase = createClient();
  await supabase
    .from("agendamentos")
    .update({ status: "no_show" })
    .eq("id", agendamentoId);
  revalidatePath("/admin/agendamentos");
  return { ok: true };
}
