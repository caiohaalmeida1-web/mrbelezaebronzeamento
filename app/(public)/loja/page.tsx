import type { Metadata } from "next";
import { ProdutoCard } from "@/components/loja/produto-card";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { createClient } from "@/lib/supabase/server";
import type { Produto } from "@/types/database";

export const metadata: Metadata = {
  title: "Loja · Produtos Click 10",
  description:
    "Compre produtos Click 10 e cuide do seu bronze em casa. Cremes ativadores, hidratantes e firmadores aprovados pela Anvisa.",
};

export const revalidate = 1800;

const FALLBACK: Produto[] = [
  {
    id: "fallback-1",
    nome: "Click 10 Tradicional",
    slug: "click-10-tradicional",
    descricao:
      "Creme hidratante, ativador e acelerador. Cor de verão o ano inteiro.",
    descricao_longa: null,
    tipo: "fisico",
    preco: 89.9,
    preco_original: null,
    estoque: 50,
    peso_gramas: 500,
    imagens: null,
    arquivo_digital_url: null,
    stripe_price_id: null,
    ativo: true,
    destaque: true,
    tags: ["Ativador", "Acelerador", "Hidratante"],
    created_at: new Date().toISOString(),
  },
  {
    id: "fallback-2",
    nome: "Click 10 Zero",
    slug: "click-10-zero",
    descricao:
      "Vitamina C, Colágeno e DHA. Antioxidante, clareador e firmador.",
    descricao_longa: null,
    tipo: "fisico",
    preco: 99.9,
    preco_original: null,
    estoque: 50,
    peso_gramas: 500,
    imagens: null,
    arquivo_digital_url: null,
    stripe_price_id: null,
    ativo: true,
    destaque: true,
    tags: ["Vitamina C", "Colágeno", "DHA"],
    created_at: new Date().toISOString(),
  },
];

export default async function LojaPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from("produtos")
    .select("*")
    .eq("ativo", true)
    .order("destaque", { ascending: false })
    .order("created_at", { ascending: false });

  const produtos: Produto[] = data && data.length > 0 ? data : FALLBACK;

  return (
    <>
      <section className="bg-hero-gradient py-20 sm:py-24">
        <div className="container-page text-center">
          <p className="font-script text-2xl text-brand-cream/95 sm:text-3xl">
            o cuidado que sua pele merece
          </p>
          <h1 className="mt-2 font-display text-5xl font-medium tracking-tight text-brand-brown sm:text-6xl">
            Loja
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-brand-brown/80 sm:text-lg">
            A linha exclusiva Click 10 e tudo que você precisa para um bronze
            duradouro entre as sessões.
          </p>
        </div>
      </section>

      <section className="bg-brand-cream py-16 sm:py-20">
        <div className="container-page">
          <ScrollReveal>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {produtos.map((p, i) => (
                <ProdutoCard key={p.id} produto={p} index={i} />
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
