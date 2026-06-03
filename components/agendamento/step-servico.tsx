"use client";

import { Sun, Wind, Clock, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn, formatBRL } from "@/lib/utils";
import type { Servico } from "@/types/database";

interface Props {
  servicos: Servico[];
  servicoSelecionado: string | null;
  onSelect: (id: string) => void;
}

const ICONS = [Sun, Wind] as const;

export function StepServico({ servicos, servicoSelecionado, onSelect }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-3xl font-medium text-brand-brown sm:text-4xl">
          Escolha o seu serviço
        </h2>
        <p className="mt-1 text-sm text-brand-caramel">
          Os dois com a mesma qualidade — você decide a experiência.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {servicos.map((s, i) => {
          const Icon = ICONS[i % ICONS.length];
          const ativo = servicoSelecionado === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelect(s.id)}
              className={cn(
                "card-brand group flex h-full flex-col text-left transition-all",
                ativo &&
                  "ring-2 ring-brand-amber shadow-xl shadow-brand-amber/15"
              )}
            >
              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-gradient text-white shadow">
                    <Icon className="h-5 w-5" />
                  </span>
                  <Badge variant="warm">
                    <Clock className="mr-1 h-3 w-3" />
                    {s.duracao_minutos} min
                  </Badge>
                </div>
                <h3 className="mt-4 font-display text-2xl font-medium text-brand-brown">
                  {s.nome}
                </h3>
                <p className="mt-1.5 flex-1 text-sm leading-relaxed text-brand-caramel">
                  {s.descricao}
                </p>
                <div className="mt-5 flex items-end justify-between border-t border-brand-gold/15 pt-4">
                  <div className="font-display text-2xl font-semibold text-brand-brown">
                    {formatBRL(Number(s.preco))}
                  </div>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 text-sm font-semibold transition-colors",
                      ativo ? "text-brand-amber" : "text-brand-caramel"
                    )}
                  >
                    {ativo ? "Selecionado" : "Selecionar"}
                    <ChevronRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
