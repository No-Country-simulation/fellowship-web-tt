# SiteHeader

Chrome de la app: logo a la izquierda, nav a la derecha (Galería, Enviar, Admin).

**Archivo:** `components/site-header.tsx`

Se monta una sola vez en `app/layout.tsx`. No instanciarlo en páginas.

## Import

```tsx
import { SiteHeader } from "@/components/site-header";
```

## Cuándo usarlo

- Solo en el root layout. Cualquier página nueva hereda el header.

No copiar el markup del header en una página. Para el wordmark aislado usá `BrandLogo` (`@repo/ui/brand-logo`).

## Props

Ninguna. Labels y hrefs salen de `lib/nav.ts` (`publicNav`, `staffNav`). El subtítulo junto al logo sale de `SITE_NAME` en `lib/site.ts`.

## Uso

```tsx
// app/layout.tsx
<SiteHeader />
{children}
```

## Composición

```
SiteHeader
├── BrandLogo (eager) + SITE_NAME
└── nav (aria-label="Principal")
    ├── publicNav (Galería, Enviar)
    └── staffNav (Admin, estilo muted)
```

## Cómo cambiar copy o rutas

Editar `lib/nav.ts` o `lib/site.ts`, no el componente:

| Export | Qué controla |
| --- | --- |
| `publicNav` | Links de galería y envío |
| `staffNav` | Link al admin |
| `SITE_NAME` | Texto al lado del logo |

## Notas

- Es Server Component (sin `"use client"`).
- `shrink-0` + `border-b`: el `<body>` es columna flex a altura completa; el header no scrollea, el `PageShell` sí.
- Frame: `px-md` + `container-content`. Hover de links: `bg-bg-white-a5`.
- “Admin” va más apagado (`text-text-muted`) que Galería y Enviar.
