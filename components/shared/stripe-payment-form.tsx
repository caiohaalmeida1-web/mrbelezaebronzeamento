"use client";

import { useState } from "react";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBRL } from "@/lib/utils";

let stripePromise: Promise<Stripe | null> | null = null;

export function getStripePromise(): Promise<Stripe | null> | null {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!key) return null;
  if (!stripePromise) stripePromise = loadStripe(key);
  return stripePromise;
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
}

interface Props {
  clientSecret: string;
  valor: number;
  /** Rota para onde o Stripe redireciona em métodos que exigem redirect. */
  returnPath: string;
  onSuccess: () => void;
}

/**
 * Formulário de pagamento com Stripe Elements (PaymentElement).
 * Renderizar apenas quando `isStripeConfigured()` e houver clientSecret.
 */
export function StripePaymentForm({
  clientSecret,
  valor,
  returnPath,
  onSuccess,
}: Props) {
  const promise = getStripePromise();
  if (!promise) return null;

  return (
    <Elements
      stripe={promise}
      options={{
        clientSecret,
        locale: "pt-BR",
        appearance: {
          variables: {
            colorPrimary: "#E87520",
            colorText: "#2C1000",
            borderRadius: "12px",
            fontFamily: "Inter, sans-serif",
          },
        },
      }}
    >
      <InnerForm valor={valor} returnPath={returnPath} onSuccess={onSuccess} />
    </Elements>
  );
}

function InnerForm({
  valor,
  returnPath,
  onSuccess,
}: Pick<Props, "valor" | "returnPath" | "onSuccess">) {
  const stripe = useStripe();
  const elements = useElements();
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function pagar(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setCarregando(true);
    setErro(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}${returnPath}`,
      },
      redirect: "if_required",
    });

    if (error) {
      setErro(error.message ?? "Não foi possível processar o pagamento.");
      setCarregando(false);
      return;
    }

    if (
      paymentIntent &&
      (paymentIntent.status === "succeeded" ||
        paymentIntent.status === "processing")
    ) {
      onSuccess();
      return;
    }

    setErro("Pagamento não concluído. Tente novamente.");
    setCarregando(false);
  }

  return (
    <form onSubmit={pagar} className="space-y-4">
      <PaymentElement />
      <Button
        type="submit"
        disabled={!stripe || !elements || carregando}
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
      {erro && (
        <p className="text-sm text-red-600" role="alert">
          {erro}
        </p>
      )}
    </form>
  );
}
