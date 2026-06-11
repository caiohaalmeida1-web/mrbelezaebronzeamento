-- =====================================================
-- 016_fidelidade_regras.sql
-- Regras de pontuação que protegem a margem:
--   · 1 ponto por R$1 efetivamente pago (pós-desconto),
--     em vez de 100 pontos fixos por sessão.
--   · Sessão sem valor pago não gera pontos.
--   · Resgate: 500 pontos = R$30 (debitado pelo admin,
--     com verificação de saldo — nunca fica negativo).
--   · Benefícios não acumulam: a sessão com 20% off da
--     5ª sessão pontua apenas sobre o valor pago.
-- =====================================================

CREATE OR REPLACE FUNCTION atualizar_fidelidade()
RETURNS TRIGGER AS $$
DECLARE
  pontos_ganhos INTEGER;
BEGIN
  IF NEW.status = 'concluido' AND (OLD.status IS NULL OR OLD.status <> 'concluido') THEN
    -- 1 ponto por R$1 pago. Garante >= 0.
    pontos_ganhos := GREATEST(FLOOR(COALESCE(NEW.valor_pago, 0))::INTEGER, 0);

    UPDATE profiles
    SET total_sessoes = total_sessoes + 1,
        pontos = pontos + pontos_ganhos
    WHERE id = NEW.cliente_id;

    IF pontos_ganhos > 0 THEN
      INSERT INTO fidelidade_transacoes (cliente_id, tipo, pontos, descricao, agendamento_id)
      VALUES (NEW.cliente_id, 'credito', pontos_ganhos, 'Sessão concluída', NEW.id);
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Resgate atômico de pontos (chamado pelo admin).
-- Falha se o saldo for insuficiente — saldo nunca fica negativo.
CREATE OR REPLACE FUNCTION resgatar_pontos(
  p_cliente_id UUID,
  p_pontos INTEGER,
  p_descricao TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  linhas INTEGER;
BEGIN
  IF p_pontos <= 0 THEN
    RETURN FALSE;
  END IF;

  UPDATE profiles
  SET pontos = pontos - p_pontos
  WHERE id = p_cliente_id AND pontos >= p_pontos;

  GET DIAGNOSTICS linhas = ROW_COUNT;
  IF linhas = 0 THEN
    RETURN FALSE; -- saldo insuficiente
  END IF;

  INSERT INTO fidelidade_transacoes (cliente_id, tipo, pontos, descricao)
  VALUES (p_cliente_id, 'debito', p_pontos, p_descricao);

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apenas service_role / código server-side pode executar o resgate
REVOKE EXECUTE ON FUNCTION resgatar_pontos(UUID, INTEGER, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION resgatar_pontos(UUID, INTEGER, TEXT) FROM anon;
REVOKE EXECUTE ON FUNCTION resgatar_pontos(UUID, INTEGER, TEXT) FROM authenticated;
GRANT EXECUTE ON FUNCTION resgatar_pontos(UUID, INTEGER, TEXT) TO service_role;

-- Hardening (advisors): search_path fixo e trigger não exposto via RPC
ALTER FUNCTION atualizar_fidelidade() SET search_path = public;
ALTER FUNCTION resgatar_pontos(UUID, INTEGER, TEXT) SET search_path = public;
REVOKE EXECUTE ON FUNCTION atualizar_fidelidade() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION atualizar_fidelidade() FROM anon;
REVOKE EXECUTE ON FUNCTION atualizar_fidelidade() FROM authenticated;
