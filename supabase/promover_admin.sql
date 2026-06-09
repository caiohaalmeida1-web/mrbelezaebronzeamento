-- =====================================================
-- promover_admin.sql
-- Promove um usuário existente a ADMIN (acesso total).
--
-- COMO USAR:
-- 1. A pessoa cria a conta normalmente no site (/cadastro)
-- 2. Troque o e-mail abaixo pelo e-mail da conta criada
-- 3. Rode este script no SQL Editor do Supabase
--
-- O admin passa a acessar /admin/dashboard com permissão
-- para gerenciar serviços, blog, galeria, agendamentos,
-- clientes, produtos, fidelidade e financeiro.
-- =====================================================

UPDATE profiles
SET role = 'admin'
WHERE email = 'TROQUE_PELO_EMAIL_DO_ADMIN@exemplo.com';

-- Conferir:
-- SELECT id, email, full_name, role FROM profiles WHERE role = 'admin';
