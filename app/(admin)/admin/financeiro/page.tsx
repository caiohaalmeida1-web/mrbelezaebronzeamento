import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DollarSign, ShoppingBag, Sparkles, TrendingUp } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatBRL } from "@/lib/utils";

export default async function AdminFinanceiro() {
  const supabase = createClient();
  const hoje = new Date();
  const mesAtualInicio = startOfMonth(hoje).toISOString();
  const mesAtualFim = endOfMonth(hoje).toISOString();
  const mesAnteriorInicio = startOfMonth(subMonths(hoje, 1)).toISOString();
  const mesAnteriorFim = endOfMonth(subMonths(hoje, 1)).toISOString();

  const [agendAtual, agendAnterior, pedidosAtual] = await Promise.all([
    supabase
      .from("agendamentos")
      .select("valor_pago")
      .gte("data_hora", mesAtualInicio)
      .lte("data_hora", mesAtualFim)
      .in("status", ["confirmado", "concluido"]),
    supabase
      .from("agendamentos")
      .select("valor_pago")
      .gte("data_hora", mesAnteriorInicio)
      .lte("data_hora", mesAnteriorFim)
      .in("status", ["confirmado", "concluido"]),
    supabase
      .from("pedidos")
      .select("valor_total, status")
      .gte("created_at", mesAtualInicio)
      .lte("created_at", mesAtualFim)
      .in("status", ["pago", "enviado", "entregue"]),
  ]);

  const totalAgend = (agendAtual.data ?? []).reduce(
    (acc, a) => acc + Number(a.valor_pago ?? 0),
    0
  );
  const totalAgendAnt = (agendAnterior.data ?? []).reduce(
    (acc, a) => acc + Number(a.valor_pago ?? 0),
    0
  );
  const totalPedidos = (pedidosAtual.data ?? []).reduce(
    (acc, p) => acc + Number(p.valor_total),
    0
  );

  const totalGeral = totalAgend + totalPedidos;
  const variacao =
    totalAgendAnt === 0
      ? 100
      : ((totalAgend - totalAgendAnt) / totalAgendAnt) * 100;

  return (
    <div className="space-y-8">
      <header>
        <p className="label-eyebrow">Mês de</p>
        <h1 className="mt-2 font-display text-4xl font-medium text-brand-brown sm:text-5xl">
          {format(hoje, "MMMM 'de' yyyy", { locale: ptBR })}
        </h1>
      </header>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          icon={DollarSign}
          label="Total do mês"
          value={formatBRL(totalGeral)}
          accent
        />
        <Stat
          icon={Sparkles}
          label="Sessões"
          value={formatBRL(totalAgend)}
        />
        <Stat
          icon={ShoppingBag}
          label="Loja"
          value={formatBRL(totalPedidos)}
        />
        <Stat
          icon={TrendingUp}
          label="vs mês anterior"
          value={`${variacao >= 0 ? "+" : ""}${variacao.toFixed(0)}%`}
        />
      </div>

      <div className="card-brand p-6">
        <h2 className="font-display text-2xl text-brand-brown">
          Exportar relatório
        </h2>
        <p className="mt-1 text-sm text-brand-caramel">
          Baixe um CSV com todas as movimentações do mês para sua contabilidade.
        </p>
        <a
          href={`/api/financeiro/csv?inicio=${mesAtualInicio}&fim=${mesAtualFim}`}
          className="btn-primary mt-5 inline-flex"
        >
          Baixar CSV
        </a>
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  accent = false,
}: {
  icon: typeof DollarSign;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`card-brand p-5 ${
        accent ? "bg-brand-brown text-brand-sun ring-0" : ""
      }`}
    >
      <Icon
        className={`h-5 w-5 ${
          accent ? "text-brand-sun" : "text-brand-amber"
        }`}
      />
      <p
        className={`mt-3 text-xs uppercase tracking-wider ${
          accent ? "text-brand-sun/70" : "text-brand-caramel/70"
        }`}
      >
        {label}
      </p>
      <p
        className={`font-display text-3xl font-semibold ${
          accent ? "text-brand-sun" : "text-brand-brown"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
