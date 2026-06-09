"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2, Save, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils";
import type { BlogPost } from "@/types/database";
import { excluirPost, salvarPost } from "./actions";

export function PostForm({ post }: { post?: BlogPost }) {
  const router = useRouter();
  const capaInputRef = useRef<HTMLInputElement>(null);

  const [titulo, setTitulo] = useState(post?.titulo ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugEditado, setSlugEditado] = useState(Boolean(post));
  const [resumo, setResumo] = useState(post?.resumo ?? "");
  const [conteudo, setConteudo] = useState(post?.conteudo ?? "");
  const [tags, setTags] = useState(post?.tags?.join(", ") ?? "");
  const [metaTitle, setMetaTitle] = useState(post?.meta_title ?? "");
  const [metaDescription, setMetaDescription] = useState(
    post?.meta_description ?? ""
  );
  const [publicado, setPublicado] = useState(post?.publicado ?? false);
  const [imagemCapa, setImagemCapa] = useState<string | null>(
    post?.imagem_capa ?? null
  );

  const [enviandoCapa, setEnviandoCapa] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  function handleTitulo(value: string) {
    setTitulo(value);
    if (!slugEditado) setSlug(slugify(value));
  }

  async function handleUploadCapa(file: File | undefined) {
    if (!file) return;
    setEnviandoCapa(true);
    setErro(null);

    const supabase = createClient();
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const path = `capas/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error } = await supabase.storage
      .from("blog")
      .upload(path, file, { contentType: file.type });

    if (error) {
      setErro(`Falha ao enviar a capa: ${error.message}`);
    } else {
      const {
        data: { publicUrl },
      } = supabase.storage.from("blog").getPublicUrl(path);
      setImagemCapa(publicUrl);
    }

    setEnviandoCapa(false);
    if (capaInputRef.current) capaInputRef.current.value = "";
  }

  async function handleSalvar() {
    setSalvando(true);
    setErro(null);

    const res = await salvarPost({
      id: post?.id ?? null,
      titulo,
      slug,
      resumo,
      conteudo,
      imagem_capa: imagemCapa,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      meta_title: metaTitle,
      meta_description: metaDescription,
      publicado,
    });

    setSalvando(false);
    if (!res.ok) {
      setErro(res.erro ?? "Erro ao salvar o post.");
      return;
    }
    router.push("/admin/blog");
    router.refresh();
  }

  async function handleExcluir() {
    if (!post) return;
    if (!confirm("Excluir este post definitivamente?")) return;
    setExcluindo(true);
    const res = await excluirPost(post.id);
    setExcluindo(false);
    if (!res.ok) {
      setErro(res.erro ?? "Erro ao excluir o post.");
      return;
    }
    router.push("/admin/blog");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {erro && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {erro}
        </p>
      )}

      <div className="card-brand space-y-5 p-6 sm:p-8">
        <div className="space-y-2">
          <Label htmlFor="titulo">Título *</Label>
          <Input
            id="titulo"
            value={titulo}
            onChange={(e) => handleTitulo(e.target.value)}
            placeholder="Ex: Como preparar a pele para o bronze"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Endereço (slug)</Label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-brand-caramel">/blog/</span>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugEditado(true);
              }}
              placeholder="gerado-automaticamente"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="resumo">Resumo</Label>
          <Textarea
            id="resumo"
            value={resumo}
            onChange={(e) => setResumo(e.target.value)}
            rows={2}
            placeholder="Frase curta que aparece na listagem do blog e no Google."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="conteudo">Conteúdo * (Markdown)</Label>
          <Textarea
            id="conteudo"
            value={conteudo}
            onChange={(e) => setConteudo(e.target.value)}
            rows={16}
            className="font-mono text-sm"
            placeholder={"## Subtítulo\n\nEscreva o texto aqui. Use **negrito**, *itálico* e listas com -."}
          />
          <p className="text-xs text-brand-caramel/70">
            Use ## para subtítulos, **texto** para negrito e - para listas.
          </p>
        </div>

        <div className="space-y-2">
          <Label>Imagem de capa</Label>
          <input
            ref={capaInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => handleUploadCapa(e.target.files?.[0])}
          />
          {imagemCapa ? (
            <div className="relative aspect-[2/1] w-full max-w-md overflow-hidden rounded-2xl">
              <Image
                src={imagemCapa}
                alt="Capa do post"
                fill
                sizes="448px"
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => setImagemCapa(null)}
                aria-label="Remover capa"
                className="absolute right-2 top-2 rounded-full bg-brand-brown/80 p-1.5 text-white hover:bg-brand-brown"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              disabled={enviandoCapa}
              onClick={() => capaInputRef.current?.click()}
            >
              {enviandoCapa ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ImagePlus className="h-4 w-4" />
              )}
              {enviandoCapa ? "Enviando..." : "Enviar imagem"}
            </Button>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
          <Input
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="bronze, cuidados, dicas"
          />
        </div>
      </div>

      <div className="card-brand space-y-5 p-6 sm:p-8">
        <h2 className="font-display text-xl font-medium text-brand-brown">
          SEO (opcional)
        </h2>
        <div className="space-y-2">
          <Label htmlFor="meta_title">Título no Google</Label>
          <Input
            id="meta_title"
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            placeholder="Se vazio, usa o título do post"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="meta_description">Descrição no Google</Label>
          <Textarea
            id="meta_description"
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            rows={2}
            placeholder="Se vazio, usa o resumo"
          />
        </div>
      </div>

      <div className="card-brand flex flex-wrap items-center justify-between gap-4 p-6 sm:p-8">
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={publicado}
            onChange={(e) => setPublicado(e.target.checked)}
            className="h-5 w-5 accent-[#e87520]"
          />
          <span className="text-sm font-semibold text-brand-brown">
            Publicar no site
            <span className="block text-xs font-normal text-brand-caramel">
              Desmarcado, o post fica salvo como rascunho.
            </span>
          </span>
        </label>

        <div className="flex gap-2">
          {post && (
            <Button
              type="button"
              variant="ghost"
              disabled={excluindo}
              onClick={handleExcluir}
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              {excluindo ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Excluir
            </Button>
          )}
          <Button type="button" disabled={salvando} onClick={handleSalvar}>
            {salvando ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {salvando ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
