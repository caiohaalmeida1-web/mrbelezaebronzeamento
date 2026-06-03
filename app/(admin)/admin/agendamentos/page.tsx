import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { formatBRL } from "@/lib/utils";
import { MarcarConcluidoBotao } from "./marcar-concluido";

export default async function AdminAgendamentos() {
  const supabase = createClient();
  const inicio = new Date().toISOString();
  const fim = addDays(new Date(), 14).toISOString();

  const { data: agendamentos } = await supabase
    .from("agendamentos")
    .select(
      "id, data_hora, status, valor_pago, observacoes, profiles(full_name, phone, email), servicos(nome)"
    )
    .gte("data_hora", inicio)
    .lte("data_hora", fim)
    .order("data_hora");

  const porDia = (agendamentos ?? []).reduce<
    Record<string, typeof agendamentos>
  >((acc, a) => {
    const k = format(new Date(a.data_hora), "yyyy-MM-dd");
    if (!acc[k]) acc[k] = [];
    acc[k]!.push(a);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <header>
        <p className="label-eyebrow">Próximos 14 dias</p>
        <h1 className="mt-2 font-display text-4xl font-medium text-brand-brown sm:text-5xl">
          Agendamentos
        </h1>
      </header>

      {Object.keys(porDia).length === 0 ? (
        <div className="card-brand p-10 text-center">
          <Calendar className="mx-auto h-12 w-12 text-brand-caramel/50" />
          <p className="mt-3 text-brand-caramel">
            Nenhum agendamento nas próximas duas semanas.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(porDia).map(([data, items]) => {
            const d = new Date(`${data}T12:00:00`);
            return (
              <section key={data}>
                <h2 className="font-display text-xl font-medium text-brand-brown">
                  {format(d, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                </h2>
                <ul className="mt-3 space-y-2">
                  {(items ?? []).map((a) => (
                    <li
                      key={a.id}
                      className="card-brand flex flex-wrap items-center justify-between gap-3 p-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-display text-lg font-semibold text-brand-brown">
                            {format(new Date(a.data_hora), "HH:mm")}
                          </span>
                          <Badge variant="warm">{a.status}</Badge>
                        </div>
                        <p className="text-sm">
                          <strong className="text-brand-brown">
                            {/* @ts-expect-error rel */}
                            {a.profiles?.full_name}
                          </strong>{" "}
                          ·{" "}
                          {/* @ts-expect-error rel */}
                          {a.servicos?.nome}
                        </p>
                        {/* @ts-expect-error rel */}
                        {a.profiles?.phone && (
                          <p className="text-xs text-brand-caramel">
                            {/* @ts-expect-error rel */}
                            {a.profiles.phone}
                          </p>
                        )}
                        {a.observacoes && (
                          <p className="mt-1 text-xs italic text-brand-caramel">
                            “{a.observacoes}”
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {a.valor_pago && (
                          <span className="text-sm font-semibold text-brand-brown">
                            {formatBRL(Number(a.valor_pago))}
                          </span>
                        )}
                        {a.status === "confirmado" && (
                          <MarcarConcluidoBotao agendamentoId={a.id} />
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
