import type { Metadata } from "next";
import { CheckoutForm } from "./checkout-form";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Finalizar compra",
  description: "Finalize sua compra na loja Mércia Regina.",
};

export default async function CheckoutPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let perfil: { full_name: string; email: string; phone: string | null } | null = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("full_name, email, phone")
      .eq("id", user.id)
      .maybeSingle();
    perfil = data;
  }

  return (
    <section className="bg-brand-cream py-16 sm:py-20">
      <div className="container-page max-w-3xl">
        <h1 className="font-display text-4xl font-medium text-brand-brown sm:text-5xl">
          Finalizar compra
        </h1>
        <p className="mt-2 text-brand-caramel">
          Confira seus dados e finalize com segurança.
        </p>

        <div className="mt-8">
          <CheckoutForm perfil={perfil} />
        </div>
      </div>
    </section>
  );
}
