import { CalendarHeart, Clock, CreditCard, Sparkles } from "lucide-react";
import { ScrollReveal } from "@/components/shared/scroll-reveal";

const STEPS = [
  {
    numero: "1",
    icon: Sparkles,
    titulo: "Escolha o serviço",
    descricao: "Bronze natural ou a jato, você decide o que combina com seu momento.",
  },
  {
    numero: "2",
    icon: CalendarHeart,
    titulo: "Agende o horário",
    descricao: "Calendário online em tempo real. Sem precisar mandar mensagem.",
  },
  {
    numero: "3",
    icon: CreditCard,
    titulo: "Pague online",
    descricao: "Pix ou cartão direto no site. Reembolso total em cancelamentos com 24h.",
  },
  {
    numero: "4",
    icon: Clock,
    titulo: "Apareça e bronze",
    descricao: "Em 1 hora você sai com a pele dourada e radiante.",
  },
] as const;

export function ComoFuncionaSection() {
  return (
    <section
      id="como-funciona"
      aria-labelledby="como-funciona-heading"
      className="bg-brand-warm py-20 sm:py-24"
    >
      <div className="container-page">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <p className="label-eyebrow justify-center">Como Funciona</p>
          <h2
            id="como-funciona-heading"
            className="mt-4 font-display text-4xl font-medium tracking-tight text-brand-brown sm:text-5xl"
          >
            Quatro passos para o seu <em className="italic">bronze dos sonhos</em>
          </h2>
        </ScrollReveal>

        <div className="mt-14 grid grid-cols-2 gap-5 sm:gap-7 md:grid-cols-4">
          {STEPS.map((step, i) => (
            <ScrollReveal key={step.numero} delay={i * 80}>
              <div className="relative flex flex-col items-center text-center">
                <div className="relative">
                  <span className="absolute -right-3 -top-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand-amber text-xs font-bold text-white shadow-md">
                    {step.numero}
                  </span>
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-brand-amber shadow-lg shadow-brand-brown/5 ring-1 ring-brand-gold/15 sm:h-20 sm:w-20">
                    <step.icon className="h-7 w-7 sm:h-8 sm:w-8" />
                  </div>
                </div>
                <h3 className="mt-5 font-display text-xl font-medium text-brand-brown sm:text-2xl">
                  {step.titulo}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-caramel">
                  {step.descricao}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
