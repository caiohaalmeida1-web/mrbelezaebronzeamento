import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArticleSchema,
  BreadcrumbSchema,
} from "@/components/shared/structured-data";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { createStaticClient } from "@/lib/supabase/static";
import { createAdminClient } from "@/lib/supabase/admin";
import { SITE_CONFIG, formatDateBR } from "@/lib/utils";

export const revalidate = 3600;

interface Props {
  params: { slug: string };
}

function tryAdminClient() {
  try {
    return createAdminClient();
  } catch {
    return null;
  }
}

export async function generateStaticParams() {
  const supabase = tryAdminClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("blog_posts")
    .select("slug")
    .eq("publicado", true);
  return (data ?? []).map((p: { slug: string }) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = tryAdminClient();
  if (!supabase) return { title: "Post" };
  const { data } = await supabase
    .from("blog_posts")
    .select("titulo, resumo, meta_title, meta_description, imagem_capa, publicado_em")
    .eq("slug", params.slug)
    .eq("publicado", true)
    .maybeSingle();
  if (!data) return { title: "Post" };

  return {
    title: data.meta_title ?? data.titulo,
    description: data.meta_description ?? data.resumo ?? undefined,
    openGraph: {
      title: data.meta_title ?? data.titulo,
      description: data.meta_description ?? data.resumo ?? undefined,
      type: "article",
      publishedTime: data.publicado_em ?? undefined,
      images: data.imagem_capa ? [data.imagem_capa] : undefined,
    },
    alternates: {
      canonical: `/blog/${params.slug}`,
    },
  };
}

export default async function PostPage({ params }: Props) {
  const supabase = createStaticClient();
  const { data: post } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", params.slug)
    .eq("publicado", true)
    .maybeSingle();

  if (!post) notFound();

  const url = `${SITE_CONFIG.url}/blog/${post.slug}`;

  return (
    <>
      <ArticleSchema
        title={post.titulo}
        description={post.resumo ?? ""}
        image={post.imagem_capa}
        publishedAt={post.publicado_em ?? post.created_at}
        author={post.autor}
        url={url}
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: SITE_CONFIG.url },
          { name: "Blog", url: `${SITE_CONFIG.url}/blog` },
          { name: post.titulo, url },
        ]}
      />

      <section className="bg-hero-gradient py-12 sm:py-16">
        <div className="container-page max-w-3xl">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand-brown hover:text-brand-caramel"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao blog
          </Link>
          <h1 className="mt-4 font-display text-4xl font-medium leading-tight text-brand-brown sm:text-5xl">
            {post.titulo}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-brand-brown/80">
            <span className="inline-flex items-center gap-1.5">
              <User className="h-4 w-4" />
              {post.autor}
            </span>
            {post.publicado_em && (
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {formatDateBR(post.publicado_em)}
              </span>
            )}
          </div>
          {post.tags && post.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {post.tags.map((t) => (
                <Badge key={t} variant="warm">
                  #{t}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-brand-cream py-12 sm:py-16">
        <div className="container-page max-w-3xl">
          <ScrollReveal>
            <article className="prose-mr">
              <MarkdownContent content={post.conteudo} />
            </article>
          </ScrollReveal>

          <div className="mt-14 rounded-3xl bg-amber-gradient p-1">
            <div className="rounded-3xl bg-white p-7 text-center sm:p-10">
              <h3 className="font-display text-3xl font-medium text-brand-brown">
                Pronta para o seu bronze?
              </h3>
              <p className="mt-2 text-brand-caramel">
                Agende online em poucos cliques.
              </p>
              <Button asChild size="lg" className="mt-5">
                <Link href="/agendar">Agendar agora</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/**
 * Renderizador simples de Markdown para os posts iniciais.
 * Suporta: # h1, ## h2, ### h3, **bold**, *italic*, listas - e parágrafos.
 * Em produção, considerar trocar por `react-markdown` + `remark-gfm`.
 */
function MarkdownContent({ content }: { content: string }) {
  const blocks = content.trim().split(/\n\n+/);
  return (
    <div className="space-y-5 text-base leading-relaxed text-brand-caramel sm:text-lg">
      {blocks.map((block, i) => {
        if (block.startsWith("### "))
          return (
            <h3
              key={i}
              className="mt-8 font-display text-2xl font-medium text-brand-brown"
            >
              {block.replace("### ", "")}
            </h3>
          );
        if (block.startsWith("## "))
          return (
            <h2
              key={i}
              className="mt-10 font-display text-3xl font-medium text-brand-brown"
            >
              {block.replace("## ", "")}
            </h2>
          );
        if (block.startsWith("# "))
          return (
            <h1
              key={i}
              className="mt-12 font-display text-4xl font-semibold text-brand-brown"
            >
              {block.replace("# ", "")}
            </h1>
          );
        if (block.startsWith("---")) return <hr key={i} className="my-8" />;
        if (block.startsWith("- ")) {
          const items = block.split("\n").map((l) => l.replace(/^- /, ""));
          return (
            <ul
              key={i}
              className="ml-5 list-disc space-y-1.5 text-brand-caramel marker:text-brand-amber"
            >
              {items.map((it, j) => (
                <li key={j}>{renderInline(it)}</li>
              ))}
            </ul>
          );
        }
        return <p key={i}>{renderInline(block)}</p>;
      })}
    </div>
  );
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**"))
      return (
        <strong key={i} className="font-semibold text-brand-brown">
          {p.slice(2, -2)}
        </strong>
      );
    if (p.startsWith("*") && p.endsWith("*"))
      return (
        <em key={i} className="italic">
          {p.slice(1, -1)}
        </em>
      );
    return <span key={i}>{p}</span>;
  });
}
