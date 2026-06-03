"use server";

import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendContactNotification } from "@/lib/resend";

const ContatoSchema = z.object({
  nome: z.string().min(2, "Nome muito curto"),
  email: z.string().email("E-mail inválido"),
  telefone: z.string().optional(),
  mensagem: z.string().min(10, "Conte um pouco mais para a gente"),
});

export type ContatoState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export async function enviarContato(
  _prev: ContatoState,
  formData: FormData
): Promise<ContatoState> {
  const raw = {
    nome: String(formData.get("nome") ?? ""),
    email: String(formData.get("email") ?? ""),
    telefone: String(formData.get("telefone") ?? "") || undefined,
    mensagem: String(formData.get("mensagem") ?? ""),
  };

  const parsed = ContatoSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Verifique os campos abaixo.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const supabase = createAdminClient();
    await supabase.from("email_lista").upsert(
      {
        email: parsed.data.email,
        nome: parsed.data.nome,
        origem: "cadastro",
      },
      { onConflict: "email" }
    );

    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail && process.env.RESEND_API_KEY) {
      await sendContactNotification(adminEmail, parsed.data);
    }

    return {
      ok: true,
      message: "Mensagem enviada! Em breve entramos em contato.",
    };
  } catch (e) {
    console.error("[contato] erro", e);
    return {
      ok: false,
      message:
        "Não conseguimos enviar agora. Por favor, tente o WhatsApp ou tente novamente.",
    };
  }
}
