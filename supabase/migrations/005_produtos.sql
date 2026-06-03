-- =====================================================
-- 005_produtos.sql
-- =====================================================

CREATE TABLE IF NOT EXISTS produtos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  descricao TEXT,
  descricao_longa TEXT,
  tipo TEXT CHECK (tipo IN ('fisico', 'digital', 'curso', 'ebook', 'assinatura')),
  preco DECIMAL(10, 2) NOT NULL,
  preco_original DECIMAL(10, 2),
  estoque INTEGER DEFAULT 0,
  peso_gramas INTEGER,
  imagens TEXT[],
  arquivo_digital_url TEXT,
  stripe_price_id TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  destaque BOOLEAN DEFAULT FALSE,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_produtos_slug ON produtos(slug);
CREATE INDEX IF NOT EXISTS idx_produtos_tipo ON produtos(tipo);
CREATE INDEX IF NOT EXISTS idx_produtos_ativo ON produtos(ativo);
CREATE INDEX IF NOT EXISTS idx_produtos_destaque ON produtos(destaque);

ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Todos veem produtos ativos" ON produtos;
CREATE POLICY "Todos veem produtos ativos" ON produtos
  FOR SELECT USING (ativo = TRUE);

DROP POLICY IF EXISTS "Admin gerencia produtos" ON produtos;
CREATE POLICY "Admin gerencia produtos" ON produtos
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Seed dos produtos reais
INSERT INTO produtos (nome, slug, descricao, descricao_longa, tipo, preco, estoque, tags, destaque)
VALUES
  (
    'Click 10 Tradicional',
    'click-10-tradicional',
    'Creme hidratante, ativador e acelerador de bronzeamento. Cor de verão o ano inteiro com hidratação profunda.',
    'O Click 10 Tradicional é o nosso creme campeão de vendas. Apresentado em pote de 500g, ele combina três funções essenciais para um bronze impecável: ativador da melanina, acelerador da pigmentação e hidratante de longa duração. Use diariamente após o banho para uma cor de verão que dura o ano todo.',
    'fisico',
    89.90,
    50,
    ARRAY['Ativador', 'Acelerador', 'Hidratante'],
    TRUE
  ),
  (
    'Click 10 Zero',
    'click-10-zero',
    'Com Vitamina C, Colágeno e DHA. Efeito antioxidante, clareador e firmador. Indicado para peles tipo 3, 4, 5 e 6. Hidratação por até 8h.',
    'A versão premium da nossa linha Click 10. Em bisnaga prática de 500ml, o Click 10 Zero combina Vitamina C antioxidante, Colágeno firmador e DHA para realçar e prolongar seu bronze. Indicado para peles tipo 3, 4, 5 e 6, oferece hidratação por até 8 horas e efeito clareador progressivo de manchas.',
    'fisico',
    99.90,
    50,
    ARRAY['Vitamina C', 'Colágeno', 'DHA', 'Firmador'],
    TRUE
  )
ON CONFLICT (slug) DO NOTHING;
