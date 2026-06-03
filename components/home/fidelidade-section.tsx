import Link from "next/link";
import { Award, Gift, Star } from "lucide-react";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { Button } from "@/components/ui/button";

const PILARES = [
  {
    icon: Award,
    titulo: "Ganhe pontos",
    descricao:
      "100 pontos a cada sessão concluída. Os pontos caem automaticamente na sua conta.",
  },
  {
    icon: Star,
    titulo: "Acumule",
    descricao:
      "500 pontos viram R$30 de desconto. Ou guarde para resgatar uma sessão inteira.",
  },
  {
    icon: Gift,
    titulo: "Resgate descontos",
    descricao:
      "Toda 5ª sessão você ganha 20% de desconto automático. Sem complicação.",
  },
] as const;

export function FidelidadeSection() {
  return (
    <section
      id="fidelidade"
      aria-labelledby="fidelidade-heading"
      className="relative overflow-hidden bg-amber-gradient py-20 sm:py-24"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        aria-hidden
        style={{
          background:
            "radial-gradient(circle at 80% 20%, rgba(255, 240, 180, 0.6) 0%, transparent 50%)",
        }}
      />
      <div className="bg-grain pointer-events-none absolute inset-0 opacity-25" aria-hidden />

      <div className="container-page relative">
        <ScrollReveal className="mx-auto max-w-2xl text-center text-white">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-brand-brown">
            <span className="h-px w-8 bg-brand-brown" /> Programa de Fidelidade
          </p>
          <h2
            id="fidelidade-heading"
            className="mt-4 font-display text-4xl font-medium tracking-tight text-brand-brown sm:text-5xl"
          >
            Sua autoestima merece <em className="italic">recompensa</em>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-brand-brown/80 sm:text-lg">
            Cada sessão que você faz vira ponto. Cada ponto vira desconto.
            E na 5ª sessão, 20% off automático — sem precisar pedir.
          </p>
        </ScrollReveal>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {PILARES.map((p, i) => (
            <ScrollReveal key={p.titulo} delay={i * 100}>
              <div className="card-brand h-full bg-white/95 p-7 backdrop-blur">
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-brown text-brand-sun shadow-lg shadow-brand-brown/20">
                  <p.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 font-display text-2xl font-medium text-brand-brown">
                  {p.titulo}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-caramel">
                  {p.descricao}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal className="mt-12 text-center">
          <Button asChild size="lg">
            <Link href="/cadastro">
              <Gift className="h-4 w-4" />
              Cadastre-se grátis
            </Link>
          </Button>
        </ScrollReveal>
      </div>
    </section>
  );
}
