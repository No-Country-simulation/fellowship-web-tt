# ADR-002: Agent Content Pipeline

- **Status**: Accepted
- **Date**: 2026-09-11
- **Supersedes**: chat/draft ADR-001 (see `docs/adr/ADR-001-superseded.md`)

## Context

Fellowship testimonios needs an admin/agent pipeline: ingest media, prepare platform assets, draft IG/LinkedIn copy, human review, then publish. The repo is greenfield. A chat/draft ADR-001 floated durable agent frameworks; this ADR locks the production boundary for v1.

## Decision

1. **No Mastra / LangGraph / ADK.** Orchestration is a Supabase-backed state machine on `contenido_generado`, Next.js API routes, and an external FFmpeg worker.
2. **Gemini** is used for understand/transcribe and platform copy only — not generative video rewrite.
3. **FFmpeg worker** preserves original A/V, applies No Country watermark, and outputs per-platform format. Media binaries remain FFmpeg-owned.
4. **Human-in-the-loop**: approve / edit / reject via Supabase UPDATE; edited text publishes as-is (no auto re-Gemini). `POST /api/agent/publicar` publishes **aprobado** rows only.
5. **API contract** (from proposal / specs):
   - `POST /api/agent/procesar` `{ testimonioId, plataformas: ("instagram"|"linkedin")[] }`
   - `POST /api/agent/publicar` `{ testimonioId }`
   - Prefer Realtime on `contenido_generado`; optional `GET /api/agent/estado/:testimonioId`
   - `POST /api/webhooks/media-listo` — HMAC, idempotent
6. **States**: `pendiente` → `procesando_media` → `generando_copy` → `listo_revision` → `aprobado`|`rechazado` → `publicado` (+ `error`). Text-only skips `procesando_media`.

## Consequences

- Simpler ops than a workflow framework; correctness lives in DB transitions + HMAC webhook idempotency.
- Publish **transport** (IG/LI API vs manual package) remains open — deferred to a later ADR; the gate stays.
- Full RLS, pixel specs, auto-publish, and OpenRouter are out of v1 scope.
- Stack changes (Vercel app, Supabase, FFmpeg worker, Gemini) require a new ADR.

## References

- Change: `openspec/changes/agent-pipeline-api-contract/`
- Specs: `agent-api`, `contenido-generado`, `media-worker`, `copy-generation`
