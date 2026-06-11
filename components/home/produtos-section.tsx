import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createStaticClient } from "@/lib/supabase/static";
import { formatBRL } from "@/lib/utils";
import type { Produto } from "@/types/database";

export async function ProdutosSection() {
  let produtos: Produto[] = [];
  try {
    const supabase = createStaticClient();
    const { data } = await supabase
      .from("produtos")
      .select("*")
      .eq("ativo", true)
      .eq("disponivel_venda", true)
      .order("destaque", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(3);
    produtos = data ?? [];
  } catch {
    produtos = [];
  }

  // Sem produtos à venda, a seção não aparece na home
  if (produtos.length === 0) return null;

  return (
    <section
      id="produtos"
      aria-labelledby="produtos-heading"
      className="relative overflow-hidden bg-brand-warm py-20 sm:py-24"
    >
      <div className="bg-grain pointer-events-none absolute inset-0 opacity-30" aria-hidden />

      <div className="container-page relative">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <p className="label-eyebrow justify-center">Loja</p>
          <h2
            id="produtos-heading"
            className="mt-4 font-display text-4xl font-medium tracking-tight text-brand-brown sm:text-5xl"
          >
            O complemento do <em className="italic">seu bronze</em>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-brand-caramel sm:text-lg">
            Biquínis e acessórios selecionados a dedo para valorizar a sua cor.
          </p>
        </ScrollReveal>

        <div className="mt-14 grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {produtos.map((p, i) => (
            <ScrollReveal key={p.id} delay={i * 100}>
              <article className="card-brand group flex h-full flex-col overflow-hidden">
                <div className="relative flex h-52 items-center justify-center overflow-hidden bg-gradient-to-br from-brand-sun via-brand-amber to-brand-caramel">
                  {p.imagens?.[0] ? (
                    <Image
                      src={p.imagens[0]}
                      alt={p.nome}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <ShoppingBag className="h-20 w-20 text-white/90 drop-shadow-md" />
                  )}
                  {p.destaque && (
                    <Badge
                      variant="sun"
                      className="absolute right-4 top-4 shadow-md"
                    >
                      Destaque
                    </Badge>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-7">
                  <h3 className="font-display text-2xl font-medium text-brand-brown">
                    {p.nome}
                  </h3>
                  {p.descricao && (
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-brand-caramel">
                      {p.descricao}
                    </p>
                  )}

                  {p.tags && p.tags.length > 0 && (
                    <div className="mt-5 flex flex-wrap gap-1.5">
                      {p.tags.map((t) => (
                        <Badge key={t} variant="warm" className="text-[10px]">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="mt-6 flex items-center justify-between border-t border-brand-gold/15 pt-5">
                    <div className="font-display text-3xl font-semibold text-brand-brown">
                      {formatBRL(Number(p.preco))}
                    </div>
                    <Button asChild size="sm">
                      <Link href={`/loja/${p.slug}`}>
                        Comprar
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </article>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal className="mt-12 text-center">
          <Button asChild variant="outline" size="lg">
            <Link href="/loja">
              Ver loja completa
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </ScrollReveal>
      </div>
    </section>
  );
}
