import { format } from "date-fns";
import { Award, Gift, Star, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";

export default async function PontosPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: profile }, { data: transacoes }] = await Promise.all([
    supabase
      .from("profiles")
      .select("pontos, total_sessoes")
      .eq("id", user.id)
      .single(),
    supabase
      .from("fidelidade_transacoes")
      .select("*")
      .eq("cliente_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const pontos = profile?.pontos ?? 0;
  const proxima5 = profile ? 5 - (profile.total_sessoes % 5 || 5) : 5;
  const ate500 = Math.max(0, 500 - pontos);

  return (
    <div className="space-y-8">
      <header>
        <p className="label-eyebrow">Programa de fidelidade</p>
        <h1 className="mt-2 font-display text-4xl font-medium text-brand-brown sm:text-5xl">
          Meus pontos
        </h1>
      </header>

      <section className="card-brand overflow-hidden bg-amber-gradient p-1">
        <div className="rounded-3xl bg-white p-6 sm:p-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-brand-caramel">
                Saldo atual
              </p>
              <p className="mt-1 font-display text-6xl font-semibold text-brand-brown sm:text-7xl">
                {pontos}
              </p>
              <p className="text-sm font-semibold text-brand-amber">pontos</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Beneficio
                icon={Star}
                titulo="Próximo prêmio"
                valor={ate500 === 0 ? "Disponível!" : `${ate500} pts`}
                desc="500pts = R$30 off"
              />
              <Beneficio
                icon={Gift}
                titulo="Próximo 20%"
                valor={proxima5 === 0 ? "Disponível!" : `${proxima5} sessões`}
                desc="A cada 5ª sessão"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="card-brand p-5 text-sm text-brand-caramel">
        <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-caramel">
          Como funciona
        </h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            Você ganha <strong>1 ponto a cada R$1 pago</strong> em sessões
            concluídas.
          </li>
          <li>
            <strong>500 pontos valem R$30 de desconto</strong> — peça o resgate
            na recepção ao agendar ou pagar.
          </li>
          <li>
            Na <strong>5ª sessão o desconto de 20% é automático</strong>.
          </li>
          <li>
            Os benefícios não acumulam na mesma sessão — vale sempre o melhor
            para você.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-2xl text-brand-brown">Histórico</h2>
        {!transacoes || transacoes.length === 0 ? (
          <div className="card-brand mt-4 p-8 text-center text-brand-caramel">
            Nenhuma transação ainda. Que tal agendar sua primeira sessão e
            começar a pontuar?
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-brand-gold/10 rounded-2xl bg-white shadow-sm ring-1 ring-brand-gold/10">
            {transacoes.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${
                      t.tipo === "credito"
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {t.tipo === "credito" ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <Award className="h-4 w-4" />
                    )}
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-brand-brown">
                      {t.descricao ?? "Movimentação"}
                    </div>
                    <div className="text-xs text-brand-caramel/70">
                      {format(new Date(t.created_at), "dd/MM/yyyy 'às' HH:mm")}
                    </div>
                  </div>
                </div>
                <Badge
                  variant={t.tipo === "credito" ? "success" : "danger"}
                  className="font-mono"
                >
                  {t.tipo === "credito" ? "+" : "-"}
                  {t.pontos} pts
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Beneficio({
  icon: Icon,
  titulo,
  valor,
  desc,
}: {
  icon: typeof Gift;
  titulo: string;
  valor: string;
  desc: string;
}) {
  return (
    <div className="rounded-2xl bg-brand-warm/60 px-4 py-3 text-center">
      <Icon className="mx-auto h-5 w-5 text-brand-amber" />
      <div className="mt-1 text-[10px] uppercase tracking-wider text-brand-caramel/70">
        {titulo}
      </div>
      <div className="font-display text-lg font-semibold text-brand-brown">
        {valor}
      </div>
      <div className="text-[10px] text-brand-caramel/70">{desc}</div>
    </div>
  );
}
