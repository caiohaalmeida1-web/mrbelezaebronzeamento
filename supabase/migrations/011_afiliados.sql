-- =====================================================
-- 011_afiliados.sql
-- Programa de afiliados / indicações
-- =====================================================

CREATE TABLE IF NOT EXISTS afiliados (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  codigo TEXT UNIQUE NOT NULL,
  percentual_comissao DECIMAL(5, 2) DEFAULT 10.00,
  total_indicacoes INTEGER DEFAULT 0,
  total_ganho DECIMAL(10, 2) DEFAULT 0,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS indicacoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  afiliado_id UUID REFERENCES afiliados(id) ON DELETE CASCADE,
  pedido_id UUID REFERENCES pedidos(id) ON DELETE SET NULL,
  agendamento_id UUID REFERENCES agendamentos(id) ON DELETE SET NULL,
  comissao DECIMAL(10, 2),
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovada', 'paga')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_afiliados_codigo ON afiliados(codigo);
CREATE INDEX IF NOT EXISTS idx_indicacoes_afiliado ON indicacoes(afiliado_id);

ALTER TABLE afiliados ENABLE ROW LEVEL SECURITY;
ALTER TABLE indicacoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Cliente vê próprio afiliado" ON afiliados;
CREATE POLICY "Cliente vê próprio afiliado" ON afiliados
  FOR SELECT USING (auth.uid() = cliente_id);

DROP POLICY IF EXISTS "Admin gerencia afiliados" ON afiliados;
CREATE POLICY "Admin gerencia afiliados" ON afiliados
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Afiliado vê próprias indicações" ON indicacoes;
CREATE POLICY "Afiliado vê próprias indicações" ON indicacoes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM afiliados
      WHERE afiliados.id = indicacoes.afiliado_id
        AND afiliados.cliente_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admin gerencia indicações" ON indicacoes;
CREATE POLICY "Admin gerencia indicações" ON indicacoes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
