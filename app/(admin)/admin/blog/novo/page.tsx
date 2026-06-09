import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PostForm } from "../post-form";

export default function NovoPost() {
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
          Novo post
        </h1>
      </header>

      <PostForm />
    </div>
  );
}
