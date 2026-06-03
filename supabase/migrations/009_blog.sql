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
