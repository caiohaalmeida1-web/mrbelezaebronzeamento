import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { formatDateBR } from "@/lib/utils";
import type { BlogPost } from "@/types/database";

const FALLBACK: Pick<
  BlogPost,
  "id" | "titulo" | "slug" | "resumo" | "publicado_em" | "tags"
>[] = [
  {
    id: "demo-1",
    titulo: "Como durar mais o bronze: 7 cuidados essenciais",
    slug: "como-durar-mais-o-bronze",
    resumo:
      "Descubra os segredos para manter seu bronze bonito por mais tempo com cuidados simples do dia a dia.",
    publicado_em: new Date().toISOString(),
    tags: ["cuidados"],
  },
  {
    id: "demo-2",
    titulo: "O que comer para bronzear mais rápido e melhor",
    slug: "alimentacao-para-bronzear",
    resumo:
      "A alimentação certa pode acelerar e fixar seu bronze. Descubra quais alimentos incluir.",
    publicado_em: new Date().toISOString(),
    tags: ["alimentação"],
  },
  {
    id: "demo-3",
    titulo: "5 erros que arruínam seu bronze antes da hora",
    slug: "5-erros-que-arruinam-bronze",
    resumo: "Evite esses erros comuns que fazem o bronze desaparecer rápido.",
    publicado_em: new Date().toISOString(),
    tags: ["dicas"],
  },
];

export async function BlogSection() {
  const supabase = createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("id, titulo, slug, resumo, publicado_em, tags")
    .eq("publicado", true)
    .order("publicado_em", { ascending: false })
    .limit(3);

  const posts = data && data.length > 0 ? data : FALLBACK;

  return (
    <section
      id="blog"
      aria-labelledby="blog-heading"
      className="bg-brand-warm py-20 sm:py-24"
    >
      <div className="container-page">
        <ScrollReveal className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-xl">
            <p className="label-eyebrow">Blog</p>
            <h2
              id="blog-heading"
              className="mt-4 font-display text-4xl font-medium tracking-tight text-brand-brown sm:text-5xl"
            >
              Dicas e <em className="italic">conteúdo</em> da Mércia
            </h2>
          </div>
          <Button asChild variant="outline">
            <Link href="/blog">
              Ver todos os posts
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </ScrollReveal>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {posts.map((post, i) => (
            <ScrollReveal key={post.id} delay={i * 100}>
              <article className="card-brand group flex h-full flex-col overflow-hidden">
                <Link
                  href={`/blog/${post.slug}`}
                  className="flex h-full flex-col"
                  aria-label={post.titulo}
                >
                  <div
                    className="relative h-44 bg-amber-gradient"
                    aria-hidden
                  >
                    <div className="absolute inset-0 bg-gradient-to-tr from-brand-brown/30 via-transparent to-transparent" />
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex items-center gap-2 text-xs text-brand-caramel/70">
                      <Calendar className="h-3.5 w-3.5" />
                      {post.publicado_em && formatDateBR(post.publicado_em)}
                    </div>
                    <h3 className="mt-3 font-display text-xl font-medium leading-snug text-brand-brown transition-colors group-hover:text-brand-amber sm:text-2xl">
                      {post.titulo}
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-brand-caramel">
                      {post.resumo}
                    </p>
                    <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand-amber">
                      Ler mais
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
