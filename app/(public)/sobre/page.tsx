import type { Metadata } from "next";
import Link from "next/link";
import { Heart, Award, Leaf, Calendar } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Sobre · A história da Mércia Regina",
  description:
    "Conheça a história da Mércia Regina, especialista em bronzeamento e referência em Vicente Pires, DF. Mais que um trabalho — uma vocação.",
};

const VALORES = [
  {
    icon: Heart,
    titulo: "Cuidado real",
    descricao:
      "Cada cliente é uma história. Cada sessão é cuidada como se fosse a primeira.",
  },
  {
    icon: Award,
    titulo: "Excelência técnica",
    descricao:
      "Anos de experiência com produtos Anvisa e técnicas atualizadas.",
  },
  {
    icon: Leaf,
    titulo: "Saúde em primeiro lugar",
    descricao:
      "Bronze que respeita sua pele. Sem ardor, sem tom alaranjado, sem exageros.",
  },
] as const;

export default function SobrePage() {
  return (
    <>
      <section className="relative overflow-hidden bg-hero-gradient py-20 sm:py-28">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          aria-hidden
          style={{
            background:
              "radial-gradient(circle at 50% 0%, rgba(255, 240, 180, 0.6) 0%, transparent 60%)",
          }}
        />
        <div className="container-page relative text-center">
          <Logo
            variant="round-color"
            size={140}
            className="mx-auto mb-6 ring-4 ring-brand-cream/40 shadow-2xl shadow-brand-brown/30"
          />
          <p className="font-script text-2xl text-brand-cream/95 sm:text-3xl">
            uma história de autoestima
          </p>
          <h1 className="mt-3 font-display text-5xl font-medium tracking-tight text-brand-brown sm:text-6xl">
            Mércia Regina
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-brand-brown/85 sm:text-lg">
            Especialista em bronzeamento, há anos transformando autoestima em
            Vicente Pires.
          </p>
        </div>
      </section>

      <section className="bg-brand-cream py-20 sm:py-24">
        <div className="container-page max-w-3xl">
          <ScrollReveal className="space-y-6 text-base leading-relaxed text-brand-caramel sm:text-lg">
            <p>
              Tudo começou com a vontade simples de fazer mulheres se sentirem
              mais bonitas. Não com fórmulas mágicas — mas com{" "}
              <strong className="text-brand-brown">técnica, cuidado e atenção</strong>{" "}
              em cada detalhe.
            </p>
            <p>
              Hoje, no espaço Mércia Regina Beleza e Bronzeamento, em Vicente
              Pires, recebemos clientes que voltam sessão após sessão — não
              só pelo resultado, mas pela experiência.
            </p>
            <p>
              Nossa especialidade é o bronzeamento <strong>natural</strong> e o{" "}
              <strong>bronze a jato</strong>, com produtos aprovados pela Anvisa
              e biquínis personalizados que valorizam cada corpo.
            </p>
            <p>
              <em className="font-display text-2xl text-brand-brown">
                Não é só um trabalho — é sobre elevar a sua autoestima e fazer
                você se sentir a mulher mais poderosa do mundo.
              </em>
            </p>
          </ScrollReveal>

          <ScrollReveal delay={120} className="mt-16">
            <div className="grid gap-5 md:grid-cols-3">
              {VALORES.map((v) => (
                <div
                  key={v.titulo}
                  className="card-brand p-6"
                >
                  <v.icon className="h-7 w-7 text-brand-amber" />
                  <h3 className="mt-4 font-display text-xl font-medium text-brand-brown">
                    {v.titulo}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-brand-caramel">
                    {v.descricao}
                  </p>
                </div>
              ))}
            </div>
          </ScrollReveal>

          <ScrollReveal className="mt-16 text-center">
            <Button asChild size="lg">
              <Link href="/agendar">
                <Calendar className="h-4 w-4" />
                Agendar minha primeira sessão
              </Link>
            </Button>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
