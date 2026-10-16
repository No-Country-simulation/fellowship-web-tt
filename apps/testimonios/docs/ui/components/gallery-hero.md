# GalleryHero

Presentación estática de la galería pública. Se utiliza una sola vez en `app/page.tsx`, dentro del `<main>` de la página.

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
- Un `<aside>` informativo, con título y el icono `UsersRound` de `lucide-react`; no es interactivo.

## Layout y accesibilidad

El fondo oscuro es plano y ocupa todo el ancho. El contenido se centra a un máximo de `70rem` (1120px); desde `lg`, la tarjeta informativa ocupa una segunda columna de `20rem`. En pantallas menores se apila debajo del texto.

La sección se identifica mediante el H1 y el aside mediante su propio H2. Los iconos y la línea de marca tienen `aria-hidden`. Es un componente de servidor, sin estado, consultas ni recursos decorativos externos.
