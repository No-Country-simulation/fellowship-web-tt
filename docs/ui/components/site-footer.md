# SiteFooter

Chrome del sitio: 4 columnas en el container + copyright. Sin overflow horizontal.

**Archivo:** `components/site-footer.tsx`

Se monta una sola vez en `app/layout.tsx`. No instanciarlo en páginas ni en bloques de landing.

## Import

```tsx
import { SiteFooter } from "@/components/site-footer";
```

## Cuándo usarlo

- Solo en el root layout. Cualquier página nueva hereda header y footer.

No rearmar las columnas a mano. Para el wordmark aislado usá `BrandLogo`. Para un divisor suelto, `Separator`.

## Props

Ninguna. Labels, hrefs, tagline y copyright salen de `lib/nav.ts`.

## Uso

```tsx
// app/layout.tsx
<SiteHeader />
{children}
<SiteFooter />
```

## Composición

```
SiteFooter
├── Navegación     ← footerNavegacion
├── Plataforma     ← footerPlataforma
├── Síguenos       ← LinkedIn, Instagram, WhatsApp
├── BrandLogo + tagline
├── Separator
└── Copyright
```

Grid: 1 col mobile, 2 desde `sm`, 4 desde `lg`.

## Cómo cambiar copy o rutas

Editar `lib/nav.ts`, no el componente:

| Export | Qué controla |
| --- | --- |
| `footerNavegacion` | Columna Navegación |
| `footerPlataforma` | Columna Plataforma |
| `footerTagline` | Texto junto al logo |
| `footerCopyright` | Línea inferior |
| `linkedinUrl` / `instagramUrl` / `whatsappUrl` | Redes (URLs reales) |

## Notas

- Es Server Component (sin `"use client"`).
- Logo del footer: `BrandLogo` a 120px de ancho.
- Iconos sociales: `/brand/icon-linkedin.svg`, `/brand/icon-instagram.svg`, `/brand/icon-whatsapp.svg` (`next/image`, 24px, `unoptimized`). `aria-label` en el `<a>`, `alt=""` en el glyph. No re-inlinear SVG.
- Externos abren en nueva pestaña (`rel="noopener noreferrer"`).
