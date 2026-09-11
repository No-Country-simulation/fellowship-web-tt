# Media worker (FFmpeg)

External consumer for `procesando_media` jobs.

## Contract

- Preserve original A/V — **no generative rewrite**
- Apply No Country watermark
- Per-platform output format
- HMAC-signed `POST /api/webhooks/media-listo` (idempotent retries)

Orchestration frameworks (Mastra / LangGraph / ADK) are out of scope.

## Local

```bash
npm install
npm run start
```

Env names: see repo root `.env.example` (`MEDIA_WEBHOOK_HMAC_SECRET`, `MEDIA_LISTO_WEBHOOK_URL`, `FFMPEG_PATH`).
