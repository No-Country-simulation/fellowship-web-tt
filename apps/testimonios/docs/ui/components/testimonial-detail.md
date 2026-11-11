# TestimonialDetail

Composición editorial de la ficha pública `/t/[slug]`. Recibe datos ya resueltos y presenta al participante, su historia completa, los medios disponibles y las acciones de cierre.

**Archivos:** `components/testimonial-detail.tsx` y `components/testimonial-detail.module.css`.

## Import y uso

```tsx
import { TestimonialDetail } from "@/components/testimonial-detail";

<TestimonialDetail testimonial={testimonial} />;
```

| Prop | Tipo | Descripción |
| --- | --- | --- |
| `testimonial` | `PublicTestimonial` | Testimonio publicado obtenido por la página |

Es un componente de servidor. No consulta Supabase. `app/(public)/t/[slug]/page.tsx` conserva la obtención de datos, metadata basada en `quote`, `notFound()` y el error con `PageShell`.

## Composición y responsive

- Proporciona el único `<main>` de la ficha: no envolver en `PageShell` ni otro `<main>`. Conserva `flex-1 min-w-0`, crece con el contenido y utiliza el scroll del documento.
- Un contenedor `mx-auto w-full max-w-[70rem]` agrupa encabezado, historia, foto testimonial, video y cierre. El padding exterior es `px-md` (24px) y `md:px-lg` (32px). No hay columnas vacías ni offsets interiores por sección.
- El relato limita su ancho a `44rem` (704px) y permanece alineado a la izquierda. Se imprime una única vez, siempre, sin comparar con `quote`, con `whitespace-pre-wrap`, 18px e interlineado 1.85. No se divide, recorta ni reescribe el contenido. `wrap-anywhere` evita overflow con palabras o URLs extensas.
- El avatar aparece encima de la información en mobile y a la derecha desde `md` (768px). Usa `next/image`, `alt=""` y un anillo degradado; el nombre es el único `h1`.
- Historia, foto testimonial y video comparten un `h2` de estilo eyebrow con línea degradada decorativa. El cierre tiene su propio `h2`.
- Las acciones se apilan en mobile, admiten wrapping desde `sm` y acompañan el texto del cierre desde `lg`. Los controles tienen al menos 44px de alto y foco visible.
- Los colores, la tipografía y los espacios reutilizan los tokens vigentes. El CSS Module limita la iluminación del encabezado y los acentos del cierre a esta ficha; no modifica estilos globales.

## Contexto profesional

| Categoría | Chips |
| --- | --- |
| `simulation` | `simulation.primary_role` |
| `first_job` | `firstJob.role_achieved` y `firstJob.company`, si existen |
| `career_change` | `careerChange.previous_profession` → `careerChange.new_role` |

Se usa `testimonial.typeLabel` como categoría visible. Los chips se eligen según `testimonial.type` y omiten valores vacíos. Solo aparece la flecha cuando existen ambos extremos. Las etiquetas ocultas identifican profesión anterior, nuevo rol y empresa para lectores de pantalla. Si el payload viene incompleto o nulo, se muestra únicamente lo que recibió el componente; no se recuperan ni inventan datos descartados por el adaptador existente.

País y fecha son opcionales; el separador requiere ambos. La fecha conserva `formatPublishedAt` y usa `<time dateTime={publishedAt}>`.

## Medios y cierre

- `captureUrl` habilita “Foto testimonial” y [`TestimonialCapture`](./testimonial-capture.md), sin pie visible. El encabezado y `aria-labelledby` usan `testimonial-photo-title`; la imagen y su ampliación conservan nombres accesibles específicos del participante.
- Foto y video tienen contenedores `mt-md w-full max-w-3xl`: máximo 48rem (768px), alineados a la izquierda con la historia y a todo el ancho disponible en mobile. El límite pertenece a esta ficha, sin cambiar otros usos de los componentes.
- La foto conserva proporciones y dimensiones intrínsecas: no se recortan archivos verticales o cuadrados ni se amplían imágenes pequeñas. El marco interno se ajusta al ancho disponible.
- `youtubeEmbedUrl` habilita “En video” mediante `YoutubeEmbed`, con proporción 16:9 y título específico del participante. La URL, los permisos y `allowFullScreen` se conservan sin cambios.
- `CLOSING_COPY` agrupa el título, la descripción y las dos acciones. «Compartir mi testimonio» enlaza a `/enviar` con `buttonVariants({ variant: "gradient" })`; «Volver al inicio» enlaza a la landing `/`. El enlace superior y el retorno desde el error de carga también dicen «Volver al inicio», porque el home ya no muestra la galería.
- El diálogo de la foto conserva su límite de viewport: no hereda el máximo de 768px de la vista integrada. La regla global `html:has(dialog:modal)` bloquea el scroll del documento mientras está abierto; `scrollbar-gutter: stable` evita cambios de ancho. Al cerrar, se retira el bloqueo sin cambiar la posición ni la gestión de foco del componente.

El máximo CSS cambia solamente el tamaño de visualización. No reduce la resolución del archivo ni los bytes descargados: vista integrada y diálogo conservan la misma URL pública. Una miniatura independiente requeriría evaluar variantes y procesamiento como mejora futura; este componente no transforma URLs ni modifica Storage.

## Límites

No usar como tarjeta ni dentro de una grilla. No reemplaza los estados de error o 404 de la página. `quote` sigue disponible para galería y metadata; esta presentación no agrega una cita destacada.
