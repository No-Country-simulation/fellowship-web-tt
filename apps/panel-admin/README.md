# panel-admin

Esqueleto del **panel de administración de No Country** (`admin-panel-v2` del monorepo principal),
reducido a lo mínimo para entender cómo está armado. **No habla con ningún back**: todos los datos
salen de mocks en memoria. Puerto **3002**.

```bash
pnpm install                                   # una vez, desde la raíz del repo
pnpm turbo run dev --filter=panel-admin        # http://localhost:3002
```

No hay login: `/` redirige directo a `/dashboard`. La idea es usarlo de base para armar algo propio.

## Arquitectura: feature-first

```
app/                              routing. Cada page es un Server Component que pide datos y compone
  layout.tsx                      html/body + estilos globales
  (panel)/                        route group: todo lo que va dentro del shell (sidebar + topbar)
    layout.tsx                    monta el AdminShell
    dashboard/ simulations/ completion/ projects/ staffing/
    simulations/[id]/layout.tsx   layout anidado: header + pestañas de una simulación
features/<feature>/
  components/                     UI de la feature ('use client' solo si hace falta)
  types/                          tipos de dominio de la feature
  infrastructure/
    mocks/                        datos de ejemplo (en el panel real no existe)
    dtos/ mappers/                forma del back (snake_case) → tipo de dominio (ver `projects`)
    repositories/                 ÚNICO lugar que "pide datos"
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

`features/projects` tiene el flujo completo (mock con forma de DTO → mapper → dominio). Las demás
features devuelven el tipo de dominio directo del mock para no sumar ruido.

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

## Qué tiene el panel real que acá no

Auth con JWT en cookie httpOnly + middleware, cambio de entorno dev/prod, Server Actions para
mutaciones (`actions/` + hooks con `useTransition`), formularios con react-hook-form + zod, gráficos
con ECharts, tests (Vitest + RTL + MSW, Playwright) y muchas más pantallas dentro de una simulación
(inscripciones, eventos, Discord, Demo Day, auto-asignación de equipos…).
