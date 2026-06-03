-- =====================================================
-- 002_servicos.sql
-- Catálogo de serviços ofertados
-- =====================================================

CREATE TABLE IF NOT EXISTS servicos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  duracao_minutos INTEGER NOT NULL,
  preco DECIMAL(10, 2) NOT NULL,
  preco_pacote DECIMAL(10, 2),
  quantidade_pacote INTEGER,
  ativo BOOLEAN DEFAULT TRUE,
  imagem_url TEXT,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_servicos_ativo ON servicos(ativo);
CREATE INDEX IF NOT EXISTS idx_servicos_ordem ON servicos(ordem);

ALTER TABLE servicos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Todos veem serviços ativos" ON servicos;
CREATE POLICY "Todos veem serviços ativos" ON servicos
  FOR SELECT USING (ativo = TRUE);

DROP POLICY IF EXISTS "Admin gerencia serviços" ON servicos;
CREATE POLICY "Admin gerencia serviços" ON servicos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Seed dos serviços reais
INSERT INTO servicos (nome, descricao, duracao_minutos, preco, ativo, ordem)
VALUES
  (
    'Bronzeamento Natural',
    'Exposição solar com biquíni de fita personalizada ou tecido próprio. Ativa a melanina, produz vitamina D e deixa a pele tratada. Todos os produtos aprovados pela Anvisa.',
    60,
    80.00,
    TRUE,
    1
  ),
  (
    'Bronze a Jato',
    'Pulverização profissional com máquina de alta precisão. Resultado imediato em 1 hora — perfeito para eventos. Dura de 7 a 10 dias com os cuidados certos.',
    60,
    120.00,
    TRUE,
    2
  )
ON CONFLICT DO NOTHING;
