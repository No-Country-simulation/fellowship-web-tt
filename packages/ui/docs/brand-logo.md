# BrandLogo

Wordmark No Country. Linkea a `/`.

**Archivo:** `packages/ui/src/brand-logo.tsx`

Uso previsto: header (152px de ancho) y footer (120px). Asset: `/brand/logo-no-country.png` en `public/` de cada app.

## Import

```tsx
import { BrandLogo } from "@repo/ui/brand-logo";
```

## Cuándo usarlo

- Chrome del sitio (header, footer)
- Cualquier lugar que necesite el wordmark **clickeable a home**

No reimplementar el link + `next/image` a mano. El componente siempre es un `<Link href="/">`: no sirve como ícono decorativo ni como título. En esos casos usá el **mismo PNG** con `next/image`, no `BrandLogo`.

No hay SVG del wordmark.

## Props

| Prop | Tipo | Default | Descripción |
| --- | --- | --- | --- |
| `width` | `number` | `152` | Ancho visual en px (header). El alto se calcula con ratio 190×32 |
| `priority` | `boolean` | `false` | `priority` de `next/image` (preload). No usar si el LCP es otro nodo (p. ej. el H1 del hero). |
| `loading` | `"eager" \| "lazy"` | — | Forzá carga eager sin preload (header). |
| `className` | `string` | — | Clases del `<Link>` |
| `src` | `string` | `"/brand/logo-no-country.png"` | Path del wordmark en `public/` de la app |
| `children` | `ReactNode` | — | Texto o marca al lado del logo (p. ej. “Testimonios”) |

El resto de props de `Link` se reenvían, excepto `href` (siempre `/`). Sirve para componer con `SheetClose` en un menú mobile.

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

### Como cierre de un Sheet

```tsx
<SheetClose nativeButton={false} render={<BrandLogo loading="eager" />} />
```

## Notas

- `alt="No Country"`. No pasar otro alt: es el wordmark de marca.
- Cada app tiene que servir `/brand/logo-no-country.png` desde su `public/`.
- El alto no se pasa por props: `height = round(width * 32 / 190)`.
- Con `children`, el link suma `items-center gap-sm`.
- Es Server Component (sin `"use client"`). Pedí `next` como peer de `@repo/ui`.
