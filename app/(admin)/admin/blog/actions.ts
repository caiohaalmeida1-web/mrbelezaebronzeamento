"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";

export interface PostInput {
  id?: string | null;
  titulo: string;
  slug: string;
  resumo: string;
  conteudo: string;
  imagem_capa: string | null;
  tags: string[];
  meta_title: string;
  meta_description: string;
  publicado: boolean;
}

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

function revalidarBlog(slug: string) {
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/admin/blog");
}

export async function salvarPost(input: PostInput) {
  const supabase = await clientAdmin();
  if (!supabase) return { ok: false, erro: "Sem permissão" };

  if (!input.titulo.trim()) return { ok: false, erro: "Informe o título." };
  if (!input.conteudo.trim()) return { ok: false, erro: "Escreva o conteúdo." };

  const slug = slugify(input.slug || input.titulo);

  const payload = {
    titulo: input.titulo.trim(),
    slug,
    resumo: input.resumo.trim() || null,
    conteudo: input.conteudo,
    imagem_capa: input.imagem_capa,
    tags: input.tags.length > 0 ? input.tags : null,
    meta_title: input.meta_title.trim() || null,
    meta_description: input.meta_description.trim() || null,
    publicado: input.publicado,
  };

  if (input.id) {
    const { data: atual } = await supabase
      .from("blog_posts")
      .select("publicado_em")
      .eq("id", input.id)
      .maybeSingle();

    const { error } = await supabase
      .from("blog_posts")
      .update({
        ...payload,
        // Define a data de publicação na primeira vez que o post é publicado
        publicado_em:
          input.publicado && !atual?.publicado_em
            ? new Date().toISOString()
            : atual?.publicado_em ?? null,
      })
      .eq("id", input.id);

    if (error) return { ok: false, erro: error.message };
  } else {
    const { error } = await supabase.from("blog_posts").insert({
      ...payload,
      publicado_em: input.publicado ? new Date().toISOString() : null,
    });

    if (error) {
      if (error.code === "23505") {
        return { ok: false, erro: "Já existe um post com esse slug." };
      }
      return { ok: false, erro: error.message };
    }
  }

  revalidarBlog(slug);
  return { ok: true };
}

export async function excluirPost(id: string) {
  const supabase = await clientAdmin();
  if (!supabase) return { ok: false, erro: "Sem permissão" };

  const { data: post } = await supabase
    .from("blog_posts")
    .select("slug")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("blog_posts").delete().eq("id", id);
  if (error) return { ok: false, erro: error.message };

  revalidarBlog(post?.slug ?? "");
  return { ok: true };
}
