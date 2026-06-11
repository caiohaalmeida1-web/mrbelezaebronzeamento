import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProdutoForm } from "../produto-form";

export default function NovoProduto() {
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
          Novo produto
        </h1>
      </header>

      <ProdutoForm />
    </div>
  );
}
