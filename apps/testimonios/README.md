# testimonios

App Next.js para capturar, validar y publicar testimonios de talento (No Country). Cómo corre el monorepo: [README de la raíz](../../README.md).

No se mezcla con la landing de empresas. Puerto local: **3001**.

## Getting Started

```bash
pnpm install
cp .env.example .env.local
pnpm turbo run dev --filter=testimonios
```

Desde esta carpeta también vale `pnpm dev`. Abrí [http://localhost:3001](http://localhost:3001).

| Ruta | Qué es |
| --- | --- |
| `/` | Galería (publicados) |
| `/enviar` | Formulario público, sin login |
| `/admin` | Inbox del equipo: validar y publicar |
| `/admin/[id]` | Preview, retocar quote y publicar o rechazar |
| `/t/[slug]` | Ficha de un testimonio publicado |

## Variables de entorno

Definidas en `.env.example`. Copiá ese archivo a `.env.local` (gitignored).

| Variable | Para qué |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Origen canónico. En local: `http://localhost:3001`. |
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key (o `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`). |
| `SUPABASE_SERVICE_ROLE_KEY` | Solo server. El form y el admin escriben con esto. |
| `ADMIN_EMAILS` | Allowlist del equipo, separada por coma. |
| `DISCORD_INBOX_WEBHOOK_URL` | Aviso interno cuando entra un envío. |
| `DISCORD_COMMUNITY_WEBHOOK_URL` | Post al canal de comunidad al publicar. |
| `META_ACCESS_TOKEN` | Opcional; Instagram Business. |
| `META_IG_USER_ID` | Opcional; Instagram Business. |

## Supabase

Proyecto aparte de la landing (`testimonials_nc_fellow`). Vive en esta app: [`supabase/migrations/20260906000000_init.sql`](./supabase/migrations/20260906000000_init.sql).

1. Desde `apps/testimonios`: `npx supabase link` y `npx supabase db push`.
2. En Authentication: desactivá el registro público. Creá un usuario del equipo.
3. En ese usuario, `app_metadata.role = admin`, **o** poné su email en `ADMIN_EMAILS`.
4. Copiá URL, anon key y service role a `.env.local`.

El talento no entra a Auth. `/enviar` inserta con `service_role`. `/admin` pide sesión y `isAdmin`. `anon` solo lee `testimonials_public` (sin email).

Deploy: en Vercel, Root Directory `apps/testimonios`.

## UI

Tokens y type scale alineados al [design system de la landing](../landing-contratar/docs/ui/design-system.md) (DM Sans, paleta oscura, Button de `@repo/ui`). Sin chrome de marketing: esta app es operativa (formulario, inbox, galería).

Componentes reutilizables (PageShell, TestimonialCard, Field, etc.): [docs/ui](./docs/ui/README.md).
