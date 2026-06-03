-- =====================================================
-- 003_horarios_config.sql
-- Configuração de horários de atendimento e bloqueios
-- =====================================================

CREATE TABLE IF NOT EXISTS horarios_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  dia_semana INTEGER CHECK (dia_semana BETWEEN 0 AND 6),
  hora_inicio TIME NOT NULL,
  hora_fim TIME NOT NULL,
  intervalo_minutos INTEGER DEFAULT 60,
  ativo BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS bloqueios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  data_inicio TIMESTAMPTZ NOT NULL,
  data_fim TIMESTAMPTZ NOT NULL,
  motivo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bloqueios_periodo
  ON bloqueios(data_inicio, data_fim);

ALTER TABLE horarios_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE bloqueios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Todos consultam horários" ON horarios_config;
CREATE POLICY "Todos consultam horários" ON horarios_config
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Admin gerencia horários" ON horarios_config;
CREATE POLICY "Admin gerencia horários" ON horarios_config
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Todos consultam bloqueios" ON bloqueios;
CREATE POLICY "Todos consultam bloqueios" ON bloqueios
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Admin gerencia bloqueios" ON bloqueios;
CREATE POLICY "Admin gerencia bloqueios" ON bloqueios
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Seed: segunda a sábado, 8h às 18h, intervalo de 60min
INSERT INTO horarios_config (dia_semana, hora_inicio, hora_fim, intervalo_minutos, ativo) VALUES
  (1, '08:00', '18:00', 60, TRUE),
  (2, '08:00', '18:00', 60, TRUE),
  (3, '08:00', '18:00', 60, TRUE),
  (4, '08:00', '18:00', 60, TRUE),
  (5, '08:00', '18:00', 60, TRUE),
  (6, '09:00', '15:00', 60, TRUE)
ON CONFLICT DO NOTHING;
