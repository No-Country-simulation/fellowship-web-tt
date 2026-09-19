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
| `/admin` | Inbox: lista a la izquierda (filtro local por estado), ficha a la derecha |
| `/admin/[id]` | Revisar: envío plegado, quote, tabs Discord / Instagram (caption editable). Al publicar: descargar PNG, copiar caption, reintentar Discord |
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
| `BUFFER_API_KEY` | Bearer de Buffer. Sin esto, Instagram/LinkedIn no se ofrecen. |
| `BUFFER_IG_CHANNEL_ID` | Canal Instagram (direct publishing). Si falta, no hay botón IG. |
| `BUFFER_LI_CHANNEL_ID` | Canal LinkedIn: caption + captura del proyecto si hay + link de YouTube (como Discord). |
| `META_ACCESS_TOKEN` | Opcional; no se usa en v1 (IG es descargar PNG + copiar caption). |
| `META_IG_USER_ID` | Opcional; no se usa en v1. |

Los channel IDs se copian del [API Explorer](https://developers.buffer.com/explorer.html) (`account.organizations` → `channels`). El código no los descubre solo.

## Supabase

Proyecto aparte de la landing (`testimonials_nc_fellow`). Migraciones en [`supabase/migrations/`](./supabase/migrations/) (init + `discord_posted_at`).

1. Desde `apps/testimonios`: `npx supabase link` y `npx supabase db push`. `discord_posted_at` marca si el webhook de comunidad ya posteó; si falla, el admin reintenta.
2. En Authentication: desactivá el registro público. Creá un usuario del equipo.
3. En ese usuario, `app_metadata.role = admin`, **o** poné su email en `ADMIN_EMAILS`.
4. Copiá URL, anon key y service role a `.env.local`.

El talento no entra a Auth. `/enviar` inserta con `service_role`. `/admin` pide sesión y `isAdmin`. `anon` solo lee `testimonials_public` (sin email).

Deploy: en Vercel, Root Directory `apps/testimonios`.

## UI

Tokens y type scale alineados al [design system de la landing](../landing-contratar/docs/ui/design-system.md) (DM Sans, paleta oscura). Button y BrandLogo: [`packages/ui/docs`](../../packages/ui/README.md). Sin chrome de marketing: esta app es operativa (formulario, inbox, galería). Scrollbar fino en `app/globals.css` (thumb de borde, hover cyan).

Componentes reutilizables (PageShell, TestimonialCard, Field, etc.): [docs/ui](./docs/ui/README.md).
