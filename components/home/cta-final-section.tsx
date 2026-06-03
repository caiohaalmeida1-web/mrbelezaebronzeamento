import Link from "next/link";
import { MapPin, Phone, Calendar } from "lucide-react";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { whatsappLink } from "@/lib/utils";

export function CtaFinalSection() {
  return (
    <section
      aria-labelledby="cta-final-heading"
      className="relative overflow-hidden bg-hero-gradient py-20 sm:py-28"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden
        style={{
          background:
            "radial-gradient(circle at 30% 30%, rgba(255, 240, 180, 0.6) 0%, transparent 60%)",
        }}
      />
      <div className="bg-grain pointer-events-none absolute inset-0 opacity-30" aria-hidden />

      <ScrollReveal className="container-page relative">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <Logo
            variant="horizontal-color"
            width={280}
            height={80}
            blend
            className="mb-8"
          />

          <h2
            id="cta-final-heading"
            className="font-display text-4xl font-medium tracking-tight text-brand-brown sm:text-5xl md:text-6xl"
          >
            Seu bronze dos sonhos <em className="italic">começa aqui.</em>
          </h2>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-brand-brown/85 sm:text-lg">
            Garanta seu horário agora. Atendimento exclusivo em Vicente Pires,
            Colônia Agrícola — DF.
          </p>

          <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
            <Button asChild variant="whatsapp" size="lg" className="w-full sm:w-auto">
              <Link
                href={whatsappLink(
                  "Olá Mércia! Quero garantir meu horário de bronzeamento."
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Phone className="h-4 w-4" />
                Falar no WhatsApp
              </Link>
            </Button>
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/agendar">
                <Calendar className="h-4 w-4" />
                Agendar online
              </Link>
            </Button>
          </div>

          <div className="mt-9 inline-flex flex-wrap items-center justify-center gap-2 rounded-full bg-brand-brown/10 px-5 py-2.5 text-sm text-brand-brown/85">
            <MapPin className="h-4 w-4" />
            <span>Vicente Pires · DF</span>
            <span className="text-brand-brown/40">·</span>
            <span className="font-semibold">(61) 98234-4399</span>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
