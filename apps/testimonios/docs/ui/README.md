# UI — guía para el equipo

Documentación de los componentes reutilizables de `apps/testimonios`.

**Objetivo:** cualquier dev puede armar galería, ficha o form sin reimplementar chrome ni cards.

Tokens y type scale: [design system de la landing](../../../landing-contratar/docs/ui/design-system.md). Compartidos en `@repo/ui`: [Button](../../../../packages/ui/docs/button.md), [BrandLogo](../../../../packages/ui/docs/brand-logo.md).

El design system de Landing es una referencia interna. Los tokens y utilities vigentes de Testimonios se definen en su propio [`app/globals.css`](../../app/globals.css), actualizado parcialmente según la identidad actual de No Country.

El formulario de página (`enviar-form`) no se documenta acá: es de una ruta, no un primitivo.

## Índice

| Recurso | Descripción |
| --- | --- |
| [Button](../../../../packages/ui/docs/button.md) | Variantes, sizes — `@repo/ui` |
| [BrandLogo](../../../../packages/ui/docs/brand-logo.md) | Wordmark No Country — `@repo/ui` ([uso local](./components/brand-logo.md)) |
| [SiteHeader](./components/site-header.md) | Chrome del layout (logo y nav) |
| [GalleryHero](./components/gallery-hero.md) | Presentación de servidor, CTA y composición del hero |
| [GalleryHeroCarousel](./components/gallery-hero-carousel.md) | Carrusel cliente de tres historias ilustrativas apiladas |
| [TestimonialsGallery](./components/testimonials-gallery.md) | Filtros, contador y grilla de historias |
| [TestimonialDetail](./components/testimonial-detail.md) | Ficha editorial de servidor, contexto profesional y medios opcionales |
| [TestimonialCapture](./components/testimonial-capture.md) | Captura a tamaño natural y ampliación en diálogo accesible |
| [PageShell](./components/page-shell.md) | Wrapper de página (`<main>` + título) |
| [TestimonialCard](./components/testimonial-card.md) | Card de resumen para galería y otros usos; no compone la ficha |
| [YoutubeEmbed](./components/youtube-embed.md) | Iframe 16:9 de YouTube |
| [Field](./components/field.md) | Label, hint, error y classes de input |
| [CaptureCropDialog](./components/capture-crop-dialog.md) | Recorte de foto: 16:9 o cuadrado |

## Convención al agregar un componente

Cada chrome/producto reutilizable nuevo en `components/` debe incluir:

1. **Archivo de docs** en `docs/ui/components/<nombre>.md` con:
   - Para qué sirve
   - Import
   - Props / variantes
   - Ejemplos de uso
   - Notas (a11y, limitaciones, cuándo no usarlo)
2. **Entrada en esta tabla** (índice de arriba)
3. **JSDoc breve** en el export del componente (para IntelliSense en el IDE)

Si el componente lo van a usar dos apps, va en `packages/ui` y la ficha canónica en `packages/ui/docs/`. Esta app solo linkea y anota uso local.

No documentar formularios de una sola ruta ni utilidades no-UI (`lib/`).

### Paths

| Alias | Dónde |
| --- | --- |
| `@repo/ui/button` | Button — ficha en [`packages/ui/docs/button.md`](../../../../packages/ui/docs/button.md) |
| `@repo/ui/brand-logo` | Wordmark — ficha en [`packages/ui/docs/brand-logo.md`](../../../../packages/ui/docs/brand-logo.md) |
| `@/components` | componentes de producto |
| `@/lib/utils` | `cn()` |

Tokens y utilidades visuales viven en `app/globals.css` (incluye el scrollbar fino: thumb `border`, hover cyan).

## Composición de la galería

`app/page.tsx` obtiene las historias en el servidor y conserva `force-dynamic`. Su `<main>` propio proporciona el scroll vertical y un hero de ancho completo, con contenido centrado de hasta `70rem` (1120px). `PageShell` continúa en el formulario y en el estado de error de la ficha.

`GalleryHero` permanece en el servidor e integra `GalleryHeroCarousel`, un componente cliente con ejemplos locales identificados como ilustrativos, pendientes de reemplazo por historias autorizadas antes de producción. `TestimonialsGallery` es un límite cliente independiente: recibe únicamente `id`, `slug`, `type`, `typeLabel`, `fullName`, `quote` y `avatarUrl`; filtra en memoria sin consultar nuevamente Supabase. El orden de publicación recibido se conserva.

La grilla usa una columna en mobile, dos desde `md` y tres desde `lg`, con gap de 24px. Los textos provisionales están agrupados en constantes locales en la página y sus componentes. Las historias y avatares de la grilla provienen de los datos publicados.

## Composición de la ficha

`app/t/[slug]/page.tsx` conserva la consulta, `generateMetadata`, `notFound()` y el estado de error. El resultado exitoso se presenta con `TestimonialDetail`, sin `PageShell` ni `TestimonialCard`. Su único `<main>` mantiene `flex-1 min-h-0 min-w-0 overflow-y-auto`, y todas las secciones comparten el contenedor `max-w-[70rem]` y el padding exterior de la galería.

La historia completa siempre se muestra, incluso cuando coincide con `quote`, con saltos de línea intactos y ancho de lectura de 44rem alineado a la izquierda. Los medios son condicionales. Solo `TestimonialCapture` agrega una interacción cliente para ampliar la captura; utiliza un diálogo nativo sin dependencias adicionales. Ver las fichas de ambos componentes para responsive, accesibilidad y limitaciones.
