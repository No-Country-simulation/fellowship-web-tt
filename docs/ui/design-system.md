# Design system

Fuente: Foundations Figma (actualizado **12/08**). Tokens en `app/globals.css`.

El tema por defecto es **oscuro** (marca). `html` usa la clase `dark`.

## Colores

Usar clases Tailwind generadas desde los tokens. Prefijo según categoría:

### Background

| Token | Clase | Hex |
| --- | --- | --- |
| `bg/base` | `bg-bg-base` | `#000115` |
| `bg/base-real` | `bg-bg-base-real` | `#030711` |
| `bg/surface-1` | `bg-bg-surface-1` | `#030428` |
| `bg/surface-2` | `bg-bg-surface-2` | `#0d0e1f` |
| `bg/surface-3` | `bg-bg-surface-3` | `#12132a` |
| `bg/surface-4` | `bg-bg-surface-4` | `#181932` |
| `bg/alt` | `bg-bg-alt` | `#1e2040` |
| `bg/alt-real` | `bg-bg-alt-real` | `#0f1629` |

También disponibles vía shadcn: `bg-background`, `bg-card`, `bg-muted`, `bg-secondary`.

### Text / neutral

| Token | Clase | Hex |
| --- | --- | --- |
| `text/primary` | `text-text-primary` | `#ffffff` |
| `text/secondary` | `text-text-secondary` | `#999999` |
| `text/muted` | `text-text-muted` | `#666666` |
| `neutral/900` | `bg-neutral-900` / `text-neutral-900` | `#3f3f46` |
| `neutral/100` | `bg-neutral-100` / `text-neutral-100` | `#f8fafc` |

shadcn: `text-foreground`, `text-muted-foreground`.

### Accents

| Token | Clase | Hex |
| --- | --- | --- |
| `accent/cyan` | `bg-accent-cyan` / `text-accent-cyan` | `#02beef` |
| `accent/indigo` | `bg-accent-indigo` / `text-accent-indigo` | `#646cf6` |
| `accent/indigo-light` | `bg-accent-indigo-light` / `text-accent-indigo-light` | `#7983f5` |
| `accent/mint` | `bg-accent-mint` / `text-accent-mint` | `#0cfca7` |
| `accent/olive` | `bg-accent-olive` / `text-accent-olive` | `#c7b000` |
| `accent/orange` | `bg-accent-orange` / `text-accent-orange` | `#f97316` |
| `accent/yellow` | `bg-accent-yellow` / `text-accent-yellow` | `#fcd34d` |
| `accent/red` | `bg-accent-red` / `text-accent-red` | `#ef4444` |

### Brand / border

| Token | Clase / utilidad | Hex |
| --- | --- | --- |
| Brand Gradient Primary | `bg-brand-gradient` o `text-brand-gradient` | `#ec4899` → `#a855f7` → `#06b6d4` |
| Brand Gradient Secondary | `bg-brand-gradient-secondary` | mismos 3 tonos al 10% (wash/glow) |
| `brand/pink` | `bg-brand-pink` | `#ec4899` |
| `brand/violet` | `bg-brand-violet` | `#a855f7` |
| `brand/cyan` | `bg-brand-cyan` | `#06b6d4` |
| `brand/gradient-start` | `bg-brand-gradient-start` | `#fe0096` (primitivo; **no** pinta el gradiente) |
| `brand/gradient-end` | `bg-brand-gradient-end` | `#01249c` (primitivo; **no** pinta el gradiente) |
| `border/default` | `border-border` | `#2a2c4a` |

```tsx
<span className="text-brand-gradient">evidencia real</span>
<div className="bg-brand-gradient rounded-md p-md" />
<div className="bg-brand-gradient-secondary" />
```

No usar `pink/500` (`#FE0096`) ni `blue/900` (`#01249C`) para el gradiente de marca: quedaron desactualizados el 12/08.

## Tipografía

Familia única: **DM Sans**. Inter quedó desvinculado el 12/08 y no se usa en ningún Text Style.

H1/H2 usan `clamp` en mobile para no desbordar; en desktop llegan a 76px / 48px.

| Estilo | Clase | Spec |
| --- | --- | --- |
| Heading/H1 | `text-heading-1` | DM Sans Extra Bold 76px |
| Heading/H2 | `text-heading-2` | DM Sans Bold 48px |
| Heading/H3 | `text-heading-3` | DM Sans Semi Bold 24px |
| Body/Large | `text-body-large` | DM Sans Regular 18px |
| Body/Default | `text-body` | DM Sans Regular 16px |
| Body/Small | `text-body-small` | DM Sans Regular 14px |
| Label/Overline | `text-overline` | DM Sans Medium 13px, uppercase |
| Data/Number | `text-data-number` | DM Sans Bold 32px |
| Data/Label | `text-data-label` | DM Sans Medium 14px |

```tsx
<h1 className="text-heading-1 text-text-primary">Título</h1>
<p className="text-body-large text-text-secondary">Soporte</p>
<p className="text-overline text-text-secondary">Sección</p>
<span className="text-data-number">4</span>
<span className="text-data-label">acuerdos</span>
```

## Spacing

Escala semántica (múltiplos de 8px). `xs` y `2xl` confirmados; intermedios y `3xl` propuestos:

| Token | Clase (ej.) | Valor |
| --- | --- | --- |
| `spacing/xs` | `p-xs`, `gap-xs` | 8px |
| `spacing/sm` | `p-sm`, `gap-sm` | 16px |
| `spacing/md` | `p-md`, `gap-md` | 24px |
| `spacing/lg` | `p-lg`, `gap-lg` | 32px |
| `spacing/xl` | `p-xl`, `gap-xl` | 48px |
| `spacing/2xl` | `p-2xl`, `gap-2xl` | 64px |
| `spacing/3xl` | `p-3xl`, `gap-3xl` | 80px |

## Radius y border

| Token | Uso | Valor |
| --- | --- | --- |
| `radius/sm` | `rounded-sm` | 4px |
| `radius/button` | `rounded-button` | 6px |
| `radius/md` | `rounded-md` | 8px |
| `radius/lg` | `rounded-lg` | 32px (cards / contenedores grandes) |
| `border/width/default` | `border` | 1px |
| `border/width/thick` | `border-thick` | 2px |

`Button` usa `rounded-button` (6px). No usar `rounded-lg` en botones: en este sistema `lg` es 32px.

## Sombras

| Token | Clase | Uso |
| --- | --- | --- |
| `shadow/card` | `shadow-card` | Elevación base (`0 1px 2px` / 5%) |
| `shadow/card-hover` | `shadow-card-hover` | Hover de card (`0 2px 6px` / 12%) |
| `shadow/glow` | `shadow-glow` | Glow marca (CTA activo, pink 35%) |
| `shadow/pulse-ring` | `shadow-pulse-ring` | Pico de animación de pulso (pink 45%) |

## Layout

| Token | Utilidad | Notas |
| --- | --- | --- |
| Contenido máx. desktop | `container-content` | max-width **1280px**, centrado |
| Desktop frame | — | 1440px / 12 col / gutter 32 (`spacing/lg`) / margen 80px (`spacing/3xl`) |
| Mobile frame | — | 390px propuesto / 4 col / gutter 16 (`spacing/sm`) / margen 24px (`spacing/md`) |

```tsx
<section className="px-md md:px-3xl">
  <div className="container-content">{/* contenido */}</div>
</section>
```

## shadcn ↔ marca

Los tokens semánticos de shadcn (`primary`, `background`, `muted`, etc.) ya apuntan a la paleta de marca. Preferí:

- **Product UI / componentes shadcn:** `bg-primary`, `text-muted-foreground`, `border-border`
- **Landing / marketing fiel al Figma:** `bg-bg-base`, `text-text-secondary`, `bg-accent-mint`, etc.

`--primary` es el rosa del gradiente corregido (`#ec4899`), no el primitivo `#fe0096`.

## Dónde está definido

Todo vive en `app/globals.css` (`:root` + `@theme inline` + utilidades). No hardcodear hex en JSX salvo casos excepcionales documentados.
