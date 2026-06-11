import { Check } from "lucide-react";
import { ScrollReveal } from "@/components/shared/scroll-reveal";

const CHECKLIST = [
  "Pele limpa: venha logo após o banho",
  "2 toalhas de banho",
  "1 toalha de rosto",
  "Venha bem alimentada",
  "Protetor solar facial",
  "Garrafa de água",
  "Cabelo preso",
  "Chegue no horário agendado",
] as const;

export function ChecklistSection() {
  return (
    <section
      aria-labelledby="checklist-heading"
      className="bg-brand-cream py-20 sm:py-24"
    >
      <div className="container-page">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <p className="label-eyebrow justify-center">Antes de Vir</p>
          <h2
            id="checklist-heading"
            className="mt-4 font-display text-4xl font-medium tracking-tight text-brand-brown sm:text-5xl"
          >
            Tudo pronto para o seu <em className="italic">momento?</em>
          </h2>
          <p className="mt-4 text-base text-brand-caramel sm:text-lg">
            Uma sessão impecável começa com uma boa preparação. Tenha em mãos:
          </p>
        </ScrollReveal>

        <ScrollReveal delay={120}>
          <ul className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {CHECKLIST.map((item, i) => (
              <li
                key={item}
                className="flex items-start gap-3 rounded-2xl bg-white px-5 py-4 shadow-sm ring-1 ring-brand-gold/15 transition-shadow hover:shadow-md"
              >
                <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-gradient text-white shadow-sm">
                  <Check className="h-4 w-4" strokeWidth={3} />
                </span>
                <span className="text-sm font-medium text-brand-brown">
                  <span className="text-brand-amber">{String(i + 1).padStart(2, "0")}.</span>{" "}
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </ScrollReveal>
      </div>
    </section>
  );
}
