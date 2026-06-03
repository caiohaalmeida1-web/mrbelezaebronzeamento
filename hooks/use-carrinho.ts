"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ItemCarrinho {
  id: string;
  slug: string;
  nome: string;
  preco: number;
  quantidade: number;
  imagem?: string;
  tipo: "fisico" | "digital" | "curso" | "ebook" | "assinatura";
}

interface Estado {
  itens: ItemCarrinho[];
  drawerAberto: boolean;
  abrir: () => void;
  fechar: () => void;
  toggle: () => void;
  adicionar: (item: ItemCarrinho) => void;
  remover: (id: string) => void;
  alterarQuantidade: (id: string, delta: number) => void;
  limpar: () => void;
  total: () => number;
  totalItens: () => number;
}

export const useCarrinho = create<Estado>()(
  persist(
    (set, get) => ({
      itens: [],
      drawerAberto: false,
      abrir: () => set({ drawerAberto: true }),
      fechar: () => set({ drawerAberto: false }),
      toggle: () => set((s) => ({ drawerAberto: !s.drawerAberto })),
      adicionar: (item) =>
        set((s) => {
          const idx = s.itens.findIndex((i) => i.id === item.id);
          if (idx >= 0) {
            const novos = [...s.itens];
            novos[idx] = {
              ...novos[idx],
              quantidade: novos[idx].quantidade + item.quantidade,
            };
            return { itens: novos, drawerAberto: true };
          }
          return { itens: [...s.itens, item], drawerAberto: true };
        }),
      remover: (id) =>
        set((s) => ({ itens: s.itens.filter((i) => i.id !== id) })),
      alterarQuantidade: (id, delta) =>
        set((s) => ({
          itens: s.itens
            .map((i) =>
              i.id === id ? { ...i, quantidade: i.quantidade + delta } : i
            )
            .filter((i) => i.quantidade > 0),
        })),
      limpar: () => set({ itens: [] }),
      total: () =>
        get().itens.reduce(
          (acc, i) => acc + i.preco * i.quantidade,
          0
        ),
      totalItens: () =>
        get().itens.reduce((acc, i) => acc + i.quantidade, 0),
    }),
    { name: "mr-carrinho" }
  )
);
