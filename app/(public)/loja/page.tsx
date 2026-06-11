import type { Metadata } from "next";
import Link from "next/link";
import { ShoppingBag, Phone } from "lucide-react";
import { ProdutoCard } from "@/components/loja/produto-card";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { Button } from "@/components/ui/button";
import { createStaticClient } from "@/lib/supabase/static";
import { whatsappLink } from "@/lib/utils";
import type { Produto } from "@/types/database";

export const metadata: Metadata = {
  title: "Loja · Moda praia e acessórios",
  description:
    "Biquínis, moda praia e acessórios selecionados pela Mércia Regina para valorizar o seu bronze.",
};

export const revalidate = 1800;

export default async function LojaPage() {
  const supabase = createStaticClient();
  const { data } = await supabase
    .from("produtos")
    .select("*")
    .eq("ativo", true)
    .eq("disponivel_venda", true)
    .order("destaque", { ascending: false })
    .order("created_at", { ascending: false });

  const produtos: Produto[] = data ?? [];

  return (
    <>
      <section className="bg-hero-gradient py-20 sm:py-24">
        <div className="container-page text-center">
          <p className="font-script text-2xl text-brand-cream/95 sm:text-3xl">
            o complemento perfeito do seu bronze
          </p>
          <h1 className="mt-2 font-display text-5xl font-medium tracking-tight text-brand-brown sm:text-6xl">
            Loja
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-brand-brown/80 sm:text-lg">
            Biquínis e acessórios selecionados a dedo para valorizar a sua cor.
          </p>
        </div>
      </section>

      <section className="bg-brand-cream py-16 sm:py-20">
        <div className="container-page">
          {produtos.length === 0 ? (
            <div className="mx-auto max-w-lg rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-brand-gold/15">
              <ShoppingBag className="mx-auto h-12 w-12 text-brand-amber/60" />
              <h2 className="mt-4 font-display text-2xl font-medium text-brand-brown">
                Novidades chegando!
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-brand-caramel">
                Estamos preparando uma seleção especial de biquínis e
                acessórios. Enquanto isso, fale com a gente no WhatsApp para
                conhecer as peças disponíveis no estúdio.
              </p>
              <Button asChild variant="whatsapp" className="mt-6">
                <Link
                  href={whatsappLink(
                    "Olá Mércia! Quero saber quais produtos estão disponíveis."
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Phone className="h-4 w-4" />
                  Falar no WhatsApp
                </Link>
              </Button>
            </div>
          ) : (
            <ScrollReveal>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {produtos.map((p, i) => (
                  <ProdutoCard key={p.id} produto={p} index={i} />
                ))}
              </div>
            </ScrollReveal>
          )}
        </div>
      </section>
    </>
  );
}
