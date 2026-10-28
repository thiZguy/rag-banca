# rag-banca

RAG assistant over public Chilean banking regulation (CMF, Ley Fintec, circulares) for internal bank teams: every answer cites document and section, or abstains. Portfolio piece and a vehicle for learning RAG, so explain each decision in one sentence as you make it.

Read `docs/PLAN.md` before planning or scoping work: it holds the 4-week plan, weekly done-criteria, eval metrics, and out-of-scope list.

## Product rules

- An answer cites `[n]` chunks that were actually retrieved, or replies "no encontré respaldo en la normativa cargada". There is no third mode.
- Evals are computed in code (Hit@5, citas válidas, abstención correcta); keep LLM-as-judge out of the MVP.
- Anything not in the plan goes to the "después del MVP" list rather than into the code. When a week runs long, cut scope; the date holds.

## Stack

TypeScript end to end: React + Vite front (`apps/web`), Node API (`apps/api`, which also owns ingestion and evals), Postgres + pgvector in Docker Compose, Claude API for generation. Corpus PDFs live in `corpus/raw/`, eval cases in `evals/questions.json`. Keep it a simple monorepo; add shared packages only when duplication forces it. Integration tests talk to the real Postgres, so run `npm run db:up` (Docker via Colima) before `npm test`.

## Workflow

Each feature runs `/grill-with-docs` → `/to-spec` → `/to-tickets` → `/implement` (with `/tdd`, and `/code-review` before each commit), with `/retro` at the end of each week. Record decisions and experiments as short ADRs in `docs/adr/`. The user reviews and understands every PR before merge, so keep PRs small and explainable.

## Agent skills

### Issue tracker

Issues are tracked in this repo's GitHub Issues via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five-role vocabulary (needs-triage, needs-info, ready-for-agent, ready-for-human, wontfix). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
