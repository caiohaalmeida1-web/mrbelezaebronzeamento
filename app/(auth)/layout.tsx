import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/shared/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-hero-gradient">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden
        style={{
          background:
            "radial-gradient(circle at 50% 0%, rgba(255, 240, 180, 0.7) 0%, transparent 60%)",
        }}
      />
      <div className="bg-grain pointer-events-none absolute inset-0 opacity-25" aria-hidden />

      <div className="container-page relative flex min-h-screen items-center justify-center py-12">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand-brown hover:text-brand-caramel"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao site
          </Link>

          <div className="mt-6 rounded-3xl bg-white/95 p-7 shadow-2xl shadow-brand-brown/15 ring-1 ring-brand-gold/15 backdrop-blur sm:p-10">
            <div className="mb-7 text-center">
              <Logo
                variant="round-color"
                size={72}
                className="mx-auto ring-2 ring-brand-gold/20"
              />
              <p className="mt-3 font-script text-xl text-brand-amber">
                Mércia Regina
              </p>
            </div>
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}
