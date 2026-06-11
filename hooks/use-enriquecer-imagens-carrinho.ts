"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useCarrinho } from "@/hooks/use-carrinho";

/** Busca no Supabase fotos faltantes (sacola antiga ou página em cache). */
export function useEnriquecerImagensCarrinho() {
  const itens = useCarrinho((s) => s.itens);
  const atualizarImagens = useCarrinho((s) => s.atualizarImagens);

  useEffect(() => {
    const pendentes = itens.filter((i) => !i.imagem);
    if (pendentes.length === 0) return;

    const supabase = createClient();
    void supabase
      .from("produtos")
      .select("id, imagens")
      .in(
        "id",
        pendentes.map((i) => i.id)
      )
      .then(({ data, error }) => {
        if (error || !data?.length) return;

        const map: Record<string, string> = {};
        for (const p of data) {
          const url = Array.isArray(p.imagens) ? p.imagens[0] : undefined;
          if (typeof url === "string" && url) map[p.id] = url;
        }
        if (Object.keys(map).length > 0) atualizarImagens(map);
      });
  }, [itens, atualizarImagens]);
}
