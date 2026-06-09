-- =====================================================
-- 012_bronze_cabine.sql
-- Novo serviço "Bronze de Cabine" (R$ 120) e reajuste
-- do "Bronze a Jato" para R$ 140
-- =====================================================

-- Bronze a Jato passa para R$ 140 e vai para a 3ª posição
UPDATE servicos
SET preco = 140.00, ordem = 3
WHERE nome = 'Bronze a Jato';

-- Novo serviço: Bronze de Cabine (R$ 120, 2ª posição)
INSERT INTO servicos (nome, descricao, duracao_minutos, preco, ativo, ordem)
SELECT
  'Bronze de Cabine',
  'Bronzeamento em cabine com conforto e privacidade, sem depender do sol. Cor uniforme o ano inteiro, com técnica profissional e produtos aprovados pela Anvisa.',
  60,
  120.00,
  TRUE,
  2
WHERE NOT EXISTS (
  SELECT 1 FROM servicos WHERE nome = 'Bronze de Cabine'
);
