"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Calendar,
  Check,
  Clock,
  CreditCard,
  Loader2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  StripePaymentForm,
  isStripeConfigured,
} from "@/components/shared/stripe-payment-form";
import { formatBRL } from "@/lib/utils";
import type { Servico } from "@/types/database";

interface Props {
  servico: Servico;
  dataHoraISO: string;
  valorBase: number;
  desconto: number;
  clientSecret: string | null;
  onPaid: () => void;
}

export function StepPagamento({
  servico,
  dataHoraISO,
  valorBase,
  desconto,
  clientSecret,
  onPaid,
}: Props) {
  const valor = valorBase - desconto;
  const dataHora = new Date(dataHoraISO);
  const stripeAtivo = Boolean(clientSecret) && isStripeConfigured();
  const [carregando, setCarregando] = useState(false);
  const [confirmado, setConfirmado] = useState(false);

  /**
   * Fallback apenas para desenvolvimento: quando o Stripe não está
   * configurado, confirma direto para permitir testar o fluxo completo.
   * Em produção (chaves configuradas) o pagamento real é feito via
   * StripePaymentForm e a confirmação definitiva vem do webhook.
   */
  async function pagarSemStripe() {
    setCarregando(true);
    await new Promise((r) => setTimeout(r, 700));
    setConfirmado(true);
    setCarregando(false);
    onPaid();
  }

  if (confirmado) {
    return (
      <div className="text-center">
        <div className="mx-auto inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
          <Check className="h-10 w-10" strokeWidth={3} />
        </div>
        <h2 className="mt-6 font-display text-3xl font-medium text-brand-brown sm:text-4xl">
          Agendamento <em className="italic">confirmado!</em>
        </h2>
        <p className="mt-3 text-base text-brand-caramel">
          Em alguns segundos você recebe o e-mail de confirmação.
        </p>
        <div className="mx-auto mt-8 flex max-w-sm items-start gap-3 rounded-2xl bg-emerald-50 px-5 py-4 text-left text-sm text-emerald-900 ring-1 ring-emerald-200">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <strong>{servico.nome}</strong>
            <br />
            {format(dataHora, "EEEE, dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-3xl font-medium text-brand-brown sm:text-4xl">
          Pagamento
        </h2>
        <p className="mt-1 text-sm text-brand-caramel">
          Pix ou cartão. Reembolso garantido em cancelamentos com 24h.
        </p>
      </div>

      <div className="card-brand p-6">
        <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-caramel">
          Resumo
        </h3>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex items-center gap-2 text-brand-brown">
            <Sparkles className="h-4 w-4 text-brand-amber" />
            <dt className="font-semibold">{servico.nome}</dt>
          </div>
          <div className="flex items-center gap-2 text-brand-caramel">
            <Calendar className="h-4 w-4 text-brand-amber" />
            <dd>
              {format(dataHora, "EEEE, dd 'de' MMMM", { locale: ptBR })}
            </dd>
          </div>
          <div className="flex items-center gap-2 text-brand-caramel">
            <Clock className="h-4 w-4 text-brand-amber" />
            <dd>
              {format(dataHora, "HH:mm")} · {servico.duracao_minutos} min
            </dd>
          </div>
        </dl>

        <div className="mt-5 space-y-1.5 border-t border-brand-gold/15 pt-4 text-sm">
          <div className="flex justify-between text-brand-caramel">
            <span>Subtotal</span>
            <span>{formatBRL(valorBase)}</span>
          </div>
          {desconto > 0 && (
            <div className="flex justify-between text-emerald-600">
              <span>Desconto da 5ª sessão (-20%)</span>
              <span>-{formatBRL(desconto)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-brand-gold/15 pt-2 font-display text-2xl font-semibold text-brand-brown">
            <span>Total</span>
            <span>{formatBRL(valor)}</span>
          </div>
        </div>
      </div>

      <div className="card-brand p-6">
        <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-caramel">
          <CreditCard className="h-4 w-4" />
          Forma de pagamento
        </h3>

        <div className="mt-4 space-y-2 text-sm text-brand-caramel">
          <div className="flex items-center gap-2 rounded-2xl bg-brand-warm/60 px-4 py-3">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            Pagamento processado com segurança via Stripe.
          </div>
          {!stripeAtivo && (
            <div className="rounded-2xl bg-amber-50 px-4 py-3 text-amber-900 ring-1 ring-amber-200">
              Modo de demonstração: a integração Stripe completa será ativada
              quando as chaves forem configuradas em produção.
            </div>
          )}
        </div>

        <div className="mt-5">
          {stripeAtivo && clientSecret ? (
            <StripePaymentForm
              clientSecret={clientSecret}
              valor={valor}
              returnPath="/cliente/agendamentos"
              onSuccess={() => {
                setConfirmado(true);
                onPaid();
              }}
            />
          ) : (
            <Button
              onClick={pagarSemStripe}
              disabled={carregando}
              size="lg"
              className="w-full"
            >
              {carregando ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CreditCard className="h-4 w-4" />
              )}
              {carregando ? "Processando…" : `Pagar ${formatBRL(valor)}`}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
