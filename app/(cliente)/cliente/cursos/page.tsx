import { PlayCircle, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export default async function CursosPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: comprasDigitais } = await supabase
    .from("pedidos")
    .select(
      "id, status, pedido_itens(produtos(id, nome, slug, tipo, arquivo_digital_url))"
    )
    .eq("cliente_id", user.id)
    .eq("status", "pago");

  const itensDigitais =
    comprasDigitais?.flatMap(
      (p) =>
        p.pedido_itens
          ?.map((i: any) => i.produtos)
          .filter(
            (prod: any) =>
              prod &&
              ["digital", "curso", "ebook", "assinatura"].includes(prod.tipo)
          ) ?? []
    ) ?? [];

  return (
    <div className="space-y-8">
      <header>
        <p className="label-eyebrow">Conteúdo</p>
        <h1 className="mt-2 font-display text-4xl font-medium text-brand-brown sm:text-5xl">
          Meus cursos e materiais
        </h1>
      </header>

      {itensDigitais.length === 0 ? (
        <div className="card-brand p-10 text-center">
          <PlayCircle className="mx-auto h-12 w-12 text-brand-caramel/50" />
          <h2 className="mt-4 font-display text-2xl text-brand-brown">
            Nenhum conteúdo digital ainda
          </h2>
          <p className="mt-1 text-brand-caramel">
            Em breve teremos cursos e e-books exclusivos sobre bronzeamento.
          </p>
          <Button asChild className="mt-5" variant="outline">
            <Link href="/loja">
              <Sparkles className="h-4 w-4" />
              Ver loja
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {itensDigitais.map((item: any) => (
            <article key={item.id} className="card-brand p-6">
              <PlayCircle className="h-8 w-8 text-brand-amber" />
              <h3 className="mt-3 font-display text-xl font-medium text-brand-brown">
                {item.nome}
              </h3>
              {item.arquivo_digital_url && (
                <Button asChild className="mt-4 w-full" variant="outline" size="sm">
                  <a
                    href={item.arquivo_digital_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Acessar
                  </a>
                </Button>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
