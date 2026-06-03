"use client";

import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCarrinho } from "@/hooks/use-carrinho";
import type { Produto } from "@/types/database";

export function BotaoAdicionar({ produto }: { produto: Produto }) {
  const adicionar = useCarrinho((s) => s.adicionar);
  const esgotado = produto.tipo === "fisico" && produto.estoque === 0;

  function clicar() {
    adicionar({
      id: produto.id,
      slug: produto.slug,
      nome: produto.nome,
      preco: Number(produto.preco),
      quantidade: 1,
      imagem: produto.imagens?.[0],
      tipo: produto.tipo,
    });
    toast.success(`${produto.nome} adicionado à sacola`);
  }

  return (
    <Button onClick={clicar} disabled={esgotado} size="lg" className="w-full">
      <ShoppingBag className="h-4 w-4" />
      {esgotado ? "Esgotado" : "Adicionar à sacola"}
    </Button>
  );
}
