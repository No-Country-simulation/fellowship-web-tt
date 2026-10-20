# panel-admin

Esqueleto del **panel de administración de No Country** (`admin-panel-v2` del monorepo principal),
reducido a lo mínimo para entender cómo está armado. Dashboard, simulaciones, proyectos, staffing
y completion salen de mocks en memoria. **Testimonios** usa el mismo Supabase que `apps/testimonios`.
Puerto **3002**.

```bash
pnpm install                                   # una vez, desde la raíz del repo
cp .env.example .env.local                     # hace falta para /testimonials
pnpm turbo run dev --filter=panel-admin        # http://localhost:3002
```

No hay login en este mock: `/` redirige directo a `/dashboard`. `/testimonials` queda detrás del
mismo shell, sin un chequeo propio.

## Testimonios

Inbox de los envíos que entran por `apps/testimonios` (`/enviar`). El código vive en
`features/testimonials` (`components/`, `types/`, `infrastructure/` y `actions/`). Las páginas
piden datos al repository. Publicar, guardar, rechazar y reintentar son Server Actions: llaman
al repository y después a Discord y Buffer. No hay mocks: el repository lee y escribe Supabase
con `service_role`. El resto del panel sigue en mock.

No hay login propio. En el panel real esta pantalla queda detrás del JWT que ya cubre el shell.

| Ruta | Qué es |
| --- | --- |
| `/testimonials` | Inbox: lista de envíos y, al elegir uno, la ficha al lado |
| `/testimonials/[id]` | Ficha: envío y una sola publicación (card + texto) para las tres redes |

Hay **una sola publicación** para Discord, Instagram y LinkedIn: la misma card PNG 1080×1350 y el
mismo texto. El quote (que va dentro de la card) y el texto llegan armados por la plantilla del
formulario y se editan a mano. No hay generación con IA. El texto se guarda en `ig_caption` y se
copia a `li_caption`. El video es solo un link de YouTube: Discord y LinkedIn lo suman al post;
Instagram no admite links.

Publicar primero arma la card en el browser y la sube al bucket `share-cards`
(`{slug}/instagram.png`). Si el PNG no se genera, pesa más de 8 MB o no se puede subir, el
testimonio sigue en revisión y se puede reintentar. Recién con la card guardada escribe la fila
con `service_role` (`published` y `published_at`) y manda el mismo post al webhook de Discord
comunidad y a Buffer (Instagram y LinkedIn). Si el envío ya no está en revisión (por ejemplo,
desde una pestaña vieja), no toca Storage. El límite de 8 MB es `SHARE_CARD_MAX_BYTES`
(`types/share.ts`); `serverActions.bodySizeLimit` está en 12mb para que entren la card y el texto.

La ficha publicada muestra el estado por red. Para Instagram y LinkedIn se guarda el id del post
de Buffer y, al abrir la ficha, se consulta el estado real (Programado, Enviando, Publicado,
Falló). Cuando Buffer lo publicó, aparece **Ver post** con el link. Los envíos sin id muestran la
hora guardada. Si alguna red falla, el testimonio queda publicado y un solo botón reintenta las
que falten.

| Variable | Para qué |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Mismo proyecto que testimonios. |
| `SUPABASE_SERVICE_ROLE_KEY` | Lee el inbox y publica. |
| `GALLERY_URL` | Solo server. Galería pública (`apps/testimonios`), para “Ver ficha pública” y el logo de Discord. En local: `http://localhost:3001`. Obligatoria en producción. No es la URL del panel. |
| `DISCORD_COMMUNITY_WEBHOOK_URL` | Post al canal de comunidad al publicar. Vacío = no se manda. |
| `BUFFER_ENV` | `development` programa a 24h; `production` publica ya. Si falta, se programa. |
| `BUFFER_API_KEY` | Bearer de Buffer. Sin esto, Instagram/LinkedIn no se ofrecen. |
| `BUFFER_IG_CHANNEL_ID` | Canal Instagram. Si falta, esa red se saltea. |
| `BUFFER_LI_CHANNEL_ID` | Canal LinkedIn. Si falta, esa red se saltea. |

El aviso de inbox (al enviar) lo manda la app pública con `DISCORD_INBOX_WEBHOOK_URL` y
`ADMIN_PANEL_URL` (`http://localhost:3002/testimonials/{id}`).

## Arquitectura: feature-first

```
app/                              routing. Cada page es un Server Component que pide datos y compone
  layout.tsx                      html/body + estilos globales
  (panel)/                        route group: todo lo que va dentro del shell (sidebar + topbar)
    layout.tsx                    monta el AdminShell
    dashboard/ simulations/ completion/ projects/ staffing/ testimonials/
    simulations/[id]/layout.tsx   layout anidado: header + pestañas de una simulación
features/<feature>/               dashboard, simulations, projects, staffing, completion, testimonials
  components/                     UI de la feature ('use client' solo si hace falta)
  types/                          tipos de dominio de la feature
  actions/                        mutaciones. En este esqueleto, solo testimonios
  infrastructure/
    mocks/                        datos de ejemplo (en el panel real no existe; testimonios no tiene)
    dtos/ mappers/                forma del back (snake_case) → tipo de dominio (`projects`, `testimonials`)
    repositories/                 ÚNICO lugar que "pide datos"
    supabase/                     cliente service_role de testimonios. Solo lo importa su repository
shared/
  lib/                            helpers sin dominio (formatDate)
  ui/patterns/                    PageHeader, SectionCard, MetricCard, StatusBadge, DataTable
  ui/feedback/                    EmptyState, LoadingState
core/
  api/mockClient.ts               reemplazo del cliente HTTP: simula latencia
  config/navigation.ts            ítems del menú lateral
```

Reglas que vienen del panel real:

- `shared/` y `core/` **nunca** importan de `features/`.
- Server Components por defecto. `'use client'` solo con hooks, handlers o APIs del browser
  (acá: `Sidebar`, `SimulationTabs`).
- Color nunca hardcodeado: tokens de `app/globals.css` (`bg-card`, `text-muted-foreground`…).
  Un estado se traduce a un `VisualTone` y se pinta con `StatusBadge`.
- Filtros y búsqueda viven en la URL (`?status=`, `?s=`): refresh y back/forward funcionan.
- Un solo `h1` por página; tablas con `<caption>` y `scope="col"`; navegación con `<Link>`, nunca
  `onClick` en un `<tr>`.

Path aliases: `@app/*`, `@core/*`, `@features/*`, `@shared/*`.

## Flujo de datos

```
page.tsx (Server Component)
  └─ repository  ← acá se cambia mock por API
       └─ mapper (DTO snake_case → dominio camelCase)
  └─ componente de la feature (recibe el tipo de dominio)
```

`features/projects` tiene el flujo completo con mock (DTO → mapper → dominio). Simulaciones,
staffing, completion y dashboard devuelven el tipo de dominio directo del mock.

`features/testimonials` usa el mismo flujo con el back ya conectado: el repository habla con
Supabase (`service_role`), el mapper pasa la fila a dominio, y las actions publican en Discord
y Buffer.

### Conectar un back real

Solo cambia el cuerpo del repositorio. Páginas y componentes no se enteran:

```ts
// antes
export async function listProjects() {
  return (await mockResponse(PROJECTS_MOCK)).map(ProjectMapper.fromDto);
}

// después
export async function listProjects() {
  const res = await fetch(`${process.env.API_URL}/admin/projects`, { cache: "no-store" });
  const dtos = (await res.json()) as ProjectDto[];
  return dtos.map(ProjectMapper.fromDto);
}
```

En testimonios ese paso ya está hecho: `testimonialRepository` lee y escribe Supabase en lugar del mock.

## Qué tiene el panel real que acá no

Auth con JWT en cookie httpOnly + middleware. En el panel real, Testimonios queda detrás de ese
JWT, el mismo que cubre el shell. También faltan el cambio de entorno dev/prod, las Server Actions
del resto de las features (`actions/` + hooks con `useTransition`), los formularios con
react-hook-form + zod, los gráficos con ECharts, los tests (Vitest + RTL + MSW, Playwright) y
muchas más pantallas dentro de una simulación (inscripciones, eventos, Discord, Demo Day,
auto-asignación de equipos…).

En este esqueleto, testimonios ya está conectado a Supabase y usa Server Actions. Dashboard,
simulaciones, proyectos, staffing y completion siguen en mock.
