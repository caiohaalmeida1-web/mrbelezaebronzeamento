-- =====================================================
-- 017_produtos_uso_interno.sql
-- Divide o catálogo em dois grupos:
--   · disponivel_venda = TRUE  → vendido no site (ex: biquínis)
--   · disponivel_venda = FALSE → uso interno nos atendimentos,
--     só controle de estoque (ex: Click 10)
-- =====================================================

ALTER TABLE produtos
  ADD COLUMN IF NOT EXISTS disponivel_venda BOOLEAN DEFAULT TRUE;

-- Click 10 é usado nas sessões de bronzeamento, não é vendido no site
UPDATE produtos
SET disponivel_venda = FALSE
WHERE slug IN ('click-10-tradicional', 'click-10-zero');

CREATE INDEX IF NOT EXISTS idx_produtos_venda ON produtos(disponivel_venda, ativo);
