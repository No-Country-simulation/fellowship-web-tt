# Environment variables

Names only — never commit secrets. Copy `.env.example` → `.env.local` (gitignored).

| Name | Used by | Purpose |
|------|---------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Next.js | Supabase API URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Next.js | Public anon / publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Next.js server | Privileged DB + Storage (never in browser) |
| `GEMINI_API_KEY` | Next.js `lib/agent` | Intro de captions IG/LI (texto) |
| `GEMINI_MODEL` | Next.js `lib/agent` | Optional primary (default `gemini-3.1-flash-lite`) |
| `GEMINI_FALLBACK_MODEL` | Next.js `lib/agent` | Optional fallback (default `gemini-2.5-flash-lite`) |
| `BUFFER_ENV` | Next.js `lib/buffer` | `development` = programar 24h; `production` = shareNow. Si falta, se programa |
| `BUFFER_API_KEY` | Next.js `lib/buffer` | Bearer de Buffer. Sin esto, IG/LI no se ofrecen |
| `BUFFER_IG_CHANNEL_ID` | Next.js `lib/buffer` | Canal Instagram. Si falta, esa red se saltea |
| `BUFFER_LI_CHANNEL_ID` | Next.js `lib/buffer` | Canal LinkedIn. Si falta, esa red se saltea |
| `ADMIN_EMAILS` | Next.js | Comma-separated allowlist (optional) |
| `DEV_ADMIN_BYPASS` | Next.js | `true` only in non-production to skip auth |
| `NEXT_PUBLIC_APP_URL` | Next.js | App origin (optional) |

## Gemini

Text-only. Gemini writes the No Country intro; the rest of the caption is assembled in code. Video is a YouTube URL on the testimonial. Primary model falls back to 2.5 Flash-Lite on 503/429/empty.

## Publish

Guardar / Publicar writes `ig_caption` and `li_caption`. Discord is the community webhook. Instagram and LinkedIn go through Buffer. `BUFFER_ENV=production` uses shareNow; anything else schedules +24h.
