# testimonios

App Next.js pública para recibir testimonios de talento (No Country) y mostrar los publicados. El inbox del equipo está en [`panel-admin`](../panel-admin) (`/testimonials`). Cómo corre el monorepo: [README de la raíz](../../README.md).

No se mezcla con la landing de empresas. Puerto local: **3001**.

## Getting Started

```bash
pnpm install
cp .env.example .env.local
pnpm turbo run dev --filter=testimonios
```

Desde esta carpeta también vale `pnpm dev`. Para el flujo aprobado, abrí [http://localhost:3001/enviar](http://localhost:3001/enviar).

| Ruta | Qué es |
| --- | --- |
| `/` | Galería con navbar/footer institucionales; funcionalidad futura, sin aprobación de publicación definitiva |
| `/enviar` | Flujo aprobado de captación: hero, autorización, carrusel, cinco pasos, resumen/edición/envío y éxito; destino de la plataforma de simulaciones |
| `/t/[slug]` | Ficha de un publicado; pendiente junto con la galería |

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

El build actual incluye las tres rutas. Declarar la galería como futura no restringe su acceso; falta definir la política de exposición en el hosting o la aplicación. «Leer historia» del carrusel depende de `/t/[slug]` y se conserva. No se han implementado flags, redirecciones ni restricciones. Configuración revisada, límites y alternativas: [Alcance de publicación](./docs/hero-form-integration.md#alcance-de-publicación).

## UI

Tokens y type scale: DM Sans y paleta oscura de `app/globals.css`, con el [design system de la landing](../landing-contratar/docs/ui/design-system.md) como referencia interna. Button y BrandLogo: [`packages/ui/docs`](../../packages/ui/README.md). `/enviar` reúne hero y formulario bajo FormHeader, con contenedor compartido de 70rem y gutters de 24/32px; `/` conserva la galería futura y su chrome institucional. Scrollbar fino en `app/globals.css`.

## Estado vigente — 16/11/2026

La base de Testimonios está integrada en `dev`: galería y fichas rediseñadas, identidad visual de No Country, formulario ES/EN/PT, navegación hacia pasos anteriores, validación integral y resumen con fotografías confirmadas y edición global «Editar/Guardar cambios».

El hero es la introducción de `/enviar`, no una página independiente ni un sexto paso. Entrar por URL muestra la casilla desmarcada; aceptarla habilita comenzar los cinco pasos. La aceptación compartida se comprueba al enviar y el parser exige una única entrada `consent=on`. Solo un envío válido recibe `consent_at` generado por el servidor; esa fecha no prueba lectura ni hora del clic. El paso 5 mantiene el recordatorio de autorización, sin otra casilla. [Contrato y límites](./docs/hero-form-integration.md#declaración-y-fecha-de-consentimiento).

El carrusel utiliza PNG administrativos mediante `next/image` (normalmente WebP, calidad 85), selección/disponibilidad cacheadas y streaming con `Suspense`, con equivalente textual y fallback local. La **implementación y revisión manual en localhost de la precarga progresiva se completaron el 16/11/2026**: primera eager/high; segunda automática tras terminar la primera, eager/low; tercera tras la segunda. Navegar anticipadamente solicita o reutiliza el destino y conserva las imágenes montadas. `fetchPriority` es una indicación del navegador, no una garantía de prioridad efectiva. Este registro no afirma un despliegue en producción. [Estrategia, métricas y límites](./docs/carousel-preload.md).

| Documento vigente | Uso |
| --- | --- |
| [Plan y estado](./docs/app_testimonios_plan.md) | Implementado, límites y planificación histórica |
| [Índice UI](./docs/ui/README.md) | Componentes y arquitectura actual |
| [Hero y formulario](./docs/hero-form-integration.md) | Rutas, consentimiento y estado en memoria |
| [Navegación y resumen](./docs/form-steps-summary.md) | Estado vigente y evolución por etapas |
| [Internacionalización](./docs/form-i18n-audit.md) | ES/EN/PT, preferencia y registro histórico de QA |
| [Precarga del carrusel](./docs/carousel-preload.md) | Comportamiento actual, mediciones y aprobación manual |

Componentes reutilizables (PageShell, TestimonialCard, Field, etc.): [docs/ui](./docs/ui/README.md).
