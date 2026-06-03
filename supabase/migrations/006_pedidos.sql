-- =====================================================
-- 006_pedidos.sql
-- Pedidos da loja virtual + itens
-- =====================================================

CREATE TABLE IF NOT EXISTS pedidos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pendente' CHECK (
    status IN ('pendente', 'pago', 'enviado', 'entregue', 'cancelado', 'reembolsado')
  ),
  valor_total DECIMAL(10, 2) NOT NULL,
  stripe_payment_intent TEXT,
  stripe_checkout_session TEXT,
  endereco_entrega JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pedido_itens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pedido_id UUID REFERENCES pedidos(id) ON DELETE CASCADE,
  produto_id UUID REFERENCES produtos(id) ON DELETE RESTRICT,
  quantidade INTEGER NOT NULL,
  preco_unitario DECIMAL(10, 2) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_pedidos_cliente ON pedidos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_status ON pedidos(status);
CREATE INDEX IF NOT EXISTS idx_pedido_itens_pedido ON pedido_itens(pedido_id);

ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedido_itens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Cliente vê próprios pedidos" ON pedidos;
CREATE POLICY "Cliente vê próprios pedidos" ON pedidos
  FOR SELECT USING (auth.uid() = cliente_id);

DROP POLICY IF EXISTS "Cliente cria pedido" ON pedidos;
CREATE POLICY "Cliente cria pedido" ON pedidos
  FOR INSERT WITH CHECK (auth.uid() = cliente_id);

DROP POLICY IF EXISTS "Admin gerencia pedidos" ON pedidos;
CREATE POLICY "Admin gerencia pedidos" ON pedidos
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Cliente vê itens dos próprios pedidos" ON pedido_itens;
CREATE POLICY "Cliente vê itens dos próprios pedidos" ON pedido_itens
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM pedidos
      WHERE pedidos.id = pedido_itens.pedido_id
        AND pedidos.cliente_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admin gerencia itens" ON pedido_itens;
CREATE POLICY "Admin gerencia itens" ON pedido_itens
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP TRIGGER IF EXISTS set_pedidos_updated_at ON pedidos;
CREATE TRIGGER set_pedidos_updated_at
  BEFORE UPDATE ON pedidos
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
