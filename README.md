# Astra Velocity

**Insurance Data Governance Platform** — compose Data Governance Projects from Velocity Pack
elements (best practices, standards, templates, semantic packs, CDE/DQ libraries, AI agent
co-workers, playbooks, dashboards), tuned to insurance sector and governance scenario.

See [PLAN.md](PLAN.md) for the full product & build plan.

## Local development

Prereqs: Node 22+, Docker Desktop.

```bash
cp .env.example .env          # then set AUTH_SECRET (and ANTHROPIC_API_KEY for AI features)
docker compose up -d db redis # infra only
cd app
npm install
npm run db:migrate            # apply migrations
npm run db:seed               # load ontology + velocity pack content + demo users
npm run dev                   # http://localhost:3000
```

Fully containerized (production-like):

```bash
docker compose --profile full up -d --build
```

Local LLM (fully inside the boundary):

```bash
docker compose --profile ollama up -d
docker exec astra-ollama ollama pull llama3.1:8b
```

## Repo layout

```
app/          Next.js platform (web + worker entrypoints)
  src/
    content/  seed content: ontology, velocity packs, best practices (the IP)
    db/       drizzle schema + migrations
    engine/   recommendation & scoring (pure, tested)
    ai/       llm gateway, guardrails, agents
docker-compose.yml
PLAN.md       product & build plan
```

Note: `Lib/` and `Scripts/` at the repo root are a pre-existing Python venv, ignored by git.
