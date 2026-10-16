# GalleryHero

Presentación de servidor de la galería pública, con un carrusel cliente independiente. Se utiliza una sola vez en `app/page.tsx`, dentro del `<main>` de la página.

**Archivo:** `components/gallery-hero.tsx`

## Import y uso

```tsx
import { GalleryHero } from "@/components/gallery-hero";

<GalleryHero />
```

## API y composición

No recibe props. El copy provisional se agrupa en `HERO_COPY`, sin modificar las historias publicadas.

- Un único `<h1>` con “Historias de” en blanco y “talento real.” con el degradado de marca.
- Eyebrow con una línea degradada decorativa de 28×2px.
- Descripción y aclaración de moderación.
- Un `Link` a `/enviar`, con `buttonVariants` de `@repo/ui`, únicamente el texto “Enviar testimonio” y foco visible.
- El CTA reutiliza la variante `gradient`: relleno rosa → cyan del token `--gradient-brand`, texto blanco de 16px (`text-base`), `font-medium`, radio `rounded-button` y borde transparente. Conserva 48px de altura mínima; el hover reduce la opacidad al 90% y el foco muestra el halo de la variante compartida (indigo claro). Las transiciones respetan movimiento reducido.
- Un [GalleryHeroCarousel](./gallery-hero-carousel.md) con tres historias ilustrativas locales y navegación manual. Reemplaza la tarjeta informativa anterior.

## Layout y accesibilidad

El fondo oscuro es plano y ocupa todo el ancho. El contenido se centra a un máximo de `70rem` (1120px). Desde `lg`, la segunda columna ocupa `26rem`, con una separación de 32px; desde `xl`, ocupa `28rem`, con 64px de separación. Así el título conserva espacio a 1024px. En pantallas menores el carrusel aparece debajo del texto y el CTA, centrado y limitado a `28rem`.

La sección se identifica mediante el H1; el carrusel tiene su propio nombre accesible. La línea de marca es decorativa. `GalleryHero` sigue siendo un componente de servidor, sin estado ni consultas; solo el carrusel gestiona interacción en el cliente. No recibe datos de Supabase ni modifica la grilla inferior.

Los ejemplos del carrusel están identificados como tales y deben reemplazarse por historias reales autorizadas antes de producción.
