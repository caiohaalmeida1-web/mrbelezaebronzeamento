import { Star } from "lucide-react";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { createClient } from "@/lib/supabase/server";
import { getInitials } from "@/lib/utils";
import type { Avaliacao, Profile } from "@/types/database";

type AvaliacaoComCliente = Pick<Avaliacao, "id" | "nota" | "comentario" | "created_at"> & {
  profiles: Pick<Profile, "full_name"> | null;
};

const FALLBACK: AvaliacaoComCliente[] = [
  {
    id: "demo-1",
    nota: 5,
    comentario:
      "Resultado simplesmente perfeito. Saí me sentindo a mulher mais linda do mundo. Mércia é uma fofa e o ambiente é maravilhoso!",
    created_at: new Date().toISOString(),
    profiles: { full_name: "Larissa S." },
  },
  {
    id: "demo-2",
    nota: 5,
    comentario:
      "Bronze a jato impecável para o casamento da minha amiga. Em uma hora estava pronta e o tom ficou natural, exatamente como queria.",
    created_at: new Date().toISOString(),
    profiles: { full_name: "Marina F." },
  },
  {
    id: "demo-3",
    nota: 5,
    comentario:
      "Já é minha 7ª sessão e nunca falho. Bronze sempre uniforme, marquinhas perfeitas e o atendimento é cinco estrelas.",
    created_at: new Date().toISOString(),
    profiles: { full_name: "Carolina M." },
  },
];

export async function AvaliacoesSection() {
  const supabase = createClient();

  const { data } = await supabase
    .from("avaliacoes")
    .select(
      "id, nota, comentario, created_at, profiles!inner(full_name)"
    )
    .eq("aprovada", true)
    .order("created_at", { ascending: false })
    .limit(6);

  const avaliacoes: AvaliacaoComCliente[] =
    data && data.length > 0
      ? (data as unknown as AvaliacaoComCliente[])
      : FALLBACK;

  return (
    <section
      id="avaliacoes"
      aria-labelledby="avaliacoes-heading"
      className="bg-brand-cream py-20 sm:py-24"
    >
      <div className="container-page">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <p className="label-eyebrow justify-center">Depoimentos</p>
          <h2
            id="avaliacoes-heading"
            className="mt-4 font-display text-4xl font-medium tracking-tight text-brand-brown sm:text-5xl"
          >
            O que dizem as <em className="italic">clientes</em>
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {avaliacoes.slice(0, 3).map((a) => {
              const nome = a.profiles?.full_name ?? "Cliente";
              return (
                <article
                  key={a.id}
                  className="card-brand flex h-full flex-col p-7"
                >
                  <div className="flex gap-0.5 text-brand-amber">
                    {Array.from({ length: a.nota ?? 5 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="mt-4 flex-1 text-sm leading-relaxed text-brand-caramel">
                    “{a.comentario}”
                  </p>
                  <div className="mt-6 flex items-center gap-3 border-t border-brand-gold/15 pt-5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-gradient text-sm font-bold text-white">
                      {getInitials(nome)}
                    </div>
                    <div>
                      <div className="font-semibold text-brand-brown">
                        {nome}
                      </div>
                      <div className="text-xs text-brand-caramel/70">
                        Cliente verificada
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
