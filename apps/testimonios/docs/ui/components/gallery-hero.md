# GalleryHero

Landing de captación: invita al talento a compartir su experiencia en `/enviar`. Componente de servidor; el carrusel independiente aporta las historias publicadas como soporte visual.

**Archivos:** `components/gallery-hero.tsx` y `components/gallery-hero.module.css`.

## Uso y contrato

```tsx
<GalleryHero stories={heroStories} />
```

`stories: readonly HeroStory[] | null` procede de la única consulta pública de `app/(public)/page.tsx`. `[]` significa cero publicados; `null` significa error de carga. El hero no consulta datos ni transforma historias.

El copy usa español neutro latinoamericano:

- H1: «Tu experiencia merece ser compartida.»
- Descripción: «Comparte tu historia con No Country, destaca tu recorrido profesional y ten la oportunidad de ganar visibilidad en nuestros canales oficiales.»
- CTA: «Compartir mi testimonio», dirigido a `/enviar`.

El mensaje expresa una oportunidad, sin prometer publicación automática ni visibilidad garantizada. La metadata específica del home es «Comparte tu testimonio · No Country», con descripción de captación. Las fichas conservan su metadata individual.

## Composición y estados

El home monta exclusivamente este hero dentro de su `main`: la grilla, búsqueda, filtros, contador y estados de exploración están temporalmente fuera del árbol de renderizado. `TestimonialsGallery`, `TestimonialCard`, sus utilidades y las fichas `/t/[slug]` permanecen disponibles. No hay redirecciones.

- Con publicados: [GalleryHeroCarousel](./gallery-hero-carousel.md), con hasta tres historias reales.
- Cero publicados: texto «Tu historia puede inspirar a otras personas de la comunidad.», sin tarjetas ni controles.
- Error: estado discreto «En este momento no se pueden mostrar las historias de la comunidad.», sin fingir una lista vacía. El CTA permanece disponible.

Sin historias no se reserva una columna vacía para el carrusel. En la ficha, los enlaces al home dicen «Volver al inicio».

## Responsive y accesibilidad

Se conserva la decoración institucional: SVG con `viewBox="0 0 1440 550"`, trazos Bézier, halos, blur y puntos. Solo la capa decorativa usa `overflow: clip`; es `aria-hidden` y no intercepta eventos. No se añaden animaciones de fondo.

Ancho máximo de contenido: `70rem`. Desde `lg`, con al menos `56rem` disponibles, las columnas son texto flexible y una reserva de **372px** para el carrusel, con 32px de separación; desde `xl`, la separación horizontal es de 64px. La tarjeta mide hasta **340px**, con 32px adicionales solo para la pila de tres. El ancho menor concede más espacio y protagonismo al título y CTA.

En tablet, móvil o con fuente ampliada que impida esas columnas, el carrusel aparece debajo del CTA. Se centra en su columna y conserva sus herramientas alineadas por debajo. Con fuente normal, el 4:5 produce normalmente 340×425px; el extracto de cinco/seis líneas evita que una cita extensa alargue toda la pila. Metadatos extensos y fuente ampliada pueden aumentar la altura sin recortar encabezado o autor. No se modifica el copy aprobado ni se añade scroll interno.

El padding horizontal del hero se limita a 24px en móvil y 32px desde tablet, aunque aumente la fuente. Así no se estrecha progresivamente la columna de lectura al ampliar el texto. El avatar y el padding de la publicación también tienen límites independientes del tamaño tipográfico.

El título tiene un único H1, wrapping natural y destacado con el degradado de marca. El CTA conserva la variante compartida `gradient`, foco visible, altura mínima de 48px, wrapping y altura automática. El carrusel tiene un nombre accesible propio.

La consulta pública y `force-dynamic` se conservan. No se añaden consultas, imágenes PNG remotas, credenciales ni datos administrativos al contrato cliente. La selección aleatoria continúa exclusivamente en servidor.

La tarjeta es una [réplica HTML de Cita](./hero-testimonial-card.md), no un PNG final publicado. Véase [QA y capturas comparativas](../capture-landing-qa.md).
