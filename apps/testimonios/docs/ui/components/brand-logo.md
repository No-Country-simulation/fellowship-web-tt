# BrandLogo

Wordmark No Country. Linkea a `/`.

**Archivo:** `components/brand-logo.tsx`

Uso previsto: header (152px de ancho). Asset: `/brand/logo-no-country.png`. El mismo PNG sirve para `next/og` (la card de Instagram); el SVG no.

## Import

```tsx
import { BrandLogo } from "@/components/brand-logo";
```

## Cuándo usarlo

- Chrome del sitio (header)
- Cualquier lugar que necesite el wordmark clickeable a home

No incrustar el PNG a mano ni usar el SVG viejo. No usarlo como ícono decorativo sin link: el componente siempre es un `<Link href="/">`.

## Props

| Prop | Tipo | Default | Descripción |
| --- | --- | --- | --- |
| `width` | `number` | `152` | Ancho visual en px. El alto se calcula con ratio 190×32 |
| `priority` | `boolean` | `false` | `priority` de `next/image` (preload) |
| `loading` | `"eager" \| "lazy"` | — | Forzá carga eager sin preload (header) |
| `className` | `string` | — | Clases del `<Link>` |
| `children` | `ReactNode` | — | Texto o marca al lado del logo (p. ej. “Testimonios”) |

El resto de props de `Link` se reenvían, excepto `href` (siempre `/`).

## Ejemplos

### Header, con el nombre de la app

```tsx
<BrandLogo loading="eager">
  <span className="text-body-small text-text-secondary">Testimonios</span>
</BrandLogo>
```

### Más chico, sin children

```tsx
<BrandLogo width={120} />
```

## Notas

- `alt="No Country"`. No pasar otro alt: es el wordmark de marca.
- Asset PNG, no SVG: `next/og` no carga bien el SVG embebido.
- El alto no se pasa por props: `height = round(width * 32 / 190)`.
- Es Server Component (sin `"use client"`).
