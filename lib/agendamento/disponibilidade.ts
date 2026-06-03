import {
  addDays,
  addMinutes,
  format,
  isBefore,
  parseISO,
  setHours,
  setMinutes,
  startOfDay,
} from "date-fns";
import type { HorarioConfig, Bloqueio, Agendamento } from "@/types/database";

export interface SlotDisponivel {
  data: Date;
  iso: string;
  label: string;
}

interface CalcularSlotsParams {
  data: Date;
  duracaoMinutos: number;
  horariosConfig: HorarioConfig[];
  bloqueios: Bloqueio[];
  agendamentos: Pick<Agendamento, "data_hora" | "status">[];
  agora?: Date;
}

/**
 * Retorna os horários livres num determinado dia, levando em conta:
 *  - configuração de horário do dia da semana
 *  - bloqueios cadastrados
 *  - agendamentos já existentes (não cancelados)
 *  - horário atual (não permite no passado nem com menos de 60min de antecedência)
 */
export function calcularSlotsDoDia(
  params: CalcularSlotsParams
): SlotDisponivel[] {
  const {
    data,
    duracaoMinutos,
    horariosConfig,
    bloqueios,
    agendamentos,
    agora = new Date(),
  } = params;

  const diaSemana = data.getDay();
  const config = horariosConfig.find(
    (h) => h.dia_semana === diaSemana && h.ativo
  );
  if (!config) return [];

  const [hi, mi] = config.hora_inicio.split(":").map(Number);
  const [hf, mf] = config.hora_fim.split(":").map(Number);

  const inicio = setMinutes(setHours(startOfDay(data), hi), mi);
  const fim = setMinutes(setHours(startOfDay(data), hf), mf);

  const slots: SlotDisponivel[] = [];
  let atual = inicio;
  const minimoAntecedencia = addMinutes(agora, 60);

  while (isBefore(addMinutes(atual, duracaoMinutos), addMinutes(fim, 1))) {
    const slotInicio = atual;
    const slotFim = addMinutes(atual, duracaoMinutos);

    const noPassado = isBefore(slotInicio, minimoAntecedencia);

    const bloqueado = bloqueios.some((b) => {
      const bi = parseISO(b.data_inicio);
      const bf = parseISO(b.data_fim);
      return slotInicio < bf && slotFim > bi;
    });

    const ocupado = agendamentos.some((a) => {
      if (a.status === "cancelado" || a.status === "no_show") return false;
      const ai = parseISO(a.data_hora);
      const af = addMinutes(ai, duracaoMinutos);
      return slotInicio < af && slotFim > ai;
    });

    if (!noPassado && !bloqueado && !ocupado) {
      slots.push({
        data: slotInicio,
        iso: slotInicio.toISOString(),
        label: format(slotInicio, "HH:mm"),
      });
    }

    atual = addMinutes(atual, config.intervalo_minutos);
  }

  return slots;
}

/**
 * Retorna os próximos N dias com info sobre disponibilidade.
 */
export function gerarDiasDisponiveis(
  hoje: Date,
  dias: number,
  horariosConfig: HorarioConfig[]
) {
  const lista: { data: Date; ativo: boolean }[] = [];
  for (let i = 0; i < dias; i++) {
    const d = addDays(hoje, i);
    const ativo = horariosConfig.some(
      (h) => h.dia_semana === d.getDay() && h.ativo
    );
    lista.push({ data: d, ativo });
  }
  return lista;
}
