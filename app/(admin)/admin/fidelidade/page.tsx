import { format } from "date-fns";
import { Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { getInitials } from "@/lib/utils";

export default async function AdminFidelidade() {
  const supabase = createClient();
  const [{ data: top }, { data: ultimas }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, pontos, total_sessoes")
      .eq("role", "cliente")
      .order("pontos", { ascending: false })
      .limit(20),
    supabase
      .from("fidelidade_transacoes")
      .select("id, pontos, tipo, descricao, created_at, profiles(full_name)")
      .order("created_at", { ascending: false })
      .limit(30),
  ]);

  return (
    <div className="space-y-10">
      <header>
        <p className="label-eyebrow">Programa de fidelidade</p>
        <h1 className="mt-2 font-display text-4xl font-medium text-brand-brown sm:text-5xl">
          Fidelidade
        </h1>
      </header>

      <section>
        <h2 className="font-display text-2xl text-brand-brown">
          Top clientes
        </h2>
        <div className="card-brand mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-gold/15 text-left text-xs uppercase tracking-wider text-brand-caramel">
                <th className="px-5 py-3">#</th>
                <th className="px-5 py-3">Cliente</th>
                <th className="px-5 py-3">Sessões</th>
                <th className="px-5 py-3">Pontos</th>
              </tr>
            </thead>
            <tbody>
              {(top ?? []).map((c, i) => (
                <tr key={c.id} className="border-b border-brand-gold/10 last:border-b-0">
                  <td className="px-5 py-3 font-bold text-brand-amber">
                    {i + 1}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-gradient text-xs font-bold text-white">
                        {getInitials(c.full_name)}
                      </div>
                      <span className="font-semibold text-brand-brown">
                        {c.full_name}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3">{c.total_sessoes}</td>
                  <td className="px-5 py-3">
                    <Badge variant="warm">{c.pontos} pts</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl text-brand-brown">
          Últimas movimentações
        </h2>
        {(!ultimas || ultimas.length === 0) ? (
          <div className="card-brand mt-3 p-8 text-center text-brand-caramel">
            <Award className="mx-auto h-10 w-10 text-brand-caramel/50" />
            <p className="mt-2">Nenhuma movimentação ainda.</p>
          </div>
        ) : (
          <ul className="mt-3 space-y-2">
            {ultimas.map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 ring-1 ring-brand-gold/10"
              >
                <div>
                  {/* @ts-expect-error rel */}
                  <strong className="text-brand-brown">{t.profiles?.full_name}</strong>
                  <span className="text-brand-caramel"> · {t.descricao}</span>
                  <div className="text-xs text-brand-caramel/70">
                    {format(new Date(t.created_at), "dd/MM/yyyy 'às' HH:mm")}
                  </div>
                </div>
                <Badge variant={t.tipo === "credito" ? "success" : "danger"}>
                  {t.tipo === "credito" ? "+" : "-"}
                  {t.pontos}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
