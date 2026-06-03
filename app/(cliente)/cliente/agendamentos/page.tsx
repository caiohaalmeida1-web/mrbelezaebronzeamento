import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import { Calendar, Clock, MapPin, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { CancelarBotao } from "./cancelar-botao";
import { createClient } from "@/lib/supabase/server";
import { SITE_CONFIG, formatBRL } from "@/lib/utils";

const STATUS_BADGE: Record<string, BadgeProps["variant"]> = {
  pendente: "warm",
  confirmado: "success",
  concluido: "default",
  cancelado: "danger",
  no_show: "outline",
};

const STATUS_LABEL: Record<string, string> = {
  pendente: "Aguardando",
  confirmado: "Confirmado",
  concluido: "Concluído",
  cancelado: "Cancelado",
  no_show: "Não compareceu",
};

export default async function AgendamentosPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: agendamentos } = await supabase
    .from("agendamentos")
    .select("id, data_hora, status, valor_pago, servicos(nome, duracao_minutos)")
    .eq("cliente_id", user.id)
    .order("data_hora", { ascending: false });

  return (
    <div className="space-y-8">
      <header className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="label-eyebrow">Histórico</p>
          <h1 className="mt-2 font-display text-4xl font-medium text-brand-brown sm:text-5xl">
            Meus agendamentos
          </h1>
        </div>
        <Button asChild>
          <Link href="/agendar">
            <Sparkles className="h-4 w-4" />
            Novo agendamento
          </Link>
        </Button>
      </header>

      {!agendamentos || agendamentos.length === 0 ? (
        <div className="card-brand p-10 text-center">
          <Calendar className="mx-auto h-12 w-12 text-brand-caramel/50" />
          <h2 className="mt-4 font-display text-2xl text-brand-brown">
            Nenhum agendamento ainda
          </h2>
          <p className="mt-1 text-brand-caramel">
            Marque sua primeira sessão e comece a brilhar.
          </p>
          <Button asChild className="mt-5">
            <Link href="/agendar">Agendar agora</Link>
          </Button>
        </div>
      ) : (
        <ul className="space-y-4">
          {agendamentos.map((a) => {
            const data = new Date(a.data_hora);
            const horasAte = (data.getTime() - Date.now()) / 36e5;
            const podeCancelar =
              (a.status === "pendente" || a.status === "confirmado") &&
              horasAte > 24;
            return (
              <li key={a.id} className="card-brand p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <Badge variant={STATUS_BADGE[a.status]}>
                      {STATUS_LABEL[a.status]}
                    </Badge>
                    <h3 className="mt-3 font-display text-2xl font-medium text-brand-brown">
                      {/* @ts-expect-error relacao */}
                      {a.servicos?.nome ?? "Serviço"}
                    </h3>
                    <div className="mt-3 grid gap-1.5 text-sm text-brand-caramel sm:grid-cols-3">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-brand-amber" />
                        {format(data, "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-brand-amber" />
                        {format(data, "HH:mm")}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-brand-amber" />
                        {SITE_CONFIG.city}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    {a.valor_pago && (
                      <div className="font-display text-xl font-semibold text-brand-brown">
                        {formatBRL(Number(a.valor_pago))}
                      </div>
                    )}
                    {podeCancelar && (
                      <CancelarBotao agendamentoId={a.id} />
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
