-- =====================================================
-- 004_agendamentos.sql
-- =====================================================

CREATE TABLE IF NOT EXISTS agendamentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  servico_id UUID REFERENCES servicos(id) ON DELETE RESTRICT,
  data_hora TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pendente' CHECK (
    status IN ('pendente', 'confirmado', 'concluido', 'cancelado', 'no_show')
  ),
  valor_pago DECIMAL(10, 2),
  stripe_payment_intent TEXT,
  observacoes TEXT,
  codigo_afiliado TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agendamentos_cliente ON agendamentos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_data ON agendamentos(data_hora);
CREATE INDEX IF NOT EXISTS idx_agendamentos_status ON agendamentos(status);

ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Cliente vê próprios agendamentos" ON agendamentos;
CREATE POLICY "Cliente vê próprios agendamentos" ON agendamentos
  FOR SELECT USING (auth.uid() = cliente_id);

DROP POLICY IF EXISTS "Cliente cria agendamento" ON agendamentos;
CREATE POLICY "Cliente cria agendamento" ON agendamentos
  FOR INSERT WITH CHECK (auth.uid() = cliente_id);

DROP POLICY IF EXISTS "Cliente atualiza próprio agendamento" ON agendamentos;
CREATE POLICY "Cliente atualiza próprio agendamento" ON agendamentos
  FOR UPDATE USING (auth.uid() = cliente_id);

DROP POLICY IF EXISTS "Admin gerencia agendamentos" ON agendamentos;
CREATE POLICY "Admin gerencia agendamentos" ON agendamentos
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP TRIGGER IF EXISTS set_agendamentos_updated_at ON agendamentos;
CREATE TRIGGER set_agendamentos_updated_at
  BEFORE UPDATE ON agendamentos
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Habilita Realtime na tabela (no painel Supabase verifique também a config)
ALTER PUBLICATION supabase_realtime ADD TABLE agendamentos;
