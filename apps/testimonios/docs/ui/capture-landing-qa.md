# Issue 1 — Landing de captación y carrusel social

Implementación inicial: 29 de octubre de 2026. Pulido visual: 30 de octubre de 2026. Rama: `feat/testimonios-capture-landing`.

**Estado:** pulido implementado para una nueva revisión humana. El QA técnico de la primera versión no equivalía a aprobación visual. Las capturas iniciales se conservan como registro; las de `assets/carousel-polish/` muestran la iteración actual.

## Pulido del 30/10 — causas y cambios

El tamaño excesivo tenía causas acumuladas: columna de hasta 448px, publicación de 408px tras reservar 40px para la pila, mínimo 4:5, cita sin límite de líneas, espacios internos trasladados proporcionalmente del Canvas y altura compartida determinada por la tarjeta más alta. Nombre y país compartían una fila flexible, causando saltos y alturas variables.

Cambios en esta iteración, exclusivamente visuales:

- `gallery-hero.tsx` / `.module.css`: columna de 372px, dejando más espacio al texto y CTA; padding horizontal limitado a 24/32px para que la fuente ampliada no estreche la lectura. Copy, colores y decoración institucional conservados.
- `gallery-hero-carousel.tsx` / `.module.css`: publicación de hasta 340px; reserva lateral de 16/32px y desplazamientos de 12/24px para dos/tres historias. Herramientas fuera del arte, altura compartida y navegación existentes conservadas.
- `hero-testimonial-card.tsx` / `.module.css`: cita de 17–22px según ancho; seis líneas para Simulación y cinco para Primer empleo/Reconversión. Nombre de una línea con elipsis; país y puesto en filas independientes. Avatar limitado a 44–52px en grilla junto a `minmax(0,1fr)`; padding de 16px y separación de 10px, sin crecer al ampliar la fuente. Se reduce también kicker, badge, márgenes y recursos profesionales.

El truncado es **CSS**, sin alterar `quote`, `fullName` ni otros datos. La elipsis la dibuja el navegador. Los nodos completos permanecen en el DOM y en el árbol de accesibilidad de Chrome, comprobado con CDP. «Leer historia» sigue apuntando a la ficha completa. No hay duplicados `sr-only`, tooltips obligatorios, scroll interno ni altura máxima que recorte el encabezado o el autor.

La cita larga ya no alarga ilimitadamente la tarjeta. País y puesto extensos, pills profesionales y fuente ampliada sí pueden aumentar su altura de forma natural: se preservan esos datos y la legibilidad, sin prometer 425px para cualquier caso extremo.

### Medidas concretas antes/después

Fuente raíz de 16px y los mismos tres registros públicos en el mismo orden. La selección se congela únicamente en el harness temporal de QA y se comprueba que las citas no cambiaron.

| Viewport / caso | Tarjeta antes | Tarjeta después | Cita antes → después | Líneas visibles antes → después |
| --- | --- | --- | --- | --- |
| 1440px, publicados | 408 × 600,61px | 340 × 425px | 25,69 → 20,57px | 8 → 5 |
| 1024px, publicados | 376 × 563,02px | 340 × 425px | 23,67 → 20,57px | 8 → 5 |
| 375px, publicados | 317 × 571,98px | 317 × 403,73px | 20 → 19,18px | 8 → 5 |
| 1440px, fixture normal | 408 × 548,64px | 340 × 425px | 25,69 → 20,57px | 5 → 4 |
| 1440px, fixture extremo | 408 × 1007,55px | 340 × 542,09px | 25,69 → 20,57px | 13 → 6 |
| 375px, fixture extremo | 317 × 958,23px | 317 × 528,70px | 20 → 19,18px | 14 → 6 |

En el fixture de escritorio, el nombre pasa de 21,15px a 16px y de hasta tres líneas a una; país y rol de 14px a 12px, kicker de 12px a 10px y badge de 11px a 10px. El ancho total del carrusel de tres pasa de 448px a 372px. El hero con publicados pasa de 821,61px a 646px de alto; los datos esenciales del autor siguen dentro de la tarjeta.

[Mediciones numéricas completas](./assets/carousel-polish/measurements.json), en píxeles CSS, sin contenido de testimonios. Los casos extremos combinados con fuente al 200% siguen requiriendo más altura por los metadatos: se documenta su [captura de 320px/font32](./assets/carousel-polish/long-320-font32.png) para revisión humana, sin afirmar una tarjeta de 425px en esa condición.

### Capturas antes/después con los mismos datos

Todas usan DM Sans cargada en el hero. La tarjeta conserva la fuente del sistema del panel. La franja de QA distingue publicados leídos del entorno y fixtures no publicados; ninguna captura de HTML se presenta como PNG final de redes.

| Caso | Antes | Después |
| --- | --- | --- |
| Publicados, desktop | [1440px antes](./assets/carousel-polish/before-published-normal-1440.png) | [1440px después](./assets/carousel-polish/after-published-normal-1440.png) |
| Publicados, móvil | [375px antes](./assets/carousel-polish/before-published-normal-375.png) | [375px después](./assets/carousel-polish/after-published-normal-375.png) |
| Publicados, 1024px | [Antes](./assets/carousel-polish/before-published-normal-1024.png) | [Después](./assets/carousel-polish/after-published-normal-1024.png) |
| Fixture extremo, desktop | [Antes](./assets/carousel-polish/before-fixtures-long-1440.png) | [Después](./assets/carousel-polish/after-fixtures-long-1440.png) |
| Fixture extremo, móvil | [Antes](./assets/carousel-polish/before-fixtures-long-375.png) | [Después](./assets/carousel-polish/after-fixtures-long-375.png) |

Último build verificado con DM Sans y publicados reales, sin franja de fixture: [producción móvil](./assets/carousel-polish/production-375.png) y [producción desktop](./assets/carousel-polish/production-1440.png). Estas capturas usan la selección pública dinámica habitual; las parejas de la tabla anterior son las que congelan los mismos registros para comparar.

### Comparación renovada con el panel actual

Se releyó el generador actual en modo lectura, especialmente `drawAuthorText`, `drawNameAndCountry`, `truncateToWidth`, `quoteDesignPlacement` y `layoutQuote`, además de `IgShare`. Último commit local del generador inspeccionado: `4dbcfb2`.

El panel limita nombres, país y rol por ancho; reserva hasta 42% del ancho para el país y reduce/recorta la cita para mantener el PNG fijo. **En este checkout nombre y país todavía comparten línea.** La estructura vertical requerida para HTML es una adaptación expresa; no se atribuye al panel un cambio que no está en el archivo actual.

Se ejecuta nuevamente el generador original y se muestra su imagen a **340 × 425px**, junto al HTML con los mismos fixtures. No se importa ese generador en la aplicación ni se modifica el panel.

| Tipo | Datos normales | Datos extensos |
| --- | --- | --- |
| Simulación | [Canvas / HTML](./assets/carousel-polish/compare-simulation-normal.png) | [Canvas / HTML](./assets/carousel-polish/compare-simulation-long.png) |
| Primer empleo | [Canvas / HTML](./assets/carousel-polish/compare-first_job-normal.png) | [Canvas / HTML](./assets/carousel-polish/compare-first_job-long.png) |
| Reconversión | [Canvas / HTML](./assets/carousel-polish/compare-career_change-normal.png) | [Canvas / HTML](./assets/carousel-polish/compare-career_change-long.png) |

Las diferencias intencionales actuales son el límite estable de cinco/seis líneas, mínimos tipográficos legibles, nombre completo accesible con elipsis visual, autor vertical, wrapping de metadatos y crecimiento ante accesibilidad/casos extremos. El PNG conserva coordenadas y tamaño fijos, texto rasterizado y sus propios límites; no se promete igualdad píxel a píxel.

### QA de esta iteración

Matriz aislada final: **555 combinaciones**, con anchos **320, 375, 768, 1024 y 1440px**, fuentes raíz **16, 24 y 32px**, las tres categorías y una/dos/tres publicaciones. Se prueban cita corta, cita extensa, cadena sin espacios y metadatos ausentes: 540 casos, más 15 de cero publicados. País y puesto ausentes se prueban también de forma independiente en las tres categorías a 320px/font32.

Se comprueba ancho máximo de 340px, límite de cinco/seis líneas, nombre en una línea, avatar sin desplazamiento, filas independientes, ausencia de scroll interno y desbordamiento, contenido esencial dentro de la tarjeta, flechas externas de 44px y diapositivas inactivas `inert`/`aria-hidden`. La revisión visual de texto al 200% detectó que el avatar y los espacios crecían demasiado; se limitaron y se repitió la matriz final completa. No se usa el simple resultado de «sin overflow» como aprobación visual.

También pasan teclado, foco visible y estable, anuncios, contador, enlace activo, bloqueo durante animaciones, navegación circular, altura compartida estable y movimiento reducido. CDP confirma que el nombre y la cita íntegros siguen en el árbol de accesibilidad pese a las elipsis. Las citas y el enlace de los publicados coinciden exactamente con la captura inicial de esta iteración.

La comparación renovada ejecuta el Canvas actual con datos normales y extensos en las tres categorías. No se modifican testimonios para probar: los fixtures están identificados y la selección de publicados se consulta en modo lectura. El harness es temporal y se elimina del árbol `app` antes de los checks y el build final.

| Check final del pulido | Resultado |
| --- | --- |
| `pnpm.cmd --filter testimonios exec tsc --noEmit` | Pasa. |
| `pnpm.cmd --filter testimonios lint` | Pasa, sin errores ni warnings de ESLint. |
| `pnpm.cmd --filter testimonios build` | Pasa; incluye `/`, `/enviar` y `/t/[slug]`, sin rutas de QA. |
| `git diff --check` | Pasa. |
| Matriz final aislada | 555 combinaciones, sin errores observados. |
| Build de producción con DM Sans y publicados | 15 combinaciones adicionales: cinco anchos × fuentes 16/24/32px. |
| Acceso directo a ficha publicada | HTTP 200, enlace de retorno al inicio correcto. |
| CTA | GET de `/enviar` correcto, sin enviar formularios. |
| Ruta temporal `/qa-polish` | Eliminada; HTTP 404 en producción. |
| JavaScript e hidratación | Sin errores observados en las sesiones verificadas. |

Las 570 combinaciones finales y los checks técnicos no equivalen a aprobación visual. Se mantiene pendiente revisar humanamente proporciones, escala, cinco/seis líneas, presentación vertical del autor y los casos extremos con texto ampliado. La QA cubre Chrome en esta máquina y el árbol accesible de CDP; quedan pendientes otros navegadores y lectores de pantalla reales. Las pruebas anteriores de la issue inicial, más abajo, se conservan como registro histórico; no sustituyen las de este pulido.

## Resultado y diff funcional

El home ahora prioriza compartir un testimonio. Conserva el fondo institucional y el CTA hacia `/enviar`, con título «Tu experiencia merece ser compartida.» y copy neutro latinoamericano que presenta la visibilidad como oportunidad. No promete publicación automática.

| Área | Antes | Después |
| --- | --- | --- |
| Home | Hero institucional y sección de exploración | Hero de captación; galería, búsqueda, filtros, contador y estados de exploración sin montar. |
| Metadata del home | Descripción genérica de historias | «Comparte tu testimonio · No Country» y descripción de captación. |
| Tarjeta del carrusel | Superficie oscura propia, avatar circular y cita con clamp | Réplica HTML de Cita: paleta por tipo, logo, badge, comilla, hexágonos, cita limitada visualmente y autor con avatar hexagonal. |
| Datos del hero | Identidad, cita, categoría y avatar | Se añaden tipo, país y campos profesionales disponibles; no se envían campos privados. |
| Herramientas | Dentro del área de la tarjeta | Enlace activo, contador y flechas debajo de la publicación. |
| Enlaces de retorno | «Volver a la galería» / «Ver más historias» | «Volver al inicio». |

La composición efectiva de `app/page.tsx` queda así:

```tsx
const listed = await listPublishedTestimonials();
const heroStories = listed.ok ? selectHeroStories(listed.testimonials) : null;

return (
  <main className="min-w-0 flex-1 bg-bg-base">
    <GalleryHero stories={heroStories} />
    {/* Galería temporalmente fuera del home; componentes y fichas se conservan. */}
  </main>
);
```

La consulta pública, `force-dynamic`, máximo de tres, selección aleatoria en servidor y navegación manual se conservan. No hay nuevas consultas ni escrituras de negocio.

## Archivos de implementación

Todos dentro de `apps/testimonios`:

- `app/page.tsx`: composición de captación y metadata local del home; se retira el mapeo usado solo por la galería.
- `components/gallery-hero.tsx` y `.module.css`: copy, distribución condicional, columna compacta y estados sin publicados / error.
- `components/gallery-hero-data.ts`: adaptación del contrato visual desde `PublicTestimonial`.
- `components/gallery-hero-carousel.tsx` y `.module.css`: integración de la vista, herramientas externas y conservación del comportamiento accesible.
- `components/hero-testimonial-card.tsx` y `.module.css` (nuevos): vista de Cita y variantes locales por tipo.
- `components/testimonial-detail.tsx`: acciones y retorno coherentes con el nuevo home.
- `app/t/[slug]/page.tsx`: texto de retorno desde el error de carga.
- `lib/nav.ts`: etiqueta «Inicio» para `/` en la navegación pública preservada.

Documentación actualizada: `README.md`, `docs/app_testimonios_plan.md`, `docs/ui/README.md`, fichas `gallery-hero`, `gallery-hero-carousel`, `testimonials-gallery`, `testimonial-detail`, `page-shell`, nueva ficha `hero-testimonial-card` y este informe. Las imágenes iniciales quedan en `docs/ui/assets/capture-landing/` y las del pulido en `docs/ui/assets/carousel-polish/`.

No se modifican `apps/panel-admin`, `packages/ui`, estilos globales, navbar, footer, formulario, dependencias, backend, migraciones ni Storage. No se realizan operaciones Git de escritura.

## Origen y diferencias con la plantilla real

La referencia es `apps/panel-admin/features/testimonials/infrastructure/ig-card-canvas.ts`, especialmente `drawQuoteDesign`, `drawBody`, `learningGradient`, `drawAuthorInline`, `drawBadge`, `drawHexDecoration`, `drawHiredPill` y `drawTransition`. Véase la [ficha de la tarjeta](./components/hero-testimonial-card.md) para valores y contratos.

Las imágenes `canvas-quote-*.png` fueron producidas ejecutando el generador Canvas original, transpilado temporalmente para el navegador, con sus dependencias originales y fixtures de QA. Se utilizaron los assets locales existentes y la fuente del sistema del panel. No se alteró ese código ni se llamó a acciones de publicación, Supabase o Storage para generar las referencias.

Las comparaciones muestran **Canvas a la izquierda / HTML a la derecha**:

| Categoría | Comparación | PNG de referencia generado para QA |
| --- | --- | --- |
| Simulación | [Comparar](./assets/capture-landing/compare-simulation.png) | [Canvas original](./assets/capture-landing/canvas-quote-simulation.png) |
| Primer empleo | [Comparar](./assets/capture-landing/compare-first_job.png) | [Canvas original](./assets/capture-landing/canvas-quote-first_job.png) |
| Reconversión | [Comparar](./assets/capture-landing/compare-career_change.png) | [Canvas original](./assets/capture-landing/canvas-quote-career_change.png) |

La réplica conserva colores, degradados, tipografía del sistema, pesos, jerarquía y recursos de cada tipo. No es idéntica píxel a píxel al PNG: conserva los datos completos pero limita visualmente cita y nombre, aplica mínimos tipográficos, admite wrapping del país, rol, badges y pills, y crece cuando hace falta. El 4:5 es una referencia mínima, resuelta con `125cqi`, no una caja que recorte el encabezado o autor. Todas las tarjetas comparten la mayor altura para que navegar no desplace los controles.

El Canvas puede reducir texto y truncar nombres o citas. Desde el pulido del 30/10, HTML también limita visualmente cita y nombre, manteniendo los textos en el DOM y sin reducirlos por debajo de sus mínimos. Los metadatos y badges son más grandes a anchos pequeños. La transición profesional puede ocupar varias líneas. Las esquinas siguen el marco de preview redondeado del panel; el PNG crudo es rectangular. Flechas, contador y enlace no forman parte del arte de la publicación.

El selector administrativo solo ofrece Cita para Simulación, aunque el dibujante admite las tres categorías. Estas variantes HTML no habilitan formatos del panel ni representan PNG ya publicados. No se consultan los archivos finales de `share-cards` para dibujar el carrusel.

## Registro inicial del 29/10 — capturas del hero

Las comparativas de desarrollo utilizan los mismos fixtures, con una franja visible «QA LOCAL · DATOS FICTICIOS · NO PUBLICADOS». Durante esa sesión Google Fonts no estaba accesible, por lo que el hero usaba su fuente de respaldo; la publicación siempre usa la pila del sistema por diseño. Las capturas de producción verifican después DM Sans descargada y datos procedentes de la consulta real de publicados.

| Contexto | Móvil 375px | Desktop 1440px |
| --- | --- | --- |
| Antes, fixtures | [Antes móvil](./assets/capture-landing/before-375.png) | [Antes desktop](./assets/capture-landing/before-1440.png) |
| Después, mismos fixtures | [Después móvil](./assets/capture-landing/after-375.png) | [Después desktop](./assets/capture-landing/after-1440.png) |
| Build de producción, DM Sans y publicados | [Producción móvil](./assets/capture-landing/production-375.png) | [Producción desktop](./assets/capture-landing/production-1440.png) |

Capturas adicionales: [320px](./assets/capture-landing/after-320.png), [768px](./assets/capture-landing/after-768.png), [1024px](./assets/capture-landing/after-1024.png), [1920px](./assets/capture-landing/after-1920.png) y [320px con texto extenso y fuente de 32px](./assets/capture-landing/long-320-font32.png).

Los registros de las capturas de producción ya estaban publicados en el entorno conectado. No se crean ni envían testimonios para las pruebas. Las capturas muestran la réplica HTML, no el PNG social de esos registros.

## Registro inicial del 29/10 — pruebas ejecutadas

| Comprobación | Resultado |
| --- | --- |
| `pnpm.cmd --filter testimonios exec tsc --noEmit` | Pasa. |
| `pnpm.cmd --filter testimonios lint` | Pasa, sin errores ni warnings de ESLint. |
| `pnpm.cmd --filter testimonios build` | Pasa con acceso de red para la fuente existente DM Sans. El primer intento restringido falló en esa descarga. |
| `git diff --check` | Pasa; Git puede advertir la conversión LF/CRLF de documentación, sin errores de whitespace. |
| Matriz aislada de layout | 288 combinaciones: 6 anchos × 4 fuentes × 4 cantidades × 3 clases de cita. |
| Producción con DM Sans y publicados | 24 combinaciones adicionales: 6 anchos × 4 fuentes. |
| Selección en servidor | 100 selecciones de 9 fixtures: máximo 3, sin duplicados, sin mutación del array original y sin propagar un campo privado de prueba. |
| Navegación, teclado y movimiento reducido | Pasa. |
| Acceso directo a ficha existente | HTTP 200 en producción, con retorno «Volver al inicio». |
| CTA `/enviar` | Formulario accesible por GET, sin enviar datos. |
| Exclusión de fixtures del resultado final | La ruta temporal `/qa-capture` se elimina antes del build y devuelve HTTP 404 en producción. |
| Errores de JavaScript / hidratación | Ninguno observado en las sesiones verificadas. |

Anchos: **320, 375, 768, 1024, 1440 y 1920px**. Fuentes raíz: **16, 20, 24 y 32px**. Cantidades: **0, 1, 2 y 3**. Citas: breve, extensa y cadena larga sin espacios; también nombres y roles extensos. Se verifica una sola diapositiva expuesta, inactivas `aria-hidden`/`inert`, contenido dentro de la publicación activa, ausencia de desbordamiento horizontal, controles fuera de la publicación y objetivos de 44px.

Las pruebas funcionales incluyen secuencia CTA → enlace → anterior → siguiente, foco visible, Enter, conservación del foco, actualización del enlace y anuncio, navegación circular, bloqueo de clics durante animaciones, altura estable y cambios inmediatos con movimiento reducido. También se comprueba que los metadatos ausentes no generan empresas o roles inventados, que error y vacío difieren y que no aparece la sección de exploración.

Se usa Chrome headless mediante CDP y Node, sin instalar dependencias. El harness y los fixtures son temporales, fuera del código entregado. La ruta aislada se retira antes de TypeScript, ESLint y build finales. Los comandos normales del proyecto cargan su configuración; no se abren ni inspeccionan archivos `.env*` o credenciales.

## Revisión y coordinación

- El copy y la identidad se conservan según la revisión humana; sigue pendiente aprobar visualmente el pulido de proporciones, truncado y autor del 30/10.
- La QA cubre Chrome en esta máquina. Safari, Firefox y lectores de pantalla reales quedan para revisión cruzada; no se afirma certificación de accesibilidad.
- Un cambio futuro del diseño Canvas deberá contrastarse con la vista local. No existe un componente visual compartido; se evita extraerlo ahora por la restricción sobre el panel y `packages/ui`.
- La galería se conserva sin montar. Su reactivación, la internacionalización del formulario y la habilitación de Cita para otros tipos en el selector administrativo corresponden a decisiones posteriores.
