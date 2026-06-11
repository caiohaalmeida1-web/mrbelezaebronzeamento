"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";

const ProdutoSchema = z.object({
  id: z.string().uuid().nullable().optional(),
  nome: z.string().min(2, "Informe o nome do produto."),
  slug: z.string(),
  descricao: z.string(),
  descricao_longa: z.string(),
  tipo: z.enum(["fisico", "digital", "curso", "ebook", "assinatura"]),
  preco: z.number().positive("Preço deve ser maior que zero."),
  preco_original: z.number().positive().nullable(),
  estoque: z.number().int().min(0),
  peso_gramas: z.number().int().positive().nullable(),
  imagens: z.array(z.string().url()),
  arquivo_digital_url: z.string().url().nullable().or(z.literal(null)),
  tags: z.array(z.string()),
  ativo: z.boolean(),
  destaque: z.boolean(),
  disponivel_venda: z.boolean(),
});

export type ProdutoInput = z.infer<typeof ProdutoSchema>;

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

function revalidarLoja(slug: string) {
  revalidatePath("/");
  revalidatePath("/loja");
  revalidatePath(`/loja/${slug}`);
  revalidatePath("/admin/produtos");
}

export async function salvarProduto(input: ProdutoInput) {
  const supabase = await clientAdmin();
  if (!supabase) return { ok: false, erro: "Sem permissão" };

  const parsed = ProdutoSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      erro: parsed.error.errors[0]?.message ?? "Dados inválidos.",
    };
  }

  const slug = slugify(parsed.data.slug || parsed.data.nome);

  const payload = {
    nome: parsed.data.nome.trim(),
    slug,
    descricao: parsed.data.descricao.trim() || null,
    descricao_longa: parsed.data.descricao_longa.trim() || null,
    tipo: parsed.data.tipo,
    preco: parsed.data.preco,
    preco_original: parsed.data.preco_original,
    estoque: parsed.data.estoque,
    peso_gramas: parsed.data.peso_gramas,
    imagens: parsed.data.imagens.length > 0 ? parsed.data.imagens : null,
    arquivo_digital_url: parsed.data.arquivo_digital_url,
    tags: parsed.data.tags.length > 0 ? parsed.data.tags : null,
    ativo: parsed.data.ativo,
    destaque: parsed.data.destaque,
    disponivel_venda: parsed.data.disponivel_venda,
  };

  if (parsed.data.id) {
    const { error } = await supabase
      .from("produtos")
      .update(payload)
      .eq("id", parsed.data.id);
    if (error) return { ok: false, erro: error.message };
  } else {
    const { error } = await supabase.from("produtos").insert(payload);
    if (error) {
      if (error.code === "23505") {
        return { ok: false, erro: "Já existe um produto com esse slug." };
      }
      return { ok: false, erro: error.message };
    }
  }

  revalidarLoja(slug);
  return { ok: true };
}

export async function excluirProduto(id: string) {
  const supabase = await clientAdmin();
  if (!supabase) return { ok: false, erro: "Sem permissão" };

  const { data: produto } = await supabase
    .from("produtos")
    .select("slug")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("produtos").delete().eq("id", id);
  if (error) {
    if (error.code === "23503") {
      return {
        ok: false,
        erro: "Produto já tem pedidos. Desative-o em vez de excluir.",
      };
    }
    return { ok: false, erro: error.message };
  }

  revalidarLoja(produto?.slug ?? "");
  return { ok: true };
}
