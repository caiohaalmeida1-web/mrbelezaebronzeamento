"use client";

import { useEffect, useMemo, useState } from "react";
import { addDays, format, isSameDay, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import {
  calcularSlotsDoDia,
  gerarDiasDisponiveis,
  type SlotDisponivel,
} from "@/lib/agendamento/disponibilidade";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type {
  Agendamento,
  Bloqueio,
  HorarioConfig,
} from "@/types/database";

interface Props {
  duracaoMinutos: number;
  horariosConfig: HorarioConfig[];
  bloqueios: Bloqueio[];
  agendamentosIniciais: Pick<Agendamento, "data_hora" | "status">[];
  slotSelecionado: string | null;
  onSelect: (iso: string | null) => void;
}

const DIAS_VISIVEIS = 14;

export function StepDataHora({
  duracaoMinutos,
  horariosConfig,
  bloqueios,
  agendamentosIniciais,
  slotSelecionado,
  onSelect,
}: Props) {
  const hoje = useMemo(() => startOfDay(new Date()), []);
  const dias = useMemo(
    () => gerarDiasDisponiveis(hoje, DIAS_VISIVEIS, horariosConfig),
    [hoje, horariosConfig]
  );

  const primeiroAtivo = dias.find((d) => d.ativo)?.data ?? hoje;
  const [diaAtivo, setDiaAtivo] = useState<Date>(primeiroAtivo);

  const [agendamentos, setAgendamentos] = useState(agendamentosIniciais);

  // Realtime: ouve novos agendamentos
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("agendamentos-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "agendamentos" },
        (payload) => {
          const novo = payload.new as Agendamento | null;
          const antigo = payload.old as Agendamento | null;
          setAgendamentos((prev) => {
            const next = prev.filter(
              (a) =>
                !(antigo && a.data_hora === antigo.data_hora) &&
                !(novo && a.data_hora === novo.data_hora)
            );
            if (novo && novo.status !== "cancelado") {
              next.push({ data_hora: novo.data_hora, status: novo.status });
            }
            return next;
          });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const slots: SlotDisponivel[] = useMemo(
    () =>
      calcularSlotsDoDia({
        data: diaAtivo,
        duracaoMinutos,
        horariosConfig,
        bloqueios,
        agendamentos,
      }),
    [diaAtivo, duracaoMinutos, horariosConfig, bloqueios, agendamentos]
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-3xl font-medium text-brand-brown sm:text-4xl">
          Quando você quer brilhar?
        </h2>
        <p className="mt-1 flex items-center gap-2 text-sm text-brand-caramel">
          <CalendarIcon className="h-4 w-4 text-brand-amber" />
          Horários atualizados em tempo real.
        </p>
      </div>

      {/* Dias */}
      <div className="-mx-2 overflow-x-auto pb-1 no-scrollbar">
        <div className="flex gap-2 px-2">
          {dias.map((d) => {
            const ativo = isSameDay(d.data, diaAtivo);
            const desabilitado = !d.ativo;
            return (
              <button
                key={d.data.toISOString()}
                type="button"
                disabled={desabilitado}
                onClick={() => {
                  setDiaAtivo(d.data);
                  onSelect(null);
                }}
                className={cn(
                  "flex w-[68px] shrink-0 flex-col items-center gap-0.5 rounded-2xl border-2 px-3 py-3 transition-all sm:w-[78px]",
                  ativo
                    ? "border-brand-amber bg-brand-amber text-white shadow-lg"
                    : "border-brand-gold/20 bg-white text-brand-brown hover:border-brand-amber/60",
                  desabilitado && "opacity-40"
                )}
                aria-pressed={ativo}
              >
                <span
                  className={cn(
                    "text-[10px] font-semibold uppercase tracking-wider",
                    ativo ? "text-white/80" : "text-brand-caramel/70"
                  )}
                >
                  {format(d.data, "EEE", { locale: ptBR })}
                </span>
                <span className="font-display text-2xl font-semibold leading-none">
                  {format(d.data, "dd")}
                </span>
                <span
                  className={cn(
                    "text-[10px] font-semibold uppercase tracking-wider",
                    ativo ? "text-white/80" : "text-brand-caramel/70"
                  )}
                >
                  {format(d.data, "MMM", { locale: ptBR })}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Slots */}
      <div>
        <p className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-brand-brown">
          <Clock className="h-4 w-4 text-brand-amber" />
          Horários disponíveis em{" "}
          <span className="font-display text-base font-semibold">
            {format(diaAtivo, "dd 'de' MMMM", { locale: ptBR })}
          </span>
        </p>

        {slots.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-brand-gold/30 bg-brand-warm/40 px-4 py-8 text-center text-sm text-brand-caramel">
            Não há horários disponíveis neste dia.
            <br />
            Tente outro dia ou fale com a Mércia no WhatsApp.
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
            {slots.map((s) => {
              const ativo = slotSelecionado === s.iso;
              return (
                <button
                  key={s.iso}
                  type="button"
                  onClick={() => onSelect(ativo ? null : s.iso)}
                  className={cn(
                    "rounded-xl border-2 px-3 py-2.5 text-sm font-semibold transition-all",
                    ativo
                      ? "border-brand-amber bg-brand-amber text-white shadow-md"
                      : "border-brand-gold/20 bg-white text-brand-brown hover:border-brand-amber/60"
                  )}
                  aria-pressed={ativo}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
