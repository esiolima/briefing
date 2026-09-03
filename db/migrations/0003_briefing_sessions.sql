-- Etapa 3: sessão de briefing. Guarda o estado de cada solicitação do
-- início (necessidade em texto livre) até a revisão/aprovação do
-- briefing consolidado. Como o solicitante não faz login (decisão
-- registrada), o "dono" da sessão é o requester_token anônimo salvo
-- no cookie de identificação, não um user_id.

CREATE TABLE IF NOT EXISTS briefing_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_token TEXT NOT NULL,
  requester_name TEXT NOT NULL,
  area_id UUID REFERENCES areas(id) ON DELETE SET NULL,
  area_name TEXT,
  position_id UUID REFERENCES positions(id) ON DELETE SET NULL,
  position_name TEXT,
  status TEXT NOT NULL DEFAULT 'em_andamento' CHECK (
    status IN ('em_andamento', 'aguardando_revisao', 'aprovado', 'finalizado')
  ),
  raw_need TEXT NOT NULL,
  interpreted_data JSONB NOT NULL DEFAULT '{}',
  clarifying_questions JSONB NOT NULL DEFAULT '[]',
  briefing_final JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_briefing_sessions_requester_token
  ON briefing_sessions(requester_token);
CREATE INDEX IF NOT EXISTS idx_briefing_sessions_status
  ON briefing_sessions(status);
