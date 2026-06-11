/**
 * Tipos do banco Supabase. Em produção, gere automaticamente com:
 *   npx supabase gen types typescript --project-id <id> > types/database.ts
 *
 * Por ora, mantemos um shape essencial que reflete as migrations.
 */

export type Role = "cliente" | "admin";
export type StatusAgendamento =
  | "pendente"
  | "confirmado"
  | "concluido"
  | "cancelado"
  | "no_show";
export type StatusPedido =
  | "pendente"
  | "pago"
  | "enviado"
  | "entregue"
  | "cancelado"
  | "reembolsado";
export type TipoProduto =
  | "fisico"
  | "digital"
  | "curso"
  | "ebook"
  | "assinatura";
export type TipoFidelidade = "credito" | "debito" | "expiracao";
export type OrigemEmail =
  | "agendamento"
  | "compra"
  | "cadastro"
  | "blog"
  | "lead_magnet";

export interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  email: string;
  avatar_url: string | null;
  role: Role;
  pontos: number;
  total_sessoes: number;
  created_at: string;
  updated_at: string;
}

export interface Servico {
  id: string;
  nome: string;
  descricao: string | null;
  duracao_minutos: number;
  preco: number;
  preco_pacote: number | null;
  quantidade_pacote: number | null;
  ativo: boolean;
  imagem_url: string | null;
  ordem: number;
  created_at: string;
}

export interface HorarioConfig {
  id: string;
  dia_semana: number;
  hora_inicio: string;
  hora_fim: string;
  intervalo_minutos: number;
  ativo: boolean;
}

export interface Bloqueio {
  id: string;
  data_inicio: string;
  data_fim: string;
  motivo: string | null;
  created_at: string;
}

export interface Agendamento {
  id: string;
  cliente_id: string;
  servico_id: string;
  data_hora: string;
  status: StatusAgendamento;
  valor_pago: number | null;
  stripe_payment_intent: string | null;
  observacoes: string | null;
  codigo_afiliado: string | null;
  created_at: string;
  updated_at: string;
}

export interface Produto {
  id: string;
  nome: string;
  slug: string;
  descricao: string | null;
  descricao_longa: string | null;
  tipo: TipoProduto;
  preco: number;
  preco_original: number | null;
  estoque: number;
  peso_gramas: number | null;
  imagens: string[] | null;
  arquivo_digital_url: string | null;
  stripe_price_id: string | null;
  ativo: boolean;
  destaque: boolean;
  /** TRUE = vendido no site; FALSE = uso interno nos atendimentos (só estoque). */
  disponivel_venda: boolean;
  tags: string[] | null;
  created_at: string;
}

export interface Pedido {
  id: string;
  cliente_id: string;
  status: StatusPedido;
  valor_total: number;
  stripe_payment_intent: string | null;
  stripe_checkout_session: string | null;
  endereco_entrega: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface PedidoItem {
  id: string;
  pedido_id: string;
  produto_id: string;
  quantidade: number;
  preco_unitario: number;
}

export interface FidelidadeTransacao {
  id: string;
  cliente_id: string;
  tipo: TipoFidelidade;
  pontos: number;
  descricao: string | null;
  agendamento_id: string | null;
  pedido_id: string | null;
  created_at: string;
}

export interface Avaliacao {
  id: string;
  cliente_id: string;
  agendamento_id: string;
  nota: number;
  comentario: string | null;
  aprovada: boolean;
  created_at: string;
}

export interface GaleriaFoto {
  id: string;
  titulo: string | null;
  imagem_url: string;
  storage_path: string | null;
  ordem: number;
  ativo: boolean;
  created_at: string;
}

export interface BlogPost {
  id: string;
  titulo: string;
  slug: string;
  resumo: string | null;
  conteudo: string;
  imagem_capa: string | null;
  autor: string;
  publicado: boolean;
  publicado_em: string | null;
  tags: string[] | null;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmailLista {
  id: string;
  email: string;
  nome: string | null;
  origem: OrigemEmail;
  ativo: boolean;
  created_at: string;
}

export interface Afiliado {
  id: string;
  cliente_id: string;
  codigo: string;
  percentual_comissao: number;
  total_indicacoes: number;
  total_ganho: number;
  ativo: boolean;
  created_at: string;
}

export interface Indicacao {
  id: string;
  afiliado_id: string;
  pedido_id: string | null;
  agendamento_id: string | null;
  comissao: number | null;
  status: "pendente" | "aprovada" | "paga";
  created_at: string;
}
