"use client";

import { useState } from "react";
import { Gift, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { resgatarPontos } from "./actions";

export function ResgatarBotao({
  clienteId,
  nome,
}: {
  clienteId: string;
  nome: string;
}) {
  const [carregando, setCarregando] = useState(false);

  async function clicar() {
    if (
      !confirm(
        `Resgatar 500 pontos de ${nome}?\nAplique R$30 de desconto na sessão dela.`
      )
    )
      return;

    setCarregando(true);
    try {
      const res = await resgatarPontos(clienteId);
      if (res.ok) toast.success(res.message ?? "Resgate feito!");
      else toast.error(res.erro ?? "Não foi possível resgatar.");
    } catch {
      toast.error("Erro inesperado.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      onClick={clicar}
      disabled={carregando}
    >
      {carregando ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Gift className="h-4 w-4" />
      )}
      Resgatar R$30
    </Button>
  );
}
