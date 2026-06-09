-- =====================================================
-- 014_fix_profiles_rls.sql
-- Corrige recursão infinita na policy de admin da tabela
-- profiles (a policy consultava a própria tabela profiles,
-- causando "infinite recursion detected in policy").
-- =====================================================

-- Função SECURITY DEFINER: verifica papel admin sem disparar RLS em profiles
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon;

-- Recria a policy de admin sem auto-referência
DROP POLICY IF EXISTS "Admin gerencia todos perfis" ON profiles;
CREATE POLICY "Admin gerencia todos perfis" ON profiles
  FOR ALL USING (public.is_admin());
