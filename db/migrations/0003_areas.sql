-- Etapa 3: áreas oficiais do fluxo de briefing.
-- Mantém registros antigos para preservar referências históricas,
-- mas deixa somente as áreas oficiais ativas.

UPDATE areas
SET active = false;

INSERT INTO areas (name, description, active)
VALUES
  ('Rede Smart', 'Área do fluxo de briefing do Martins.', true),
  ('Trade Martins - Matcon', 'Área do fluxo de briefing do Martins.', true),
  ('Trade Martins - Agrovet e Pet', 'Área do fluxo de briefing do Martins.', true),
  ('Trade Martins - Eletro', 'Área do fluxo de briefing do Martins.', true),
  ('Trade Martins - Farma', 'Área do fluxo de briefing do Martins.', true),
  ('Trade Martins - Varejo', 'Área do fluxo de briefing do Martins.', true)
ON CONFLICT DO NOTHING;

UPDATE areas
SET active = true
WHERE name IN (
  'Rede Smart',
  'Trade Martins - Matcon',
  'Trade Martins - Agrovet e Pet',
  'Trade Martins - Eletro',
  'Trade Martins - Farma',
  'Trade Martins - Varejo'
);
