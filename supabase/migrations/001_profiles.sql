-- =====================================================
-- 001_profiles.sql
-- Perfil estendido vinculado ao auth.users do Supabase
-- =====================================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  role TEXT DEFAULT 'cliente' CHECK (role IN ('cliente', 'admin')),
  pontos INTEGER DEFAULT 0,
  total_sessoes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Cliente vê e edita o próprio perfil
DROP POLICY IF EXISTS "Usuário vê próprio perfil" ON profiles;
CREATE POLICY "Usuário vê próprio perfil" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Usuário atualiza próprio perfil" ON profiles;
CREATE POLICY "Usuário atualiza próprio perfil" ON profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Usuário cria próprio perfil" ON profiles;
CREATE POLICY "Usuário cria próprio perfil" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Função SECURITY DEFINER: verifica papel admin sem disparar RLS em profiles
-- (uma policy de profiles que consulta profiles causa recursão infinita)
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

-- Admin vê todos
DROP POLICY IF EXISTS "Admin gerencia todos perfis" ON profiles;
CREATE POLICY "Admin gerencia todos perfis" ON profiles
  FOR ALL USING (public.is_admin());

-- Trigger para criar profile automaticamente após signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Trigger updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
