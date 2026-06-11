import {
  startOfMonth,
  endOfMonth,
  subMonths,
  format,
  getDaysInMonth,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  BarChart3,
  DollarSign,
  PieChart,
  Receipt,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { BarrasHorizontais, BarrasVerticais } from "@/components/admin/charts";
import { createClient } from "@/lib/supabase/server";
import { formatBRL } from "@/lib/utils";

interface AgendamentoFin {
  data_hora: string;
  valor_pago: number | null;
  status: string;
  servicos: { nome: string } | null;
}

export default async function AdminFinanceiro() {
  const supabase = createClient();
  const hoje = new Date();
  const mesAtualInicio = startOfMonth(hoje).toISOString();
  const mesAtualFim = endOfMonth(hoje).toISOString();
  const mesAnteriorInicio = startOfMonth(subMonths(hoje, 1)).toISOString();
  const mesAnteriorFim = endOfMonth(subMonths(hoje, 1)).toISOString();

  const [agendAtualRes, agendAnterior, pedidosAtual] = await Promise.all([
    supabase
      .from("agendamentos")
      .select("data_hora, valor_pago, status, servicos(nome)")
      .gte("data_hora", mesAtualInicio)
      .lte("data_hora", mesAtualFim),
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

  const agendamentos = (agendAtualRes.data ??
    []) as unknown as AgendamentoFin[];
  const validos = agendamentos.filter((a) =>
    ["confirmado", "concluido"].includes(a.status)
  );
  const cancelados = agendamentos.filter((a) => a.status === "cancelado");
  const noShows = agendamentos.filter((a) => a.status === "no_show");

  const totalAgend = validos.reduce(
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

  const ticketMedio = validos.length > 0 ? totalAgend / validos.length : 0;
  const taxaCancelamento =
    agendamentos.length > 0
      ? ((cancelados.length + noShows.length) / agendamentos.length) * 100
      : 0;

  // Faturamento por dia do mês
  const diasNoMes = getDaysInMonth(hoje);
  const porDia = Array.from({ length: diasNoMes }, (_, i) => ({
    label: String(i + 1),
    value: 0,
    sessoes: 0,
    destaque: i + 1 === hoje.getDate(),
  }));
  for (const a of validos) {
    const dia = new Date(a.data_hora).getDate() - 1;
    if (porDia[dia]) {
      porDia[dia].value += Number(a.valor_pago ?? 0);
      porDia[dia].sessoes += 1;
    }
  }

  // Receita por serviço
  const porServico = new Map<string, { valor: number; sessoes: number }>();
  for (const a of validos) {
    const nome = a.servicos?.nome ?? "Outros";
    const atual = porServico.get(nome) ?? { valor: 0, sessoes: 0 };
    atual.valor += Number(a.valor_pago ?? 0);
    atual.sessoes += 1;
    porServico.set(nome, atual);
  }
  const rankingServicos = [...porServico.entries()]
    .map(([nome, v]) => ({
      label: nome,
      value: v.valor,
      hint: `${v.sessoes} ${v.sessoes === 1 ? "sessão" : "sessões"}`,
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-8">
      <header>
        <p className="label-eyebrow">Financeiro · Mês de</p>
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
        <Stat icon={Sparkles} label="Sessões" value={formatBRL(totalAgend)} />
        <Stat icon={ShoppingBag} label="Loja" value={formatBRL(totalPedidos)} />
        <Stat
          icon={TrendingUp}
          label="vs mês anterior"
          value={`${variacao >= 0 ? "+" : ""}${variacao.toFixed(0)}%`}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <Stat
          icon={Receipt}
          label="Ticket médio"
          value={formatBRL(ticketMedio)}
        />
        <Stat
          icon={BarChart3}
          label="Sessões pagas"
          value={String(validos.length)}
        />
        <Stat
          icon={XCircle}
          label="Cancelamentos + faltas"
          value={`${taxaCancelamento.toFixed(0)}%`}
        />
      </div>

      <div className="card-brand p-6">
        <h2 className="flex items-center gap-2 font-display text-2xl text-brand-brown">
          <BarChart3 className="h-5 w-5 text-brand-amber" />
          Faturamento por dia
        </h2>
        <p className="mt-1 text-sm text-brand-caramel">
          Sessões confirmadas e concluídas ao longo do mês. O dia de hoje
          aparece em destaque.
        </p>
        <div className="mt-6">
          <BarrasVerticais
            data={porDia.map(({ label, value, sessoes, destaque }) => ({
              label,
              value,
              destaque,
              hint: `${sessoes} ${sessoes === 1 ? "sessão" : "sessões"}`,
            }))}
            formatValue={(v) => formatBRL(v)}
          />
        </div>
      </div>

      <div className="card-brand p-6">
        <h2 className="flex items-center gap-2 font-display text-2xl text-brand-brown">
          <PieChart className="h-5 w-5 text-brand-amber" />
          Receita por serviço
        </h2>
        {rankingServicos.length === 0 ? (
          <p className="mt-3 text-sm text-brand-caramel">
            Nenhuma sessão paga neste mês ainda.
          </p>
        ) : (
          <div className="mt-6">
            <BarrasHorizontais
              data={rankingServicos}
              formatValue={(v) => formatBRL(v)}
            />
          </div>
        )}
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
        className={`h-5 w-5 ${accent ? "text-brand-sun" : "text-brand-amber"}`}
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
