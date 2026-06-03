-- =====================================================
-- 010_email_lista.sql
-- Captura de leads / newsletter
-- =====================================================

CREATE TABLE IF NOT EXISTS email_lista (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  nome TEXT,
  origem TEXT CHECK (origem IN ('agendamento', 'compra', 'cadastro', 'blog', 'lead_magnet')),
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_lista_ativo ON email_lista(ativo);

ALTER TABLE email_lista ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Qualquer um pode se inscrever" ON email_lista;
CREATE POLICY "Qualquer um pode se inscrever" ON email_lista
  FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Admin gerencia lista" ON email_lista;
CREATE POLICY "Admin gerencia lista" ON email_lista
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
