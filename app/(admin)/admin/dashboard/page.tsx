import { format, startOfDay, endOfDay, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertTriangle,
  Calendar,
  DollarSign,
  Package,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatBRL } from "@/lib/utils";

export default async function AdminDashboard() {
  const supabase = createClient();
  const hoje = new Date();
  const inicioDia = startOfDay(hoje).toISOString();
  const fimDia = endOfDay(hoje).toISOString();
  const inicioMes = startOfMonth(hoje).toISOString();

  const [
    { data: agendamentosHoje },
    { data: pedidosHoje },
    { count: novosCadastros },
    { data: produtosBaixos },
    { data: faturamentoMes },
  ] = await Promise.all([
    supabase
      .from("agendamentos")
      .select("id, data_hora, valor_pago, status, profiles(full_name), servicos(nome)")
      .gte("data_hora", inicioDia)
      .lte("data_hora", fimDia)
      .order("data_hora"),
    supabase
      .from("pedidos")
      .select("valor_total")
      .gte("created_at", inicioDia)
      .eq("status", "pago"),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "cliente")
      .gte("created_at", inicioMes),
    supabase
      .from("produtos")
      .select("nome, estoque")
      .lt("estoque", 5)
      .eq("tipo", "fisico")
      .eq("ativo", true)
      .order("estoque"),
    supabase
      .from("agendamentos")
      .select("valor_pago")
      .gte("data_hora", inicioMes)
      .in("status", ["confirmado", "concluido"]),
  ]);

  const faturamentoDia =
    (pedidosHoje ?? []).reduce((acc, p) => acc + Number(p.valor_total), 0) +
    (agendamentosHoje ?? []).reduce(
      (acc, a) => acc + (a.status !== "cancelado" ? Number(a.valor_pago ?? 0) : 0),
      0
    );

  const faturamentoMesTotal = (faturamentoMes ?? []).reduce(
    (acc, a) => acc + Number(a.valor_pago ?? 0),
    0
  );

  return (
    <div className="space-y-8">
      <header>
        <p className="label-eyebrow">Visão geral</p>
        <h1 className="mt-2 font-display text-4xl font-medium text-brand-brown sm:text-5xl">
          Dashboard
        </h1>
        <p className="mt-1 text-brand-caramel">
          {format(hoje, "EEEE, dd 'de' MMMM", { locale: ptBR })}
        </p>
      </header>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          icon={DollarSign}
          label="Faturamento hoje"
          value={formatBRL(faturamentoDia)}
          accent
        />
        <Stat
          icon={Calendar}
          label="Sessões hoje"
          value={String(agendamentosHoje?.length ?? 0)}
        />
        <Stat
          icon={Users}
          label="Novas clientes / mês"
          value={String(novosCadastros ?? 0)}
        />
        <Stat
          icon={DollarSign}
          label="Faturamento mês"
          value={formatBRL(faturamentoMesTotal)}
        />
      </div>

      <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="card-brand p-6">
          <h2 className="flex items-center gap-2 font-display text-2xl text-brand-brown">
            <Calendar className="h-5 w-5 text-brand-amber" />
            Agenda de hoje
          </h2>
          {!agendamentosHoje || agendamentosHoje.length === 0 ? (
            <p className="mt-3 text-brand-caramel">
              Nenhum agendamento hoje. Bom dia para descansar.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-brand-gold/10">
              {agendamentosHoje.map((a) => (
                <li key={a.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-semibold text-brand-brown">
                      {/* @ts-expect-error rel */}
                      {a.profiles?.full_name ?? "Cliente"}
                    </p>
                    <p className="text-sm text-brand-caramel">
                      {/* @ts-expect-error rel */}
                      {a.servicos?.nome}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-lg font-semibold text-brand-brown">
                      {format(new Date(a.data_hora), "HH:mm")}
                    </p>
                    <p className="text-xs text-brand-caramel">{a.status}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card-brand p-6">
          <h2 className="flex items-center gap-2 font-display text-2xl text-brand-brown">
            <Package className="h-5 w-5 text-brand-amber" />
            Estoque baixo
          </h2>
          {!produtosBaixos || produtosBaixos.length === 0 ? (
            <p className="mt-3 text-brand-caramel">
              Estoque saudável em todos os produtos.
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {produtosBaixos.map((p) => (
                <li
                  key={p.nome}
                  className="flex items-center justify-between rounded-2xl bg-amber-50 px-4 py-3 ring-1 ring-amber-200"
                >
                  <span className="flex items-center gap-2 text-sm font-semibold text-amber-900">
                    <AlertTriangle className="h-4 w-4" />
                    {p.nome}
                  </span>
                  <span className="text-sm font-bold text-amber-900">
                    {p.estoque} un.
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
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
      <div
        className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${
          accent
            ? "bg-brand-sun/15 text-brand-sun"
            : "bg-amber-gradient text-white"
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>
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
