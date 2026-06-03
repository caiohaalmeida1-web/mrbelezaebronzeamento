import Link from "next/link";
import { Sun, Wind, ArrowRight } from "lucide-react";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const SERVICOS = [
  {
    numero: "01",
    icon: Sun,
    nome: "Bronzeamento Natural",
    descricao:
      "Exposição solar com biquíni de fita personalizada ou tecido próprio. Ativa a melanina, produz vitamina D e deixa a pele tratada. Todos os produtos aprovados pela Anvisa.",
    tag: "Pele Saudável",
    duracao: "60 min",
    preco: "R$ 80",
  },
  {
    numero: "02",
    icon: Wind,
    nome: "Bronze a Jato",
    descricao:
      "Pulverização profissional com máquina de alta precisão. Resultado imediato em 1 hora — perfeito para eventos. Dura de 7 a 10 dias com os cuidados certos.",
    tag: "Resultado em 1h",
    duracao: "60 min",
    preco: "R$ 120",
  },
] as const;

export function ServicosSection() {
  return (
    <section
      id="servicos"
      aria-labelledby="servicos-heading"
      className="bg-brand-cream py-20 sm:py-24"
    >
      <div className="container-page">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <p className="label-eyebrow justify-center">Serviços</p>
          <h2
            id="servicos-heading"
            className="mt-4 font-display text-4xl font-medium tracking-tight text-brand-brown sm:text-5xl"
          >
            Escolha o seu <em className="italic">bronze</em>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-brand-caramel sm:text-lg">
            Duas técnicas, o mesmo cuidado: pele saudável, marquinhas perfeitas
            e cor que dura. Você escolhe a que combina com o seu momento.
          </p>
        </ScrollReveal>

        <div className="mt-14 grid gap-6 sm:gap-8 md:grid-cols-2">
          {SERVICOS.map((s, i) => (
            <ScrollReveal key={s.nome} delay={i * 100}>
              <article className="group card-brand relative flex h-full flex-col overflow-hidden p-8 sm:p-10">
                <span className="absolute right-6 top-5 font-display text-7xl font-semibold leading-none text-brand-warm">
                  {s.numero}
                </span>

                <div className="relative flex items-center gap-4">
                  <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-gradient text-white shadow-lg shadow-brand-amber/30">
                    <s.icon className="h-6 w-6" />
                  </span>
                  <Badge variant="warm">{s.tag}</Badge>
                </div>

                <h3 className="relative mt-6 font-display text-3xl font-medium leading-tight text-brand-brown sm:text-[34px]">
                  {s.nome}
                </h3>

                <p className="relative mt-4 flex-1 text-sm leading-relaxed text-brand-caramel sm:text-base">
                  {s.descricao}
                </p>

                <div className="relative mt-6 flex items-end justify-between border-t border-brand-gold/15 pt-5">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-brand-caramel/70">
                      A partir de
                    </div>
                    <div className="font-display text-3xl font-semibold text-brand-brown">
                      {s.preco}
                    </div>
                    <div className="text-xs text-brand-caramel/70">
                      Sessão de {s.duracao}
                    </div>
                  </div>
                  <Button asChild variant="default" size="sm">
                    <Link href="/agendar">
                      Agendar
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </div>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
