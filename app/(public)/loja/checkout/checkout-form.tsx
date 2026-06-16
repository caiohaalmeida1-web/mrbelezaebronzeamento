"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Loader2, MapPin, ShieldCheck, ShoppingBag, Store, Truck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  StripePaymentForm,
  isStripeConfigured,
} from "@/components/shared/stripe-payment-form";
import { useCarrinho } from "@/hooks/use-carrinho";
import { cn, formatBRL, FORMA_ENTREGA_LABEL, SITE_CONFIG } from "@/lib/utils";
import type { FormaEntrega } from "@/types/database";
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
  const [formaEntrega, setFormaEntrega] = useState<FormaEntrega>("envio");
  const [carregando, setCarregando] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [totalPedido, setTotalPedido] = useState(0);

  const temFisico = itens.some((i) => i.tipo === "fisico");

  // Etapa de pagamento: pedido criado, aguardando cartão
  if (clientSecret) {
    return (
      <div className="mx-auto max-w-lg space-y-6">
        <div className="card-brand p-6 sm:p-8">
          <h2 className="flex items-center gap-2 font-display text-2xl text-brand-brown">
            <CreditCard className="h-5 w-5 text-brand-amber" />
            Pagamento
          </h2>
          <div className="mt-3 flex items-center gap-2 rounded-2xl bg-brand-warm/60 px-4 py-3 text-sm text-brand-caramel">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            Pagamento processado com segurança via Stripe.
          </div>
          <div className="mt-5">
            <StripePaymentForm
              clientSecret={clientSecret}
              valor={totalPedido}
              returnPath="/cliente/compras"
              onSuccess={() => {
                toast.success("Pagamento aprovado! Obrigada pela compra.");
                limpar();
                setTimeout(() => router.push("/cliente/compras"), 1200);
              }}
            />
          </div>
        </div>
      </div>
    );
  }

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
        formaEntrega: temFisico ? formaEntrega : undefined,
        endereco:
          temFisico && formaEntrega === "envio"
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

      if (result.clientSecret && isStripeConfigured()) {
        // Vai para a etapa de pagamento com Stripe Elements
        setTotalPedido(total);
        setClientSecret(result.clientSecret);
        return;
      }

      // Fallback de desenvolvimento (Stripe não configurado)
      toast.success("Pedido criado! Você poderá pagar na entrega ou via WhatsApp.");
      limpar();
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
              Como você prefere receber?
            </h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {(
                [
                  {
                    id: "envio" as const,
                    icon: Truck,
                    titulo: "Envio",
                    descricao: "Entrega no endereço informado",
                  },
                  {
                    id: "retirada" as const,
                    icon: Store,
                    titulo: "Retirada na loja",
                    descricao: "Busque no nosso espaço em Vicente Pires",
                  },
                ] as const
              ).map((opcao) => {
                const Icon = opcao.icon;
                const ativo = formaEntrega === opcao.id;
                return (
                  <button
                    key={opcao.id}
                    type="button"
                    onClick={() => setFormaEntrega(opcao.id)}
                    className={cn(
                      "rounded-2xl border-2 p-4 text-left transition-all",
                      ativo
                        ? "border-brand-amber bg-brand-warm/80 shadow-md shadow-brand-amber/10"
                        : "border-brand-gold/20 bg-white/60 hover:border-brand-gold/40"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5",
                        ativo ? "text-brand-amber" : "text-brand-caramel"
                      )}
                    />
                    <p className="mt-2 font-semibold text-brand-brown">
                      {opcao.titulo}
                    </p>
                    <p className="mt-1 text-sm text-brand-caramel">
                      {opcao.descricao}
                    </p>
                  </button>
                );
              })}
            </div>

            {formaEntrega === "retirada" ? (
              <div className="mt-5 flex gap-3 rounded-2xl bg-brand-warm/60 p-4 text-sm text-brand-brown">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-amber" />
                <div>
                  <p className="font-semibold">Local de retirada</p>
                  <p className="mt-1 text-brand-caramel">{SITE_CONFIG.address}</p>
                  <p className="mt-1 text-brand-caramel">
                    Após a confirmação do pagamento, avisaremos quando estiver pronto
                    para retirada.
                  </p>
                </div>
              </div>
            ) : (
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
        {temFisico && (
          <p className="mt-4 text-sm text-brand-caramel">
            Recebimento:{" "}
            <span className="font-semibold text-brand-brown">
              {FORMA_ENTREGA_LABEL[formaEntrega]}
            </span>
          </p>
        )}
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
