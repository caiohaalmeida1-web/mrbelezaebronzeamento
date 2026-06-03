import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Gift, Package, Sparkles, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { formatBRL } from "@/lib/utils";

export default async function ClienteDashboard() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [
    { data: profile },
    { data: proximoAgendamento },
    { data: ultimoPedido },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, pontos, total_sessoes")
      .eq("id", user.id)
      .single(),
    supabase
      .from("agendamentos")
      .select("data_hora, status, servicos(nome)")
      .eq("cliente_id", user.id)
      .gte("data_hora", new Date().toISOString())
      .in("status", ["pendente", "confirmado"])
      .order("data_hora", { ascending: true })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("pedidos")
      .select("id, valor_total, status, created_at")
      .eq("cliente_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const proxima5sessao = profile
    ? 5 - (profile.total_sessoes % 5 || 5)
    : 0;

  return (
    <div className="space-y-8">
      <header>
        <p className="font-script text-2xl text-brand-amber">
          olá, {profile?.full_name?.split(" ")[0] ?? "linda"}!
        </p>
        <h1 className="font-display text-4xl font-medium text-brand-brown sm:text-5xl">
          Sua área pessoal
        </h1>
      </header>

      <div className="grid gap-5 sm:grid-cols-3">
        <Card
          icon={Sparkles}
          label="Sessões realizadas"
          value={profile?.total_sessoes ?? 0}
          accent
        />
        <Card
          icon={Gift}
          label="Pontos disponíveis"
          value={profile?.pontos ?? 0}
        />
        <Card
          icon={Calendar}
          label="Para próximo desconto"
          value={proxima5sessao === 0 ? "20% off!" : `${proxima5sessao} sessões`}
        />
      </div>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="card-brand p-6 sm:p-8">
          <h2 className="flex items-center gap-2 font-display text-2xl text-brand-brown">
            <Calendar className="h-5 w-5 text-brand-amber" />
            Próximo agendamento
          </h2>
          {proximoAgendamento ? (
            <div className="mt-4 space-y-3">
              <div>
                <Badge
                  variant={
                    proximoAgendamento.status === "confirmado"
                      ? "success"
                      : "warm"
                  }
                >
                  {proximoAgendamento.status}
                </Badge>
              </div>
              <p className="font-display text-2xl font-medium text-brand-brown">
                {/* @ts-expect-error - servicos relacionada */}
                {proximoAgendamento.servicos?.nome ?? "Serviço"}
              </p>
              <p className="text-brand-caramel">
                {format(
                  new Date(proximoAgendamento.data_hora),
                  "EEEE, dd 'de' MMMM 'às' HH:mm",
                  { locale: ptBR }
                )}
              </p>
              <Button asChild variant="outline">
                <Link href="/cliente/agendamentos">Ver detalhes</Link>
              </Button>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              <p className="text-brand-caramel">
                Você ainda não tem agendamentos. Que tal marcar sua próxima
                sessão?
              </p>
              <Button asChild>
                <Link href="/agendar">
                  <Sparkles className="h-4 w-4" />
                  Agendar agora
                </Link>
              </Button>
            </div>
          )}
        </div>

        <div className="card-brand p-6 sm:p-8">
          <h2 className="flex items-center gap-2 font-display text-2xl text-brand-brown">
            <Package className="h-5 w-5 text-brand-amber" />
            Última compra
          </h2>
          {ultimoPedido ? (
            <div className="mt-4 space-y-3">
              <Badge variant="warm">{ultimoPedido.status}</Badge>
              <p className="font-display text-2xl font-medium text-brand-brown">
                {formatBRL(Number(ultimoPedido.valor_total))}
              </p>
              <p className="text-sm text-brand-caramel">
                {format(
                  new Date(ultimoPedido.created_at),
                  "dd/MM/yyyy 'às' HH:mm"
                )}
              </p>
              <Button asChild variant="outline">
                <Link href="/cliente/compras">Ver compras</Link>
              </Button>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              <p className="text-brand-caramel">
                Nenhuma compra ainda. Conheça nossa linha Click 10.
              </p>
              <Button asChild variant="outline">
                <Link href="/loja">
                  <ShoppingBag className="h-4 w-4" />
                  Ir à loja
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function Card({
  icon: Icon,
  label,
  value,
  accent = false,
}: {
  icon: typeof Calendar;
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div
      className={`card-brand p-6 ${accent ? "bg-brand-brown text-brand-sun ring-0" : ""}`}
    >
      <div
        className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${
          accent ? "bg-brand-sun/15 text-brand-sun" : "bg-amber-gradient text-white"
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div
        className={`mt-3 text-xs uppercase tracking-wider ${
          accent ? "text-brand-sun/70" : "text-brand-caramel/70"
        }`}
      >
        {label}
      </div>
      <div
        className={`font-display text-3xl font-semibold ${
          accent ? "text-brand-sun" : "text-brand-brown"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
