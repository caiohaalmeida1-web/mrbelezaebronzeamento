import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { BlogPost } from "@/types/database";
import { PostForm } from "../post-form";

export const dynamic = "force-dynamic";

export default async function EditarPost({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data: post } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("id", params.id)
    .maybeSingle<BlogPost>();

  if (!post) notFound();

  return (
    <div className="space-y-8">
      <header>
        <Link
          href="/admin/blog"
          className="inline-flex items-center gap-1 text-sm font-semibold text-brand-caramel hover:text-brand-brown"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar aos posts
        </Link>
        <p className="label-eyebrow mt-4">Blog</p>
        <h1 className="mt-2 font-display text-4xl font-medium text-brand-brown sm:text-5xl">
          Editar post
        </h1>
      </header>

      <PostForm post={post} />
    </div>
  );
}
