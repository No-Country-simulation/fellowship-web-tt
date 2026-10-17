# GalleryHero

Presentación de servidor de la galería pública, con un carrusel cliente independiente. Se utiliza una sola vez en `app/page.tsx`, dentro del `<main>` de la página.

**Archivos:** `components/gallery-hero.tsx` y `components/gallery-hero.module.css`.

## Import y uso

```tsx
import { GalleryHero } from "@/components/gallery-hero";

<GalleryHero />
```

## API y composición

No recibe props. El copy provisional se agrupa en `HERO_COPY`, sin modificar las historias publicadas.

- Un único `<h1>` con “Historias de” en blanco y “talento real.” con el degradado de marca.
- Eyebrow con una línea degradada decorativa de 28×2px.
- Descripción existente, seguida del CTA con 24px de separación (`mt-md`).
- Un `Link` a `/enviar`, con `buttonVariants` de `@repo/ui`, únicamente el texto “Enviar testimonio” y foco visible.
- El CTA reutiliza la variante `gradient`: relleno rosa → cyan del token `--gradient-brand`, texto blanco de 16px (`text-base`), `font-medium`, radio `rounded-button` y borde transparente. Conserva 48px de altura mínima; el hover reduce la opacidad al 90% y el foco muestra el halo de la variante compartida (indigo claro). Las transiciones respetan movimiento reducido.
- Un [GalleryHeroCarousel](./gallery-hero-carousel.md) con tres historias ilustrativas locales y navegación manual. Reemplaza la tarjeta informativa anterior.

## Layout y accesibilidad

El fondo reproduce la decoración de `preview_hero_opcion_b_simplificado.html`, reemplazando las elipses con bordes CSS y los puntos aislados de la iteración anterior. Un SVG inline con `viewBox="0 0 1440 550"` conserva los dos trazos Bézier de la maqueta (cálido inferior y cyan derecho), sus grosores de 1.4/1.2 y opacidades de 0.78/0.62.

Los halos magenta/violeta de la izquierda y parte inferior, la iluminación azul del carrusel y el acento superior derecho usan las cinco superficies elípticas y gradientes del SVG aprobado. Un único blur de 26 unidades suaviza el halo central, con región de filtro acotada. Los colores se derivan de los tokens locales mediante `color-mix` y tonos HSL relativos al cyan de marca; posiciones, radios y opacidades parten de la referencia. El fondo base combina gradientes CSS.

Dos grupos de puntos a la derecha conservan el paso de 28px y la máscara de opacidad progresiva de la maqueta. Hasta 930px, el SVG se amplía al 170 %, se desplaza a -35 % y reduce su opacidad a 0.8; hasta 600px, pasa a 250 % / -115 % / 0.57 y se ocultan los puntos. Estos cortes afectan solo a la decoración, sin cambiar los breakpoints del layout. No incorpora imágenes rasterizadas, animaciones ni JavaScript de interacción.

La decoración vive en una capa absoluta con `aria-hidden` y `pointer-events: none`, aislada detrás del contenido mediante `isolation` y `z-index: -1`. Solo esa capa recorta sus formas con `overflow: clip`: el hero conserva el espacio para las tarjetas y los indicadores de foco.

Se conserva la composición del hero, el diseño del CTA y el comportamiento del carrusel. El contenido se centra a un máximo de `70rem` (1120px). Desde `lg`, la segunda columna ocupa `26rem`, con una separación de 32px; desde `xl`, ocupa `28rem`, con 64px de separación. Así el título conserva espacio a 1024px. En pantallas menores el carrusel aparece debajo del texto y el CTA, centrado y limitado a `28rem`.

La sección se identifica mediante el H1; el carrusel tiene su propio nombre accesible. La línea de marca es decorativa. `GalleryHero` sigue siendo un componente de servidor, sin estado ni consultas; solo el carrusel gestiona interacción en el cliente. No recibe datos de Supabase ni modifica la grilla inferior.

El carrusel conserva una aclaración de contenido ilustrativo para lectores de pantalla, sin pie visual. Los ejemplos locales son exclusivamente para desarrollo y revisión; deben reemplazarse por historias reales autorizadas antes de producción.
