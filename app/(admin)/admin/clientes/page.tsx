import { format } from "date-fns";
import { Search, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/server";
import { getInitials } from "@/lib/utils";

interface Props {
  searchParams: { q?: string };
}

export default async function AdminClientes({ searchParams }: Props) {
  const supabase = createClient();
  const q = searchParams.q?.trim();

  let query = supabase
    .from("profiles")
    .select("id, full_name, email, phone, pontos, total_sessoes, role, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (q) {
    query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`);
  }

  const { data: clientes } = await query;

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="label-eyebrow">Base</p>
          <h1 className="mt-2 font-display text-4xl font-medium text-brand-brown sm:text-5xl">
            Clientes
          </h1>
        </div>
      </header>

      <form className="relative max-w-md">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-caramel" />
        <Input
          name="q"
          defaultValue={q}
          placeholder="Buscar por nome, e-mail ou telefone…"
          className="pl-11"
        />
      </form>

      {!clientes || clientes.length === 0 ? (
        <div className="card-brand p-10 text-center">
          <Users className="mx-auto h-12 w-12 text-brand-caramel/50" />
          <p className="mt-3 text-brand-caramel">Nenhuma cliente encontrada.</p>
        </div>
      ) : (
        <div className="card-brand overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-gold/15 text-left text-xs uppercase tracking-wider text-brand-caramel">
                <th className="px-5 py-3">Cliente</th>
                <th className="px-5 py-3">Contato</th>
                <th className="px-5 py-3">Sessões</th>
                <th className="px-5 py-3">Pontos</th>
                <th className="px-5 py-3">Cadastro</th>
                <th className="px-5 py-3">Tipo</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-brand-gold/10 last:border-b-0 hover:bg-brand-warm/30"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-gradient text-xs font-bold text-white">
                        {getInitials(c.full_name)}
                      </div>
                      <div>
                        <div className="font-semibold text-brand-brown">
                          {c.full_name}
                        </div>
                        <div className="text-xs text-brand-caramel">
                          {c.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-brand-caramel">{c.phone ?? "—"}</td>
                  <td className="px-5 py-3 font-semibold text-brand-brown">
                    {c.total_sessoes}
                  </td>
                  <td className="px-5 py-3">
                    <Badge variant="warm">{c.pontos} pts</Badge>
                  </td>
                  <td className="px-5 py-3 text-xs text-brand-caramel">
                    {format(new Date(c.created_at), "dd/MM/yy")}
                  </td>
                  <td className="px-5 py-3">
                    <Badge variant={c.role === "admin" ? "default" : "outline"}>
                      {c.role}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
