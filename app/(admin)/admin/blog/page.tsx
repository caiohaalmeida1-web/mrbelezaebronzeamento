import { format } from "date-fns";
import Link from "next/link";
import { FileText, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export default async function AdminBlog() {
  const supabase = createClient();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id, titulo, slug, publicado, publicado_em, autor, tags")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="label-eyebrow">Blog</p>
          <h1 className="mt-2 font-display text-4xl font-medium text-brand-brown sm:text-5xl">
            Posts
          </h1>
        </div>
        <Button asChild>
          <Link href="/admin/blog/novo">
            <Plus className="h-4 w-4" />
            Novo post
          </Link>
        </Button>
      </header>

      {!posts || posts.length === 0 ? (
        <div className="card-brand p-10 text-center">
          <FileText className="mx-auto h-12 w-12 text-brand-caramel/50" />
          <p className="mt-3 text-brand-caramel">Nenhum post ainda.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {posts.map((p) => (
            <li
              key={p.id}
              className="card-brand flex flex-wrap items-center justify-between gap-3 p-5"
            >
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant={p.publicado ? "success" : "warm"}>
                    {p.publicado ? "Publicado" : "Rascunho"}
                  </Badge>
                  {p.publicado_em && (
                    <span className="text-xs text-brand-caramel/70">
                      {format(new Date(p.publicado_em), "dd/MM/yyyy")}
                    </span>
                  )}
                </div>
                <h3 className="mt-1 font-display text-lg font-semibold text-brand-brown">
                  {p.titulo}
                </h3>
                <p className="text-xs text-brand-caramel">/{p.slug}</p>
              </div>
              <Link
                href={`/admin/blog/${p.id}`}
                className="text-sm font-semibold text-brand-amber hover:underline"
              >
                Editar →
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
