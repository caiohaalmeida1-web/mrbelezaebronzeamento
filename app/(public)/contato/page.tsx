import type { Metadata } from "next";
import Link from "next/link";
import { Phone, MapPin, Mail, Instagram, Clock } from "lucide-react";
import { ContatoForm } from "./contato-form";
import { SITE_CONFIG, whatsappLink } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contato · Fale com a Mércia Regina",
  description:
    "Entre em contato com Mércia Regina Beleza e Bronzeamento. WhatsApp, Instagram e endereço em Vicente Pires, DF.",
};

export default function ContatoPage() {
  return (
    <>
      <section className="bg-hero-gradient py-20 sm:py-24">
        <div className="container-page text-center">
          <p className="font-script text-2xl text-brand-cream/95 sm:text-3xl">
            adoramos saber de você
          </p>
          <h1 className="mt-3 font-display text-5xl font-medium tracking-tight text-brand-brown sm:text-6xl">
            Contato
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-brand-brown/80 sm:text-lg">
            Tem dúvidas, quer agendar ou conhecer melhor o espaço? Estamos aqui
            para você.
          </p>
        </div>
      </section>

      <section className="bg-brand-cream py-20 sm:py-24">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <aside className="space-y-6">
            <div className="card-brand p-7">
              <h2 className="font-display text-2xl font-medium text-brand-brown">
                Fale conosco
              </h2>
              <p className="mt-1 text-sm text-brand-caramel">
                Resposta rápida pelo WhatsApp ou Instagram.
              </p>
              <div className="mt-5 space-y-3 text-sm">
                <ContactLine
                  icon={Phone}
                  label="WhatsApp"
                  value={SITE_CONFIG.phone}
                  href={whatsappLink()}
                />
                <ContactLine
                  icon={Instagram}
                  label="Instagram"
                  value={SITE_CONFIG.instagram}
                  href={SITE_CONFIG.instagramUrl}
                />
                <ContactLine
                  icon={Mail}
                  label="E-mail"
                  value={SITE_CONFIG.email}
                  href={`mailto:${SITE_CONFIG.email}`}
                />
                <ContactLine
                  icon={MapPin}
                  label="Endereço"
                  value={SITE_CONFIG.address}
                />
              </div>
            </div>

            <div className="card-brand p-7">
              <h2 className="flex items-center gap-2 font-display text-2xl font-medium text-brand-brown">
                <Clock className="h-5 w-5 text-brand-amber" />
                Horários
              </h2>
              <ul className="mt-4 space-y-2 text-sm text-brand-caramel">
                <li className="flex justify-between">
                  <span>Segunda a sexta</span>
                  <span className="font-semibold text-brand-brown">
                    08:00 — 18:00
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>Sábado</span>
                  <span className="font-semibold text-brand-brown">
                    09:00 — 15:00
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>Domingo</span>
                  <span className="text-brand-caramel/70">Fechado</span>
                </li>
              </ul>
            </div>
          </aside>

          <div className="card-brand p-7 sm:p-10">
            <h2 className="font-display text-2xl font-medium text-brand-brown sm:text-3xl">
              Envie uma mensagem
            </h2>
            <p className="mt-1 text-sm text-brand-caramel">
              Preencha abaixo e respondemos em breve.
            </p>
            <div className="mt-6">
              <ContatoForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function ContactLine({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: typeof Phone;
  label: string;
  value: string;
  href?: string;
}) {
  const inner = (
    <>
      <Icon className="mt-0.5 h-4 w-4 text-brand-amber" />
      <div>
        <div className="text-xs uppercase tracking-wider text-brand-caramel/70">
          {label}
        </div>
        <div className="font-medium text-brand-brown">{value}</div>
      </div>
    </>
  );

  const cls =
    "flex items-start gap-3 rounded-2xl bg-brand-warm/60 px-4 py-3 transition-colors hover:bg-brand-warm";

  if (href) {
    const external = href.startsWith("http");
    return (
      <Link
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className={cls}
      >
        {inner}
      </Link>
    );
  }

  return <div className={cls}>{inner}</div>;
}
