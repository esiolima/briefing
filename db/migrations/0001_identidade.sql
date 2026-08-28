-- Etapa 1: identidade e organização.
-- O solicitante NÃO tem conta/login (decisão registrada): ele só informa
-- nome, área e cargo a cada solicitação, guardados junto do briefing
-- (tabela briefing_sessions, que chega na Etapa 3).
-- admin_users existe só para o painel administrativo (nível único, geral).

CREATE TABLE IF NOT EXISTS areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  function TEXT,
  objectives JSONB DEFAULT '[]',
  audiences JSONB DEFAULT '[]',
  recurring_campaigns JSONB DEFAULT '[]',
  relevant_info TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  area_id UUID NOT NULL REFERENCES areas(id) ON DELETE CASCADE,
  responsibilities TEXT,
  context TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_positions_area_id ON positions(area_id);

CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Necessário para gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;
