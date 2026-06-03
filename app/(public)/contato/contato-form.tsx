"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Send, Check, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { enviarContato, type ContatoState } from "./actions";

const initialState: ContatoState = { ok: false };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      <Send className="h-4 w-4" />
      {pending ? "Enviando…" : "Enviar mensagem"}
    </Button>
  );
}

export function ContatoForm() {
  const [state, formAction] = useFormState(enviarContato, initialState);

  return (
    <form
      action={formAction}
      className="space-y-5"
      aria-label="Formulário de contato"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="nome">Nome*</Label>
          <Input
            id="nome"
            name="nome"
            type="text"
            required
            placeholder="Como podemos te chamar?"
            aria-describedby={state.errors?.nome ? "err-nome" : undefined}
          />
          {state.errors?.nome && (
            <p id="err-nome" className="text-xs text-red-600">
              {state.errors.nome[0]}
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">E-mail*</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder="seu@email.com"
            aria-describedby={state.errors?.email ? "err-email" : undefined}
          />
          {state.errors?.email && (
            <p id="err-email" className="text-xs text-red-600">
              {state.errors.email[0]}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="telefone">Telefone (opcional)</Label>
        <Input
          id="telefone"
          name="telefone"
          type="tel"
          placeholder="(61) 99999-9999"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="mensagem">Mensagem*</Label>
        <Textarea
          id="mensagem"
          name="mensagem"
          required
          rows={5}
          placeholder="Conta para a gente como podemos ajudar você…"
          aria-describedby={
            state.errors?.mensagem ? "err-mensagem" : undefined
          }
        />
        {state.errors?.mensagem && (
          <p id="err-mensagem" className="text-xs text-red-600">
            {state.errors.mensagem[0]}
          </p>
        )}
      </div>

      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SubmitButton />
        {state.message && (
          <p
            role="status"
            className={`flex items-center gap-2 text-sm font-medium ${
              state.ok ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {state.ok ? (
              <Check className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
