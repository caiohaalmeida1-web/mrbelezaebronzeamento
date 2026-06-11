import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Produto } from "@/types/database";
import { ProdutoForm } from "../produto-form";

export const dynamic = "force-dynamic";

export default async function EditarProduto({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data: produto } = await supabase
    .from("produtos")
    .select("*")
    .eq("id", params.id)
    .maybeSingle<Produto>();

  if (!produto) notFound();

  return (
    <div className="space-y-8">
      <header>
        <Link
          href="/admin/produtos"
          className="inline-flex items-center gap-1 text-sm font-semibold text-brand-caramel hover:text-brand-brown"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar aos produtos
        </Link>
        <p className="label-eyebrow mt-4">Catálogo</p>
        <h1 className="mt-2 font-display text-4xl font-medium text-brand-brown sm:text-5xl">
          Editar produto
        </h1>
      </header>

      <ProdutoForm produto={produto} />
    </div>
  );
}
