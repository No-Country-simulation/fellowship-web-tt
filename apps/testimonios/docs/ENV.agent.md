# Environment variables

Names only — never commit secrets. Copy `.env.example` → `.env.local` (gitignored).

| Name | Used by | Purpose |
|------|---------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Next.js / worker | Supabase API URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Next.js | Public anon / publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Next.js server / worker | Privileged DB + Storage (never in browser) |
| `GEMINI_API_KEY` | Next.js `lib/agent` | Understand/transcribe + IG/LI copy (text only) |
| `MEDIA_WEBHOOK_SECRET` | Next.js webhook + worker | Shared HMAC-SHA256 secret for `media-listo` |
| `MEDIA_LISTO_WEBHOOK_URL` | Worker | Full URL of `POST /api/webhooks/media-listo` |
| `FFMPEG_PATH` | Worker | Optional path to `ffmpeg` binary |
| `WATERMARK_PATH` | Worker | Optional local path to No Country logo PNG |
| `ADMIN_EMAILS` | Next.js | Comma-separated allowlist (optional) |
| `DEV_ADMIN_BYPASS` | Next.js | `true` only in non-production to skip auth |
| `NEXT_PUBLIC_APP_URL` | Next.js | App origin (optional) |

## Local Supabase

```bash
npx supabase start
npm run verify:supabase
```

Use keys from `npx supabase status`. See [schema-inventory.md](schema-inventory.md).

## Remote project

Replace URL/keys in `.env.local` with the fellowship testimonios project (not `No_Country_Fellowship_Data`). Never commit `.env.local`.

## Webhook HMAC

- Header: `x-media-webhook-signature`
- Value: hex HMAC-SHA256 of the **raw request body** using `MEDIA_WEBHOOK_SECRET`

## Gemini

Text-only drafts; FFmpeg owns media binaries.

## Publish

`publicar` only marks `aprobado → publicado` in DB. Social posts are manual.
