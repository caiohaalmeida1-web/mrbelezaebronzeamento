import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Calendar,
  Gift,
  LayoutDashboard,
  LogOut,
  Package,
  PlayCircle,
} from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { WhatsAppFab } from "@/components/shared/whatsapp-fab";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { sair } from "@/app/(auth)/actions";
import { getInitials } from "@/lib/utils";

const NAV = [
  { href: "/cliente/dashboard", label: "Início", icon: LayoutDashboard },
  { href: "/cliente/agendamentos", label: "Agendamentos", icon: Calendar },
  { href: "/cliente/pontos", label: "Pontos", icon: Gift },
  { href: "/cliente/compras", label: "Compras", icon: Package },
  { href: "/cliente/cursos", label: "Cursos", icon: PlayCircle },
];

export default async function ClienteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/cliente/dashboard");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, pontos, total_sessoes, role")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="min-h-screen bg-brand-cream">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-brand-gold/15 bg-white/80 backdrop-blur-md lg:flex">
        <Link href="/" className="flex items-center gap-3 border-b border-brand-gold/15 px-5 py-5">
          <Logo variant="round-color" size={42} />
          <div>
            <div className="font-display text-base font-medium leading-tight text-brand-brown">
              Mércia Regina
            </div>
            <div className="font-script text-sm leading-tight text-brand-amber">
              minha conta
            </div>
          </div>
        </Link>

        {profile && (
          <div className="px-4 py-4">
            <div className="flex items-center gap-3 rounded-2xl bg-brand-warm p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-gradient text-sm font-bold text-white">
                {getInitials(profile.full_name)}
              </div>
              <div>
                <div className="text-sm font-semibold text-brand-brown">
                  {profile.full_name.split(" ")[0]}
                </div>
                <div className="text-xs text-brand-caramel">
                  {profile.pontos} pts · {profile.total_sessoes} sessões
                </div>
              </div>
            </div>
          </div>
        )}

        <nav className="flex-1 space-y-0.5 px-3">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-brand-brown transition-colors hover:bg-brand-warm"
            >
              <n.icon className="h-4 w-4 text-brand-amber" />
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="space-y-2 border-t border-brand-gold/15 p-4">
          <Button asChild className="w-full" size="sm">
            <Link href="/agendar">
              <Calendar className="h-4 w-4" />
              Novo agendamento
            </Link>
          </Button>
          <form action={sair}>
            <Button type="submit" variant="ghost" size="sm" className="w-full">
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </form>
        </div>
      </aside>

      {/* Top bar mobile */}
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-brand-gold/15 bg-brand-cream/85 px-4 backdrop-blur lg:hidden">
        <Link href="/cliente/dashboard" className="flex items-center gap-2">
          <Logo variant="round-color" size={36} />
          <span className="font-display text-lg text-brand-brown">
            Mércia Regina
          </span>
        </Link>
        <form action={sair}>
          <Button type="submit" variant="ghost" size="icon" aria-label="Sair">
            <LogOut className="h-4 w-4" />
          </Button>
        </form>
      </header>

      {/* Mobile bottom nav */}
      <nav
        aria-label="Navegação"
        className="fixed bottom-0 left-0 right-0 z-30 grid grid-cols-5 border-t border-brand-gold/15 bg-brand-cream/95 backdrop-blur lg:hidden"
      >
        {NAV.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className="flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium uppercase tracking-wider text-brand-caramel"
          >
            <n.icon className="h-4 w-4 text-brand-amber" />
            {n.label}
          </Link>
        ))}
      </nav>

      <main className="lg:ml-64 pb-24 lg:pb-0">
        <div className="container-page py-8 sm:py-12">{children}</div>
      </main>

      <WhatsAppFab />
    </div>
  );
}
