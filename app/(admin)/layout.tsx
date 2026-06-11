import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Calendar,
  Camera,
  DollarSign,
  FileText,
  Gift,
  LayoutDashboard,
  LogOut,
  Package,
  Users,
} from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { sair } from "@/app/(auth)/actions";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/agendamentos", label: "Agendamentos", icon: Calendar },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
  { href: "/admin/produtos", label: "Produtos", icon: Package },
  { href: "/admin/blog", label: "Blog", icon: FileText },
  { href: "/admin/galeria", label: "Galeria", icon: Camera },
  { href: "/admin/fidelidade", label: "Fidelidade", icon: Gift },
  { href: "/admin/financeiro", label: "Financeiro", icon: DollarSign },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin/dashboard");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "admin") {
    redirect("/cliente/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF7F1] via-[#F6F1E8] to-[#F1EADC]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-brand-gold/15 bg-brand-brown text-brand-cream lg:flex">
        <Link
          href="/"
          className="flex items-center gap-3 border-b border-brand-cream/10 px-5 py-5"
        >
          <Logo
            variant="round-color"
            size={42}
            className="ring-2 ring-brand-sun/30"
          />
          <div>
            <div className="font-display text-base font-medium leading-tight text-brand-sun">
              Mércia Regina
            </div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-brand-cream/60">
              Painel Admin
            </div>
          </div>
        </Link>

        <nav className="flex-1 space-y-0.5 px-3 py-4">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-brand-cream/85 transition-colors hover:bg-brand-cream/5 hover:text-brand-sun"
            >
              <n.icon className="h-4 w-4 text-brand-amber" />
              {n.label}
            </Link>
          ))}
        </nav>

        <form action={sair} className="border-t border-brand-cream/10 p-4">
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="w-full text-brand-cream/80 hover:bg-brand-cream/5 hover:text-brand-sun"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </form>
      </aside>

      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-brand-gold/15 bg-brand-cream/85 px-4 backdrop-blur lg:hidden">
        <span className="font-display text-lg font-medium text-brand-brown">
          Admin · Mércia Regina
        </span>
        <form action={sair}>
          <Button type="submit" variant="ghost" size="icon" aria-label="Sair">
            <LogOut className="h-4 w-4" />
          </Button>
        </form>
      </header>

      <main className="lg:ml-64">
        <div className="container-page py-8 sm:py-12">{children}</div>
      </main>
    </div>
  );
}
