import Link from "next/link";
import { ArrowRight, Droplets, Sparkles } from "lucide-react";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatBRL } from "@/lib/utils";

const PRODUTOS = [
  {
    slug: "click-10-tradicional",
    nome: "Click 10 Tradicional",
    badge: "Tradicional",
    descricao:
      "Creme hidratante, ativador e acelerador de bronzeamento. Cor de verão o ano inteiro com hidratação profunda.",
    apresentacao: "Pote de 500g",
    tags: ["Ativador", "Acelerador", "Hidratante"],
    preco: 89.9,
    icon: Droplets,
    accent: "from-brand-sun via-brand-amber to-brand-caramel",
  },
  {
    slug: "click-10-zero",
    nome: "Click 10 Zero",
    badge: "Premium",
    descricao:
      "Com Vitamina C, Colágeno e DHA. Efeito antioxidante, clareador e firmador. Indicado para peles tipo 3, 4, 5 e 6. Hidratação por até 8h.",
    apresentacao: "Bisnaga de 500ml",
    tags: ["Vitamina C", "Colágeno", "DHA", "Firmador"],
    preco: 99.9,
    icon: Sparkles,
    accent: "from-brand-caramel via-brand-amber to-brand-brown",
  },
] as const;

export function ProdutosSection() {
  return (
    <section
      id="produtos"
      aria-labelledby="produtos-heading"
      className="relative overflow-hidden bg-brand-warm py-20 sm:py-24"
    >
      <div className="bg-grain pointer-events-none absolute inset-0 opacity-30" aria-hidden />

      <div className="container-page relative">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <p className="label-eyebrow justify-center">Linha Exclusiva</p>
          <h2
            id="produtos-heading"
            className="mt-4 font-display text-4xl font-medium tracking-tight text-brand-brown sm:text-5xl"
          >
            Produtos <em className="italic">Click 10</em>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-brand-caramel sm:text-lg">
            A nossa linha exclusiva para você levar o cuidado profissional para
            casa e prolongar o bronze entre as sessões.
          </p>
        </ScrollReveal>

        <div className="mt-14 grid gap-6 sm:gap-8 md:grid-cols-2">
          {PRODUTOS.map((p, i) => (
            <ScrollReveal key={p.slug} delay={i * 100}>
              <article className="card-brand group flex h-full flex-col overflow-hidden">
                <div
                  className={`relative flex h-52 items-center justify-center bg-gradient-to-br ${p.accent}`}
                >
                  <p.icon className="h-20 w-20 text-white/90 drop-shadow-md" />
                  <Badge
                    variant="sun"
                    className="absolute right-4 top-4 shadow-md"
                  >
                    {p.badge}
                  </Badge>
                </div>

                <div className="flex flex-1 flex-col p-7">
                  <h3 className="font-display text-2xl font-medium text-brand-brown sm:text-3xl">
                    {p.nome}
                  </h3>
                  <p className="mt-1 text-xs uppercase tracking-wider text-brand-caramel/70">
                    {p.apresentacao}
                  </p>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-brand-caramel">
                    {p.descricao}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {p.tags.map((t) => (
                      <Badge key={t} variant="warm" className="text-[10px]">
                        {t}
                      </Badge>
                    ))}
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-brand-gold/15 pt-5">
                    <div className="font-display text-3xl font-semibold text-brand-brown">
                      {formatBRL(p.preco)}
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
