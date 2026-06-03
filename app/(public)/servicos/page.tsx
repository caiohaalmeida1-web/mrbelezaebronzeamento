import type { Metadata } from "next";
import Link from "next/link";
import { Sun, Wind, Clock, Sparkles, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { ChecklistSection } from "@/components/home/checklist-section";
import { FaqSection } from "@/components/home/faq-section";
import { createClient } from "@/lib/supabase/server";
import { formatBRL } from "@/lib/utils";
import type { Servico } from "@/types/database";

export const metadata: Metadata = {
  title: "Serviços · Bronzeamento natural e a jato",
  description:
    "Conheça os serviços de bronzeamento da Mércia Regina: natural ao sol e a jato. Produtos Anvisa, técnica profissional, em Vicente Pires, DF.",
};

export const revalidate = 3600;

const FALLBACK: Servico[] = [
  {
    id: "fallback-natural",
    nome: "Bronzeamento Natural",
    descricao:
      "Exposição solar com biquíni de fita personalizada ou tecido próprio.",
    duracao_minutos: 60,
    preco: 80,
    preco_pacote: null,
    quantidade_pacote: null,
    ativo: true,
    imagem_url: null,
    ordem: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: "fallback-jato",
    nome: "Bronze a Jato",
    descricao: "Pulverização profissional com máquina de alta precisão.",
    duracao_minutos: 60,
    preco: 120,
    preco_pacote: null,
    quantidade_pacote: null,
    ativo: true,
    imagem_url: null,
    ordem: 2,
    created_at: new Date().toISOString(),
  },
];

export default async function ServicosPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from("servicos")
    .select("*")
    .eq("ativo", true)
    .order("ordem", { ascending: true });

  const servicos = data && data.length > 0 ? data : FALLBACK;

  const ICONS = [Sun, Wind] as const;
  const HIGHLIGHTS = [
    {
      icon: ShieldCheck,
      titulo: "Aprovado pela Anvisa",
      descricao: "Todos os produtos com registro e segurança comprovada.",
    },
    {
      icon: Clock,
      titulo: "1 hora de duração",
      descricao: "Sessões rápidas, perfeitas para encaixar na sua rotina.",
    },
    {
      icon: Sparkles,
      titulo: "Resultado natural",
      descricao: "DHA calibrado pelo seu tom — nada de pele alaranjada.",
    },
  ] as const;

  return (
    <>
      <section className="bg-hero-gradient py-20 sm:py-28">
        <div className="container-page text-center">
          <p className="font-script text-2xl text-brand-cream/95 sm:text-3xl">
            nossas mãos cuidam, sua autoestima brilha
          </p>
          <h1 className="mt-3 font-display text-5xl font-medium tracking-tight text-brand-brown sm:text-6xl md:text-7xl">
            Serviços
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-brand-brown/80 sm:text-lg">
            Duas técnicas, o mesmo cuidado: pele saudável, marquinhas perfeitas
            e cor que dura.
          </p>
        </div>
      </section>

      <section className="bg-brand-cream py-20 sm:py-24">
        <div className="container-page">
          <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
            {servicos.map((s, i) => {
              const Icon = ICONS[i % ICONS.length];
              return (
                <ScrollReveal key={s.id} delay={i * 100}>
                  <article className="card-brand flex h-full flex-col p-8 sm:p-10">
                    <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-gradient text-white shadow-lg shadow-brand-amber/30">
                      <Icon className="h-6 w-6" />
                    </span>
                    <h2 className="mt-5 font-display text-3xl font-medium text-brand-brown">
                      {s.nome}
                    </h2>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-brand-caramel sm:text-base">
                      {s.descricao}
                    </p>
                    <div className="mt-6 flex flex-wrap items-center gap-2">
                      <Badge variant="warm">
                        <Clock className="mr-1 h-3 w-3" />
                        {s.duracao_minutos} min
                      </Badge>
                      <Badge variant="warm">
                        <ShieldCheck className="mr-1 h-3 w-3" />
                        Anvisa
                      </Badge>
                    </div>
                    <div className="mt-6 flex items-end justify-between border-t border-brand-gold/15 pt-5">
                      <div>
                        <div className="text-xs uppercase tracking-wider text-brand-caramel/70">
                          A partir de
                        </div>
                        <div className="font-display text-3xl font-semibold text-brand-brown">
                          {formatBRL(s.preco)}
                        </div>
                      </div>
                      <Button asChild>
                        <Link href={`/agendar?servico=${s.id}`}>Agendar</Link>
                      </Button>
                    </div>
                  </article>
                </ScrollReveal>
              );
            })}
          </div>

          <ScrollReveal className="mt-16">
            <div className="grid gap-6 md:grid-cols-3">
              {HIGHLIGHTS.map((h) => (
                <div
                  key={h.titulo}
                  className="rounded-3xl bg-brand-warm p-7 ring-1 ring-brand-gold/10"
                >
                  <h.icon className="h-7 w-7 text-brand-amber" />
                  <h3 className="mt-4 font-display text-xl font-medium text-brand-brown">
                    {h.titulo}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-brand-caramel">
                    {h.descricao}
                  </p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      <ChecklistSection />
      <FaqSection />
    </>
  );
}
