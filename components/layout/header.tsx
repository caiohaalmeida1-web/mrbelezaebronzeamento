"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { CarrinhoDrawer } from "@/components/loja/carrinho-drawer";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/servicos", label: "Serviços" },
  { href: "/loja", label: "Produtos" },
  { href: "/blog", label: "Blog" },
  { href: "/sobre", label: "Sobre" },
  { href: "/contato", label: "Contato" },
] as const;

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-300",
        scrolled
          ? "bg-brand-cream/85 backdrop-blur-xl shadow-sm shadow-brand-brown/5 border-b border-brand-gold/10"
          : "bg-transparent border-b border-transparent"
      )}
    >
      <div className="container-page flex h-16 items-center justify-between gap-3 sm:h-20">
        <Link
          href="/"
          aria-label="Mércia Regina · Início"
          className="flex items-center gap-2"
        >
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#F5C200] to-[#E87520]">
            <span
              style={{
                fontFamily: "Dancing Script, cursive",
                color: "#2C1000",
                fontSize: "14px",
                fontWeight: 700,
              }}
            >
              mr
            </span>
          </div>
          <div className="hidden flex-col leading-tight sm:flex">
            <span
              style={{
                fontFamily: "Dancing Script, cursive",
                color: "#2C1000",
                fontSize: "16px",
                fontWeight: 700,
              }}
            >
              Mércia Regina
            </span>
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                color: "#E87520",
                fontSize: "10px",
                letterSpacing: "0.05em",
              }}
            >
              Beleza · Bronzeamento
            </span>
          </div>
        </Link>

        <nav
          aria-label="Principal"
          className="hidden items-center gap-7 lg:flex"
        >
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="relative text-sm font-medium text-brand-brown/80 transition-colors hover:text-brand-amber"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <CarrinhoDrawer />

          <Button
            asChild
            size="sm"
            className="hidden sm:inline-flex"
          >
            <Link href="/agendar">
              <Calendar className="h-4 w-4" />
              Agendar
            </Link>
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                aria-label="Abrir menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 p-0">
              <div className="flex h-full flex-col">
                <div className="flex items-center gap-3 border-b border-brand-gold/15 px-6 py-5">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#F5C200] to-[#E87520]">
                    <span
                      style={{
                        fontFamily: "Dancing Script, cursive",
                        color: "#2C1000",
                        fontSize: "16px",
                        fontWeight: 700,
                      }}
                    >
                      mr
                    </span>
                  </div>
                  <div>
                    <p className="font-display text-lg font-medium leading-none text-brand-brown">
                      Mércia Regina
                    </p>
                    <p className="font-script text-sm leading-tight text-brand-amber">
                      na primeira sessão você vicia
                    </p>
                  </div>
                </div>

                <nav className="flex flex-1 flex-col gap-1 px-3 py-6">
                  {NAV_LINKS.map((l) => (
                    <SheetClose key={l.href} asChild>
                      <Link
                        href={l.href}
                        className="rounded-xl px-3 py-3 text-base font-medium text-brand-brown transition-colors hover:bg-brand-warm hover:text-brand-amber"
                      >
                        {l.label}
                      </Link>
                    </SheetClose>
                  ))}
                </nav>

                <div className="space-y-2 border-t border-brand-gold/15 p-6">
                  <SheetClose asChild>
                    <Button asChild className="w-full">
                      <Link href="/agendar">
                        <Calendar className="h-4 w-4" />
                        Agendar agora
                      </Link>
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/login">Entrar / Cadastrar</Link>
                    </Button>
                  </SheetClose>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
