-- =====================================================
-- 008_avaliacoes.sql
-- =====================================================

CREATE TABLE IF NOT EXISTS avaliacoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  agendamento_id UUID REFERENCES agendamentos(id) ON DELETE CASCADE,
  nota INTEGER CHECK (nota BETWEEN 1 AND 5),
  comentario TEXT,
  aprovada BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_avaliacoes_aprovada ON avaliacoes(aprovada);

ALTER TABLE avaliacoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Todos veem avaliações aprovadas" ON avaliacoes;
CREATE POLICY "Todos veem avaliações aprovadas" ON avaliacoes
  FOR SELECT USING (aprovada = TRUE OR auth.uid() = cliente_id);

DROP POLICY IF EXISTS "Cliente cria avaliação" ON avaliacoes;
CREATE POLICY "Cliente cria avaliação" ON avaliacoes
  FOR INSERT WITH CHECK (auth.uid() = cliente_id);

DROP POLICY IF EXISTS "Admin gerencia avaliações" ON avaliacoes;
CREATE POLICY "Admin gerencia avaliações" ON avaliacoes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
