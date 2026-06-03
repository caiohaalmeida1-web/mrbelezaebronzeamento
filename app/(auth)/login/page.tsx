"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useSearchParams } from "next/navigation";
import { LogIn, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { login, type AuthState } from "../actions";

const initial: AuthState = { ok: false };

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" size="lg" disabled={pending}>
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
      {pending ? "Entrando…" : "Entrar"}
    </Button>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? undefined;
  const [state, action] = useFormState(login, initial);

  return (
    <form action={action} className="mt-7 space-y-4">
      {next && <input type="hidden" name="next" value={next} />}
      <div className="space-y-1.5">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          placeholder="seu@email.com"
          autoComplete="email"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          placeholder="••••••••"
          autoComplete="current-password"
        />
      </div>

      {state.message && !state.ok && (
        <p className="text-sm text-red-600" role="alert">
          {state.message}
        </p>
      )}

      <Submit />
    </form>
  );
}

export default function LoginPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-medium text-brand-brown">
        Bem-vinda de volta
      </h1>
      <p className="mt-1 text-sm text-brand-caramel">
        Entre na sua conta para gerenciar seus agendamentos.
      </p>

      <Suspense fallback={<div className="mt-7 h-44 rounded-2xl bg-brand-warm/40 animate-pulse" />}>
        <LoginForm />
      </Suspense>

      <div className="mt-6 text-center text-sm text-brand-caramel">
        Ainda não tem conta?{" "}
        <Link
          href="/cadastro"
          className="font-semibold text-brand-amber hover:underline"
        >
          Cadastre-se
        </Link>
      </div>
    </div>
  );
}
