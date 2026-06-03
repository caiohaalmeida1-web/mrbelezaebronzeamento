"use client";

import { ShieldCheck, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface DadosCliente {
  nome: string;
  email: string;
  telefone: string;
  observacoes: string;
  codigoAfiliado: string;
}

interface Props {
  dados: DadosCliente;
  onChange: (data: DadosCliente) => void;
  perfilLogado?: { full_name: string; email: string; phone: string | null } | null;
}

export function StepDados({ dados, onChange, perfilLogado }: Props) {
  const update = (patch: Partial<DadosCliente>) =>
    onChange({ ...dados, ...patch });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-3xl font-medium text-brand-brown sm:text-4xl">
          Conta para a Mércia
        </h2>
        <p className="mt-1 text-sm text-brand-caramel">
          Esses dados ficam só com a gente.
        </p>
      </div>

      {perfilLogado && (
        <div className="flex items-start gap-3 rounded-2xl bg-brand-warm/70 px-4 py-3 text-sm text-brand-brown ring-1 ring-brand-gold/15">
          <User className="mt-0.5 h-4 w-4 text-brand-amber" />
          <div>
            <strong className="font-semibold">
              Olá, {perfilLogado.full_name.split(" ")[0]}!
            </strong>{" "}
            Já preenchemos seus dados. É só conferir.
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="nome">Nome*</Label>
          <Input
            id="nome"
            value={dados.nome}
            onChange={(e) => update({ nome: e.target.value })}
            required
            placeholder="Seu nome completo"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">E-mail*</Label>
          <Input
            id="email"
            type="email"
            value={dados.email}
            onChange={(e) => update({ email: e.target.value })}
            required
            placeholder="seu@email.com"
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="telefone">WhatsApp*</Label>
          <Input
            id="telefone"
            type="tel"
            value={dados.telefone}
            onChange={(e) => update({ telefone: e.target.value })}
            required
            placeholder="(61) 99999-9999"
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="observacoes">Observações (opcional)</Label>
          <Textarea
            id="observacoes"
            value={dados.observacoes}
            onChange={(e) => update({ observacoes: e.target.value })}
            placeholder="Algo que a Mércia precisa saber? (alergia, primeira vez, evento, etc.)"
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="codigoAfiliado">
            Código de indicação (opcional)
          </Label>
          <Input
            id="codigoAfiliado"
            value={dados.codigoAfiliado}
            onChange={(e) => update({ codigoAfiliado: e.target.value })}
            placeholder="Ganhe pontos extras se uma amiga te indicou"
          />
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900 ring-1 ring-emerald-200">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
        <div>
          <strong className="font-semibold">Política de cancelamento:</strong>{" "}
          reembolso integral em cancelamentos com mais de 24h. Para cancelar
          com menos de 24h, fale conosco no WhatsApp.
        </div>
      </div>
    </div>
  );
}
