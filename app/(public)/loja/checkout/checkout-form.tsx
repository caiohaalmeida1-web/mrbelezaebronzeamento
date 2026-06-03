"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Loader2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCarrinho } from "@/hooks/use-carrinho";
import { formatBRL } from "@/lib/utils";
import { finalizarPedido } from "./actions";

interface Props {
  perfil: { full_name: string; email: string; phone: string | null } | null;
}

export function CheckoutForm({ perfil }: Props) {
  const router = useRouter();
  const itens = useCarrinho((s) => s.itens);
  const total = useCarrinho((s) => s.total());
  const limpar = useCarrinho((s) => s.limpar);

  const [nome, setNome] = useState(perfil?.full_name ?? "");
  const [email, setEmail] = useState(perfil?.email ?? "");
  const [cep, setCep] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [carregando, setCarregando] = useState(false);

  const temFisico = itens.some((i) => i.tipo === "fisico");

  if (itens.length === 0) {
    return (
      <div className="card-brand p-10 text-center">
        <ShoppingBag className="mx-auto h-12 w-12 text-brand-caramel/50" />
        <h2 className="mt-4 font-display text-2xl text-brand-brown">
          Sua sacola está vazia
        </h2>
        <p className="mt-1 text-brand-caramel">
          Adicione produtos antes de finalizar.
        </p>
        <Button
          className="mt-5"
          onClick={() => router.push("/loja")}
          variant="outline"
        >
          Voltar à loja
        </Button>
      </div>
    );
  }

  async function submeter(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);
    try {
      const result = await finalizarPedido({
        itens: itens.map((i) => ({ id: i.id, quantidade: i.quantidade })),
        nome,
        email,
        endereco: temFisico
          ? {
              cep,
              rua,
              numero,
              complemento: complemento || undefined,
              bairro,
              cidade,
              estado,
            }
          : undefined,
      });

      if (!result.ok) {
        toast.error(result.message ?? "Erro ao finalizar.");
        return;
      }

      toast.success("Pedido criado! Redirecionando para o pagamento…");
      limpar();
      // Em produção, integrar Stripe Elements aqui usando result.clientSecret
      setTimeout(() => router.push("/cliente/compras"), 1200);
    } catch {
      toast.error("Erro inesperado.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <form onSubmit={submeter} className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div className="card-brand p-6 sm:p-8">
        <h2 className="font-display text-2xl text-brand-brown">Seus dados</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="nome">Nome*</Label>
            <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail*</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        {temFisico && (
          <>
            <h3 className="mt-8 font-display text-2xl text-brand-brown">
              Endereço de entrega
            </h3>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="cep">CEP*</Label>
                <Input id="cep" value={cep} onChange={(e) => setCep(e.target.value)} required />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="rua">Rua*</Label>
                <Input id="rua" value={rua} onChange={(e) => setRua(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="numero">Número*</Label>
                <Input id="numero" value={numero} onChange={(e) => setNumero(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="complemento">Complemento</Label>
                <Input
                  id="complemento"
                  value={complemento}
                  onChange={(e) => setComplemento(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bairro">Bairro*</Label>
                <Input id="bairro" value={bairro} onChange={(e) => setBairro(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cidade">Cidade*</Label>
                <Input
                  id="cidade"
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="estado">Estado*</Label>
                <Input id="estado" value={estado} onChange={(e) => setEstado(e.target.value)} required />
              </div>
            </div>
          </>
        )}
      </div>

      <aside className="card-brand h-fit p-6 sm:p-7">
        <h2 className="font-display text-xl text-brand-brown">Resumo</h2>
        <ul className="mt-4 space-y-3">
          {itens.map((it) => (
            <li key={it.id} className="flex justify-between gap-3 text-sm">
              <span>
                <span className="font-semibold text-brand-brown">{it.nome}</span>
                <span className="text-brand-caramel/70"> ×{it.quantidade}</span>
              </span>
              <span className="font-semibold text-brand-brown">
                {formatBRL(it.preco * it.quantidade)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-5 flex justify-between border-t border-brand-gold/15 pt-4">
          <span className="text-brand-caramel">Total</span>
          <span className="font-display text-2xl font-semibold text-brand-brown">
            {formatBRL(total)}
          </span>
        </div>
        <Button type="submit" className="mt-5 w-full" size="lg" disabled={carregando}>
          {carregando ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CreditCard className="h-4 w-4" />
          )}
          {carregando ? "Processando…" : `Pagar ${formatBRL(total)}`}
        </Button>
      </aside>
    </form>
  );
}
