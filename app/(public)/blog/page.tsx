import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { createClient } from "@/lib/supabase/server";
import { formatDateBR } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Blog · Dicas de bronzeamento",
  description:
    "Dicas exclusivas da Mércia Regina sobre bronzeamento natural, bronze a jato, cuidados pós-sessão e a linha Click 10.",
};

export const revalidate = 3600;

export default async function BlogPage() {
  const supabase = createClient();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id, titulo, slug, resumo, publicado_em, tags")
    .eq("publicado", true)
    .order("publicado_em", { ascending: false });

  return (
    <>
      <section className="bg-hero-gradient py-20 sm:py-24">
        <div className="container-page text-center">
          <p className="font-script text-2xl text-brand-cream/95 sm:text-3xl">
            conteúdo da Mércia
          </p>
          <h1 className="mt-2 font-display text-5xl font-medium tracking-tight text-brand-brown sm:text-6xl">
            Blog
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-brand-brown/80 sm:text-lg">
            Dicas de cuidados, alimentação, técnicas e tudo que você precisa
            saber sobre bronzeamento.
          </p>
        </div>
      </section>

      <section className="bg-brand-cream py-16 sm:py-20">
        <div className="container-page">
          {!posts || posts.length === 0 ? (
            <p className="text-center text-brand-caramel">
              Em breve novos posts.
            </p>
          ) : (
            <ScrollReveal>
              <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
                {posts.map((p) => (
                  <article
                    key={p.id}
                    className="card-brand group flex h-full flex-col overflow-hidden"
                  >
                    <Link
                      href={`/blog/${p.slug}`}
                      className="flex h-full flex-col"
                    >
                      <div className="relative h-44 bg-amber-gradient" aria-hidden>
                        <div className="absolute inset-0 bg-gradient-to-tr from-brand-brown/30 via-transparent to-transparent" />
                      </div>
                      <div className="flex flex-1 flex-col p-6">
                        <div className="flex items-center gap-2 text-xs text-brand-caramel/70">
                          <Calendar className="h-3.5 w-3.5" />
                          {p.publicado_em && formatDateBR(p.publicado_em)}
                        </div>
                        <h2 className="mt-3 font-display text-xl font-medium leading-snug text-brand-brown transition-colors group-hover:text-brand-amber">
                          {p.titulo}
                        </h2>
                        <p className="mt-2 flex-1 text-sm leading-relaxed text-brand-caramel">
                          {p.resumo}
                        </p>
                        {p.tags && p.tags.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {p.tags.slice(0, 3).map((t) => (
                              <Badge key={t} variant="warm" className="text-[10px]">
                                {t}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand-amber">
                          Ler mais
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </span>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            </ScrollReveal>
          )}
        </div>
      </section>
    </>
  );
}
