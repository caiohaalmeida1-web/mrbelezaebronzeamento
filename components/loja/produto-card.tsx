"use client";

import Link from "next/link";
import { ShoppingBag, Sparkles, Droplets } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCarrinho } from "@/hooks/use-carrinho";
import { formatBRL } from "@/lib/utils";
import type { Produto } from "@/types/database";

const ICONS = [Droplets, Sparkles] as const;
const GRADIENTS = [
  "from-brand-sun via-brand-amber to-brand-caramel",
  "from-brand-caramel via-brand-amber to-brand-brown",
  "from-brand-amber via-brand-caramel to-brand-brown",
] as const;

interface Props {
  produto: Produto;
  index?: number;
}

export function ProdutoCard({ produto, index = 0 }: Props) {
  const adicionar = useCarrinho((s) => s.adicionar);
  const Icon = ICONS[index % ICONS.length];
  const gradient = GRADIENTS[index % GRADIENTS.length];
  const esgotando = produto.tipo === "fisico" && produto.estoque > 0 && produto.estoque < 5;
  const esgotado = produto.tipo === "fisico" && produto.estoque === 0;

  function adicionarAoCarrinho() {
    if (esgotado) return;
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
    <article className="card-brand group flex h-full flex-col overflow-hidden">
      <Link
        href={`/loja/${produto.slug}`}
        className={`relative flex h-48 items-center justify-center bg-gradient-to-br ${gradient}`}
        aria-label={produto.nome}
      >
        <Icon className="h-16 w-16 text-white/90 drop-shadow-md transition-transform duration-300 group-hover:scale-110" />
        {produto.destaque && (
          <Badge variant="sun" className="absolute right-3 top-3 shadow-md">
            ⭐ Destaque
          </Badge>
        )}
        {esgotando && (
          <Badge variant="amber" className="absolute left-3 top-3">
            Esgotando
          </Badge>
        )}
        {esgotado && (
          <div className="absolute inset-0 flex items-center justify-center bg-brand-brown/70">
            <Badge variant="danger">Esgotado</Badge>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <Link
          href={`/loja/${produto.slug}`}
          className="font-display text-xl font-medium text-brand-brown transition-colors hover:text-brand-amber"
        >
          {produto.nome}
        </Link>
        <p className="mt-1.5 line-clamp-2 flex-1 text-sm leading-relaxed text-brand-caramel">
          {produto.descricao}
        </p>

        {produto.tags && produto.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {produto.tags.slice(0, 3).map((t) => (
              <Badge key={t} variant="warm" className="text-[10px]">
                {t}
              </Badge>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-end justify-between border-t border-brand-gold/15 pt-4">
          <div className="font-display text-2xl font-semibold text-brand-brown">
            {formatBRL(Number(produto.preco))}
          </div>
          <Button
            type="button"
            size="sm"
            onClick={adicionarAoCarrinho}
            disabled={esgotado}
          >
            <ShoppingBag className="h-4 w-4" />
            Comprar
          </Button>
        </div>
      </div>
    </article>
  );
}
