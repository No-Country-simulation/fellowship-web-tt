# Design system

Fuente: Foundations del diseño (Figma). Tokens en `app/globals.css`.

El tema por defecto es **oscuro** (marca). `html` usa la clase `dark`.

## Colores

Usar clases Tailwind generadas desde los tokens. Prefijo según categoría:

### Background

| Token | Clase | Hex |
| --- | --- | --- |
| `bg/base` | `bg-bg-base` | `#000115` |
| `bg/surface-1` | `bg-bg-surface-1` | `#030428` |
| `bg/surface-2` | `bg-bg-surface-2` | `#0d0e1f` |
| `bg/surface-3` | `bg-bg-surface-3` | `#12132a` |
| `bg/surface-4` | `bg-bg-surface-4` | `#181932` |
| `bg/alt` | `bg-bg-alt` | `#1e2040` |

También disponibles vía shadcn: `bg-background`, `bg-card`, `bg-muted`, `bg-secondary`.

### Text

| Token | Clase | Hex |
| --- | --- | --- |
| `text/primary` | `text-text-primary` | `#ffffff` |
| `text/secondary` | `text-text-secondary` | `#999999` |
| `text/muted` | `text-text-muted` | `#666666` |

shadcn: `text-foreground`, `text-muted-foreground`.

### Accents

| Token | Clase | Hex |
| --- | --- | --- |
| `accent/cyan` | `bg-accent-cyan` / `text-accent-cyan` | `#02beef` |
| `accent/indigo` | `bg-accent-indigo` / `text-accent-indigo` | `#646cf6` |
| `accent/indigo-light` | `bg-accent-indigo-light` / `text-accent-indigo-light` | `#7983f5` |
| `accent/mint` | `bg-accent-mint` / `text-accent-mint` | `#0cfca7` |
| `accent/olive` | `bg-accent-olive` / `text-accent-olive` | `#c7b000` |

### Brand / border

| Token | Clase / utilidad | Hex |
| --- | --- | --- |
| `brand/gradient-start` | `bg-brand-gradient-start` / primary shadcn | `#fe0096` |
| `brand/gradient-end` | `bg-brand-gradient-end` | `#01249c` |
| Gradiente de marca | `bg-brand-gradient` o `text-brand-gradient` | pink → blue |
| `border/default` | `border-border` | `#2a2c4a` |

```tsx
<span className="text-brand-gradient">evidencia real</span>
<div className="bg-brand-gradient rounded-md p-md" />
```

## Tipografía

Fuentes: **Inter** (UI / headings / body) y **DM Sans** (números y labels de data).

| Estilo | Clase | Spec |
| --- | --- | --- |
| Heading/H1 | `text-heading-1` | Inter Extra Bold 56px |
| Heading/H2 | `text-heading-2` | Inter Bold 36px |
| Heading/H3 | `text-heading-3` | Inter Semi Bold 24px |
| Body/Large | `text-body-large` | Inter Regular 18px |
| Body/Default | `text-body` | Inter Regular 16px |
| Body/Small | `text-body-small` | Inter Regular 14px |
| Label/Overline | `text-overline` | Inter Medium 13px, uppercase |
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

Escala semántica (múltiplos de 8px):

| Token | Clase (ej.) | Valor |
| --- | --- | --- |
| `spacing/xs` | `p-xs`, `gap-xs` | 8px |
| `spacing/sm` | `p-sm`, `gap-sm` | 16px |
| `spacing/md` | `p-md`, `gap-md` | 24px |
| `spacing/lg` | `p-lg`, `gap-lg` | 32px |
| `spacing/xl` | `p-xl`, `gap-xl` | 48px |
| `spacing/2xl` | `p-2xl`, `gap-2xl` | 64px |

## Radius y border

| Token | Uso | Valor |
| --- | --- | --- |
| `radius/sm` | `rounded-sm` | 4px |
| `radius/md` | `rounded-md` | 8px |
| `border/width/default` | `border` | 1px |

## Sombras

| Token | Clase | Uso |
| --- | --- | --- |
| `shadow/card` | `shadow-card` | Elevación base |
| `shadow/card-hover` | `shadow-card-hover` | Hover de card |
| `shadow/glow` | `shadow-glow` | Glow marca (CTA activo) |
| `shadow/pulse-ring` | `shadow-pulse-ring` | Pico de animación de pulso |

## Layout

| Token | Utilidad | Notas |
| --- | --- | --- |
| Contenido máx. desktop | `container-content` | max-width **1080px**, centrado |
| Desktop frame | — | 1440px / 12 col / gutter 24 |
| Mobile frame | — | 390px propuesto / 4 col / gutter 16 |

```tsx
<section className="px-sm md:px-lg">
  <div className="container-content">{/* contenido */}</div>
</section>
```

## shadcn ↔ marca

Los tokens semánticos de shadcn (`primary`, `background`, `muted`, etc.) ya apuntan a la paleta de marca. Preferí:

- **Product UI / componentes shadcn:** `bg-primary`, `text-muted-foreground`, `border-border`
- **Landing / marketing fiel al Figma:** `bg-bg-base`, `text-text-secondary`, `bg-accent-mint`, etc.

## Dónde está definido

Todo vive en `app/globals.css` (`:root` + `@theme inline` + utilidades). No hardcodear hex en JSX salvo casos excepcionales documentados.
