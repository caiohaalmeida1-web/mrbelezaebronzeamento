-- =====================================================
-- 013_galeria_storage.sql
-- Galeria de fotos gerenciada pelo admin + buckets de
-- Storage para imagens da galeria e capas do blog
-- =====================================================

CREATE TABLE IF NOT EXISTS galeria_fotos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT,
  imagem_url TEXT NOT NULL,
  storage_path TEXT,
  ordem INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_galeria_ativo ON galeria_fotos(ativo, ordem);

ALTER TABLE galeria_fotos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Todos veem fotos ativas" ON galeria_fotos;
CREATE POLICY "Todos veem fotos ativas" ON galeria_fotos
  FOR SELECT USING (ativo = TRUE);

DROP POLICY IF EXISTS "Admin gerencia galeria" ON galeria_fotos;
CREATE POLICY "Admin gerencia galeria" ON galeria_fotos
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =====================================================
-- Buckets de Storage (públicos para leitura)
-- =====================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('galeria', 'galeria', TRUE), ('blog', 'blog', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Leitura pública das imagens
DROP POLICY IF EXISTS "Imagens públicas para leitura" ON storage.objects;
CREATE POLICY "Imagens públicas para leitura" ON storage.objects
  FOR SELECT USING (bucket_id IN ('galeria', 'blog'));

-- Apenas admin envia imagens
DROP POLICY IF EXISTS "Admin envia imagens" ON storage.objects;
CREATE POLICY "Admin envia imagens" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id IN ('galeria', 'blog')
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Apenas admin atualiza imagens (necessário para upsert)
DROP POLICY IF EXISTS "Admin atualiza imagens" ON storage.objects;
CREATE POLICY "Admin atualiza imagens" ON storage.objects
  FOR UPDATE USING (
    bucket_id IN ('galeria', 'blog')
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Apenas admin remove imagens
DROP POLICY IF EXISTS "Admin remove imagens" ON storage.objects;
CREATE POLICY "Admin remove imagens" ON storage.objects
  FOR DELETE USING (
    bucket_id IN ('galeria', 'blog')
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
