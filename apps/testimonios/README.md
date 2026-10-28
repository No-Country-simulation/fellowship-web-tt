# testimonios

App Next.js pública para recibir testimonios de talento (No Country) y mostrar los publicados. El inbox del equipo está en [`panel-admin`](../panel-admin) (`/testimonials`). Cómo corre el monorepo: [README de la raíz](../../README.md).

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
| `/enviar` | Formulario público, sin login (país y avatar obligatorios; captura, YouTube, Instagram y LinkedIn opcionales) |
| `/t/[slug]` | Ficha de un testimonio publicado |

El video del envío es solo un link de YouTube (`youtube.com` o `youtu.be`). No hay upload de mp4.

Quote y captions de Instagram y LinkedIn salen de la plantilla en `lib/testimonials/quote.ts` al enviar. En el panel el equipo edita nombre, país, cita y los campos de la card según el tipo; el tipo no se cambia. Si cambia el nombre y una descripción sigue la plantilla, se regenera; las editadas a mano quedan igual. No hay generación con IA.

| Doc | Contenido |
| --- | --- |
| [docs/COPY_PIPELINE.md](./docs/COPY_PIPELINE.md) | Plantilla (quote, nombre, IG o LinkedIn, hashtags) |
| [docs/MEDIA_FORMATS.md](./docs/MEDIA_FORMATS.md) | Avatar, captura y YouTube en Discord / Instagram / LinkedIn |
| [docs/ENV.agent.md](./docs/ENV.agent.md) | Variables de esta app |

## Variables de entorno

Definidas en `.env.example`. Copiá ese archivo a `.env.local` (gitignored).

| Variable | Para qué |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Origen canónico. En local: `http://localhost:3001`. |
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key (o `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`). |
| `SUPABASE_SERVICE_ROLE_KEY` | Solo server. El form sube avatar y captura y hace el insert. |
| `DISCORD_INBOX_WEBHOOK_URL` | Aviso interno cuando entra un envío. Si está vacío, no se manda. |
| `ADMIN_PANEL_URL` | Solo server. Origen del panel. El aviso linkea `{ADMIN_PANEL_URL}/testimonials/{id}`. En local: `http://localhost:3002`. |

## Supabase

Proyecto aparte de la landing (`testimonials_nc_fellow`). Las migraciones siguen en [`supabase/migrations/`](./supabase/migrations/). Esta app no es dueña del inbox: el panel usa el mismo proyecto.

1. Desde `apps/testimonios`: `npx supabase link` y `npx supabase db push`.
2. Copiá URL, anon key y service role a `.env.local`.
3. El mismo service role, el webhook de comunidad y Buffer van en el panel.

El talento no entra a Auth. `/enviar` inserta con `service_role`. `anon` solo lee `testimonials_public` (sin email). Esta app no tiene login.

Deploy: en Vercel, Root Directory `apps/testimonios`.

## UI

Tokens y type scale alineados al [design system de la landing](../landing-contratar/docs/ui/design-system.md) (DM Sans, paleta oscura). Button y BrandLogo: [`packages/ui/docs`](../../packages/ui/README.md). Sin chrome de marketing: esta app es el formulario y la galería. Scrollbar fino en `app/globals.css` (thumb de borde, hover cyan).

Componentes reutilizables (PageShell, TestimonialCard, Field, etc.): [docs/ui](./docs/ui/README.md).
