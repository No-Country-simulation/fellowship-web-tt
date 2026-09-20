# ADR-002: Agent Content Pipeline

- **Status**: Accepted (amended 2026-09-19)
- **Date**: 2026-09-11
- **Supersedes**: chat/draft ADR-001 (see `docs/adr/ADR-001-superseded.md`)
- **PR**: [#46](https://github.com/No-Country-simulation/fellowship-web-tt/pull/46) → `dev`

## Context

Fellowship testimonios drafts IG/LinkedIn captions from the written story. Video is a YouTube URL. Admin reviews in `/admin/[id]` and publishes with the existing form.

## Decision

1. **No Mastra / LangGraph / ADK / media worker.** Gemini is a server action that fills the caption textarea.
2. **Gemini** writes only a short No Country intro (text).
3. **Code** assembles intro + quoted quote + name + IG or LinkedIn + fixed hashtags.
4. **Human-in-the-loop**: persist only on Guardar / Publicar (`ig_caption`, `li_caption`).
5. **UI**: Instagram keeps the PNG card. LinkedIn is a text post (caption + Video + captura). Discord uses the same default intro, not editable.
6. Entry: `generateCaption` in `lib/testimonials/generate-caption.ts`.

The understand → strategy → first-person draft → repair pipeline from the colleague PR is out of scope. Unused orchestration, `contenido_generado`, and the FFmpeg worker were removed.

## Consequences

- One Gemini call per Generate. No extra draft tables.
- Publish **transport** (Buffer vs manual) remains open.
- Stack changes (Vercel app, Supabase, Gemini) require a new ADR.

## References

- Env: [ENV.agent.md](../ENV.agent.md)
- Copy: [COPY_PIPELINE.md](../COPY_PIPELINE.md)
