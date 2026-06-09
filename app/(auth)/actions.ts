"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const CadastroSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Mínimo 8 caracteres"),
  full_name: z.string().min(2),
  phone: z.string().optional(),
});

export type AuthState = {
  ok: boolean;
  message?: string;
};

export async function login(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { ok: false, message: "Dados inválidos." };

  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return { ok: false, message: "E-mail ou senha incorretos." };
  }

  let next = formData.get("next") as string | null;

  if (!next) {
    // Admin vai direto para o painel; cliente para a área pessoal
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .maybeSingle();

    next =
      profile?.role === "admin" ? "/admin/dashboard" : "/cliente/dashboard";
  }

  redirect(next);
}

export async function cadastrar(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const parsed = CadastroSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    full_name: formData.get("full_name"),
    phone: formData.get("phone") || undefined,
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.errors[0]?.message ?? "Dados inválidos.",
    };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.full_name,
        phone: parsed.data.phone,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/cliente/dashboard`,
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already")) {
      return {
        ok: false,
        message: "Esse e-mail já está cadastrado. Faça login.",
      };
    }
    return { ok: false, message: error.message };
  }

  redirect("/cliente/dashboard");
}

export async function sair() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/");
}
