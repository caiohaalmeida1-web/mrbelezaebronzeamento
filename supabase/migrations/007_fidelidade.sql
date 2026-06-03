-- =====================================================
-- 007_fidelidade.sql
-- Programa de pontos: +100 por sessão, 20% de desconto na 5ª
-- =====================================================

CREATE TABLE IF NOT EXISTS fidelidade_transacoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  tipo TEXT CHECK (tipo IN ('credito', 'debito', 'expiracao')),
  pontos INTEGER NOT NULL,
  descricao TEXT,
  agendamento_id UUID REFERENCES agendamentos(id) ON DELETE SET NULL,
  pedido_id UUID REFERENCES pedidos(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fidelidade_cliente ON fidelidade_transacoes(cliente_id);

ALTER TABLE fidelidade_transacoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Cliente vê próprias transações" ON fidelidade_transacoes;
CREATE POLICY "Cliente vê próprias transações" ON fidelidade_transacoes
  FOR SELECT USING (auth.uid() = cliente_id);

DROP POLICY IF EXISTS "Admin gerencia fidelidade" ON fidelidade_transacoes;
CREATE POLICY "Admin gerencia fidelidade" ON fidelidade_transacoes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Trigger: ao concluir um agendamento, +1 sessão e +100 pontos
CREATE OR REPLACE FUNCTION atualizar_fidelidade()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'concluido' AND (OLD.status IS NULL OR OLD.status <> 'concluido') THEN
    UPDATE profiles
    SET total_sessoes = total_sessoes + 1,
        pontos = pontos + 100
    WHERE id = NEW.cliente_id;

    INSERT INTO fidelidade_transacoes (cliente_id, tipo, pontos, descricao, agendamento_id)
    VALUES (NEW.cliente_id, 'credito', 100, 'Sessão concluída', NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_fidelidade ON agendamentos;
CREATE TRIGGER trigger_fidelidade
  AFTER UPDATE ON agendamentos
  FOR EACH ROW EXECUTE FUNCTION atualizar_fidelidade();
