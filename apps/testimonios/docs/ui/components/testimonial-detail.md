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

Es un componente de servidor. No consulta Supabase. `app/t/[slug]/page.tsx` conserva la obtención de datos, metadata basada en `quote`, `notFound()` y el error con `PageShell`.

## Composición y responsive

- Proporciona el único `<main>` de la ficha: no envolver en `PageShell` ni otro `<main>`. Conserva `flex-1 min-h-0 min-w-0 overflow-y-auto`, necesario porque el body del layout no scrollea.
- Un contenedor `mx-auto w-full max-w-[70rem]` agrupa encabezado, historia, captura, video y cierre. El padding exterior es `px-md` (24px) y `md:px-lg` (32px). No hay columnas vacías ni offsets interiores por sección.
- El relato limita su ancho a `44rem` (704px) y permanece alineado a la izquierda. Se imprime una única vez, siempre, sin comparar con `quote`, con `whitespace-pre-wrap`, 18px e interlineado 1.85. No se divide, recorta ni reescribe el contenido. `wrap-anywhere` evita overflow con palabras o URLs extensas.
- El avatar aparece encima de la información en mobile y a la derecha desde `md` (768px). Usa `next/image`, `alt=""` y un anillo degradado; el nombre es el único `h1`.
- Historia, proyecto y video comparten un `h2` de estilo eyebrow con línea degradada decorativa. El cierre tiene su propio `h2`.
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

- `captureUrl` habilita “El proyecto” y [`TestimonialCapture`](./testimonial-capture.md), con pie que incluye el nombre. La imagen conserva tamaño natural y proporción, sin límite de 288px.
- `youtubeEmbedUrl` habilita “En video” mediante `YoutubeEmbed`, con título específico del participante. La URL se pasa sin transformaciones ni cambios de validación.
- `CLOSING_COPY` agrupa los textos provisionales del título, la descripción y las dos acciones. “Enviar testimonio” enlaza a `/enviar` con `buttonVariants({ variant: "gradient" })`; “Ver más historias” enlaza a `/`.
- Al abrir el diálogo de captura, `.page:has(dialog[open])` bloquea el scroll del main. Al cerrarlo recupera su comportamiento automáticamente, sin mutar el layout ni el body.

## Límites

No usar como tarjeta ni dentro de una grilla. No reemplaza los estados de error o 404 de la página. `quote` sigue disponible para galería y metadata; esta presentación no agrega una cita destacada.
