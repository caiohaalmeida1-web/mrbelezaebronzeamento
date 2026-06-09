-- =====================================================================
-- SETUP COMPLETO DO BANCO - MERCIA REGINA - BELEZA E BRONZEAMENTO
-- Cole este arquivo inteiro no SQL Editor do Supabase Dashboard
-- e clique em RUN. Idempotente: pode rodar mais de uma vez.
-- Gerado a partir de supabase/migrations/001..011
-- =====================================================================



-- =====================================================================
-- ARQUIVO: 001_profiles.sql
-- =====================================================================

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

-- Admin vê todos
DROP POLICY IF EXISTS "Admin gerencia todos perfis" ON profiles;
CREATE POLICY "Admin gerencia todos perfis" ON profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

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


-- =====================================================================
-- ARQUIVO: 002_servicos.sql
-- =====================================================================

-- =====================================================
-- 002_servicos.sql
-- Catálogo de serviços ofertados
-- =====================================================

CREATE TABLE IF NOT EXISTS servicos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  duracao_minutos INTEGER NOT NULL,
  preco DECIMAL(10, 2) NOT NULL,
  preco_pacote DECIMAL(10, 2),
  quantidade_pacote INTEGER,
  ativo BOOLEAN DEFAULT TRUE,
  imagem_url TEXT,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_servicos_ativo ON servicos(ativo);
CREATE INDEX IF NOT EXISTS idx_servicos_ordem ON servicos(ordem);

ALTER TABLE servicos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Todos veem serviços ativos" ON servicos;
CREATE POLICY "Todos veem serviços ativos" ON servicos
  FOR SELECT USING (ativo = TRUE);

DROP POLICY IF EXISTS "Admin gerencia serviços" ON servicos;
CREATE POLICY "Admin gerencia serviços" ON servicos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Seed dos serviços reais
INSERT INTO servicos (nome, descricao, duracao_minutos, preco, ativo, ordem)
VALUES
  (
    'Bronzeamento Natural',
    'Exposição solar com biquíni de fita personalizada ou tecido próprio. Ativa a melanina, produz vitamina D e deixa a pele tratada. Todos os produtos aprovados pela Anvisa.',
    60,
    80.00,
    TRUE,
    1
  ),
  (
    'Bronze de Cabine',
    'Bronzeamento em cabine com conforto e privacidade, sem depender do sol. Cor uniforme o ano inteiro, com técnica profissional e produtos aprovados pela Anvisa.',
    60,
    120.00,
    TRUE,
    2
  ),
  (
    'Bronze a Jato',
    'Pulverização profissional com máquina de alta precisão. Resultado imediato em 1 hora — perfeito para eventos. Dura de 7 a 10 dias com os cuidados certos.',
    60,
    140.00,
    TRUE,
    3
  )
ON CONFLICT DO NOTHING;


-- =====================================================================
-- ARQUIVO: 003_horarios_config.sql
-- =====================================================================

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


-- =====================================================================
-- ARQUIVO: 004_agendamentos.sql
-- =====================================================================

-- =====================================================
-- 004_agendamentos.sql
-- =====================================================

CREATE TABLE IF NOT EXISTS agendamentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  servico_id UUID REFERENCES servicos(id) ON DELETE RESTRICT,
  data_hora TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pendente' CHECK (
    status IN ('pendente', 'confirmado', 'concluido', 'cancelado', 'no_show')
  ),
  valor_pago DECIMAL(10, 2),
  stripe_payment_intent TEXT,
  observacoes TEXT,
  codigo_afiliado TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agendamentos_cliente ON agendamentos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_data ON agendamentos(data_hora);
CREATE INDEX IF NOT EXISTS idx_agendamentos_status ON agendamentos(status);

ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Cliente vê próprios agendamentos" ON agendamentos;
CREATE POLICY "Cliente vê próprios agendamentos" ON agendamentos
  FOR SELECT USING (auth.uid() = cliente_id);

DROP POLICY IF EXISTS "Cliente cria agendamento" ON agendamentos;
CREATE POLICY "Cliente cria agendamento" ON agendamentos
  FOR INSERT WITH CHECK (auth.uid() = cliente_id);

DROP POLICY IF EXISTS "Cliente atualiza próprio agendamento" ON agendamentos;
CREATE POLICY "Cliente atualiza próprio agendamento" ON agendamentos
  FOR UPDATE USING (auth.uid() = cliente_id);

DROP POLICY IF EXISTS "Admin gerencia agendamentos" ON agendamentos;
CREATE POLICY "Admin gerencia agendamentos" ON agendamentos
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP TRIGGER IF EXISTS set_agendamentos_updated_at ON agendamentos;
CREATE TRIGGER set_agendamentos_updated_at
  BEFORE UPDATE ON agendamentos
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Habilita Realtime na tabela (no painel Supabase verifique também a config)
ALTER PUBLICATION supabase_realtime ADD TABLE agendamentos;


-- =====================================================================
-- ARQUIVO: 005_produtos.sql
-- =====================================================================

-- =====================================================
-- 005_produtos.sql
-- =====================================================

CREATE TABLE IF NOT EXISTS produtos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  descricao TEXT,
  descricao_longa TEXT,
  tipo TEXT CHECK (tipo IN ('fisico', 'digital', 'curso', 'ebook', 'assinatura')),
  preco DECIMAL(10, 2) NOT NULL,
  preco_original DECIMAL(10, 2),
  estoque INTEGER DEFAULT 0,
  peso_gramas INTEGER,
  imagens TEXT[],
  arquivo_digital_url TEXT,
  stripe_price_id TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  destaque BOOLEAN DEFAULT FALSE,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_produtos_slug ON produtos(slug);
CREATE INDEX IF NOT EXISTS idx_produtos_tipo ON produtos(tipo);
CREATE INDEX IF NOT EXISTS idx_produtos_ativo ON produtos(ativo);
CREATE INDEX IF NOT EXISTS idx_produtos_destaque ON produtos(destaque);

ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Todos veem produtos ativos" ON produtos;
CREATE POLICY "Todos veem produtos ativos" ON produtos
  FOR SELECT USING (ativo = TRUE);

DROP POLICY IF EXISTS "Admin gerencia produtos" ON produtos;
CREATE POLICY "Admin gerencia produtos" ON produtos
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Seed dos produtos reais
INSERT INTO produtos (nome, slug, descricao, descricao_longa, tipo, preco, estoque, tags, destaque)
VALUES
  (
    'Click 10 Tradicional',
    'click-10-tradicional',
    'Creme hidratante, ativador e acelerador de bronzeamento. Cor de verão o ano inteiro com hidratação profunda.',
    'O Click 10 Tradicional é o nosso creme campeão de vendas. Apresentado em pote de 500g, ele combina três funções essenciais para um bronze impecável: ativador da melanina, acelerador da pigmentação e hidratante de longa duração. Use diariamente após o banho para uma cor de verão que dura o ano todo.',
    'fisico',
    89.90,
    50,
    ARRAY['Ativador', 'Acelerador', 'Hidratante'],
    TRUE
  ),
  (
    'Click 10 Zero',
    'click-10-zero',
    'Com Vitamina C, Colágeno e DHA. Efeito antioxidante, clareador e firmador. Indicado para peles tipo 3, 4, 5 e 6. Hidratação por até 8h.',
    'A versão premium da nossa linha Click 10. Em bisnaga prática de 500ml, o Click 10 Zero combina Vitamina C antioxidante, Colágeno firmador e DHA para realçar e prolongar seu bronze. Indicado para peles tipo 3, 4, 5 e 6, oferece hidratação por até 8 horas e efeito clareador progressivo de manchas.',
    'fisico',
    99.90,
    50,
    ARRAY['Vitamina C', 'Colágeno', 'DHA', 'Firmador'],
    TRUE
  )
ON CONFLICT (slug) DO NOTHING;


-- =====================================================================
-- ARQUIVO: 006_pedidos.sql
-- =====================================================================

-- =====================================================
-- 006_pedidos.sql
-- Pedidos da loja virtual + itens
-- =====================================================

CREATE TABLE IF NOT EXISTS pedidos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pendente' CHECK (
    status IN ('pendente', 'pago', 'enviado', 'entregue', 'cancelado', 'reembolsado')
  ),
  valor_total DECIMAL(10, 2) NOT NULL,
  stripe_payment_intent TEXT,
  stripe_checkout_session TEXT,
  endereco_entrega JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pedido_itens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pedido_id UUID REFERENCES pedidos(id) ON DELETE CASCADE,
  produto_id UUID REFERENCES produtos(id) ON DELETE RESTRICT,
  quantidade INTEGER NOT NULL,
  preco_unitario DECIMAL(10, 2) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_pedidos_cliente ON pedidos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_status ON pedidos(status);
CREATE INDEX IF NOT EXISTS idx_pedido_itens_pedido ON pedido_itens(pedido_id);

ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedido_itens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Cliente vê próprios pedidos" ON pedidos;
CREATE POLICY "Cliente vê próprios pedidos" ON pedidos
  FOR SELECT USING (auth.uid() = cliente_id);

DROP POLICY IF EXISTS "Cliente cria pedido" ON pedidos;
CREATE POLICY "Cliente cria pedido" ON pedidos
  FOR INSERT WITH CHECK (auth.uid() = cliente_id);

DROP POLICY IF EXISTS "Admin gerencia pedidos" ON pedidos;
CREATE POLICY "Admin gerencia pedidos" ON pedidos
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Cliente vê itens dos próprios pedidos" ON pedido_itens;
CREATE POLICY "Cliente vê itens dos próprios pedidos" ON pedido_itens
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM pedidos
      WHERE pedidos.id = pedido_itens.pedido_id
        AND pedidos.cliente_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admin gerencia itens" ON pedido_itens;
CREATE POLICY "Admin gerencia itens" ON pedido_itens
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP TRIGGER IF EXISTS set_pedidos_updated_at ON pedidos;
CREATE TRIGGER set_pedidos_updated_at
  BEFORE UPDATE ON pedidos
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- =====================================================================
-- ARQUIVO: 007_fidelidade.sql
-- =====================================================================

-- =====================================================
-- 007_fidelidade.sql
-- Programa de pontos: +100 por sessão, 20% de desconto na 5ª
-- =====================================================

CREATE TABLE IF NOT EXISTS fidelidade_transacoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  tipo TEXT CHECK (tipo IN ('credito', 'debito', 'expiracao')),
  pontos INTEGER NOT NULL,
  descricao TEXT,
  agendamento_id UUID REFERENCES agendamentos(id) ON DELETE SET NULL,
  pedido_id UUID REFERENCES pedidos(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fidelidade_cliente ON fidelidade_transacoes(cliente_id);

ALTER TABLE fidelidade_transacoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Cliente vê próprias transações" ON fidelidade_transacoes;
CREATE POLICY "Cliente vê próprias transações" ON fidelidade_transacoes
  FOR SELECT USING (auth.uid() = cliente_id);

DROP POLICY IF EXISTS "Admin gerencia fidelidade" ON fidelidade_transacoes;
CREATE POLICY "Admin gerencia fidelidade" ON fidelidade_transacoes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Trigger: ao concluir um agendamento, +1 sessão e +100 pontos
CREATE OR REPLACE FUNCTION atualizar_fidelidade()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'concluido' AND (OLD.status IS NULL OR OLD.status <> 'concluido') THEN
    UPDATE profiles
    SET total_sessoes = total_sessoes + 1,
        pontos = pontos + 100
    WHERE id = NEW.cliente_id;

    INSERT INTO fidelidade_transacoes (cliente_id, tipo, pontos, descricao, agendamento_id)
    VALUES (NEW.cliente_id, 'credito', 100, 'Sessão concluída', NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_fidelidade ON agendamentos;
CREATE TRIGGER trigger_fidelidade
  AFTER UPDATE ON agendamentos
  FOR EACH ROW EXECUTE FUNCTION atualizar_fidelidade();


-- =====================================================================
-- ARQUIVO: 008_avaliacoes.sql
-- =====================================================================

-- =====================================================
-- 008_avaliacoes.sql
-- =====================================================

CREATE TABLE IF NOT EXISTS avaliacoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  agendamento_id UUID REFERENCES agendamentos(id) ON DELETE CASCADE,
  nota INTEGER CHECK (nota BETWEEN 1 AND 5),
  comentario TEXT,
  aprovada BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_avaliacoes_aprovada ON avaliacoes(aprovada);

ALTER TABLE avaliacoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Todos veem avaliações aprovadas" ON avaliacoes;
CREATE POLICY "Todos veem avaliações aprovadas" ON avaliacoes
  FOR SELECT USING (aprovada = TRUE OR auth.uid() = cliente_id);

DROP POLICY IF EXISTS "Cliente cria avaliação" ON avaliacoes;
CREATE POLICY "Cliente cria avaliação" ON avaliacoes
  FOR INSERT WITH CHECK (auth.uid() = cliente_id);

DROP POLICY IF EXISTS "Admin gerencia avaliações" ON avaliacoes;
CREATE POLICY "Admin gerencia avaliações" ON avaliacoes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );


-- =====================================================================
-- ARQUIVO: 009_blog.sql
-- =====================================================================

-- =====================================================
-- 009_blog.sql
-- Blog com SSG/ISR
-- =====================================================

CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  resumo TEXT,
  conteudo TEXT NOT NULL,
  imagem_capa TEXT,
  autor TEXT DEFAULT 'Mércia Regina',
  publicado BOOLEAN DEFAULT FALSE,
  publicado_em TIMESTAMPTZ,
  tags TEXT[],
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blog_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_publicado ON blog_posts(publicado, publicado_em DESC);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Todos veem posts publicados" ON blog_posts;
CREATE POLICY "Todos veem posts publicados" ON blog_posts
  FOR SELECT USING (publicado = TRUE);

DROP POLICY IF EXISTS "Admin gerencia blog" ON blog_posts;
CREATE POLICY "Admin gerencia blog" ON blog_posts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP TRIGGER IF EXISTS set_blog_posts_updated_at ON blog_posts;
CREATE TRIGGER set_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Seed dos primeiros 4 posts com conteúdo completo
INSERT INTO blog_posts (titulo, slug, resumo, conteudo, autor, publicado, publicado_em, tags, meta_title, meta_description) VALUES
(
  'Como durar mais o bronze: 7 cuidados essenciais pós-sessão',
  'como-durar-mais-o-bronze',
  'Descubra os segredos para manter seu bronze bonito por mais tempo com cuidados simples do dia a dia.',
  '## 1. Hidrate, hidrate, hidrate

A regra de ouro do bronze duradouro é manter a pele bem hidratada todos os dias. Use hidratantes específicos para pós-bronze, como o nosso Click 10 Zero, e aplique pela manhã e à noite.

## 2. Evite banhos muito quentes

A água quente abre os poros e remove o bronze mais rápido. Prefira banhos mornos ou frios — sua pele agradece.

## 3. Use sabonetes neutros

Sabonetes muito alcalinos esfoliam a pele e tiram a cor. Opte por sabonetes neutros, glicerinados ou hidratantes.

## 4. Não esfolie nos primeiros 7 dias

Esfoliação remove células mortas — e parte do bronze junto. Espere pelo menos uma semana após a sessão.

## 5. Proteja-se do sol direto

Parece contraditório, mas o sol em excesso ressecativa a pele e acelera a descamação. Use protetor solar todos os dias.

## 6. Beba muita água

Hidratação por dentro também conta. 2 litros de água por dia mantêm a pele viva e o bronze brilhante.

## 7. Aposte em alimentos ricos em betacaroteno

Cenoura, mamão, manga, batata-doce: alimentos alaranjados ajudam a fixar e manter o bronze por mais tempo.

---

Seguindo esses 7 cuidados, seu bronze pode durar **10 a 14 dias** com toda a beleza.',
  'Mércia Regina',
  TRUE,
  NOW(),
  ARRAY['cuidados', 'bronze', 'hidratação'],
  'Como durar mais o bronze | Mércia Regina',
  'Aprenda 7 cuidados essenciais pós-sessão para manter seu bronze por mais tempo.'
),
(
  'O que comer para bronzear mais rápido e melhor',
  'alimentacao-para-bronzear',
  'A alimentação certa pode acelerar e fixar seu bronze. Descubra quais alimentos incluir na sua dieta.',
  '## Beta-caroteno: seu aliado número 1

O beta-caroteno é o pigmento natural que dá cor laranja a frutas e vegetais — e que **estimula a produção de melanina** na nossa pele. Inclua diariamente:

- Cenoura
- Mamão
- Manga
- Batata-doce
- Abóbora
- Pimentão amarelo

## Vitamina E para fixar o bronze

A vitamina E é antioxidante e ajuda a manter a pele saudável e o bronze bonito por mais tempo:

- Abacate
- Castanhas e nozes
- Sementes (girassol, gergelim)
- Azeite de oliva extravirgem

## Ômega 3 para hidratar de dentro pra fora

Peixes como salmão, sardinha e atum, além de chia e linhaça, hidratam a pele profundamente.

## Hidratação não é só água

Chás, sucos naturais e água de coco também contam. O importante é manter o organismo bem hidratado.

## Evite

- Frituras em excesso
- Açúcar refinado
- Álcool em grande quantidade

Esses inimigos aceleram o envelhecimento da pele e prejudicam a qualidade do bronze.',
  'Mércia Regina',
  TRUE,
  NOW(),
  ARRAY['alimentação', 'bronze', 'dicas'],
  'Alimentação para bronzear melhor | Mércia Regina',
  'Descubra quais alimentos ajudam a bronzear mais rápido e manter o bronze por mais tempo.'
),
(
  'Biquíni de praia vs biquíni para bronzeamento: qual a diferença?',
  'biquini-bronzeamento-vs-praia',
  'Entenda por que o biquíni certo faz toda a diferença no resultado do seu bronze.',
  '## O tecido importa — e muito

O biquíni de praia tradicional é feito com tecidos densos que **bloqueiam parcialmente** os raios UV. Resultado? Marquinhas borradas e desbotadas.

O biquíni de bronzeamento, por outro lado, é feito com **fitas finas e adesivas** ou tecidos especiais que criam contornos definidos e marquinhas perfeitas.

## Tipos de biquíni para bronzear

### 1. Fita adesiva personalizada
A queridinha das nossas clientes. As fitas são posicionadas estrategicamente e oferecem **liberdade total de movimento e formato**. Personalizamos para cada corpo.

### 2. Biquíni de tecido fino
Biquínis de tecido bem fino e elástico, geralmente em cor preta ou natural, que formam contornos limpos.

### 3. Bronze sem marca (full body)
Para quem quer um bronze totalmente uniforme, sem marquinhas — opção popular no bronze a jato.

## Posso usar biquíni de praia para bronzear?

Pode, mas o resultado não será o mesmo. As marcas vão sair borradas e mais claras do que com um biquíni próprio.

## Nossa dica

Na primeira sessão, deixamos você experimentar nossas fitas personalizadas — encontramos o formato que mais valoriza seu corpo.',
  'Mércia Regina',
  TRUE,
  NOW(),
  ARRAY['biquíni', 'bronze', 'dicas'],
  'Biquíni para bronzeamento | Mércia Regina',
  'Aprenda a diferença entre biquíni de praia e biquíni para bronzeamento e escolha o certo.'
),
(
  '5 erros que arruínam seu bronze antes da hora',
  '5-erros-que-arruinam-bronze',
  'Evite esses erros comuns que fazem o bronze desaparecer mais rápido do que deveria.',
  '## Erro 1: Esfoliar antes do prazo

A pele precisa de pelo menos 7 dias para fixar o pigmento. Esfoliação nesse período remove o bronze junto das células mortas.

## Erro 2: Tomar banho quente

Água muito quente dilata os poros e acelera a descamação. Tome banhos mornos e curtos.

## Erro 3: Usar sabonetes ressecativos

Sabonetes em barra muito alcalinos ressecam a pele. Prefira sabonetes neutros ou hidratantes glicerinados.

## Erro 4: Esquecer da hidratação

Pele desidratada perde o bronze rapidamente. Hidrate **2x ao dia** com produtos pós-bronze.

## Erro 5: Ficar muito tempo na piscina

Cloro e água do mar são inimigos do bronze. Se for à piscina, use protetor solar resistente à água e enxágue logo após.

---

Evitando esses 5 erros, seu bronze pode durar **até 14 dias** com brilho e uniformidade.',
  'Mércia Regina',
  TRUE,
  NOW(),
  ARRAY['erros', 'bronze', 'cuidados'],
  '5 erros que arruínam o bronze | Mércia Regina',
  'Descubra os 5 erros mais comuns que fazem o bronze sumir antes da hora e como evitá-los.'
)
ON CONFLICT (slug) DO NOTHING;


-- =====================================================================
-- ARQUIVO: 010_email_lista.sql
-- =====================================================================

-- =====================================================
-- 010_email_lista.sql
-- Captura de leads / newsletter
-- =====================================================

CREATE TABLE IF NOT EXISTS email_lista (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  nome TEXT,
  origem TEXT CHECK (origem IN ('agendamento', 'compra', 'cadastro', 'blog', 'lead_magnet')),
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_lista_ativo ON email_lista(ativo);

ALTER TABLE email_lista ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Qualquer um pode se inscrever" ON email_lista;
CREATE POLICY "Qualquer um pode se inscrever" ON email_lista
  FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Admin gerencia lista" ON email_lista;
CREATE POLICY "Admin gerencia lista" ON email_lista
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );


-- =====================================================================
-- ARQUIVO: 011_afiliados.sql
-- =====================================================================

-- =====================================================
-- 011_afiliados.sql
-- Programa de afiliados / indicações
-- =====================================================

CREATE TABLE IF NOT EXISTS afiliados (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  codigo TEXT UNIQUE NOT NULL,
  percentual_comissao DECIMAL(5, 2) DEFAULT 10.00,
  total_indicacoes INTEGER DEFAULT 0,
  total_ganho DECIMAL(10, 2) DEFAULT 0,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS indicacoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  afiliado_id UUID REFERENCES afiliados(id) ON DELETE CASCADE,
  pedido_id UUID REFERENCES pedidos(id) ON DELETE SET NULL,
  agendamento_id UUID REFERENCES agendamentos(id) ON DELETE SET NULL,
  comissao DECIMAL(10, 2),
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovada', 'paga')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_afiliados_codigo ON afiliados(codigo);
CREATE INDEX IF NOT EXISTS idx_indicacoes_afiliado ON indicacoes(afiliado_id);

ALTER TABLE afiliados ENABLE ROW LEVEL SECURITY;
ALTER TABLE indicacoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Cliente vê próprio afiliado" ON afiliados;
CREATE POLICY "Cliente vê próprio afiliado" ON afiliados
  FOR SELECT USING (auth.uid() = cliente_id);

DROP POLICY IF EXISTS "Admin gerencia afiliados" ON afiliados;
CREATE POLICY "Admin gerencia afiliados" ON afiliados
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Afiliado vê próprias indicações" ON indicacoes;
CREATE POLICY "Afiliado vê próprias indicações" ON indicacoes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM afiliados
      WHERE afiliados.id = indicacoes.afiliado_id
        AND afiliados.cliente_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admin gerencia indicações" ON indicacoes;
CREATE POLICY "Admin gerencia indicações" ON indicacoes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
