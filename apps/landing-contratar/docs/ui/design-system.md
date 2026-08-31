# Design system

Fuente: Foundations Figma (actualizado **21/08**). Tokens en `app/globals.css`.

El tema por defecto es **oscuro** (marca). `html` usa la clase `dark`. Bandas claras: `surface="light"` en `Section` (`[data-surface=light]`).

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
| `bg/marketing-base` | `bg-bg-marketing-base` | alias de `bg/base` |
| `bg/marketing-surface` | `bg-bg-marketing-surface` | alias de `bg/surface-2` |
| `bg/marketing-light` | `bg-bg-marketing-light` | `#e9ecf5` |
| `bg/brand-subtle` | `bg-bg-brand-subtle` | `#ff00940d` (pink ~5%) |
| `bg/white-a5` | `bg-bg-white-a5` | `#ffffff0d` (white ~5%; hover de nav) |
| `bg/pink-a10` | `bg-bg-pink-a10` | `#ff00941a` (pink ~10%; hover de “Iniciar Sesión”) |

También disponibles vía shadcn: `bg-background`, `bg-card`, `bg-muted`, `bg-secondary`.

### Text / neutral

| Token | Clase | Hex |
| --- | --- | --- |
| `text/primary` | `text-text-primary` | `#ffffff` |
| `text/secondary` | `text-text-secondary` | `#999999` |
| `text/muted` | `text-text-muted` | `#666666` |
| `text/warm-white` | `text-text-warm-white` | `#fafaf8` |
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
| Brand Gradient Primary | `bg-brand-gradient` o `text-brand-gradient` | `#fe0096` → `#02beef` |
| Brand Gradient Secondary | `bg-brand-gradient-secondary` | mismos 2 tonos al 10% (wash/glow) |
| `brand/gradient-start` | `bg-brand-gradient-start` | `#fe0096` (`pink/500`) |
| `brand/gradient-end` | `bg-brand-gradient-end` | `#02beef` (`cyan/500`) |
| `brand/pink` | `bg-brand-pink` | alias de `gradient-start` |
| `brand/cyan` | `bg-brand-cyan` | alias de `gradient-end` |
| `brand/violet` | `bg-brand-violet` | `#a855f7` (legado; no está en la paleta 21/08) |
| `border/default` | `border-border` | `#2a2c4a` |
| `border/subtle` | `border-border-subtle` | `#1d283a` |
| `border/soft` | `border-border-soft` | `#cccccc` |
| `border/emphasis` | `border-border-emphasis` | `#ff00940d` |

```tsx
<span className="text-brand-gradient">evidencia real</span>
<div className="bg-brand-gradient rounded-md p-md" />
<div className="bg-brand-gradient-secondary" />
```

### Superficie clara

No es un tema global. `Section surface="light"` remapea los tokens de trabajo para que `text-text-primary`, `bg-bg-base` y `border-border` pinten la paleta on-light:

| Token on-light | Remapea a | Hex |
| --- | --- | --- |
| `bg/marketing-light` | `--bg-base` (fondo de banda) | `#e9ecf5` |
| `text/on-light-primary` | `--text-primary` | `#000115` |
| `text/on-light-secondary` | `--text-secondary` | `#666666` |
| `text/on-light-muted` | `--text-muted` | `#999999` |
| `border/on-light` | `--border-default` | `#cccccc` |

Las superficies internas (`bg-bg-surface-*`) pasan a blanco. Los acentos de marca no se oscurecen.

`[data-surface=light]` pone `color: var(--text-on-light-primary)` en el host. Ese `color` gana a utilidades como `text-white`, así que `bg-brand-gradient` (CTA `gradient`) fuerza blanco otra vez en `globals.css`.

También disponibles como clases directas: `bg-bg-marketing-light`, `text-text-on-light-primary`, `border-border-on-light`.

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
| Ancho de copy | `max-w-xl` / `max-w-3xl` | 36rem / 48rem (escala container; **no** es `spacing/xl`) |
| Starfield | `bg-starfield` | Fondo del `body` (`Background-space.svg`) |
| Mapa | `bg-landing-map` | Contenedor de la sección Perfiles. El SVG (`Background-map.svg`) se carga lazy, no como `background-image` de CSS |
| Chip de perfil | `profile-chip` | Roles/conocimientos en Profiles. Color vía `--chip-accent` |
| Capturas de producto | `/public/product/*` | Cómo funciona: `perfil-*.webp` (`quality={90}`, allowlist en `next.config.ts`). Hero: fichas HTML + `avatar-*.webp` (hexágono `.hero-profile-avatar`, `unoptimized`). Quotes: avatares SVG. Logos en SVG |
| Iconos sociales | `/public/brand/icon-*.svg` | Footer (LinkedIn, Instagram, WhatsApp). `unoptimized`; no re-inlinear el SVG |
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

`--primary` es el rosa del gradiente (`#fe0096`).

## Dónde está definido

Todo vive en `app/globals.css` (`:root` + `@theme inline` + utilidades). No hardcodear hex en JSX salvo casos excepcionales documentados.
