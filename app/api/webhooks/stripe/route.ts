import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { confirmarAgendamento } from "@/app/(public)/agendar/actions";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !secret) {
    return NextResponse.json(
      { error: "missing stripe signature" },
      { status: 400 }
    );
  }

  const body = await req.text();
  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (e) {
    console.error("[stripe webhook] verify failed", e);
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  const admin = createAdminClient();

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const pi = event.data.object as Stripe.PaymentIntent;
        const agendamentoId = pi.metadata.agendamento_id;
        const pedidoId = pi.metadata.pedido_id;

        if (agendamentoId) {
          await confirmarAgendamento(agendamentoId);
        }

        if (pedidoId) {
          await admin
            .from("pedidos")
            .update({ status: "pago" })
            .eq("id", pedidoId);
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent;
        const agendamentoId = pi.metadata.agendamento_id;
        const pedidoId = pi.metadata.pedido_id;
        if (agendamentoId) {
          await admin
            .from("agendamentos")
            .update({ status: "cancelado" })
            .eq("id", agendamentoId);
        }
        if (pedidoId) {
          await admin
            .from("pedidos")
            .update({ status: "cancelado" })
            .eq("id", pedidoId);
        }
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const piId = charge.payment_intent as string | null;
        if (piId) {
          await admin
            .from("pedidos")
            .update({ status: "reembolsado" })
            .eq("stripe_payment_intent", piId);
        }
        break;
      }

      default:
        break;
    }
  } catch (e) {
    console.error("[stripe webhook] handler error", e);
    return NextResponse.json({ error: "handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
