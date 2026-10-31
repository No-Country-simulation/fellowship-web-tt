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
piden datos al repository. Publicar, guardar, rechazar, archivar, volver a publicar,
reintentar y eliminar rechazados son Server Actions. Publicar y reintentar llaman al
repository y después a Discord y Buffer. Archivar, volver a publicar, rechazar un archivado
y eliminar rechazados no mandan posts. No hay mocks:
el repository lee y escribe Supabase con `service_role`. El resto del panel sigue en mock.

No hay login propio. En el panel real esta pantalla queda detrás del JWT que ya cubre el shell.

| Ruta | Qué es |
| --- | --- |
| `/testimonials` | Inbox: lista de envíos y, al elegir uno, la ficha al lado |
| `/testimonials/[id]` | Ficha: envío y una sola card para las tres redes |

Los filtros del inbox viven en la URL: `?status=` (`in_review`, `published`, `archived`, `rejected`),
`?type=` (`simulation`, `first_job`, `career_change`) y `?s=` (hasta 100 caracteres, sin caracteres
de control). Un valor inválido redirige a la query válida. La lista, la ficha y las actions conservan
esa query.

Un id que no es un uuid responde 404 y no consulta Supabase. Si el id es válido y Supabase o la
red fallan, la ficha muestra «No se pudo cargar».

Hay **una sola card** PNG 1080×1350 para Discord, Instagram y LinkedIn. Cada red tiene su texto
y su intro. Discord sigue la misma plantilla, sin mención y sin hashtags, y se guarda en
`discord_caption`. La cita queda en la imagen. Los tres textos llegan armados por la plantilla y
se editan a mano, en un tab por red. No hay generación con IA. Instagram usa el valor guardado
(`@usuario`). LinkedIn escribe `@usuario` a partir del perfil. El video es solo un link de
YouTube: la plantilla de Discord y LinkedIn trae `Video testimonial:` y el link al final de la descripción. El admin lo deja
o lo saca en ese texto. Al publicar se manda el campo tal cual: el link no se agrega después.
Instagram no admite links.

En la ficha en revisión se editan los datos que dibuja la card. El tipo queda solo lectura.
Siempre se pueden cambiar el nombre, el país y la cita. El país es el mismo listado que el formulario público, con «Otro país» para escribir uno que no esté en la lista. Según el tipo, además:

| Tipo | Campos |
| --- | --- |
| `simulation` | `primary_role` (puesto principal) |
| `first_job` | `role_achieved` (puesto del primer empleo) y `company` (empresa) |
| `career_change` | `previous_profession` (oficio anterior) y `new_role` (rol nuevo) |

Al cambiar el nombre, cada descripción que todavía coincide con la plantilla armada con el
nombre anterior se regenera con el nombre nuevo: se conserva la intro y, si el texto ya tenía
la línea de video, se vuelve a poner al final. Si el admin la había sacado en LinkedIn o
Discord, no vuelve. Una descripción editada a mano no se toca. Cambiar la cita, el país o los
campos del tipo no regenera las descripciones.

En el header del inbox, debajo de la búsqueda y el filtro, hay un control que copia
`{GALLERY_URL}/enviar`. El mismo control aparece en el estado vacío de «En revisión». Si en
producción falta `GALLERY_URL`, no se muestra y ese texto vacío nombra la ruta `/enviar`.

Publicar arma la card en el browser. En el server, el update a `published` y `published_at`
solo gana si la fila sigue `in_review`. El request que no cambia la fila no sube nada ni postea,
y vuelve a la ficha. El que gana sube el PNG al bucket `share-cards` (`{slug}/instagram.png`).
Si el PNG no se genera o pesa más de 5 MB, el testimonio sigue en revisión. Si no se puede
subir, la fila vuelve a `in_review` con `published_at` en null. Con la card guardada reserva cada
red (la fecha solo si sigue en null) y manda la card al webhook de Discord comunidad y a Buffer.
Cada red sale con su texto guardado. Discord tiene el suyo, sin mención ni hashtags; la cita queda
en la imagen. Si `discord_caption` está vacío, el envío a Discord usa la plantilla de esa red
(con el link del video si hay uno) y no reescribe la fila. Si la llamada falla, borra esa fecha. Si Buffer respondió y no se
guarda el id, la fecha queda y Reintentar no crea otro post. `?share=ok` muestra «Salió en las
redes.» en la ficha; `?share=failed` se conserva. Si el envío ya no está en revisión (por
ejemplo, desde una pestaña vieja), no toca Storage. El límite de 5 MB es `SHARE_CARD_MAX_BYTES`
(`types/share.ts`); `serverActions.bodySizeLimit` está en 8mb para que entren la card y el texto.

La ficha publicada muestra el estado por red. Para Instagram y LinkedIn se guarda el id del post
de Buffer y, al abrir la ficha, se consulta el estado real (Programado, Enviando, Publicado,
Falló). Cuando Buffer lo publicó, aparece **Ver post** con el link. Los envíos sin id muestran la
hora guardada. Si alguna red no tiene fecha, o Instagram o LinkedIn quedan en error en Buffer,
el testimonio sigue publicado y un solo botón reintenta solo esas. Reintentar consulta el estado
con el id guardado: si Buffer no responde, esa red no se toca; si es error, borra fecha e id
condicionando al id viejo y vuelve a reservar y postear. Las que ya salieron no se mandan de nuevo.

Archivar un publicado pide un motivo obligatorio (hasta 500 caracteres) y lo pasa a `archived`.
El detalle queda con `?status=archived` y el inbox lo lista en Archivados. Sale de la galería.
Archivar no borra los posts ya enviados a Discord, Instagram ni LinkedIn, ni los ids de Buffer,
ni las fechas de publicación (`published_at`, `*_posted_at`). Volver a publicar lo devuelve a
`published` y a la galería sin reenviar a ninguna red: si una red nunca había salido, el panel
de publicados vuelve a ofrecer Reintentar. Rechazar un archivado lo pasa a `rejected`, limpia el
motivo y vuelve a `/testimonials` con los filtros del inbox.

### Eliminar rechazados

En la pestaña Rechazados del inbox se marcan varios testimonios o todos los visibles
(tope 100 por operación). «Eliminar definitivamente» pide confirmación con la cantidad.
Solo corre sobre filas que siguen `rejected`. Por cada una borra primero el avatar
(bucket `avatars`), la foto testimonial (bucket `captures`, si existe) y
`share-cards/{slug}/instagram.png`, y después la fila. Si Storage falla en una, esa fila
queda y se puede reintentar. Al terminar se queda en el inbox con los filtros de la URL
y muestra un resultado. No requiere migración: usa `service_role`.

Antes de desplegar el panel hay que aplicar la migración
`20261027221527_discord_caption.sql`. Sin la columna `discord_caption`, guardar y publicar fallan
para todos los envíos. Archivar además necesita `20261028190000_archived_status.sql` y
`20261028190001_archive_reason.sql` (el estado `archived` y el motivo).

Un reintento de LinkedIn de un testimonio publicado antes de este cambio ya no agrega el link del
video al final: se manda el texto guardado.

| Variable | Para qué |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Mismo proyecto que testimonios. |
| `SUPABASE_SERVICE_ROLE_KEY` | Lee el inbox y publica. |
| `GALLERY_URL` | Solo server. Galería pública (`apps/testimonios`), para “Ver ficha pública”, el logo de Discord y el link del formulario (`{GALLERY_URL}/enviar`) que se copia desde el inbox. En local: `http://localhost:3001`. Obligatoria en producción: si falta, el control de copiar no se muestra. No es la URL del panel. |
| `DISCORD_COMMUNITY_WEBHOOK_URL` | Post al canal de comunidad al publicar. Vacío = no se manda. |
| `BUFFER_ENV` | `development` programa a 1 semana; `production` publica ya. Si falta, se programa. |
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
- Filtros y búsqueda viven en la URL (`?status=`, `?type=`, `?s=`): refresh y back/forward funcionan.
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
