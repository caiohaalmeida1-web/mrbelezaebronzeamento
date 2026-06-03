import Link from "next/link";
import { Edit, Plus, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { formatBRL } from "@/lib/utils";

export default async function AdminProdutos() {
  const supabase = createClient();
  const { data: produtos } = await supabase
    .from("produtos")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="label-eyebrow">Catálogo</p>
          <h1 className="mt-2 font-display text-4xl font-medium text-brand-brown sm:text-5xl">
            Produtos
          </h1>
        </div>
        <Button asChild>
          <Link href="/admin/produtos/novo">
            <Plus className="h-4 w-4" />
            Novo produto
          </Link>
        </Button>
      </header>

      {!produtos || produtos.length === 0 ? (
        <div className="card-brand p-10 text-center">
          <Package className="mx-auto h-12 w-12 text-brand-caramel/50" />
          <p className="mt-3 text-brand-caramel">Nenhum produto cadastrado.</p>
        </div>
      ) : (
        <div className="card-brand overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-gold/15 text-left text-xs uppercase tracking-wider text-brand-caramel">
                <th className="px-5 py-3">Produto</th>
                <th className="px-5 py-3">Tipo</th>
                <th className="px-5 py-3">Preço</th>
                <th className="px-5 py-3">Estoque</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {produtos.map((p) => (
                <tr key={p.id} className="border-b border-brand-gold/10 last:border-b-0">
                  <td className="px-5 py-3">
                    <div className="font-semibold text-brand-brown">{p.nome}</div>
                    <div className="text-xs text-brand-caramel">{p.slug}</div>
                  </td>
                  <td className="px-5 py-3 text-brand-caramel">{p.tipo}</td>
                  <td className="px-5 py-3 font-semibold text-brand-brown">
                    {formatBRL(Number(p.preco))}
                  </td>
                  <td className="px-5 py-3">
                    {p.tipo === "fisico" ? (
                      <Badge variant={p.estoque < 5 ? "danger" : "warm"}>
                        {p.estoque} un.
                      </Badge>
                    ) : (
                      <span className="text-brand-caramel/70">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <Badge variant={p.ativo ? "success" : "outline"}>
                      {p.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      href={`/admin/produtos/${p.id}`}
                      className="inline-flex items-center gap-1 text-brand-amber hover:underline"
                    >
                      <Edit className="h-3.5 w-3.5" />
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
