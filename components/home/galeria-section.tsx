import Image from "next/image";
import { Quote, Sun } from "lucide-react";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { createClient } from "@/lib/supabase/server";
import type { GaleriaFoto } from "@/types/database";

/**
 * Placeholders artísticos exibidos enquanto não há fotos reais.
 * As fotos são gerenciadas pelo admin em /admin/galeria.
 */
const GALERIA = [
  {
    span: "row-span-2 col-span-2",
    gradient: "from-brand-sun via-brand-amber to-brand-caramel",
    label: "Bronze a Jato",
  },
  {
    span: "",
    gradient: "from-brand-amber to-brand-caramel",
    label: "Marquinha",
  },
  {
    span: "",
    gradient: "from-brand-caramel to-brand-brown",
    label: "Click 10",
  },
  {
    span: "",
    gradient: "from-brand-sun to-brand-amber",
    label: "Natural",
  },
  {
    span: "",
    gradient: "from-brand-amber via-brand-caramel to-brand-brown",
    label: "Resultado",
  },
];

const SPANS = ["row-span-2 col-span-2", "", "", "", ""];

export async function GaleriaSection() {
  const supabase = createClient();
  const { data } = await supabase
    .from("galeria_fotos")
    .select("*")
    .eq("ativo", true)
    .order("ordem", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(5);

  const fotos: GaleriaFoto[] = data ?? [];

  return (
    <section
      id="galeria"
      aria-labelledby="galeria-heading"
      className="bg-brand-warm py-20 sm:py-24"
    >
      <div className="container-page">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <p className="label-eyebrow justify-center">Resultados</p>
          <h2
            id="galeria-heading"
            className="mt-4 font-display text-4xl font-medium tracking-tight text-brand-brown sm:text-5xl"
          >
            Marquinhas que <em className="italic">encantam</em>
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {fotos.length > 0
              ? fotos.map((f, i) => (
                  <div
                    key={f.id}
                    className={`group relative aspect-square overflow-hidden rounded-2xl ${SPANS[i] ?? ""}`}
                  >
                    <Image
                      src={f.imagem_url}
                      alt={f.titulo ?? "Resultado de bronzeamento"}
                      fill
                      sizes="(max-width: 640px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {f.titulo && (
                      <div className="absolute inset-0 flex items-end justify-start bg-gradient-to-t from-brand-brown/50 to-transparent p-4 transition-opacity group-hover:bg-brand-brown/20">
                        <div className="flex items-center gap-2">
                          <Sun className="h-4 w-4 text-white/90" />
                          <span className="text-xs font-semibold uppercase tracking-wider text-white/95">
                            {f.titulo}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              : GALERIA.map((g, i) => (
                  <div
                    key={i}
                    className={`group relative aspect-square overflow-hidden rounded-2xl bg-gradient-to-br ${g.gradient} ${g.span}`}
                  >
                    <div className="absolute inset-0 flex items-end justify-start bg-gradient-to-t from-brand-brown/50 to-transparent p-4 transition-opacity group-hover:bg-brand-brown/20">
                      <div className="flex items-center gap-2">
                        <Sun className="h-4 w-4 text-white/90" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-white/95">
                          {g.label}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <figure className="mt-14 overflow-hidden rounded-3xl bg-brand-brown text-brand-cream sm:mt-20">
            <div className="relative px-6 py-12 sm:px-14 sm:py-16">
              <Quote className="absolute left-6 top-6 h-12 w-12 text-brand-sun/20 sm:left-10 sm:top-10 sm:h-16 sm:w-16" />
              <blockquote className="relative mx-auto max-w-3xl text-center font-display text-2xl font-medium italic leading-snug text-brand-cream sm:text-3xl md:text-4xl">
                Não é só um trabalho — é sobre elevar a sua autoestima e fazer
                você se sentir a mulher mais poderosa do mundo.
              </blockquote>
              <figcaption className="relative mt-7 text-center">
                <span className="font-script text-2xl text-brand-sun">
                  Mércia Regina
                </span>
                <span className="mt-1 block text-xs uppercase tracking-[0.22em] text-brand-cream/60">
                  Especialista em Bronzeamento
                </span>
              </figcaption>
            </div>
          </figure>
        </ScrollReveal>
      </div>
    </section>
  );
}
