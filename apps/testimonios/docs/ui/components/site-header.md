# SiteHeader

Chrome de la app: logo a la izquierda, nav al centro.

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

Ninguna. Labels y hrefs salen de `lib/nav.ts` (`publicNav`). El subtítulo junto al logo sale de `SITE_NAME` en `lib/site.ts`.

## Uso

```tsx
// app/layout.tsx
<SiteHeader />
{children}
```

## Composición

```
SiteHeader (grid 1fr | auto | 1fr)
├── BrandLogo (eager) + SITE_NAME
├── nav (aria-label="Principal")
│   └── publicNav (Galería, Enviar)
└── columna vacía (mantiene el nav centrado)
```

## Cómo cambiar copy o rutas

Editar `lib/nav.ts` o `lib/site.ts`, no el componente:

| Export | Qué controla |
| --- | --- |
| `publicNav` | Links de galería y envío |
| `SITE_NAME` | Texto al lado del logo |

## Notas

- Es Server Component (sin `"use client"`).
- `shrink-0` + `border-b`: el `<body>` es columna flex a altura completa; el header no scrollea. El scroll lo proporciona el `<main>` de cada página: propio en la galería y de `PageShell` en el formulario y la ficha.
- Frame: `px-md` + `container-content`. Hover de links: `bg-bg-white-a5`.
