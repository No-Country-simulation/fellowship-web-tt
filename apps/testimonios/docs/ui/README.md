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
| [SiteHeader](./components/site-header.md) | Navbar institucional sticky, disclosures y diálogo móvil |
| [SiteFooter](./components/site-footer.md) | Footer institucional de servidor, navegación, redes y destinos pendientes |
| [Propuesta para la web oficial](./official-chrome-improvements.md) | Registro de hallazgos, diferencias deliberadas y QA integral del chrome |
| [GalleryHero](./components/gallery-hero.md) | Landing de captación, CTA y composición del hero |
| [GalleryHeroCarousel](./components/gallery-hero-carousel.md) | Hasta tres testimonios publicados, apilados y con navegación manual |
| [HeroTestimonialCard](./components/hero-testimonial-card.md) | Réplica HTML de la plantilla Canvas Cita, con variantes por tipo |
| [TestimonialsGallery](./components/testimonials-gallery.md) | Buscador, filtros, contador y grilla; temporalmente fuera del home |
| [TestimonialDetail](./components/testimonial-detail.md) | Ficha editorial de servidor, contexto profesional y medios opcionales |
| [TestimonialCapture](./components/testimonial-capture.md) | Foto testimonial a tamaño natural, sin pie visible y con ampliación accesible |
| [PageShell](./components/page-shell.md) | Wrapper de página (`<main>` + título) |
| [TestimonialCard](./components/testimonial-card.md) | Card de resumen para galería y otros usos; no compone la ficha |
| [YoutubeEmbed](./components/youtube-embed.md) | Iframe 16:9 de YouTube |
| [Field](./components/field.md) | Label, hint, error y classes de input |
| [CaptureCropDialog](./components/capture-crop-dialog.md) | Recorte de foto: 16:9 o cuadrado |
| [FormLanguageSelect](./components/form-language-select.md) | Selector ES/PT-BR del formulario y portal al recorte activo |
| [FormHeader](./components/form-header.md) | Marca no navegable y selector único, exclusivo de `/enviar` |

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

## Composición de la landing

El home prioriza la captación hacia `/enviar`. La galería permanece implementada pero no se monta; el carrusel utiliza únicamente publicados y las fichas `/t/[slug]` siguen disponibles. Véase [QA de la landing y comparación con Canvas](./capture-landing-qa.md).

El [QA integral de etapas 1–4](./official-chrome-improvements.md#qa-integral--etapa-4) documenta la matriz responsive, teclado y regresiones de las tres rutas. Distingue pruebas vivas, estados aislados y pendientes manuales; el cierre no equivale a certificación de accesibilidad ni aprobación visual humana.

`app/layout.tsx` conserva HTML/body, fuente, estilos y metadata general. `app/(public)/layout.tsx` compone `SiteHeader`, contenido y `SiteFooter` sin wrappers DOM. Las URLs públicas no cambian. El 404 raíz reutiliza ese layout para URLs inexistentes; el 404 del grupo público hereda su chrome sin duplicarlo. El footer continúa en el flujo del documento y no modifica el scroll ni el bloqueo de los diálogos.

Las etapas 3 y 4 de i18n conectan ES/PT-BR exclusivamente en `/enviar`, con `FormLocaleProvider`, [FormHeader](./components/form-header.md) y un único [FormLanguageSelect](./components/form-language-select.md). Esa ruta no monta navbar/footer institucionales. La introducción consume el contexto y conserva el SVG y su composición; sigue entrando como children a `EnviarForm` y desaparece en éxito. Véase la [auditoría](../form-i18n-audit.md) para metadata, estado, QA y límites de revisión.

`app/(public)/page.tsx` obtiene las historias en el servidor y conserva `force-dynamic`. Su `<main>` propio contiene un hero de ancho completo, con contenido centrado de hasta `70rem` (1120px). `PageShell` continúa en el estado de error de la ficha; `/enviar` resuelve query y metadata en `app/enviar/page.tsx` y conserva su `<main>` de ancho `max-w-3xl` mediante `EnviarExperience`. `EnviarIntro` se pasa como children a `EnviarForm`: aparece durante los pasos y se retira al mostrar el éxito. En ese estado, `SuccessCard` proporciona el único `h1` y recibe el foco existente; el selector permanece disponible.

Las tres rutas usan el scroll del documento. El layout es una columna flexible con altura mínima de `100dvh`; cada `<main>` crece con su contenido y no crea un scroll independiente. El header institucional es sticky y publica su altura real para el offset de scroll. El formulario enfoca pasos y errores sin scroll automático y luego desplaza el documento, descontando la altura real del header y 16px de separación. Su contenedor permite cortar palabras demasiado anchas y sus botones de navegación admiten varias líneas para no depender del antiguo scroll horizontal al ampliar la fuente. Los diálogos modales bloquean el scroll raíz mediante `html:has(dialog:modal)`; `scrollbar-gutter: stable` conserva el ancho al abrirlos y cerrarlos. Los paneles de diálogo mantienen su scroll interno cuando hace falta.

`GalleryHero` permanece en el servidor e integra `GalleryHeroCarousel`, un componente cliente que recibe hasta tres testimonios de la misma consulta pública de `app/(public)/page.tsx`. `selectHeroStories` selecciona sin reemplazo y transmite exclusivamente identidad, slug y datos públicos de presentación; incluye tipo real, país, rol, empresa y profesión anterior cuando existen para la réplica de Cita. No hay ejemplos ficticios ni consultas adicionales. El hero distingue cero publicados y error de carga, manteniendo el CTA. La galería preservada filtra en memoria y no se monta en el home.

Para una futura reutilización, `TestimonialsGallery` conserva su contrato y distribución: una columna en mobile, dos desde `md` y tres desde `lg`, con gap de 24px. No se eliminan historias, componentes ni páginas de detalle al ocultar esa sección.

La barra preservada de `TestimonialsGallery` mantiene búsqueda, filtros y contador para usos futuros. Su API y su distribución se describen en la ficha correspondiente; el home ya no presenta el encabezado «Explorá las historias» ni los estados de esa sección.

Al ampliar la fuente, el CTA puede ocupar varias líneas y el hero apila sus columnas si no dispone de `56rem`. La publicación tiene hasta 340px de ancho, cita limitada visualmente a cinco/seis líneas y autor en filas de nombre, país y puesto. Los textos completos se conservan en el DOM; el nombre muestra elipsis en una línea. Solo los metadatos y la fuente ampliada pueden hacer crecer la tarjeta por encima de la referencia 4:5. Los controles permanecen fuera de su área visual. Los detalles están documentados en cada componente.

## Composición de la ficha

`app/(public)/t/[slug]/page.tsx` conserva la consulta, `generateMetadata`, `notFound()` y el estado de error. El resultado exitoso se presenta con `TestimonialDetail`, sin `PageShell` ni `TestimonialCard`. Su único `<main>` mantiene `flex-1 min-w-0` en el flujo del documento, y todas las secciones comparten el contenedor `max-w-[70rem]` y el padding exterior de la galería.

La historia completa siempre se muestra, incluso cuando coincide con `quote`, con saltos de línea intactos y ancho de lectura de 44rem alineado a la izquierda. Los medios son condicionales y se limitan a 768px en la ficha. Solo `TestimonialCapture` agrega una interacción cliente para ampliar la foto testimonial; utiliza un diálogo nativo sin dependencias adicionales y sin ese límite de ancho. Ver las fichas de ambos componentes para responsive, accesibilidad y limitaciones.
