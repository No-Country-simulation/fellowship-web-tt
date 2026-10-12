# Environment variables

Names only — never commit secrets. Copy `.env.example` → `.env.local` (gitignored).

Esta app no tiene agente ni login. Quote y captions salen de la plantilla en `lib/testimonials/quote.ts`.

| Name | Used by | Purpose |
|------|---------|---------|
| `NEXT_PUBLIC_SITE_URL` | Next.js | Origen canónico. Local: `http://localhost:3001` |
| `NEXT_PUBLIC_SUPABASE_URL` | Next.js | Supabase API URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Next.js | Public anon / publishable key. La galería lee `testimonials_public` |
| `SUPABASE_SERVICE_ROLE_KEY` | Next.js server | Insert del form y upload de avatar/captura (never in browser) |
| `DISCORD_INBOX_WEBHOOK_URL` | Next.js server | Aviso interno al enviar. Vacío = no se manda |
| `ADMIN_PANEL_URL` | Next.js server | Origen del panel. El aviso linkea `{ADMIN_PANEL_URL}/testimonials/{id}` |

Discord comunidad y Buffer viven en `apps/panel-admin`.
