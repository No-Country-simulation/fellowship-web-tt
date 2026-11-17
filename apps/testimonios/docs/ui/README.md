# UI — guía para el equipo

> Flujo aprobado: `/enviar`, con hero y cinco pasos bajo FormHeader. `/` y `/t/[slug]` conservan la experiencia pública futura, todavía sin aprobación de publicación definitiva. Sus rutas siguen incluidas en el build: no hay restricciones implementadas. Layout y alternativas de despliegue: [Hero y formulario integrados](../hero-form-integration.md).

> Estado de implementación al 16/11/2026: la base de galería/fichas, identidad visual, formulario ES/EN/PT, navegación/resumen, hero integrado e imágenes optimizadas está en `dev`. La implementación y revisión manual en localhost de la [precarga progresiva](../carousel-preload.md) se completaron el 16/11/2026; este registro no afirma un despliegue en producción. Los informes por etapas conservan sus resultados originales y no se regeneran con una arquitectura posterior.

Documentación de los componentes reutilizables de `apps/testimonios`.

**Objetivo:** cualquier dev puede armar galería, ficha o form sin reimplementar chrome ni cards.

Tokens y type scale: [design system de la landing](../../../landing-contratar/docs/ui/design-system.md). Compartidos en `@repo/ui`: [Button](../../../../packages/ui/docs/button.md), [BrandLogo](../../../../packages/ui/docs/brand-logo.md).

El design system de Landing es una referencia interna. Los tokens y utilities vigentes de Testimonios se definen en su propio [`app/globals.css`](../../app/globals.css), actualizado parcialmente según la identidad actual de No Country.

El formulario de página (`enviar-form`) no se documenta acá: es de una ruta, no un primitivo.

Las [etapas de navegación, validación y resumen del formulario](../form-steps-summary.md) documentan el indicador hacia pasos anteriores, la comprobación integral y las tres tarjetas con fotografías confirmadas. «Editar» permanece en el encabezado y «Guardar cambios» al pie durante la edición; valida los datos editables sin enviar. Entrar directamente a `/enviar` muestra el hero con casilla desmarcada: no permite omitir aceptación para comenzar ni para enviar. El paso 5 «Revisión y envío» muestra el recordatorio de autorización, sin otra casilla. El servidor exige una única declaración `consent=on` y los datos válidos antes de registrar `consent_at`; no acredita interacción física con el checkbox. Véanse [contrato y límites](../hero-form-integration.md#declaración-y-fecha-de-consentimiento). La revisión editorial/legal y la coordinación futura con la web oficial no se presentan como resueltas.

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
| [HeroTestimonialCard](./components/hero-testimonial-card.md) | Arte administrativo optimizado, precarga progresiva y alternativa textual en el carrusel |
| [TestimonialsGallery](./components/testimonials-gallery.md) | Buscador, filtros, contador y grilla en `/`; publicación futura |
| [TestimonialDetail](./components/testimonial-detail.md) | Ficha editorial de servidor, contexto profesional y medios opcionales |
| [TestimonialCapture](./components/testimonial-capture.md) | Foto testimonial a tamaño natural, sin pie visible y con ampliación accesible |
| [PageShell](./components/page-shell.md) | Wrapper de página (`<main>` + título) |
| [TestimonialCard](./components/testimonial-card.md) | Card de resumen para galería y otros usos; no compone la ficha |
| [YoutubeEmbed](./components/youtube-embed.md) | Iframe 16:9 de YouTube |
| [Field](./components/field.md) | Label, hint, error y classes de input |
| [CaptureCropDialog](./components/capture-crop-dialog.md) | Recorte de foto: 16:9 o cuadrado |
| [FormLanguageSelect](./components/form-language-select.md) | Selector ES/EN/PT exclusivo del header, inerte mientras hay recorte |
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

La captación aprobada vive en `/enviar`; `/` monta la galería futura y `/t/[slug]` conserva las fichas pendientes. El [QA histórico de la landing](./capture-landing-qa.md) describe la composición anterior y la comparación con Canvas.

El [QA integral de etapas 1–4](./official-chrome-improvements.md#qa-integral--etapa-4) documenta la matriz responsive, teclado y regresiones de las tres rutas. Distingue pruebas vivas, estados aislados y pendientes manuales; el cierre no equivale a certificación de accesibilidad ni aprobación visual humana.

`app/layout.tsx` conserva HTML/body, fuente, estilos y metadata general. `app/(public)/layout.tsx` compone `SiteHeader`, contenido y `SiteFooter` sin wrappers DOM. Las URLs públicas no cambian. El 404 raíz reutiliza ese layout para URLs inexistentes; el 404 del grupo público hereda su chrome sin duplicarlo. El footer continúa en el flujo del documento y no modifica el scroll ni el bloqueo de los diálogos.

`/enviar` conecta ES/EN/PT con `FormLocaleProvider`, [FormHeader](./components/form-header.md) y un único [FormLanguageSelect](./components/form-language-select.md). Los códigos canónicos son `es/en/pt`; `pt-BR` es alias de lectura y atributo HTML del portugués brasileño. Elegir idioma conserva estado y URL y guarda la preferencia `testimonios_locale`; una query explícita prevalece al navegar o recargar. Esa ruta no monta navbar/footer institucionales. `EnviarIntro` sigue entrando como children a `EnviarForm` y desaparece en éxito; el hero integrado es una vista separada de `EnviarExperience`. Véase la [auditoría](../form-i18n-audit.md) para historia, metadata y límites.

`app/(public)/page.tsx` consulta publicados y monta la galería, conservando `force-dynamic`. `/enviar` resuelve query, metadata y hasta tres historias para su hero en `app/enviar/page.tsx`. `form-layout.module.css` comparte contenido de hasta 70rem, padding exterior de 24px y 32px desde 48rem entre header, hero y formulario, sin modificar contenedores globales. La descripción del hero conserva 36rem y los párrafos largos del formulario 44rem. `EnviarIntro` entra como children a `EnviarForm` y desaparece en éxito; se retira su enlace a `/` porque el paso 1 ya permite volver al hero. `SuccessCard` conserva el foco; el selector permanece disponible.

Las tres rutas usan el scroll del documento. El layout es una columna flexible con altura mínima de `100dvh`; cada `<main>` crece con su contenido y no crea un scroll independiente. El header institucional es sticky y publica su altura real para el offset de scroll. El formulario enfoca pasos y errores sin scroll automático y luego desplaza el documento, descontando la altura real del header y 16px de separación. Su contenedor permite cortar palabras demasiado anchas y sus botones de navegación admiten varias líneas para no depender del antiguo scroll horizontal al ampliar la fuente. Los diálogos modales bloquean el scroll raíz mediante `html:has(dialog:modal)`; `scrollbar-gutter: stable` conserva el ancho al abrirlos y cerrarlos. Los paneles de diálogo mantienen su scroll interno cuando hace falta.

`GalleryHero` es una vista cliente de `EnviarExperience` e integra `GalleryHeroCarousel`. La página inicia la consulta pública y `selectAvailableHeroStories()` como promesa; un `Suspense` exclusivo del carrusel incorpora hasta tres historias, priorizando imágenes confirmadas y usando historias textuales si no hay ninguna disponible, sin bloquear el resto del flujo. Conserva timeout, caché y backoff descritos en [primera visita](../carousel-first-visit.md). El navegador no consulta Supabase ni lista Storage. Tras la primera imagen eager/high, la cola prepara segunda y tercera eager/low, conservando elementos y recursos; navegar anticipadamente solicita o reutiliza el destino. Las prioridades son hints. [Comportamiento y mediciones vigentes](../carousel-preload.md).

El hero distingue cero publicados y error de carga y mantiene el CTA. Cada arte administrativo usa `next/image`, calidad 85 y `sizes` según ancho/DPR; la alternativa textual y el fallback local conservan el relato sin depender de la ficha. «Leer historia» es el único enlace visible del carrusel y conserva el destino futuro; debe resolverse esa dependencia antes de restringir rutas.

`TestimonialsGallery` conserva contrato y distribución: una columna en mobile, dos desde `md` y tres desde `lg`, con gap de 24px. Se monta en `/`; no se elimina ni rediseña en el ajuste de `/enviar`.

La barra de `TestimonialsGallery` mantiene búsqueda, filtros y contador. Su API se describe en la ficha correspondiente. Conservar el código accesible no equivale a aprobar su publicación.

Al ampliar la fuente, el CTA puede ocupar varias líneas y el hero apila sus columnas si no dispone de `56rem`. La publicación administrativa optimizada tiene hasta 340px de ancho y conserva 4:5, sin reconstruir ni recortar su diseño. Debajo solo están «Leer historia», flechas y posición. Una única región con relato completo se revela dentro de la tarjeta ante error, foco de teclado o relación ancho/fuente insuficiente; los relatos largos tienen scroll. El texto rasterizado mantiene límites de ampliación tipográfica: [nitidez y carrusel compacto](../carousel-legibility.md) documenta la alternativa al 200% y la revisión manual pendiente.

## Composición de la ficha

`app/(public)/t/[slug]/page.tsx` conserva la consulta, `generateMetadata`, `notFound()` y el estado de error. El resultado exitoso se presenta con `TestimonialDetail`, sin `PageShell` ni `TestimonialCard`. Su único `<main>` mantiene `flex-1 min-w-0` en el flujo del documento, y todas las secciones comparten el contenedor `max-w-[70rem]` y el padding exterior de la galería.

La historia completa siempre se muestra, incluso cuando coincide con `quote`, con saltos de línea intactos y ancho de lectura de 44rem alineado a la izquierda. Los medios son condicionales y se limitan a 768px en la ficha. Solo `TestimonialCapture` agrega una interacción cliente para ampliar la foto testimonial; utiliza un diálogo nativo sin dependencias adicionales y sin ese límite de ancho. Ver las fichas de ambos componentes para responsive, accesibilidad y limitaciones.
