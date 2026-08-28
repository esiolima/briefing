# Martins Briefing — Etapas 0, 1 e 2

Base do projeto (Etapa 0), identificação do solicitante e autenticação do
admin (Etapa 1), e agora o banco de conhecimento com busca semântica
(Etapa 2).

## O que já está pronto

**Etapa 0 — Fundação**
- Projeto Next.js + TypeScript configurado (`app/`).
- Tailwind com os tokens oficiais da identidade visual (`tailwind.config.ts`,
  `lib/design-tokens.ts`): paleta azul-marinho/azul/ciano e fonte Montserrat.
- Componentes base do design system (`components/ui`).
- Conexão com PostgreSQL (`lib/db.ts`) e `docker-compose.yml` com
  `pgvector/pgvector:pg16`.
- `.env.example` com todas as variáveis sensíveis — nenhum secret no código.
- CI básico no GitHub Actions (lint, typecheck, build).

**Etapa 1 — Identidade e autenticação**
- Tabelas `areas`, `positions` e `admin_users`.
- Solicitante **não faz login**: `/identificacao` pede nome, área e cargo,
  salvos em cookie (`lib/identity.ts`).
- Admin faz login de verdade: `/admin/login` com sessão JWT, protegido por
  `middleware.ts` (nível único de admin).

**Etapa 2 — Banco de conhecimento**
- Tabelas `knowledge_items`, `demand_types`, `campaigns`, `materials`
  (`db/migrations/0002_conhecimento.sql`), com colunas `VECTOR(1536)` e
  índices HNSW para busca por similaridade.
- `lib/ai/embeddings.ts` gera embeddings via OpenAI (modelo configurável
  por `AI_EMBEDDING_MODEL`); `lib/knowledge-service.ts` e
  `lib/campaign-service.ts` encapsulam todo CRUD + busca semântica, sem
  nenhuma dependência do restante do sistema — módulo isolado, como
  previsto na arquitetura.
- API REST completa em `/api/admin/knowledge`, `/api/admin/demand-types`,
  `/api/admin/campaigns` e `/api/admin/materials` (todas protegidas pelo
  middleware do admin).
- Endpoint de busca semântica: `GET /api/admin/knowledge/search?q=...`.
- Tela `/admin/knowledge`: cadastro rápido de itens de conhecimento e um
  campo para testar a busca semântica na hora (mostra o % de similaridade).
  As telas de CRUD visual de tipos de demanda/campanhas/materiais ficam
  para a Etapa 7 — a API já existe e funciona por trás.

Ainda **não** entram: wizard de criação de briefing, geração de perguntas
complementares pela IA, respostas do Droni — isso é Etapa 3 em diante.

## Como rodar localmente

```bash
cp .env.example .env.local
npm install
docker compose up -d        # sobe o Postgres com pgvector
npm run db:migrate          # extensões + todas as tabelas
npm run db:seed             # admin inicial e áreas/cargos de exemplo
npm run dev
```

Acesse `http://localhost:3000` (fluxo do solicitante) ou
`http://localhost:3000/admin/login` → `/admin/knowledge` para testar o
banco de conhecimento. **Lembre de preencher `OPENAI_API_KEY`** no
`.env.local` antes de cadastrar ou buscar conhecimento — é isso que gera
os embeddings.

## Decisões já fechadas para as próximas etapas

- O solicitante **não faz login** — apenas informa nome e área (padrão).
  O login/JWT (`JWT_SECRET`) é usado só para o painel administrativo.
- Anexos no Droni são 100% manuais pelo usuário — a ferramenta não envia
  nem faz upload de referência, apenas gera prompts e textos.
- Sem limite de tamanho/tipo de arquivo (não há upload de referência).
- Histórico retido por 1 ano e meio; sem tratamento de LGPD por enquanto.
- Um único nível de administrador (geral).
- Idioma único: português (pt-BR).
- Analytics limitado a eventos básicos (tabela `audit_logs`).
- Não há regeneração de resposta do Droni — o solicitante edita manualmente
  ou apenas copia e cola.
- Tela de "Relatórios" removida do escopo por enquanto.
