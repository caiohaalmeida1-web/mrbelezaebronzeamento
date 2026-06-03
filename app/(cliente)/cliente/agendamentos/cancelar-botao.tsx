"use client";

import { useState } from "react";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cancelarAgendamento } from "@/app/(public)/agendar/actions";

export function CancelarBotao({ agendamentoId }: { agendamentoId: string }) {
  const [carregando, setCarregando] = useState(false);

  async function clicar() {
    if (!confirm("Tem certeza que quer cancelar? O reembolso é integral em cancelamentos com mais de 24h.")) return;

    setCarregando(true);
    try {
      const res = await cancelarAgendamento(agendamentoId);
      if (res.ok) toast.success(res.message ?? "Cancelado com sucesso.");
      else toast.error(res.message ?? "Não foi possível cancelar.");
    } catch {
      toast.error("Erro inesperado.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={clicar}
      disabled={carregando}
      className="mt-2 text-red-500 hover:bg-red-50 hover:text-red-600"
    >
      {carregando ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
      Cancelar
    </Button>
  );
}
