# BrandLogo

Wordmark No Country. Linkea a `/`.

**Archivo:** `components/brand-logo.tsx`

Uso previsto: header (152px de ancho) y footer (120px). Asset: `/brand/logo-no-country.svg`.

## Import

```tsx
import { BrandLogo } from "@/components/brand-logo";
```

## Cuándo usarlo

- Chrome del sitio (header, footer)
- Cualquier lugar que necesite el wordmark clickeable a home

No incrustar el SVG a mano ni usar los PNG viejos de marca. No usarlo como ícono decorativo sin link: el componente siempre es un `<Link href="/">`.

## Props

| Prop | Tipo | Default | Descripción |
| --- | --- | --- | --- |
| `width` | `number` | `152` | Ancho visual en px (header HF). El alto se calcula con ratio 190×32 |
| `priority` | `boolean` | `false` | `priority` de `next/image` (poner `true` en el header) |
| `className` | `string` | — | Clases del `<Link>` |

## Ejemplos

### Header (LCP)

```tsx
<BrandLogo priority />
```

### Footer, más chico

```tsx
<BrandLogo width={120} />
```

## Notas

- `alt="No Country"`. No pasar otro alt: es el wordmark de marca.
- `unoptimized` porque el asset es SVG.
- El alto no se pasa por props: `height = round(width * 32 / 190)`.
- Es Server Component (sin `"use client"`).
