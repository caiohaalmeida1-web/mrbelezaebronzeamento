import type { Metadata } from "next";
import { FidelidadeSection } from "@/components/home/fidelidade-section";
import { CtaFinalSection } from "@/components/home/cta-final-section";

export const metadata: Metadata = {
  title: "Programa de fidelidade",
  description:
    "Ganhe pontos a cada sessão na Mércia Regina. Acumule descontos e benefícios exclusivos.",
};

export default function FidelidadePage() {
  return (
    <>
      <section className="bg-hero-gradient py-20 sm:py-24">
        <div className="container-page text-center">
          <p className="font-script text-2xl text-brand-cream/95 sm:text-3xl">
            sua autoestima merece recompensa
          </p>
          <h1 className="mt-2 font-display text-5xl font-medium tracking-tight text-brand-brown sm:text-6xl">
            Programa de fidelidade
          </h1>
        </div>
      </section>
      <FidelidadeSection />
      <CtaFinalSection />
    </>
  );
}
