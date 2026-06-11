import { addDays, format, isSameDay, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AgendamentoSlot {
  id: string;
  data_hora: string;
  status: string;
  cliente: string;
  servico: string;
}

interface ConfigDia {
  dia_semana: number;
  hora_inicio: string; // "08:00:00"
  hora_fim: string;
  ativo: boolean;
}

const STATUS_ESTILO: Record<string, string> = {
  pendente: "bg-amber-100 text-amber-900 ring-amber-300",
  confirmado: "bg-emerald-100 text-emerald-900 ring-emerald-300",
  concluido: "bg-sky-100 text-sky-900 ring-sky-300",
};

function horaParaNumero(hora: string): number {
  return Number(hora.split(":")[0]);
}

/**
 * Grade semanal estilo agenda: 7 dias × horários de atendimento,
 * com os agendamentos posicionados nos seus slots.
 */
export function AgendaSemanal({
  agendamentos,
  config,
}: {
  agendamentos: AgendamentoSlot[];
  config: ConfigDia[];
}) {
  const hoje = new Date();
  const dias = Array.from({ length: 7 }, (_, i) => addDays(hoje, i));

  const ativos = config.filter((c) => c.ativo);
  const horaMin = ativos.length
    ? Math.min(...ativos.map((c) => horaParaNumero(c.hora_inicio)))
    : 8;
  const horaMax = ativos.length
    ? Math.max(...ativos.map((c) => horaParaNumero(c.hora_fim)))
    : 18;
  const horas = Array.from(
    { length: horaMax - horaMin },
    (_, i) => horaMin + i
  );

  function configDoDia(d: Date): ConfigDia | undefined {
    return ativos.find((c) => c.dia_semana === d.getDay());
  }

  function agendamentoNoSlot(d: Date, hora: number): AgendamentoSlot | undefined {
    return agendamentos.find((a) => {
      const data = new Date(a.data_hora);
      return isSameDay(data, d) && data.getHours() === hora;
    });
  }

  return (
    <div className="card-brand overflow-x-auto p-4">
      <div className="min-w-[760px]">
        {/* Cabeçalho dos dias */}
        <div className="grid grid-cols-[56px_repeat(7,1fr)] gap-1">
          <div />
          {dias.map((d) => (
            <div
              key={d.toISOString()}
              className={`rounded-xl px-1 py-2 text-center ${
                isToday(d) ? "bg-brand-brown text-brand-sun" : "text-brand-brown"
              }`}
            >
              <div className="text-[10px] font-semibold uppercase tracking-wider opacity-75">
                {format(d, "EEE", { locale: ptBR })}
              </div>
              <div className="font-display text-lg font-semibold leading-tight">
                {format(d, "dd/MM")}
              </div>
            </div>
          ))}
        </div>

        {/* Linhas de horário */}
        <div className="mt-1 space-y-1">
          {horas.map((hora) => (
            <div
              key={hora}
              className="grid grid-cols-[56px_repeat(7,1fr)] gap-1"
            >
              <div className="flex items-center justify-end pr-2 text-xs font-semibold text-brand-caramel/70">
                {String(hora).padStart(2, "0")}h
              </div>
              {dias.map((d) => {
                const cfg = configDoDia(d);
                const fechado =
                  !cfg ||
                  hora < horaParaNumero(cfg.hora_inicio) ||
                  hora >= horaParaNumero(cfg.hora_fim);

                if (fechado) {
                  return (
                    <div
                      key={d.toISOString()}
                      className="h-12 rounded-lg bg-brand-brown/[0.04]"
                      aria-hidden
                    />
                  );
                }

                const ag = agendamentoNoSlot(d, hora);
                if (!ag) {
                  return (
                    <div
                      key={d.toISOString()}
                      className="h-12 rounded-lg border border-dashed border-brand-gold/25 bg-white/50"
                    />
                  );
                }

                return (
                  <div
                    key={d.toISOString()}
                    title={`${format(new Date(ag.data_hora), "HH:mm")} · ${ag.cliente} · ${ag.servico} (${ag.status})`}
                    className={`flex h-12 flex-col justify-center overflow-hidden rounded-lg px-2 ring-1 ${
                      STATUS_ESTILO[ag.status] ??
                      "bg-stone-100 text-stone-700 ring-stone-300"
                    }`}
                  >
                    <span className="truncate text-[11px] font-bold leading-tight">
                      {ag.cliente}
                    </span>
                    <span className="truncate text-[10px] leading-tight opacity-80">
                      {ag.servico}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Legenda */}
        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-brand-caramel">
          <Legenda cor="bg-amber-100 ring-amber-300" label="Pendente" />
          <Legenda cor="bg-emerald-100 ring-emerald-300" label="Confirmado" />
          <Legenda cor="bg-sky-100 ring-sky-300" label="Concluído" />
          <Legenda
            cor="border border-dashed border-brand-gold/40 bg-white"
            label="Livre"
          />
          <Legenda cor="bg-brand-brown/10" label="Fechado" />
        </div>
      </div>
    </div>
  );
}

function Legenda({ cor, label }: { cor: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-3.5 w-3.5 rounded ring-1 ring-inset ${cor}`} />
      {label}
    </span>
  );
}
