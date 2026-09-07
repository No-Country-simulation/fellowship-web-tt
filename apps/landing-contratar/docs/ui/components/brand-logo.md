# BrandLogo

Wordmark No Country. Linkea a `/`.

**Archivo:** `packages/ui/src/brand-logo.tsx`

Uso previsto: header (152px de ancho) y footer (120px). Asset por app: `/brand/logo-no-country.svg` en `public/`.

## Import

```tsx
import { BrandLogo } from "@repo/ui/brand-logo";
```

## Cuándo usarlo

- Chrome del sitio (header, footer)
- Cualquier lugar que necesite el wordmark clickeable a home

No incrustar el SVG a mano ni usar los PNG viejos de marca en el chrome. No usarlo como ícono decorativo sin link: el componente siempre es un `<Link href="/">`.

La card de Instagram (`next/og` en testimonios) no usa este componente: `next/og` no carga bien el SVG. Ahí sigue el PNG (`public/brand/logo-no-country.png`).

## Props

| Prop | Tipo | Default | Descripción |
| --- | --- | --- | --- |
| `width` | `number` | `152` | Ancho visual en px (header HF). El alto se calcula con ratio 190×32 |
| `priority` | `boolean` | `false` | `priority` de `next/image` (preload). No usar en el header de la landing: el LCP es el H1 del hero. |
| `loading` | `"eager" \| "lazy"` | — | Forzá carga eager sin preload (header). |
| `className` | `string` | — | Clases del `<Link>` |
| `children` | `ReactNode` | — | Texto o marca al lado del logo (p. ej. “Testimonios”) |

El resto de props de `Link` se reenvían, excepto `href` (siempre `/`). Sirve para componer con `SheetClose` en el menú mobile.

## Ejemplos

### Header

```tsx
<BrandLogo loading="eager" />
```

### Header con nombre de producto

```tsx
<BrandLogo loading="eager">
  <span className="text-body-small text-text-secondary">Testimonios</span>
</BrandLogo>
```

### Footer, más chico

```tsx
<BrandLogo width={120} />
```

### Como cierre del Sheet mobile

```tsx
<SheetClose nativeButton={false} render={<BrandLogo loading="eager" />} />
```

## Notas

- `alt="No Country"`. No pasar otro alt: es el wordmark de marca.
- `unoptimized` porque el asset es SVG.
- Cada app tiene que servir `/brand/logo-no-country.svg` desde su `public/`.
- El alto no se pasa por props: `height = round(width * 32 / 190)`.
- Con `children`, el link suma `items-center gap-sm`.
- Es Server Component (sin `"use client"`). Pedí `next` como peer de `@repo/ui`.
