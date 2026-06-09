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

function revalidarGaleria() {
  revalidatePath("/");
  revalidatePath("/admin/galeria");
}

export async function registrarFoto(input: {
  titulo: string | null;
  storagePath: string;
}) {
  const supabase = await clientAdmin();
  if (!supabase) return { ok: false, erro: "Sem permissão" };

  const {
    data: { publicUrl },
  } = supabase.storage.from("galeria").getPublicUrl(input.storagePath);

  const { error } = await supabase.from("galeria_fotos").insert({
    titulo: input.titulo,
    imagem_url: publicUrl,
    storage_path: input.storagePath,
  });

  if (error) return { ok: false, erro: error.message };
  revalidarGaleria();
  return { ok: true };
}

export async function excluirFoto(id: string) {
  const supabase = await clientAdmin();
  if (!supabase) return { ok: false, erro: "Sem permissão" };

  const { data: foto } = await supabase
    .from("galeria_fotos")
    .select("storage_path")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("galeria_fotos").delete().eq("id", id);
  if (error) return { ok: false, erro: error.message };

  if (foto?.storage_path) {
    await supabase.storage.from("galeria").remove([foto.storage_path]);
  }

  revalidarGaleria();
  return { ok: true };
}

export async function alternarFoto(id: string, ativo: boolean) {
  const supabase = await clientAdmin();
  if (!supabase) return { ok: false, erro: "Sem permissão" };

  const { error } = await supabase
    .from("galeria_fotos")
    .update({ ativo })
    .eq("id", id);

  if (error) return { ok: false, erro: error.message };
  revalidarGaleria();
  return { ok: true };
}
