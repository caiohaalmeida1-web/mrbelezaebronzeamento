import type { Metadata } from "next";
import { addDays } from "date-fns";
import { AgendamentoWizard } from "@/components/agendamento/wizard";
import { createClient } from "@/lib/supabase/server";
import type {
  Agendamento,
  Bloqueio,
  HorarioConfig,
  Servico,
} from "@/types/database";

export const metadata: Metadata = {
  title: "Agendar online · Bronzeamento Vicente Pires",
  description:
    "Agende online sua sessão de bronzeamento com a Mércia Regina. Escolha serviço, data e horário em tempo real. Pagamento Pix ou cartão.",
};

interface PageProps {
  searchParams: { servico?: string };
}

const FALLBACK_SERVICOS: Servico[] = [
  {
    id: "fallback-natural",
    nome: "Bronzeamento Natural",
    descricao: "Exposição solar com biquíni de fita personalizada.",
    duracao_minutos: 60,
    preco: 80,
    preco_pacote: null,
    quantidade_pacote: null,
    ativo: true,
    imagem_url: null,
    ordem: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: "fallback-cabine",
    nome: "Bronze de Cabine",
    descricao:
      "Bronzeamento em cabine com conforto e privacidade, sem depender do sol.",
    duracao_minutos: 60,
    preco: 120,
    preco_pacote: null,
    quantidade_pacote: null,
    ativo: true,
    imagem_url: null,
    ordem: 2,
    created_at: new Date().toISOString(),
  },
  {
    id: "fallback-jato",
    nome: "Bronze a Jato",
    descricao: "Pulverização profissional com máquina de alta precisão.",
    duracao_minutos: 60,
    preco: 140,
    preco_pacote: null,
    quantidade_pacote: null,
    ativo: true,
    imagem_url: null,
    ordem: 3,
    created_at: new Date().toISOString(),
  },
];

const FALLBACK_HORARIOS: HorarioConfig[] = [
  { id: "1", dia_semana: 1, hora_inicio: "08:00:00", hora_fim: "18:00:00", intervalo_minutos: 60, ativo: true },
  { id: "2", dia_semana: 2, hora_inicio: "08:00:00", hora_fim: "18:00:00", intervalo_minutos: 60, ativo: true },
  { id: "3", dia_semana: 3, hora_inicio: "08:00:00", hora_fim: "18:00:00", intervalo_minutos: 60, ativo: true },
  { id: "4", dia_semana: 4, hora_inicio: "08:00:00", hora_fim: "18:00:00", intervalo_minutos: 60, ativo: true },
  { id: "5", dia_semana: 5, hora_inicio: "08:00:00", hora_fim: "18:00:00", intervalo_minutos: 60, ativo: true },
  { id: "6", dia_semana: 6, hora_inicio: "09:00:00", hora_fim: "15:00:00", intervalo_minutos: 60, ativo: true },
];

export default async function AgendarPage({ searchParams }: PageProps) {
  const supabase = createClient();

  const [
    { data: servicosData },
    { data: horariosData },
    { data: bloqueiosData },
    { data: agendamentosData },
    { data: { user } },
  ] = await Promise.all([
    supabase.from("servicos").select("*").eq("ativo", true).order("ordem"),
    supabase.from("horarios_config").select("*").eq("ativo", true),
    supabase
      .from("bloqueios")
      .select("*")
      .gte("data_fim", new Date().toISOString()),
    supabase
      .from("agendamentos")
      .select("data_hora, status")
      .gte("data_hora", new Date().toISOString())
      .lte("data_hora", addDays(new Date(), 30).toISOString())
      .in("status", ["pendente", "confirmado"]),
    supabase.auth.getUser(),
  ]);

  const servicos: Servico[] =
    servicosData && servicosData.length > 0
      ? servicosData
      : FALLBACK_SERVICOS;

  const horariosConfig: HorarioConfig[] =
    horariosData && horariosData.length > 0
      ? horariosData
      : FALLBACK_HORARIOS;

  const bloqueios: Bloqueio[] = bloqueiosData ?? [];
  const agendamentos: Pick<Agendamento, "data_hora" | "status">[] =
    agendamentosData ?? [];

  let perfil:
    | { full_name: string; email: string; phone: string | null; total_sessoes: number }
    | null = null;

  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("full_name, email, phone, total_sessoes")
      .eq("id", user.id)
      .maybeSingle();
    perfil = data;
  }

  return (
    <>
      <section className="bg-hero-gradient py-16 sm:py-20">
        <div className="container-page text-center">
          <p className="font-script text-2xl text-brand-cream/95 sm:text-3xl">
            seu bronze começa aqui
          </p>
          <h1 className="mt-2 font-display text-4xl font-medium tracking-tight text-brand-brown sm:text-5xl md:text-6xl">
            Agendar
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-brand-brown/80">
            Em quatro passos simples você garante seu horário com pagamento
            seguro.
          </p>
        </div>
      </section>

      <section className="bg-brand-cream py-16 sm:py-20">
        <div className="container-page max-w-3xl">
          <AgendamentoWizard
            servicos={servicos}
            horariosConfig={horariosConfig}
            bloqueios={bloqueios}
            agendamentosIniciais={agendamentos}
            servicoInicial={searchParams.servico}
            perfilLogado={perfil}
          />
        </div>
      </section>
    </>
  );
}
