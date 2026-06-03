import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { FAQSchema } from "@/components/shared/structured-data";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const FAQS = [
  {
    question: "O bronze a jato mancha a roupa?",
    answer:
      "Logo após a sessão, use roupas escuras e folgadas. Após o primeiro banho não há risco de manchas — o produto já está fixado na pele.",
  },
  {
    question: "Fica com tom alaranjado?",
    answer:
      "Não com a nossa técnica. Usamos DHA calibrado ao seu tom de pele para um resultado natural e dourado — nada de 'cenoura'.",
  },
  {
    question: "Gestantes podem fazer?",
    answer:
      "Para bronze a jato recomendamos aguardar o pós-parto. Para bronzeamento natural ao sol, é possível com liberação médica. Sua saúde vem sempre primeiro.",
  },
  {
    question: "Dói ou arde?",
    answer:
      "Nenhuma das duas coisas. O bronze a jato é um jato de névoa suave e indolor. O natural ao sol é feito com todo o conforto para você relaxar e aproveitar.",
  },
  {
    question: "Quanto tempo dura o bronze?",
    answer:
      "De 7 a 10 dias com os cuidados certos: hidratação diária, banhos mornos e sabonetes neutros. Algumas clientes conseguem 14 dias com a linha Click 10.",
  },
  {
    question: "Preciso depilar antes da sessão?",
    answer:
      "Sim, fazer a depilação 24h antes da sessão garante uma absorção uniforme do bronze e evita irritações.",
  },
  {
    question: "Como funciona o cancelamento?",
    answer:
      "Cancelamentos com mais de 24h de antecedência têm reembolso total. Após esse prazo, infelizmente não é possível reembolsar — você pode reagendar mediante disponibilidade.",
  },
] as const;

export function FaqSection() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="bg-brand-cream py-20 sm:py-24"
    >
      <FAQSchema faqs={FAQS as unknown as { question: string; answer: string }[]} />
      <div className="container-page max-w-3xl">
        <ScrollReveal className="text-center">
          <p className="label-eyebrow justify-center">Tire suas dúvidas</p>
          <h2
            id="faq-heading"
            className="mt-4 font-display text-4xl font-medium tracking-tight text-brand-brown sm:text-5xl"
          >
            Perguntas <em className="italic">frequentes</em>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-brand-caramel sm:text-lg">
            Não achou sua resposta? Chama no WhatsApp.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={120}>
          <Accordion
            type="single"
            collapsible
            defaultValue="item-0"
            className="mt-10 space-y-3"
          >
            {FAQS.map((f, i) => (
              <AccordionItem key={f.question} value={`item-${i}`}>
                <AccordionTrigger>{f.question}</AccordionTrigger>
                <AccordionContent>{f.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollReveal>
      </div>
    </section>
  );
}
