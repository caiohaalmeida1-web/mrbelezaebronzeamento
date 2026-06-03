# Mércia Regina · Beleza e Bronzeamento

Site oficial do espaço **Mércia Regina Beleza e Bronzeamento** — bronzeamento natural e a jato em Vicente Pires, DF.

> Slogan: **Na primeira sessão você vicia**
> Tagline: **O bronze perfeito que eleva sua autoestima em 1 hora.**

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | **Next.js 14** (App Router) |
| Linguagem | TypeScript |
| Estilização | **Tailwind CSS** + shadcn/ui |
| Banco de dados | **Supabase** (PostgreSQL) com RLS |
| Autenticação | Supabase Auth |
| Storage | Supabase Storage |
| Pagamentos | **Stripe** (Pix + cartão) |
| E-mail transacional | **Resend** |
| Estado (carrinho) | Zustand |
| Validação | Zod |
| Datas | date-fns |
| Analytics | Vercel Analytics + GA4 |
| Deploy | **Vercel** |

---

## Funcionalidades

- **Home** com 15 seções inteiramente fiéis à identidade da marca (hero gradiente âmbar/laranja, prova social, serviços, produtos Click 10, checklist, galeria + citação, fidelidade, avaliações, blog, FAQ, CTA final).
- **Agendamento online** em wizard de 4 etapas: serviço → data/hora → dados → pagamento Stripe (com desconto automático na 5ª sessão).
- **Loja virtual** com produtos físicos, digitais, cursos e assinatura. Carrinho lateral (Zustand) e checkout Stripe.
- **Programa de fidelidade** automatizado por trigger Postgres: 100 pts/sessão, 500 pts = R$30, 20% off na 5ª.
- **Área da cliente** (`/cliente/*`): dashboard, histórico de agendamentos, pontos, compras, cursos.
- **Painel admin** (`/admin/*`): dashboard, agenda, clientes, produtos, blog (Markdown), fidelidade, financeiro com export CSV.
- **Blog SSG/ISR** com revalidação a cada 1h, schema.org Article + BreadcrumbList.
- **SEO técnico** com `generateMetadata`, schema.org `BeautySalon`, sitemap dinâmico, robots.txt, OG tags.
- **WhatsApp FAB** sempre visível em todas as páginas.

---

## Instalação local

### 1. Pré-requisitos

- Node.js **18.18+**
- npm 10+
- Conta no [Supabase](https://supabase.com), [Stripe](https://stripe.com) e [Resend](https://resend.com)

### 2. Variáveis de ambiente

Copie o template e preencha com as suas chaves:

```bash
cp .env.example .env.local
```

Conteúdo esperado em `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<projeto>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ey...
SUPABASE_SERVICE_ROLE_KEY=ey...

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Resend
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@merciaregina.com.br

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_WHATSAPP=5561982344399

# Admin
ADMIN_EMAIL=mercia@merciaregina.com.br
```

### 3. Instalar dependências

```bash
npm install
```

### 4. Rodar as migrations no Supabase

Os arquivos SQL estão em [`supabase/migrations/`](./supabase/migrations). Aplique-os na ordem.

**Opção A — Supabase CLI:**

```bash
supabase link --project-ref <ref>
supabase db push
```

**Opção B — SQL Editor do dashboard:** abra cada arquivo `001_*.sql` → `011_*.sql` e execute em ordem.

Veja [`supabase/README.md`](./supabase/README.md) para detalhes (configuração de Auth, Realtime, Storage e como promover um usuário a admin).

### 5. Rodar em desenvolvimento

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

### 6. Configurar webhook do Stripe (em desenvolvimento)

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copie o `whsec_...` exibido para `STRIPE_WEBHOOK_SECRET`.

---

## Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm start` | Inicia servidor de produção (após `build`) |
| `npm run lint` | ESLint |

O `postbuild` roda `next-sitemap` automaticamente para gerar sitemap estático complementar.

---

## Estrutura

```
app/
├── (public)/        # rotas públicas: /, /servicos, /loja, /agendar, /blog, /sobre, /contato, /fidelidade
├── (auth)/          # /login, /cadastro
├── (cliente)/       # /cliente/dashboard, /cliente/agendamentos, /cliente/pontos, /cliente/compras, /cliente/cursos
├── (admin)/         # /admin/dashboard, /admin/agendamentos, /admin/clientes, /admin/produtos, /admin/blog, /admin/fidelidade, /admin/financeiro
├── api/webhooks/    # webhook do Stripe
└── auth/callback/   # callback OAuth/magic link Supabase

components/
├── ui/              # shadcn/ui customizado
├── layout/          # Header, Footer, FAB
├── home/            # 15 seções da home
├── agendamento/     # Wizard
├── loja/            # ProdutoCard, CarrinhoDrawer, BotaoAdicionar
└── shared/          # Logo, ScrollReveal, StructuredData

lib/
├── supabase/        # client, server, admin, middleware
├── stripe.ts        # cliente Stripe
├── resend.ts        # templates de e-mail
├── agendamento/     # cálculo de disponibilidade
└── utils.ts         # helpers + SITE_CONFIG

supabase/migrations/ # 11 arquivos SQL
types/               # Profile, Servico, Agendamento, Produto, Pedido…
hooks/               # use-carrinho (Zustand)
public/images/       # logos
```

---

## Deploy na Vercel

1. **Conecte o repositório** em [vercel.com/new](https://vercel.com/new).
2. **Configure as variáveis** de ambiente (mesmas do `.env.local`, mas com URLs de produção).
3. **Webhook do Stripe**: aponte para `https://<seu-dominio>/api/webhooks/stripe` no dashboard do Stripe e copie o `whsec_...` para a env `STRIPE_WEBHOOK_SECRET`.
4. **Vercel Analytics**: já incluído no `app/layout.tsx`.
5. **Domínio**: aponte `merciaregina.com.br` na aba *Domains* da Vercel.
6. **Cron de lembrete 24h**: configure uma Supabase Edge Function ou um Vercel Cron (`vercel.json`) para disparar o reminder via Resend.

---

## Identidade visual

```
brown   #2C1000   amber   #E87520
caramel #8B4513   sun     #F5C200
gold    #D4960A   cream   #FEF8EE  warm #FFF3D8

hero-gradient: linear-gradient(170deg, #FFE566 0%, #F5C200 35%, #E07818 72%, #C04400 100%)

display: Cormorant Garamond  —  body: Inter  —  script: Dancing Script
```

Tudo encapsulado em `tailwind.config.ts` (`brand-*`, `font-display`, `font-script`, `bg-hero-gradient`, `bg-amber-gradient`).

---

## Contato e links

- **Site**: https://merciaregina.com.br
- **WhatsApp**: [+55 (61) 98234-4399](https://wa.me/5561982344399)
- **Instagram**: [@mrbelezaebronzeamento](https://instagram.com/mrbelezaebronzeamento)
- **Endereço**: Vicente Pires · Colônia Agrícola — DF

---

© 2026 Mércia Regina Beleza e Bronzeamento. Todos os direitos reservados.
