import Link from "next/link";
import { ChevronDown, Sparkles } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { whatsappLink } from "@/lib/utils";

export function Hero() {
  return (
    <section
      id="home"
      aria-label="Apresentação"
      className="relative overflow-hidden bg-hero-gradient pb-16 pt-28 sm:pb-24 sm:pt-32 md:pb-32 md:pt-36"
    >
      {/* Brilho radial */}
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        aria-hidden
        style={{
          background:
            "radial-gradient(circle at 50% 0%, rgba(255, 240, 180, 0.65) 0%, transparent 60%)",
        }}
      />
      <div className="bg-grain pointer-events-none absolute inset-0 opacity-30" aria-hidden />

      <div className="container-page relative">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <Logo
            variant="round-color"
            size={160}
            priority
            className="mb-7 ring-4 ring-brand-cream/40 shadow-2xl shadow-brand-brown/30"
          />

          <p className="font-script text-2xl text-brand-cream/95 drop-shadow-sm sm:text-3xl">
            na primeira sessão você vicia
          </p>

          <h1 className="mt-3 max-w-2xl text-balance font-display text-4xl font-medium leading-[1.05] tracking-tight text-brand-brown sm:text-5xl md:text-6xl lg:text-7xl">
            O bronze perfeito que <em className="font-display italic text-brand-brown">eleva sua autoestima</em> em 1 hora.
          </h1>

          <p className="mt-6 max-w-xl text-balance text-base leading-relaxed text-brand-brown/85 sm:text-lg">
            Especialista em bronzeamento saudável e gradativo em Vicente Pires.
            Produtos aprovados pela Anvisa. Sessões com hora marcada e atendimento exclusivo.
          </p>

          <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
            <Button asChild variant="whatsapp" size="lg" className="w-full sm:w-auto">
              <Link
                href={whatsappLink(
                  "Olá Mércia! Quero garantir minha marquinha. Pode me ajudar?"
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Sparkles className="h-4 w-4" />
                Quero minha marquinha
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <Link href="/agendar">Agendar online</Link>
            </Button>
          </div>

          <p className="mt-7 text-xs uppercase tracking-[0.22em] text-brand-brown/70">
            ✨ Mais de 13.5K seguidoras · 100% Anvisa
          </p>
        </div>

        {/* Scroll indicator */}
        <div className="mt-14 flex justify-center sm:mt-20">
          <a
            href="#servicos"
            aria-label="Rolar para serviços"
            className="inline-flex h-12 w-7 items-end justify-center rounded-full border-2 border-brand-brown/40 pb-2 text-brand-brown/70 transition-colors hover:border-brand-brown hover:text-brand-brown"
          >
            <ChevronDown className="h-4 w-4 animate-scroll-bounce" />
          </a>
        </div>
      </div>
    </section>
  );
}
