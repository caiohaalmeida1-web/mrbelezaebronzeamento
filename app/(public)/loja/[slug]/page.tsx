import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Droplets, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BotaoAdicionar } from "@/components/loja/botao-adicionar";
import { ProdutoCard } from "@/components/loja/produto-card";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { createStaticClient } from "@/lib/supabase/static";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatBRL } from "@/lib/utils";
import type { Produto } from "@/types/database";

export const revalidate = 1800;

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  try {
    const supabase = createStaticClient();
    const { data } = await supabase
      .from("produtos")
      .select("slug")
      .eq("ativo", true)
      .eq("disponivel_venda", true);
    return (data ?? []).map((p: { slug: string }) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("produtos")
      .select("nome, descricao")
      .eq("slug", params.slug)
      .maybeSingle();
    if (!data) return { title: "Produto" };
    return {
      title: data.nome,
      description: data.descricao ?? undefined,
    };
  } catch {
    return { title: "Produto" };
  }
}

export default async function ProdutoPage({ params }: Props) {
  const supabase = createStaticClient();
  const { data: produto } = await supabase
    .from("produtos")
    .select("*")
    .eq("slug", params.slug)
    .eq("ativo", true)
    .eq("disponivel_venda", true)
    .maybeSingle();

  if (!produto) {
    notFound();
  }

  const { data: similares } = await supabase
    .from("produtos")
    .select("*")
    .eq("ativo", true)
    .eq("disponivel_venda", true)
    .neq("id", produto.id)
    .limit(3);

  return (
    <>
      <section className="bg-brand-cream py-10 sm:py-14">
        <div className="container-page">
          <Link
            href="/loja"
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand-caramel hover:text-brand-amber"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para a loja
          </Link>

          <div className="mt-6 grid gap-10 lg:grid-cols-2">
            <ProdutoVisual produto={produto} />
            <ProdutoInfo produto={produto} />
          </div>
        </div>
      </section>

      {similares && similares.length > 0 && (
        <section className="bg-brand-warm py-16 sm:py-20">
          <div className="container-page">
            <ScrollReveal>
              <h2 className="font-display text-3xl font-medium text-brand-brown sm:text-4xl">
                Você também pode amar
              </h2>
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {similares.map((s, i) => (
                  <ProdutoCard key={s.id} produto={s} index={i} />
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>
      )}
    </>
  );
}

function ProdutoVisual({ produto }: { produto: Produto }) {
  const imagens = produto.imagens?.filter(Boolean) ?? [];
  const principal = imagens[0];

  return (
    <div className="space-y-3">
      <div className="relative aspect-square overflow-hidden rounded-3xl bg-amber-gradient shadow-2xl shadow-brand-brown/15">
        {principal ? (
          <Image
            src={principal}
            alt={produto.nome}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Droplets className="h-32 w-32 text-white/95 drop-shadow-xl" />
          </div>
        )}
        {produto.destaque && (
          <Badge variant="sun" className="absolute right-4 top-4 z-10">
            ⭐ Destaque
          </Badge>
        )}
      </div>

      {imagens.length > 1 && (
        <div className="grid grid-cols-3 gap-3">
          {imagens.slice(0, 3).map((url, i) => (
            <div
              key={url}
              className="relative aspect-square overflow-hidden rounded-2xl ring-1 ring-brand-gold/15"
            >
              <Image
                src={url}
                alt={`${produto.nome} — foto ${i + 1}`}
                fill
                sizes="(max-width: 1024px) 33vw, 15vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProdutoInfo({ produto }: { produto: Produto }) {
  return (
    <div>
      <p className="label-eyebrow">Loja Mércia Regina</p>
      <h1 className="mt-3 font-display text-4xl font-medium leading-tight text-brand-brown sm:text-5xl">
        {produto.nome}
      </h1>

      {produto.tags && produto.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {produto.tags.map((t) => (
            <Badge key={t} variant="warm">
              {t}
            </Badge>
          ))}
        </div>
      )}

      <div className="mt-6 flex items-baseline gap-3">
        <div className="font-display text-4xl font-semibold text-brand-brown">
          {formatBRL(Number(produto.preco))}
        </div>
        {produto.preco_original && (
          <div className="text-sm text-brand-caramel/60 line-through">
            {formatBRL(Number(produto.preco_original))}
          </div>
        )}
      </div>

      <p className="mt-5 text-base leading-relaxed text-brand-caramel">
        {produto.descricao_longa ?? produto.descricao}
      </p>

      <div className="mt-7">
        <BotaoAdicionar produto={produto} />
      </div>

      <div className="mt-7 grid gap-3 sm:grid-cols-3">
        <Beneficio
          icon={ShieldCheck}
          titulo="100% Anvisa"
          descricao="Produto seguro"
        />
        <Beneficio
          icon={Truck}
          titulo="Frete BR"
          descricao="Para todo o Brasil"
        />
        <Beneficio
          icon={Sparkles}
          titulo="Resultado"
          descricao="Hidratação 8h"
        />
      </div>
    </div>
  );
}

function Beneficio({
  icon: Icon,
  titulo,
  descricao,
}: {
  icon: typeof ShieldCheck;
  titulo: string;
  descricao: string;
}) {
  return (
    <div className="rounded-2xl bg-white px-3 py-3 text-center ring-1 ring-brand-gold/15">
      <Icon className="mx-auto h-5 w-5 text-brand-amber" />
      <div className="mt-1 text-xs font-semibold text-brand-brown">
        {titulo}
      </div>
      <div className="text-[11px] text-brand-caramel">{descricao}</div>
    </div>
  );
}
