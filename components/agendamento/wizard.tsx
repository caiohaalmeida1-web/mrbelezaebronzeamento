"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ProgressBar } from "./progress-bar";
import { StepServico } from "./step-servico";
import { StepDataHora } from "./step-data-hora";
import { StepDados, type DadosCliente } from "./step-dados";
import { StepPagamento } from "./step-pagamento";
import { Button } from "@/components/ui/button";
import { criarAgendamento } from "@/app/(public)/agendar/actions";
import type {
  Agendamento,
  Bloqueio,
  HorarioConfig,
  Servico,
} from "@/types/database";

interface Props {
  servicos: Servico[];
  horariosConfig: HorarioConfig[];
  bloqueios: Bloqueio[];
  agendamentosIniciais: Pick<Agendamento, "data_hora" | "status">[];
  servicoInicial?: string;
  perfilLogado?: {
    full_name: string;
    email: string;
    phone: string | null;
    total_sessoes: number;
  } | null;
}

export function AgendamentoWizard({
  servicos,
  horariosConfig,
  bloqueios,
  agendamentosIniciais,
  servicoInicial,
  perfilLogado,
}: Props) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [servicoId, setServicoId] = useState<string | null>(
    servicoInicial ?? null
  );
  const [dataHora, setDataHora] = useState<string | null>(null);
  const [dados, setDados] = useState<DadosCliente>({
    nome: perfilLogado?.full_name ?? "",
    email: perfilLogado?.email ?? "",
    telefone: perfilLogado?.phone ?? "",
    observacoes: "",
    codigoAfiliado: "",
  });
  const [carregando, setCarregando] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [desconto, setDesconto] = useState(0);

  const servicoSelecionado = servicos.find((s) => s.id === servicoId);

  function podeAvancar(): boolean {
    if (step === 1) return Boolean(servicoId);
    if (step === 2) return Boolean(dataHora);
    if (step === 3)
      return Boolean(
        dados.nome.length >= 2 && /\S+@\S+\.\S+/.test(dados.email) && dados.telefone.length >= 8
      );
    return false;
  }

  async function avancar() {
    if (step < 3) {
      setStep(step + 1);
      return;
    }

    if (step === 3) {
      // Cria agendamento e PaymentIntent
      if (!servicoId || !dataHora) return;
      setCarregando(true);
      try {
        const fd = new FormData();
        fd.append("servico_id", servicoId);
        fd.append("data_hora", dataHora);
        fd.append("nome", dados.nome);
        fd.append("email", dados.email);
        fd.append("telefone", dados.telefone);
        if (dados.observacoes) fd.append("observacoes", dados.observacoes);
        if (dados.codigoAfiliado)
          fd.append("codigo_afiliado", dados.codigoAfiliado);

        const result = await criarAgendamento(fd);
        if (!result.ok) {
          toast.error(result.message ?? "Não foi possível agendar.");
          return;
        }
        setClientSecret(result.clientSecret ?? null);
        setDesconto(result.desconto ?? 0);
        setStep(4);
      } catch (e) {
        console.error(e);
        toast.error("Algo deu errado. Tente novamente.");
      } finally {
        setCarregando(false);
      }
    }
  }

  function voltar() {
    if (step > 1) setStep(step - 1);
  }

  return (
    <div className="space-y-10">
      <ProgressBar current={step} />

      <div className="card-brand p-6 sm:p-10">
        {step === 1 && (
          <StepServico
            servicos={servicos}
            servicoSelecionado={servicoId}
            onSelect={setServicoId}
          />
        )}

        {step === 2 && servicoSelecionado && (
          <StepDataHora
            duracaoMinutos={servicoSelecionado.duracao_minutos}
            horariosConfig={horariosConfig}
            bloqueios={bloqueios}
            agendamentosIniciais={agendamentosIniciais}
            slotSelecionado={dataHora}
            onSelect={setDataHora}
          />
        )}

        {step === 3 && (
          <StepDados
            dados={dados}
            onChange={setDados}
            perfilLogado={perfilLogado}
          />
        )}

        {step === 4 && servicoSelecionado && dataHora && (
          <StepPagamento
            servico={servicoSelecionado}
            dataHoraISO={dataHora}
            valorBase={Number(servicoSelecionado.preco)}
            desconto={desconto}
            clientSecret={clientSecret}
            onPaid={() => {
              toast.success("Agendamento confirmado!");
              setTimeout(() => router.push("/cliente/agendamentos"), 2200);
            }}
          />
        )}
      </div>

      {step < 4 && (
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={voltar}
            disabled={step === 1 || carregando}
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <Button
            onClick={avancar}
            disabled={!podeAvancar() || carregando}
            size="lg"
          >
            {carregando && <Loader2 className="h-4 w-4 animate-spin" />}
            {step === 3 ? "Ir para pagamento" : "Continuar"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
