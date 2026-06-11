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
import type { Produto, TipoProduto } from "@/types/database";
import { excluirProduto, salvarProduto } from "./actions";

const TIPOS: { value: TipoProduto; label: string }[] = [
  { value: "fisico", label: "Físico (enviado pelo correio)" },
  { value: "digital", label: "Digital (arquivo)" },
  { value: "curso", label: "Curso online" },
  { value: "ebook", label: "E-book" },
  { value: "assinatura", label: "Assinatura" },
];

const MAX_IMAGEM_MB = 5;
const TIPOS_IMAGEM = ["image/jpeg", "image/png", "image/webp"];

export function ProdutoForm({ produto }: { produto?: Produto }) {
  const router = useRouter();
  const imagemInputRef = useRef<HTMLInputElement>(null);

  const [nome, setNome] = useState(produto?.nome ?? "");
  const [slug, setSlug] = useState(produto?.slug ?? "");
  const [slugEditado, setSlugEditado] = useState(Boolean(produto));
  const [descricao, setDescricao] = useState(produto?.descricao ?? "");
  const [descricaoLonga, setDescricaoLonga] = useState(
    produto?.descricao_longa ?? ""
  );
  const [tipo, setTipo] = useState<TipoProduto>(produto?.tipo ?? "fisico");
  const [preco, setPreco] = useState(produto ? String(produto.preco) : "");
  const [precoOriginal, setPrecoOriginal] = useState(
    produto?.preco_original ? String(produto.preco_original) : ""
  );
  const [estoque, setEstoque] = useState(
    produto ? String(produto.estoque) : "0"
  );
  const [pesoGramas, setPesoGramas] = useState(
    produto?.peso_gramas ? String(produto.peso_gramas) : ""
  );
  const [arquivoDigitalUrl, setArquivoDigitalUrl] = useState(
    produto?.arquivo_digital_url ?? ""
  );
  const [tags, setTags] = useState(produto?.tags?.join(", ") ?? "");
  const [imagens, setImagens] = useState<string[]>(produto?.imagens ?? []);
  const [ativo, setAtivo] = useState(produto?.ativo ?? true);
  const [destaque, setDestaque] = useState(produto?.destaque ?? false);
  const [disponivelVenda, setDisponivelVenda] = useState(
    produto?.disponivel_venda ?? true
  );

  const [enviandoImagem, setEnviandoImagem] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  function handleNome(value: string) {
    setNome(value);
    if (!slugEditado) setSlug(slugify(value));
  }

  async function handleUploadImagem(file: File | undefined) {
    if (!file) return;

    if (!TIPOS_IMAGEM.includes(file.type)) {
      setErro("Envie apenas imagens JPG, PNG ou WebP.");
      return;
    }
    if (file.size > MAX_IMAGEM_MB * 1024 * 1024) {
      setErro(`Imagem muito grande. Máximo ${MAX_IMAGEM_MB}MB.`);
      return;
    }

    setEnviandoImagem(true);
    setErro(null);

    const supabase = createClient();
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error } = await supabase.storage
      .from("produtos")
      .upload(path, file, { contentType: file.type });

    if (error) {
      setErro(`Falha ao enviar a imagem: ${error.message}`);
    } else {
      const {
        data: { publicUrl },
      } = supabase.storage.from("produtos").getPublicUrl(path);
      setImagens((prev) => [...prev, publicUrl]);
    }

    setEnviandoImagem(false);
    if (imagemInputRef.current) imagemInputRef.current.value = "";
  }

  async function handleSalvar() {
    setSalvando(true);
    setErro(null);

    const precoNum = Number(preco.replace(",", "."));
    const precoOriginalNum = precoOriginal
      ? Number(precoOriginal.replace(",", "."))
      : null;

    if (!precoNum || precoNum <= 0) {
      setErro("Informe um preço válido.");
      setSalvando(false);
      return;
    }

    const res = await salvarProduto({
      id: produto?.id ?? null,
      nome,
      slug,
      descricao,
      descricao_longa: descricaoLonga,
      tipo,
      preco: precoNum,
      preco_original: precoOriginalNum,
      estoque: Number(estoque) || 0,
      peso_gramas: pesoGramas ? Number(pesoGramas) : null,
      imagens,
      arquivo_digital_url: arquivoDigitalUrl.trim() || null,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      ativo,
      destaque,
      disponivel_venda: disponivelVenda,
    });

    setSalvando(false);
    if (!res.ok) {
      setErro(res.erro ?? "Erro ao salvar o produto.");
      return;
    }
    router.push("/admin/produtos");
    router.refresh();
  }

  async function handleExcluir() {
    if (!produto) return;
    if (!confirm("Excluir este produto definitivamente?")) return;
    setExcluindo(true);
    const res = await excluirProduto(produto.id);
    setExcluindo(false);
    if (!res.ok) {
      setErro(res.erro ?? "Erro ao excluir o produto.");
      return;
    }
    router.push("/admin/produtos");
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
          <Label htmlFor="nome">Nome *</Label>
          <Input
            id="nome"
            value={nome}
            onChange={(e) => handleNome(e.target.value)}
            placeholder="Ex: Click 10 Tradicional"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Endereço (slug)</Label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-brand-caramel">/loja/</span>
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
          <Label>Finalidade *</Label>
          <div className="grid gap-2 sm:grid-cols-2">
            <label
              className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors ${
                disponivelVenda
                  ? "border-brand-amber bg-amber-50"
                  : "border-brand-gold/30 bg-white"
              }`}
            >
              <input
                type="radio"
                name="finalidade"
                checked={disponivelVenda}
                onChange={() => setDisponivelVenda(true)}
                className="mt-0.5 h-4 w-4 accent-[#e87520]"
              />
              <span>
                <span className="block text-sm font-semibold text-brand-brown">
                  Venda no site
                </span>
                <span className="block text-xs text-brand-caramel">
                  Aparece na loja e pode ser comprado online (ex: biquínis).
                </span>
              </span>
            </label>
            <label
              className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors ${
                !disponivelVenda
                  ? "border-brand-amber bg-amber-50"
                  : "border-brand-gold/30 bg-white"
              }`}
            >
              <input
                type="radio"
                name="finalidade"
                checked={!disponivelVenda}
                onChange={() => setDisponivelVenda(false)}
                className="mt-0.5 h-4 w-4 accent-[#e87520]"
              />
              <span>
                <span className="block text-sm font-semibold text-brand-brown">
                  Uso interno
                </span>
                <span className="block text-xs text-brand-caramel">
                  Estoque dos atendimentos, não aparece na loja (ex: Click 10).
                </span>
              </span>
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tipo">Tipo *</Label>
          <select
            id="tipo"
            value={tipo}
            onChange={(e) => setTipo(e.target.value as TipoProduto)}
            className="flex h-12 w-full rounded-2xl border border-brand-gold/30 bg-white px-4 py-2 text-sm text-brand-brown shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-amber"
          >
            {TIPOS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="preco">Preço (R$) *</Label>
            <Input
              id="preco"
              inputMode="decimal"
              value={preco}
              onChange={(e) => setPreco(e.target.value)}
              placeholder="89,90"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="preco_original">Preço &quot;de&quot; (opcional)</Label>
            <Input
              id="preco_original"
              inputMode="decimal"
              value={precoOriginal}
              onChange={(e) => setPrecoOriginal(e.target.value)}
              placeholder="119,90"
            />
          </div>
        </div>

        {tipo === "fisico" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="estoque">Estoque (unidades)</Label>
              <Input
                id="estoque"
                inputMode="numeric"
                value={estoque}
                onChange={(e) => setEstoque(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="peso">Peso (gramas, p/ frete)</Label>
              <Input
                id="peso"
                inputMode="numeric"
                value={pesoGramas}
                onChange={(e) => setPesoGramas(e.target.value)}
                placeholder="500"
              />
            </div>
          </div>
        )}

        {tipo !== "fisico" && (
          <div className="space-y-2">
            <Label htmlFor="arquivo">URL do arquivo digital</Label>
            <Input
              id="arquivo"
              type="url"
              value={arquivoDigitalUrl}
              onChange={(e) => setArquivoDigitalUrl(e.target.value)}
              placeholder="https://…"
            />
            <p className="text-xs text-brand-caramel/70">
              Link entregue à cliente após o pagamento.
            </p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="descricao">Descrição curta</Label>
          <Textarea
            id="descricao"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            rows={2}
            placeholder="Frase que aparece no card da loja."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="descricao_longa">Descrição completa</Label>
          <Textarea
            id="descricao_longa"
            value={descricaoLonga}
            onChange={(e) => setDescricaoLonga(e.target.value)}
            rows={5}
            placeholder="Texto detalhado da página do produto."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
          <Input
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Ativador, Acelerador, Hidratante"
          />
        </div>
      </div>

      <div className="card-brand space-y-4 p-6 sm:p-8">
        <h2 className="font-display text-xl font-medium text-brand-brown">
          Imagens
        </h2>
        <input
          ref={imagemInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => handleUploadImagem(e.target.files?.[0])}
        />

        {imagens.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {imagens.map((url, i) => (
              <div
                key={url}
                className="relative aspect-square overflow-hidden rounded-2xl"
              >
                <Image
                  src={url}
                  alt={`Imagem ${i + 1} do produto`}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() =>
                    setImagens((prev) => prev.filter((u) => u !== url))
                  }
                  aria-label="Remover imagem"
                  className="absolute right-2 top-2 rounded-full bg-brand-brown/80 p-1.5 text-white hover:bg-brand-brown"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <Button
          type="button"
          variant="outline"
          disabled={enviandoImagem}
          onClick={() => imagemInputRef.current?.click()}
        >
          {enviandoImagem ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ImagePlus className="h-4 w-4" />
          )}
          {enviandoImagem ? "Enviando..." : "Adicionar imagem"}
        </Button>
        <p className="text-xs text-brand-caramel/70">
          JPG, PNG ou WebP até {MAX_IMAGEM_MB}MB. A primeira imagem é a
          principal.
        </p>
      </div>

      <div className="card-brand flex flex-wrap items-center justify-between gap-4 p-6 sm:p-8">
        <div className="flex flex-col gap-3">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={ativo}
              onChange={(e) => setAtivo(e.target.checked)}
              className="h-5 w-5 accent-[#e87520]"
            />
            <span className="text-sm font-semibold text-brand-brown">
              Ativo
            </span>
          </label>
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={destaque}
              onChange={(e) => setDestaque(e.target.checked)}
              className="h-5 w-5 accent-[#e87520]"
            />
            <span className="text-sm font-semibold text-brand-brown">
              Destaque (aparece primeiro)
            </span>
          </label>
        </div>

        <div className="flex gap-2">
          {produto && (
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
