# Supabase — Banco de dados Mércia Regina

Pasta com todas as migrations do projeto. Devem ser executadas **em ordem numérica**.

## Como aplicar localmente

### Opção 1 — SQL Editor do Supabase Dashboard

1. Acesse [supabase.com](https://supabase.com) e crie um projeto novo
2. Vá em **SQL Editor**
3. Para cada arquivo nesta pasta (em ordem 001 → 011), copie o conteúdo e execute
4. Confira em **Database → Tables** se as tabelas foram criadas

### Opção 2 — CLI do Supabase

```bash
npm install -g supabase
supabase login
supabase link --project-ref <seu-project-ref>
supabase db push
```

## Após criar as tabelas

1. Vá em **Authentication → Policies** e confira que cada tabela tem RLS ativada
2. Vá em **Authentication → Providers** e configure:
   - Email/Password (já vem ativo)
   - URL de redirect: `http://localhost:3000/auth/callback` (dev) e o domínio em produção
3. Vá em **Database → Replication** e habilite Realtime para `agendamentos`
4. Em **Storage**, crie o bucket `produtos` (público, max 5MB) e `digitais` (privado)
5. Promova a Mércia para admin manualmente após o primeiro login:

```sql
UPDATE profiles SET role = 'admin'
WHERE email = 'mercia@merciaregina.com.br';
```

## Migrations

| Arquivo | Descrição |
|---|---|
| 001_profiles.sql | Perfis estendidos vinculados a auth.users |
| 002_servicos.sql | Catálogo de serviços + seed (Bronzeamento Natural / Bronze a Jato) |
| 003_horarios_config.sql | Horários de atendimento e bloqueios |
| 004_agendamentos.sql | Agendamentos com Realtime habilitado |
| 005_produtos.sql | Loja virtual + seed (Click 10 Tradicional / Click 10 Zero) |
| 006_pedidos.sql | Pedidos e itens |
| 007_fidelidade.sql | Programa de pontos com trigger automático |
| 008_avaliacoes.sql | Avaliações com aprovação manual |
| 009_blog.sql | Blog + 4 posts iniciais |
| 010_email_lista.sql | Captura de leads |
| 011_afiliados.sql | Programa de indicações |
