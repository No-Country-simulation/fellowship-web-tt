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
| [GalleryHeroCarousel](./components/gallery-hero-carousel.md) | Hasta tres testimonios publicados, apilados y con navegación manual |
| [TestimonialsGallery](./components/testimonials-gallery.md) | Buscador, filtros, contador y grilla de historias |
| [TestimonialDetail](./components/testimonial-detail.md) | Ficha editorial de servidor, contexto profesional y medios opcionales |
| [TestimonialCapture](./components/testimonial-capture.md) | Foto testimonial a tamaño natural, sin pie visible y con ampliación accesible |
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

`app/page.tsx` obtiene las historias en el servidor y conserva `force-dynamic`. Su `<main>` propio proporciona el scroll vertical y un hero de ancho completo, con contenido centrado de hasta `70rem` (1120px). `PageShell` continúa en el estado de error de la ficha; `/enviar` compone su propio encabezado editorial y `<main>` en `app/enviar/page.tsx`, con ancho `max-w-3xl`. El encabezado se pasa como `children` de servidor a `EnviarForm`: aparece durante los pasos y se retira al mostrar el éxito. En ese estado, `SuccessCard` proporciona el único `h1` y recibe el foco existente.

`GalleryHero` permanece en el servidor e integra `GalleryHeroCarousel`, un componente cliente que recibe hasta tres testimonios de la misma consulta pública de `app/page.tsx`. `selectHeroStories` selecciona en servidor sin reemplazo, con aleatoriedad cuando hay más de tres, y transmite solo `id`, `slug`, `quote`, `fullName`, `typeLabel` y `avatarUrl`. No hay ejemplos ficticios ni consultas adicionales. Con cero publicados, el hero muestra un texto discreto; ante un error, conserva el aviso único de la sección inferior. `TestimonialsGallery` es un límite cliente independiente: recibe únicamente `id`, `slug`, `type`, `typeLabel`, `fullName`, `quote` y `avatarUrl`; busca por nombre o extracto y filtra por categoría en memoria sin consultar nuevamente Supabase. El orden de publicación recibido se conserva.

La grilla usa una columna en mobile, dos desde `md` y tres desde `lg`, con gap de 24px. Los textos provisionales están agrupados en constantes locales en la página y sus componentes. Las historias y avatares de la grilla provienen de los datos publicados.

La sección «Explorá las historias» conserva su `h2` y asociación accesible, con el eyebrow «VOCES DE LA COMUNIDAD» y una línea de degradado de marca encima, separados del título por 24px como en el hero. El contador aparece sobre una única barra de búsqueda y filtros. Hasta `lg`, la búsqueda ocupa la primera fila y los filtros quedan debajo: en una grilla 2 × 2 antes de `sm`, y con ancho natural y wrapping desde `sm`. Desde `lg`, los filtros quedan a la izquierda y el buscador a la derecha, con 288px de ancho y 320px desde `xl`, sin ocupar todo el espacio sobrante.

Al ampliar la fuente, el CTA puede ocupar varias líneas, el hero apila sus columnas si no dispone de `56rem` y la barra permite filas adicionales; sus filtros pasan a una columna si el ancho interior es menor que `14rem`. La sección de exploración permite cortar palabras que excedan su ancho, evitando desbordamientos sin ocultar contenido. La composición anterior se conserva con fuente base de 16px. Los detalles están documentados en cada componente.

## Composición de la ficha

`app/t/[slug]/page.tsx` conserva la consulta, `generateMetadata`, `notFound()` y el estado de error. El resultado exitoso se presenta con `TestimonialDetail`, sin `PageShell` ni `TestimonialCard`. Su único `<main>` mantiene `flex-1 min-h-0 min-w-0 overflow-y-auto`, y todas las secciones comparten el contenedor `max-w-[70rem]` y el padding exterior de la galería.

La historia completa siempre se muestra, incluso cuando coincide con `quote`, con saltos de línea intactos y ancho de lectura de 44rem alineado a la izquierda. Los medios son condicionales y se limitan a 768px en la ficha. Solo `TestimonialCapture` agrega una interacción cliente para ampliar la foto testimonial; utiliza un diálogo nativo sin dependencias adicionales y sin ese límite de ancho. Ver las fichas de ambos componentes para responsive, accesibilidad y limitaciones.
