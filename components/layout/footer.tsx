import Link from "next/link";
import { Instagram, Phone, MapPin, Mail } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { SITE_CONFIG, whatsappLink } from "@/lib/utils";

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-brand-brown text-brand-cream/90">
      <div className="absolute inset-0 bg-grain opacity-[0.04]" aria-hidden />

      <div className="container-page relative grid gap-10 py-14 sm:py-20 lg:grid-cols-4">
        <div className="space-y-5 lg:col-span-2">
          <Link
            href="/"
            className="inline-flex items-center gap-3"
            aria-label="Mércia Regina · Início"
          >
            <Logo
              variant="round-mono"
              width={48}
              height={48}
              rounded={false}
              style={{ filter: "brightness(0) invert(1)", opacity: 0.9 }}
            />
            <span className="flex flex-col leading-tight">
              <span className="font-display text-xl font-medium text-brand-cream">
                Mércia Regina
              </span>
              <span className="font-script text-sm text-brand-sun/90">
                Beleza · Bronzeamento
              </span>
            </span>
          </Link>
          <p className="max-w-md text-sm leading-relaxed text-brand-cream/70">
            Especialista em bronzeamento natural e a jato em Vicente Pires, DF.
            Produtos aprovados pela Anvisa, técnica que respeita sua pele e
            valoriza sua autoestima.
          </p>
          <div className="flex items-center gap-3">
            <Link
              href={SITE_CONFIG.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-sun/30 text-brand-sun transition-all hover:bg-brand-sun hover:text-brand-brown"
            >
              <Instagram className="h-4 w-4" />
            </Link>
            <Link
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#25D366]/40 text-[#25D366] transition-all hover:bg-[#25D366] hover:text-white"
            >
              <Phone className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-brand-sun">
            Navegação
          </h3>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link href="/servicos" className="hover:text-brand-amber">
                Serviços
              </Link>
            </li>
            <li>
              <Link href="/loja" className="hover:text-brand-amber">
                Produtos
              </Link>
            </li>
            <li>
              <Link href="/agendar" className="hover:text-brand-amber">
                Agendar
              </Link>
            </li>
            <li>
              <Link href="/blog" className="hover:text-brand-amber">
                Blog
              </Link>
            </li>
            <li>
              <Link href="/fidelidade" className="hover:text-brand-amber">
                Fidelidade
              </Link>
            </li>
            <li>
              <Link href="/sobre" className="hover:text-brand-amber">
                Sobre
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-brand-sun">
            Contato
          </h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-amber" />
              <span>{SITE_CONFIG.address}</span>
            </li>
            <li className="flex items-start gap-2.5">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand-amber" />
              <Link
                href={whatsappLink()}
                className="hover:text-brand-amber"
                target="_blank"
                rel="noopener noreferrer"
              >
                {SITE_CONFIG.phone}
              </Link>
            </li>
            <li className="flex items-start gap-2.5">
              <Instagram className="mt-0.5 h-4 w-4 shrink-0 text-brand-amber" />
              <Link
                href={SITE_CONFIG.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand-amber"
              >
                {SITE_CONFIG.instagram}
              </Link>
            </li>
            <li className="flex items-start gap-2.5">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand-amber" />
              <Link
                href={`mailto:${SITE_CONFIG.email}`}
                className="hover:text-brand-amber"
              >
                {SITE_CONFIG.email}
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-brand-cream/10">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-6 text-xs text-brand-cream/60 sm:flex-row">
          <p>© {new Date().getFullYear()} Mércia Regina · Todos os direitos reservados.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacidade" className="hover:text-brand-amber">
              Privacidade
            </Link>
            <Link href="/termos" className="hover:text-brand-amber">
              Termos
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
