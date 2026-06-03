"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { Loader2, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cadastrar, type AuthState } from "../actions";

const initial: AuthState = { ok: false };

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" size="lg" disabled={pending}>
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
      {pending ? "Criando…" : "Criar conta"}
    </Button>
  );
}

export default function CadastroPage() {
  const [state, action] = useFormState(cadastrar, initial);

  return (
    <div>
      <h1 className="font-display text-3xl font-medium text-brand-brown">
        Crie sua conta
      </h1>
      <p className="mt-1 text-sm text-brand-caramel">
        E ganhe pontos a cada sessão concluída.
      </p>

      <form action={action} className="mt-7 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="full_name">Nome completo</Label>
          <Input id="full_name" name="full_name" required placeholder="Seu nome" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" name="email" type="email" required placeholder="seu@email.com" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">WhatsApp (opcional)</Label>
          <Input id="phone" name="phone" type="tel" placeholder="(61) 99999-9999" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
          />
        </div>

        {state.message && !state.ok && (
          <p className="text-sm text-red-600" role="alert">
            {state.message}
          </p>
        )}

        <Submit />
      </form>

      <div className="mt-6 text-center text-sm text-brand-caramel">
        Já tem conta?{" "}
        <Link
          href="/login"
          className="font-semibold text-brand-amber hover:underline"
        >
          Entrar
        </Link>
      </div>
    </div>
  );
}
