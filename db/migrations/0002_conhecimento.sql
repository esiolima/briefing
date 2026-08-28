-- Etapa 2: banco de conhecimento dinâmico (seção 12-14 da spec).
-- Nenhuma informação institucional fica hardcoded — tudo cadastrado
-- pelo admin e indexado para busca semântica via pgvector.

CREATE TABLE IF NOT EXISTS knowledge_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (
    category IN ('empresa', 'area', 'cargo', 'tipo_demanda', 'campanha', 'material')
  ),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  -- metadata.type: 'fato' | 'diretriz' — diferencia fato de sugestão (regra 9, seção 31)
  embedding VECTOR(1536),
  tags TEXT[] NOT NULL DEFAULT '{}',
  area_id UUID REFERENCES areas(id) ON DELETE SET NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_knowledge_items_category ON knowledge_items(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_items_area_id ON knowledge_items(area_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_items_tags ON knowledge_items USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_knowledge_items_embedding
  ON knowledge_items USING hnsw (embedding vector_cosine_ops);

CREATE TABLE IF NOT EXISTS demand_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  required_info JSONB NOT NULL DEFAULT '[]',
  specific_questions JSONB NOT NULL DEFAULT '[]',
  common_deliverables JSONB NOT NULL DEFAULT '[]',
  examples TEXT,
  guidelines TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  area_id UUID REFERENCES areas(id) ON DELETE SET NULL,
  year INTEGER,
  type TEXT,
  objective TEXT,
  audience TEXT,
  description TEXT,
  briefing TEXT,
  materials JSONB NOT NULL DEFAULT '[]',
  "references" JSONB NOT NULL DEFAULT '[]',
  observations TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  embedding VECTOR(1536),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_campaigns_area_id ON campaigns(area_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_tags ON campaigns USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_campaigns_embedding
  ON campaigns USING hnsw (embedding vector_cosine_ops);

CREATE TABLE IF NOT EXISTS materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  file_url TEXT,
  link TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  area_id UUID REFERENCES areas(id) ON DELETE SET NULL,
  year INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_materials_campaign_id ON materials(campaign_id);
CREATE INDEX IF NOT EXISTS idx_materials_area_id ON materials(area_id);
CREATE INDEX IF NOT EXISTS idx_materials_tags ON materials USING GIN(tags);
