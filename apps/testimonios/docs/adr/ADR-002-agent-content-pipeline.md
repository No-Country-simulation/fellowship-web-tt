# ADR-002: Agent Content Pipeline

- **Status**: Accepted (amended 2026-09-18)
- **Date**: 2026-09-11
- **Supersedes**: chat/draft ADR-001 (see `docs/adr/ADR-001-superseded.md`)
- **PR**: [#46](https://github.com/No-Country-simulation/fellowship-web-tt/pull/46) → `dev`

## Context

Fellowship testimonios needs an admin/agent pipeline: ingest media, prepare platform assets, draft IG/LinkedIn copy, human review, then publish. A chat/draft ADR-001 floated durable agent frameworks; this ADR locks the production boundary.

## Decision

1. **No Mastra / LangGraph / ADK.** Orchestration is a Supabase-backed state machine on `contenido_generado`, Next.js API routes, and an external FFmpeg worker.
2. **Gemini** is used for understand/transcribe and platform copy only — not generative video rewrite.
3. **FFmpeg worker** preserves original A/V, applies No Country watermark, and outputs per-platform format. Media binaries remain FFmpeg-owned.
4. **Human-in-the-loop**: approve / edit / reject via Supabase UPDATE; edited text publishes as-is (no auto re-Gemini). `POST /api/agent/publicar` publishes **aprobado** rows only.
5. **API contract**:
   - `POST /api/agent/procesar` `{ testimonioId, plataformas: ("instagram"|"linkedin")[] }`
   - `POST /api/agent/publicar` `{ testimonioId }`
   - Prefer Realtime on `contenido_generado`; optional `GET /api/agent/estado/:testimonioId`
   - `POST /api/webhooks/media-listo` — HMAC, idempotent
6. **States**: `pendiente` → `procesando_media` → `generando_copy` → `listo_revision` → `aprobado`|`rechazado` → `publicado` (+ `error`). Text-only skips `procesando_media`.

### Amendment (2026-09-18) — Copy quality

Copy generation is a typed pipeline, not a single free-form prompt:

| Step | What |
|------|------|
| Understanding | Structured JSON from the story + form `type` hint |
| Strategy | Narrative matrix: testimonial type × platform |
| Draft | Gemini 3.1 Flash-Lite → fallback 2.5 Flash-Lite |
| Validate | Deterministic rules (voice, hashtags, fidelity heuristics) |
| Repair | One repair pass if validation fails |
| Fidelity LLM | Optional (`GEMINI_FIDELITY_LLM=true`), fixed 2.5 model |

**Voice rule:** drafts are always a **first-person testimonio** (`yo` / `me` / `mi`). Reject impersonal essay openers (“Entrar al mundo IT…”) and brand CTAs (“Te leo en comentarios”). Details: [COPY_PIPELINE.md](../COPY_PIPELINE.md).

## Consequences

- Simpler ops than a workflow framework; correctness lives in DB transitions + HMAC webhook idempotency + copy validators.
- Publish **transport** (IG/LI API vs manual package) remains open — deferred to a later ADR; the gate stays.
- Full RLS, pixel specs, auto-publish, and OpenRouter are out of v1 scope.
- Stack changes (Vercel app, Supabase, FFmpeg worker, Gemini) require a new ADR.

## References

- Env: [ENV.agent.md](../ENV.agent.md)
- Copy rules: [COPY_PIPELINE.md](../COPY_PIPELINE.md)
- Media: [MEDIA_FORMATS.md](../MEDIA_FORMATS.md)
- Migration: `supabase/migrations/20260911150000_agent_contenido_media_jobs.sql`
