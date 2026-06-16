import { format } from "date-fns";
import { Package, Receipt, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { formatBRL, FORMA_ENTREGA_LABEL } from "@/lib/utils";
import type { FormaEntrega } from "@/types/database";

const STATUS_VAR: Record<string, BadgeProps["variant"]> = {
  pendente: "warm",
  pago: "success",
  enviado: "amber",
  entregue: "default",
  cancelado: "danger",
  reembolsado: "outline",
};

interface PedidoComItens {
  id: string;
  status: string;
  valor_total: number;
  forma_entrega: FormaEntrega | null;
  created_at: string;
  pedido_itens:
    | {
        quantidade: number;
        produtos: { nome: string; slug: string } | null;
      }[]
    | null;
}

export default async function ComprasPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: pedidos } = await supabase
    .from("pedidos")
    .select(
      "id, status, valor_total, forma_entrega, created_at, pedido_itens(quantidade, produtos(nome, slug))"
    )
    .eq("cliente_id", user.id)
    .order("created_at", { ascending: false })
    .returns<PedidoComItens[]>();

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="label-eyebrow">Histórico</p>
          <h1 className="mt-2 font-display text-4xl font-medium text-brand-brown sm:text-5xl">
            Minhas compras
          </h1>
        </div>
        <Button asChild>
          <Link href="/loja">
            <ShoppingBag className="h-4 w-4" />
            Comprar mais
          </Link>
        </Button>
      </header>

      {!pedidos || pedidos.length === 0 ? (
        <div className="card-brand p-10 text-center">
          <Package className="mx-auto h-12 w-12 text-brand-caramel/50" />
          <h2 className="mt-4 font-display text-2xl text-brand-brown">
            Nenhuma compra ainda
          </h2>
          <p className="mt-1 text-brand-caramel">
            Conheça nossa linha Click 10.
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {pedidos.map((p) => (
            <li key={p.id} className="card-brand p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Receipt className="h-4 w-4 text-brand-amber" />
                    <span className="font-mono text-xs text-brand-caramel/70">
                      #{p.id.slice(0, 8)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-brand-caramel/70">
                    {format(new Date(p.created_at), "dd/MM/yyyy 'às' HH:mm")}
                    {p.forma_entrega && (
                      <>
                        {" · "}
                        {FORMA_ENTREGA_LABEL[p.forma_entrega]}
                      </>
                    )}
                  </p>
                  <ul className="mt-3 space-y-0.5 text-sm text-brand-brown">
                    {p.pedido_itens?.map((it, i) => (
                      <li key={i}>
                        <strong>{it.quantidade}×</strong>{" "}
                        {it.produtos?.nome ?? "Produto"}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="text-right">
                  <Badge variant={STATUS_VAR[p.status]}>{p.status}</Badge>
                  <div className="mt-2 font-display text-xl font-semibold text-brand-brown">
                    {formatBRL(Number(p.valor_total))}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
