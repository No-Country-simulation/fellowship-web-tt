# Environment variables

Names only — never commit secrets. Copy `.env.example` → `.env.local` (gitignored).

| Name | Used by | Purpose |
|------|---------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Next.js | Supabase API URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Next.js | Public anon / publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Next.js server | Privileged DB + Storage (never in browser) |
| `GEMINI_API_KEY` | Next.js `lib/agent` | Intro de captions IG/LI (texto) |
| `GEMINI_MODEL` | Next.js `lib/agent` | Optional primary (default `gemini-3.1-flash-lite`) |
| `GEMINI_FALLBACK_MODEL` | Next.js `lib/agent` | Optional fallback (default `gemini-3.5-flash-lite`) |
| `BUFFER_ENV` | Next.js `lib/buffer` | `development` = programar 24h; `production` = shareNow. Si falta, se programa |
| `BUFFER_API_KEY` | Next.js `lib/buffer` | Bearer de Buffer. Sin esto, IG/LI no se ofrecen |
| `BUFFER_IG_CHANNEL_ID` | Next.js `lib/buffer` | Canal Instagram. Si falta, esa red se saltea |
| `BUFFER_LI_CHANNEL_ID` | Next.js `lib/buffer` | Canal LinkedIn. Si falta, esa red se saltea |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Next.js `lib/sanity` | Proyecto Sanity (videos) |
| `NEXT_PUBLIC_SANITY_DATASET` | Next.js `lib/sanity` | Dataset (local vs prod) |
| `SANITY_API_TOKEN` | Next.js `lib/sanity` | Token con write assets (server only) |
| `FFMPEG_MICRO_API_KEY` | Next.js `lib/ffmpeg-micro` | Bearer [FFmpeg Micro](https://api.ffmpeg-micro.com) |
| `ADMIN_EMAILS` | Next.js | Comma-separated allowlist (optional) |
| `DEV_ADMIN_BYPASS` | Next.js | `true` only in non-production to skip auth |
| `NEXT_PUBLIC_APP_URL` | Next.js | App origin (optional) |
| `NEXT_PUBLIC_SITE_URL` | Next.js | Origen público (logo watermark) |

## Gemini

Text-only. Gemini writes the No Country intro; the rest of the caption is assembled in code. Primary model falls back to 3.5 Flash-Lite on 503/429/empty or other errors.

## Video (Sanity + FFmpeg Micro)

1. `/enviar` sube mp4 (máx. 100 MB) → Sanity (original) → Supabase guarda `video_original_url` + `video_status=original`.
2. Admin **Procesar** → FFmpeg Micro (transcribe Whisper ES + burn subtítulos + watermark texto + encode 1080p high).
3. Resultado → Sanity (processed) → Supabase `video_processed_url`.
4. Admin **Aprobar video** (aparte de Publicar testimonio) → `video_share_url` = link para el fellow; se borra el original en Sanity.
5. Buffer / Discord **no** reciben el mp4 (card + captions como hoy). YouTube opcional sigue en `video_url`.

Free tier FFmpeg Micro: 250 MB input / 100 processing minutes. Stabilización avanzada no está en free virtual options.

## Publish

Guardar / Publicar writes `ig_caption` and `li_caption`. Discord is the community webhook. Instagram and LinkedIn go through Buffer. `BUFFER_ENV=production` uses shareNow; anything else schedules +24h. Video approval does not trigger publish.
