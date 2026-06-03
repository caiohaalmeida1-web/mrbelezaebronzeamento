import Link from "next/link";
import { Sun, Home, Calendar } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-hero-gradient px-5 text-center">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden
        style={{
          background:
            "radial-gradient(circle at 50% 30%, rgba(255, 240, 180, 0.7) 0%, transparent 60%)",
        }}
      />

      <Logo
        variant="round-color"
        size={120}
        className="relative ring-4 ring-brand-cream/40 shadow-2xl shadow-brand-brown/30"
      />

      <p className="relative mt-7 font-script text-2xl text-brand-cream/95 sm:text-3xl">
        ops, perdemos o caminho
      </p>
      <h1 className="relative mt-2 font-display text-6xl font-medium tracking-tight text-brand-brown sm:text-7xl">
        404
      </h1>
      <p className="relative mt-3 max-w-md text-base text-brand-brown/80">
        A página que você procura não existe — mas o seu bronze sim.
      </p>

      <div className="relative mt-7 flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg">
          <Link href="/">
            <Home className="h-4 w-4" />
            Ir para a home
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/agendar">
            <Calendar className="h-4 w-4" />
            Agendar uma sessão
          </Link>
        </Button>
      </div>

      <Sun className="absolute bottom-10 right-10 h-32 w-32 text-brand-sun/20" />
    </main>
  );
}
