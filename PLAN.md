# Astra Velocity — Insurance Data Governance Platform
## Product & Build Plan (v3 — production-grade · domain-deep · dashboard-forward · AI-native)

---

## 1. What we are building, in one paragraph

**Astra Velocity** is a production web platform where a user selects an **insurance sector** and a **governance scenario**, and the platform **composes a Data Governance Project** from a governed library of **Velocity Pack elements** — best practices, standards, templates, semantic packs, CDE libraries, DQ rule libraries, AI agent co-workers, playbooks, toolkits, metrics, training modules, and dashboard blueprints. The platform is **AI-native**: an LLM-powered copilot and a supervised agent runtime do real drafting work inside the product under full guardrails (human-in-the-loop, PII protection, audit, provider-switchable LLMs). Different roles see different platforms — executive, pursuit, delivery, steward, curator, admin — via a live **role switcher**. Built locally on Docker first, Azure-ready by construction.

---

## 2. Platform pillars (v3)

1. **Domain-first insurance ontology** — obligations, KPIs, CDEs, value chains as first-class linked entities (§3).
2. **Velocity Pack library & composer** — explainable recommendation of pack elements per sector × scenario (§4, §5).
3. **Dashboard pillar** — suggested dashboard blueprints + four flagship dashboards live in-app (§6).
4. **AI & Agentic layer** — copilot + six agent co-workers running in-platform, guardrailed, LLM-switchable (§7).
5. **Roles & experiences** — persona-shaped views with a live role switcher on real RBAC (§8).
6. **Admin & governance of the platform itself** — content studio, AI administration, audit (§9).

---

## 3. The insurance domain layer (the moat)

All first-class, DB-backed entities with typed relationships:

- **Sectors (9)**: P&C Personal Lines · P&C Commercial · Specialty & E&S · Reinsurance · Life & Annuities · Health/Group Benefits · Surety · Investments/Asset Mgmt · Brokerage/MGA. Each defines value-chain stages (Submission → Underwriting → Policy Admin → Billing → Claims (FNOL→adjudication→subrogation) → Reserving → Reinsurance → Reporting), system archetypes, distribution model, canonical pain points.
- **Data domain ontology**: Party · Product · Policy · Coverage · Exposure · Premium · Claim · Reserve · Billing · Reinsurance/Cession · Producer/Distribution · Financials/GL · Employee/HR · Reference & Regulatory data — sector-flavored semantics (COPE in commercial property; vehicle/driver in personal auto; ceded limits in treaty re).
- **Regulatory obligation register**: NAIC model laws & state DOI · Schedule P / statutory statements · ASOP 23 & 56 · SOX/MAR · HIPAA · GLBA/NPPI & state privacy · PBR/VM-20 · IFRS 17/LDTI · Solvency II/IDD · Lloyd's minimum standards · **NAIC AI Model Bulletin / EU AI Act** (feeds the AI-governance pack). Obligations link to sectors, capabilities, elements, dashboards.
- **KPI & metric dictionary**: loss ratio, combined ratio, expense ratio, retention/persistency, quote-to-bind, LAE, development factors, cession/net retention, MCR/MLR, surrender rates, IBOR/ABOR breaks… each with definition, formula grammar, dependent CDEs, certified-metric chain.
- **CDE & DQ libraries** per domain/sector: earned-premium reconciliation, reserve consistency, ISO class-code validity, COPE completeness, FNOL timeliness, bordereaux completeness, member-attribution validity, GL tie-points…
- **Scenarios (10, sector-flavored)**: Sensitive Data Unlock · Report Integrity · Financial Reconciliation · Operational/FinOps · Greenfield Platform · Regulatory & Statutory Reporting · Claims Analytics · Actuarial & Pricing Readiness · M&A/Portfolio Integration · AI/ML & GenAI Readiness.
- **Capabilities (coverage axis)**: Classification · Catalog & Metadata · Semantic Layer · Data Quality · Lineage · Access & Policy · Stewardship Ops.
- **Recommendation engine**: `(sector, scenario, options) → ranked explainable element + dashboard set`; pure, unit-tested; every pick renders "Why this is in your pack" (best practice + pain point + obligation).

---

## 4. Velocity Pack catalog — beyond the proposal

The 11 proposal packs (semantic pack, agent pack, governance-as-code, command center, leverage model, assessment toolkit, standards traceability, performance index, enablement kit, lineage triage, NPPI playcard) are seeds. **New packs we add:**

| New Velocity Pack | What it is | Why it wins deals |
|---|---|---|
| **VP-12 Data Contract Starter Pack** | Data-contract schema + CI patterns for insurance data products (producer/consumer SLAs, schema evolution, DQ thresholds in the contract) | "Governance as code" extended to the interface between teams — very current |
| **VP-13 Insurance Data Product Blueprints** | Target-state definitions for Policy 360, Claims 360, Producer 360, Customer/Party 360, Finance Data Product — CDEs, sources, semantic model, dashboard set per blueprint | Buyers think in data products; we arrive with the product shapes pre-cut |
| **VP-14 AI Governance & Model Risk Pack** | AI use-case intake, model cards, LLM guardrail policy templates, NAIC AI Bulletin / EU AI Act readiness checklists, agent-supervision SOPs | Every insurer is being asked "who governs the AI?" — we answer for data *and* AI |
| **VP-15 Privacy, Consent & DSAR Pack** | Purpose-based access patterns, consent metadata model, DSAR readiness runbook, privacy-by-design review gates | Extends the NPPI playcard into an operating capability |
| **VP-16 Party & Master Data Resolution Pack** | Party-resolution rules (insured/claimant/provider/producer), survivorship patterns, hierarchy management for groups/programs | MDM is the unspoken dependency of half of governance use cases |
| **VP-17 Reference Data Pack** | Curated insurance code sets: ISO class/cause-of-loss codes, NAICS mappings, state/jurisdiction codes, currency, Lloyd's risk codes — with stewardship workflow | Unglamorous, instantly credible, demo-ready depth |
| **VP-18 Data Marketplace & Certification Pack** | Certification tiers (bronze/silver/gold), publication workflow, consumer request flows, marketplace metadata standards | The "shop window" that makes governance visible to the business |
| **VP-19 M&A / Book-Transfer Due-Diligence Pack** | Data due-diligence checklists, semantic mapping accelerators, migration DQ gates | Specialty/consolidation-heavy market fit |
| **VP-20 Operating Model & RACI Pack** | Federated governance org patterns, steward capacity planner, council cadences, decision-rights matrices | Answers the org-design question every RFP asks |
| **VP-21 Value & Adoption Tracking Pack** | Value-moment templates, benefit ledgers, adoption telemetry patterns, funding narratives | Keeps programs funded — the political survival kit |
| **VP-22 Governance Communications & Change Pack** | Stakeholder maps, comms calendars, training comms, exec one-pagers | Change management as packaged asset, not an afterthought |

All packs carry the same metadata (capabilities, sectors, scenarios, obligations, best practices, "so what, for whom") and are composable in the same engine.

---

## 5. User journey & screens

Discover → Scope → Compose → Blueprint → Operate → Export/Share.

1. **Home / Story** — cost-curve narrative, "agents draft, stewards decide", role-aware CTA.
2. **Insurance Landscape Explorer** — interactive value chain per sector; stages light up domains, obligations, pain points, and the elements/dashboards that serve them.
3. **Scenario Catalog** — sector-flavored archetype cards with capability-emphasis radar.
4. **Velocity Pack Library** — filterable; Agent Roster as digital co-worker cards; Dashboard gallery.
5. **Best Practices Hub** — "what good looks like" per capability × sector, evidence-framed, cross-linked to elements and obligations.
6. **Project Composer** — canvas grouped by capability; live coverage heatmap, leverage gauge, dashboard preview; explainable "why" per element; **Copilot drawer** (§7.2).
7. **Project Blueprint** — waves, pods, train-the-trainer, metrics, risks, dashboard set; AI-drafted narrative (human-approved); PDF export; workspace sharing.
8. **Live Dashboards** — GPI Portfolio, Steward Command Center, DQ Health, Executive Value on simulated telemetry.
9. **Agent Workbench** — the six agents running on project/library content with approval queues (§7.3).
10. **Admin Suite** (§9).

---

## 6. The dashboard pillar

**Blueprint catalog (suggested per sector × scenario):** Governance — GPI Portfolio (burn-up to maturity target, capability radar per product) · Steward "My Day" Command Center (suggestion queues, breach triage, audit trail) · DQ Health (rule telemetry, CDE coverage, breach aging, report-inputs-at-risk) · Lineage & Explainability (coverage per priority report, unstitched inventory, time-to-diagnose) · Classification & Privacy Coverage (chain integrity discovered→cataloged→tagged→enforced) · Agent Leverage (acceptance rates, effort deltas, benched agents) · Executive Value (incidents avoided, cycle-time deltas, cost-curve actuals) · Regulatory Readiness (evidence status per obligation). Business — Report Trust panel · Premium & Loss Reconciliation · Close Acceleration · FinOps allocation & tag health · Claims Leakage watch · Producer DQ · Member Integrity.

Each blueprint = spec (audience, questions answered, KPIs, required CDEs/telemetry, refresh, Power BI-first target stack). **Four flagships built live in-app** (GPI, Steward Command Center, DQ Health, Executive Value) on a **simulation engine** generating synthetic telemetry per composed project; same screens can later ingest real telemetry via the API.

---

## 7. AI & Agentic layer (new pillar)

### 7.1 LLM Gateway — provider-switchable by design
A single internal gateway service brokers all model calls:
- **Providers**: Anthropic Claude (default), Azure OpenAI, AWS Bedrock, **Ollama for fully-local mode** (nothing leaves the Docker host — the "inside your boundary" story, demonstrable).
- **Model registry & routing**: per-feature routing (e.g., copilot → Claude Sonnet; bulk drafting → local/small; narrative polish → larger model), configurable in Admin without redeploys; versioned prompt templates managed centrally.
- **Controls**: per-workspace token/cost budgets, rate limits, timeouts/fallbacks, response caching.
- **Full AI audit log**: every call records feature, prompt template + version, model, redaction report, tokens, cost, latency, and the human decision that followed.

### 7.2 AI features (copilot surface)
- **Engagement Copilot**: describe a client situation in prose → drafts sector/scenario selection + composed pack, *always* landing in the Composer for human review — never auto-committing.
- **Library Q&A (RAG)**: grounded question-answering over the pack library, best practices, and obligation register — with citations to the elements; refuses when ungrounded.
- **Drafting assists**: glossary term candidates, CDE suggestions, DQ rule drafts from a described dataset, blueprint narrative generation, dashboard insight summaries ("what changed this week") — all draft-only, all through approval queues.

### 7.3 Agent Workbench — the six co-workers, running
Glossary Scout · Rule Smith · Triage Marshal · Lineage Tracer · CDE Classifier · Alignment Auditor, implemented as supervised agents over project/library content (simulated telemetry now, real integrations later). Each has: a job description card, a work queue, **confidence-scored suggestions**, steward approve/edit/reject actions, acceptance-rate telemetry, and a **benching rule** (below-threshold agents drop to draft-only). This *is* the product demo of "agents draft, stewards decide, everything is logged."

### 7.4 Guardrails, security & PII (non-negotiable defaults)
- **Human-in-the-loop always**: no AI output mutates library or project content without explicit approval; approvals are individually logged.
- **PII/NPPI protection**: pre-prompt PII detection & redaction layer (Presidio-class + insurance-tuned patterns: policy numbers, claim numbers, SSN, medical terms); redaction report stored with each call; local-model routing available for sensitive workspaces.
- **Prompt-injection defense**: strict system-prompt containment, content sanitization on retrieved/user content, no tool-execution from retrieved text, output schema validation (Zod) on every structured response.
- **Grounding & honesty**: RAG answers must cite; confidence scores surfaced; "I don't know" is a valid, designed outcome.
- **Safety telemetry & evals**: golden-set eval suite per AI feature run in CI; drift alarms on acceptance rates; kill-switch per feature and per provider in Admin.
- **Security**: secrets in env/vault (never DB), per-provider key isolation, egress allowlist for the gateway, data-residency labels per workspace.

---

## 8. Roles & the Role Switcher

Real RBAC underneath; a visible **role switcher** on top (demo gold: flip personas live in a meeting and the platform reshapes).

| Role | Landing experience | What they see/do |
|---|---|---|
| **Executive / CDO** | Executive Value + GPI burn-up | Portfolio maturity, value narrative, funding view; read-mostly |
| **Pursuit Lead** | Composer + Copilot | Compose packs, generate blueprints, export client-safe decks |
| **Delivery Lead** | Project Blueprint + waves | Run composed projects, track milestones, manage trainee roster |
| **Data Steward** | Steward "My Day" + Agent Workbench | Approve/reject agent suggestions, triage breaches, curate glossary |
| **Content Curator** | Library Studio | Author/version pack content, review drafts, publish |
| **Platform Admin** | Admin Suite | Users/roles/workspaces, LLM & guardrail config, audit, feature flags |

Role switching for privileged users is itself audit-logged; the switcher shows *authorized* personas only (with a demo mode that unlocks all personas in demo workspaces).

## 9. Admin Suite

- **Users, roles, workspaces** (workspace = pursuit or engagement; content and projects scoped; client-safe isolation).
- **Library Studio**: versioned content authoring (draft → review → published), diff view, change history, deprecation flow — our IP under governance, visibly.
- **AI Administration**: provider & key management, model registry and per-feature routing, prompt-template versioning, guardrail policy config (redaction strictness, budgets, kill-switches), eval results, AI cost dashboard.
- **Audit center**: unified human+AI audit log, filterable, exportable.
- **Platform config**: feature flags, branding/theme tokens, simulation seeds, usage analytics.

---

## 10. Architecture & deployment (local Docker first, Azure later)

- **App**: Next.js (App Router) + TypeScript end-to-end; Tailwind + shadcn/ui (heavily themed); custom SVG signature visuals; Recharts (per dataviz skill).
- **Services (docker-compose)**: `web` (Next.js) · `db` (Postgres 16) · `gateway` worker (LLM gateway + agent runtime; Node, BullMQ) · `redis` (queues/cache) · optional `ollama` (local models, compose profile) · optional `pgvector` extension for RAG embeddings (in Postgres — no separate vector DB).
- **API**: REST + OpenAPI (telemetry ingestion + future integrations), typed client generated for the web app.
- **Data**: Postgres + Drizzle ORM, migrations from day 1; entities: ontology, elements (versioned), workspaces, projects, users/roles, audit (human + AI), telemetry, prompt templates, eval results. pgvector for library embeddings.
- **Auth**: Auth.js — credentials + TOTP locally from day 1, **Entra ID provider behind a flag** so Azure SSO is config, not code. RBAC enforced server-side per route/procedure.
- **Quality**: Vitest (engine, gateway, guardrails), Playwright (core journeys per role), Zod-validated content pipeline, golden-set AI evals in CI, GitHub Actions.
- **Azure later (config, not rewrite)**: Container Apps (web/gateway), Azure Postgres Flexible + pgvector, Azure Redis, Key Vault for secrets, Entra SSO flag on, Azure OpenAI as an additional gateway provider, Front Door + WAF.
- **Ops**: structured logging (pino), health/readiness endpoints, error tracking hook, DB backup script in compose, seed/demo-data commands.

---

## 11. Build phases

| Phase | Deliverable |
|---|---|
| **0. Foundations** | Monorepo scaffold in `app/` (venv untouched), docker-compose stack (web/db/redis/gateway), Auth+RBAC+role switcher shell, CI, migrations, seed pipeline |
| **1. Domain & content model** | Ontology schema + seed content: 9 sectors, 10 scenarios, obligation register, KPI dictionary, 80–100 elements incl. new packs VP-12…22, ~30 best practices, ~15 dashboard blueprints |
| **2. Design system & shell** | Themed component library, nav, light/dark, signature SVGs (value-chain ribbon, radar, heatmap, burn-up), persona landing pages |
| **3. Explore & Library** | Landscape Explorer, Scenario Catalog, Pack Library, Best Practices Hub |
| **4. Composer & engine** | Recommendation engine (tested), Composer canvas + coverage/leverage/dashboard preview, project persistence, Blueprint v1 + PDF |
| **5. AI layer** | LLM gateway (Anthropic + Ollama first), guardrail stack (PII redaction, injection defense, audit), Library Q&A RAG, Engagement Copilot, prompt/eval management |
| **6. Agent Workbench & dashboards** | Six agents on simulated telemetry with approval queues; simulation engine; four flagship dashboards live |
| **7. Admin & hardening** | Library Studio, AI Administration, audit center, usage analytics, Playwright per-role coverage, performance pass, seeded flagship demo projects + guided demo script |

Each phase ships a deployable increment; content authoring (Phase 1) continues in parallel throughout.

---

## 12. Open decisions (defaults chosen; flag if you disagree)

1. **Local auth**: credentials + TOTP now, Entra ID flag for Azure phase.
2. **Default LLM**: Anthropic Claude via gateway; Ollama profile for fully-local demos; Azure OpenAI added at Azure phase.
3. **Vector store**: pgvector inside Postgres (one less service) over a dedicated vector DB.
4. **Queues**: Redis + BullMQ for agent/gateway jobs.
5. **Name/branding**: "Astra Velocity", Artizent-brandable theme tokens, no client names in content.
