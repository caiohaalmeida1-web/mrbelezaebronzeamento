import type { Metadata } from "next";
import { Hero } from "@/components/home/hero";
import { SocialProofBar } from "@/components/home/social-proof-bar";
import { ServicosSection } from "@/components/home/servicos-section";
import { ComoFuncionaSection } from "@/components/home/como-funciona-section";
import { ProdutosSection } from "@/components/home/produtos-section";
import { ChecklistSection } from "@/components/home/checklist-section";
import { GaleriaSection } from "@/components/home/galeria-section";
import { FidelidadeSection } from "@/components/home/fidelidade-section";
import { AvaliacoesSection } from "@/components/home/avaliacoes-section";
import { BlogSection } from "@/components/home/blog-section";
import { FaqSection } from "@/components/home/faq-section";
import { CtaFinalSection } from "@/components/home/cta-final-section";

export const metadata: Metadata = {
  title: "Mércia Regina · Bronzeamento em Vicente Pires, DF",
  description:
    "O bronze perfeito que eleva sua autoestima em 1 hora. Bronzeamento natural e a jato em Vicente Pires, DF. Agende online 24h. Produtos Anvisa.",
  alternates: { canonical: "/" },
};

export const revalidate = 3600;

export default function HomePage() {
  return (
    <>
      <Hero />
      <SocialProofBar />
      <ServicosSection />
      <ComoFuncionaSection />
      <ProdutosSection />
      <ChecklistSection />
      <GaleriaSection />
      <FidelidadeSection />
      <AvaliacoesSection />
      <BlogSection />
      <FaqSection />
      <CtaFinalSection />
    </>
  );
}
