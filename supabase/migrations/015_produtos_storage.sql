-- =====================================================
-- 015_produtos_storage.sql
-- Bucket de Storage para imagens de produtos
-- =====================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('produtos', 'produtos', TRUE)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Imagens de produtos públicas" ON storage.objects;
CREATE POLICY "Imagens de produtos públicas" ON storage.objects
  FOR SELECT USING (bucket_id = 'produtos');

DROP POLICY IF EXISTS "Admin envia imagens de produtos" ON storage.objects;
CREATE POLICY "Admin envia imagens de produtos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'produtos'
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Admin atualiza imagens de produtos" ON storage.objects;
CREATE POLICY "Admin atualiza imagens de produtos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'produtos'
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Admin remove imagens de produtos" ON storage.objects;
CREATE POLICY "Admin remove imagens de produtos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'produtos'
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
