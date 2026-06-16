-- =====================================================
-- 018_pedidos_forma_entrega.sql
-- Envio por correio ou retirada na loja
-- =====================================================

ALTER TABLE pedidos
  ADD COLUMN IF NOT EXISTS forma_entrega TEXT CHECK (
    forma_entrega IS NULL OR forma_entrega IN ('envio', 'retirada')
  );

COMMENT ON COLUMN pedidos.forma_entrega IS
  'envio = entrega no endereço; retirada = cliente busca na loja; NULL = pedido só digital';
