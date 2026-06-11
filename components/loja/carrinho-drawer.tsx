"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCarrinho } from "@/hooks/use-carrinho";
import { formatBRL } from "@/lib/utils";

export function CarrinhoDrawer() {
  const itens = useCarrinho((s) => s.itens);
  const drawerAberto = useCarrinho((s) => s.drawerAberto);
  const abrir = useCarrinho((s) => s.abrir);
  const fechar = useCarrinho((s) => s.fechar);
  const remover = useCarrinho((s) => s.remover);
  const alterarQuantidade = useCarrinho((s) => s.alterarQuantidade);
  const total = useCarrinho((s) => s.total());
  const totalItens = useCarrinho((s) => s.totalItens());

  return (
    <>
      <button
        type="button"
        onClick={abrir}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-brand-brown transition-colors hover:bg-brand-warm"
        aria-label={`Carrinho com ${totalItens} ${totalItens === 1 ? "item" : "itens"}`}
      >
        <ShoppingBag className="h-5 w-5" />
        {totalItens > 0 && (
          <span className="absolute -right-0.5 -top-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-amber px-1 text-[10px] font-bold text-white">
            {totalItens}
          </span>
        )}
      </button>

      <Sheet
        open={drawerAberto}
        onOpenChange={(o) => (o ? abrir() : fechar())}
      >
        <SheetContent side="right" className="flex w-full flex-col gap-0 sm:max-w-md">
          <SheetHeader className="border-b border-brand-gold/15 pb-4">
            <SheetTitle className="flex items-center gap-2 text-2xl">
              <ShoppingBag className="h-5 w-5 text-brand-amber" />
              Sua sacola
            </SheetTitle>
          </SheetHeader>

          {itens.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 py-12 text-center">
              <ShoppingBag className="h-12 w-12 text-brand-caramel/40" />
              <div>
                <p className="font-display text-xl text-brand-brown">
                  Sacola vazia
                </p>
                <p className="mt-1 text-sm text-brand-caramel">
                  Adicione produtos da nossa linha Click 10.
                </p>
              </div>
              <SheetClose asChild>
                <Button asChild>
                  <Link href="/loja">Ir para a loja</Link>
                </Button>
              </SheetClose>
            </div>
          ) : (
            <>
              <ul className="flex-1 overflow-y-auto py-4">
                {itens.map((it) => (
                  <li
                    key={it.id}
                    className="flex gap-3 border-b border-brand-gold/10 py-4"
                  >
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-amber-gradient">
                      {it.imagem ? (
                        <Image
                          src={it.imagem}
                          alt={it.nome}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-white">
                          <ShoppingBag className="h-7 w-7" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/loja/${it.slug}`}
                          className="font-display text-base font-medium text-brand-brown hover:text-brand-amber"
                        >
                          {it.nome}
                        </Link>
                        <button
                          type="button"
                          onClick={() => remover(it.id)}
                          className="text-brand-caramel/60 hover:text-red-500"
                          aria-label="Remover"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-sm font-semibold text-brand-amber">
                        {formatBRL(it.preco)}
                      </p>
                      <div className="mt-2 inline-flex items-center gap-1 self-start rounded-full border border-brand-gold/20 bg-white">
                        <button
                          type="button"
                          onClick={() => alterarQuantidade(it.id, -1)}
                          className="p-1.5 text-brand-brown hover:text-brand-amber"
                          aria-label="Diminuir"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="min-w-6 text-center text-sm font-semibold text-brand-brown">
                          {it.quantidade}
                        </span>
                        <button
                          type="button"
                          onClick={() => alterarQuantidade(it.id, 1)}
                          className="p-1.5 text-brand-brown hover:text-brand-amber"
                          aria-label="Aumentar"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="space-y-3 border-t border-brand-gold/15 pt-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-brand-caramel">Subtotal</span>
                  <span className="font-display text-2xl font-semibold text-brand-brown">
                    {formatBRL(total)}
                  </span>
                </div>
                <p className="text-xs text-brand-caramel/70">
                  Frete e descontos calculados na finalização.
                </p>
                <SheetClose asChild>
                  <Button asChild size="lg" className="w-full">
                    <Link href="/loja/checkout">Finalizar compra</Link>
                  </Button>
                </SheetClose>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
