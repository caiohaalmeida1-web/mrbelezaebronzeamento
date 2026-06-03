"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { marcarConcluido } from "./actions";

export function MarcarConcluidoBotao({
  agendamentoId,
}: {
  agendamentoId: string;
}) {
  const [carregando, setCarregando] = useState(false);

  async function clicar() {
    setCarregando(true);
    try {
      const res = await marcarConcluido(agendamentoId);
      if (res.ok) toast.success("Sessão marcada como concluída! +100 pts.");
      else toast.error("Não foi possível atualizar.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <Button
      type="button"
      size="sm"
      onClick={clicar}
      disabled={carregando}
      variant="amber"
    >
      {carregando ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Check className="h-3.5 w-3.5" />
      )}
      Concluir
    </Button>
  );
}
