# Nitidez y carrusel compacto

Iteración del 11/11/2026, rama `feat/testimonios-carousel-optimized-images`. Pendiente de revisión manual en localhost. La arquitectura de [streaming y disponibilidad](./carousel-first-visit.md) queda aprobada como base y se conserva: no se modificaron selección, HEAD, concurrencia, timeout, backoff, Data Cache ni `Suspense`. Solo se ajustó la altura de su reserva visual al retirar el bloque inferior.

## Decisión de imagen

Se selecciona **WebP, calidad 85 solamente en `HeroTestimonialCard`**, conservando `width=1080`, `height=1350`, `object-fit: contain` y el `sizes` anterior. El máximo visual sigue siendo 340px CSS; no se aumenta el tamaño de las tarjetas. El navegador elige una resolución del `srcset` existente según viewport/DPR. No se fuerza 1080px para DPR1 ni se modifica `deviceSizes`/`imageSizes` globalmente.

Se leyó la referencia instalada de Next 16.3 (`node_modules/next/dist/docs/01-app/03-api-reference/02-components/image.md`). Su allowlist predeterminada es `[75]`. Se comparó con un build temporal `[75,85,90]`; la configuración final permite **`[75,85]`**. Los demás `Image` de la app no piden calidad explícita y conservan el valor 75. No cambian formatos, TTL, remotePatterns, avatares ni otros recursos.

## Comparación visual y transferencia

Se capturaron seis PNG públicos confirmados mediante la consulta existente y GET/HEAD públicos sobre sus rutas conocidas, sin listar Storage ni acceder al panel/credenciales. Todos eran 1080×1350; pesaban 185,6–1478,4KiB. Luego se reprodujeron **los mismos bytes locales**, sin latencia de Storage, para comparar 90 respuestas reales de `/_next/image`: seis fuentes × cinco anchos × tres calidades. Todas devolvieron WebP, dimensiones solicitadas y HTTP 200; la repetición verificó HIT. Las tablas siguientes conservan los resultados; la matriz completa de MIME, dimensiones y bytes queda como diagnóstico local ignorado.

Medianas de cuerpo de imagen sobre seis fuentes (KiB, sin encabezados):

| Ancho entregado | Calidad 75 | Calidad 85 | Calidad 90 |
| --- | ---: | ---: | ---: |
| 384 | 19,4 | 25,2 | 29,8 |
| 640 | 36,2 | 47,8 | 57,9 |
| 750 | 43,0 | 57,6 | 70,1 |
| 828 | 47,7 | 64,2 | 78,7 |
| 1080 | 60,4 | 81,2 | 97,7 |

A 750px, calidad 85 abarca 30,5–90,1KiB; a 1080px, 46,2–147,7KiB. En la mediana de 750px, 85 suma ~34% respecto de 75; 90 suma otro ~22%. Es un coste real de mejor conservación de bordes, no una reducción de peso.

Se inspeccionaron los seis diseños a tamaño reducido y dos comparaciones de texto pequeño, ampliadas para reconocer artefactos: [fondo oscuro](./ui/assets/carousel-legibility/comparison-2.png) y [fondo claro/autor](./ui/assets/carousel-legibility/comparison-4.png). Las columnas son 75/85/90/PNG de referencia, y las filas 384/750/1080. Se muestra un recorte equivalente a 340px CSS a DPR2. Estas son comparaciones del bitmap, no capturas completas del navegador.

La resolución insuficiente para el DPR produce el deterioro más marcado: 384px ampliados a DPR2 pierden mucho más detalle que la diferencia 85→90. Con 750/1080px, 85 reduce moderadamente ruido/halos de 75, en especial alrededor de trazos de color y texto pequeño. 90 se acerca algo más al PNG pero su mejora adicional es pequeña al tamaño real. Se elige 85 como compromiso; la valoración visual no equivale a una prueba de lectura con usuarios. Los screenshots de UI conservados permiten la revisión final.

La matriz de primera selección usa una identidad de fuente nueva por combinación para impedir que Chrome reutilice una variante grande ya cacheada. El [resumen de QA](./ui/assets/carousel-legibility/qa-summary.json) distingue esos 15 casos de la matriz responsive, donde reutilizar una fuente mayor ya disponible es comportamiento legítimo del navegador. Los anchos existentes cubren DPR1/2/3; no se añaden resoluciones ni se atribuye al encoder el texto que ya es pequeño en el diseño original.

| Viewport | DPR1 | DPR2 | DPR3 |
| --- | --- | --- | --- |
| 320px | 384×480 | 640×800 | 828×1035 |
| 375px | 384×480 | 750×938 | 1080×1350 |
| 768 / 1440 / 1920px | 384×480 | 750×938 | 1080×1350 |

Son dimensiones reales de respuesta del optimizador; el ancho CSS de imagen excluye el borde y depende también del gutter del scroll del documento. La selección puede conservar una variante mayor ya cacheada, sin que eso pruebe que cada nueva visita descargue 1080px.

## Presentación y equivalente textual

Se retiran de `GalleryHeroCarousel` el autor/categoría/país visuales inferiores y el `details/summary` «Leer testimonio en texto». Se conservan el arte, **un único enlace visible «Leer historia»**, flechas, posición, animaciones, anuncios localizados y foco. El enlace sigue en `/t/{slug}`, sin prefetch. No cambia la publicación administrativa ni se reconstruyen sus siete plantillas.

`HeroTestimonialCard` contiene una sola región textual por historia: nombre, categoría/país, relato completo (o cita si no hay relato) y contexto profesional público activo. No vuelve a leer la cita y después el relato que ya la incluye. El bitmap tiene `alt=""`/`aria-hidden`; las tarjetas inactivas conservan `inert`/`aria-hidden`. El árbol accesible expone una sola historia completa y una sola región localizada activa.

La región textual usa el espacio **dentro del marco 4:5**, sin otro botón/enlace:

- Estado normal: recortada visualmente, disponible para tecnologías de asistencia.
- Imagen ausente o error posterior a HEAD: visible inmediatamente, sin bitmap roto. La historia no depende de navegar a la ficha.
- Foco de teclado: se revela con foco cyan visible y scroll nativo para recorrer el relato; Tab continúa al enlace y flechas.
- Contenedor de hasta 11em: se revela como texto refluido. En los cinco anchos comprobados con fuente raíz al 200%, esta condición se cumple y sustituye visualmente el bitmap mediante un fondo opaco. La misma región permanece en el DOM; no hay un segundo relato.

Los relatos largos son desplazables dentro del marco, con gutter estable. No se recortan ni clampa su contenido; el scroll permite llegar al final y no cambia la altura de la pila. El estado de carga usa un mensaje localizado breve. Los mensajes ya no indican «leer debajo» porque ese bloque dejó de existir. Se mantiene la carga exclusiva de la activa y el montaje conservado de las visitadas; mostrar texto no introduce otra descarga de respaldo ni llamadas al backend.

**Límite visual pendiente:** mejorar WebP no convierte el texto rasterizado en tipografía adaptable. El umbral ancho/fuente y el foco ofrecen lectura sin un segundo control, pero no detectan todos los modos de zoom, ajustes de SO ni necesidades visuales. No se declara resuelta la accesibilidad visual mediante texto oculto. Zoom nativo, dispositivos físicos, descubrimiento del scroll y lectores reales requieren revisión. La ficha del enlace existente ofrece otra lectura, pero el fallback local no depende de ella y la aprobación de publicación de esa ruta sigue siendo independiente.

## Mediciones de carga

Las mediciones antes/después de la tabla siguiente usan el build de producción, Chrome 157 y los mismos PNG locales. Tres parejas fría/caliente por modo: escritorio 1440/DPR1 y móvil 375/DPR2 con 1,6Mbps, 150ms y CPU×4. Fría significa URLs nuevas de fuente, servidor y perfil nuevos; caliente es recarga en el mismo servidor/navegador. No se borraron caches compartidas ni se modificó la selección de producción; el orden se fija solo en el fixture QA. Los reportes completos de tiempos permanecen locales e ignorados.

La pintura se mide mediante Element Timing, separada de TTFB y `load`/`decode`. En móvil el QA desplaza la imagen al viewport para poder medirla; no representa automáticamente el LCP de la primera pantalla de un usuario. LCP se observa por separado, aunque en estas muestras pueda coincidir con el arte. Las comparaciones finales se ejecutan sin otra batería de navegador en paralelo. Los tiempos de origen remoto quedan excluidos: no se confunde variación de red con compresión.

La reserva inicial se reduce de arte+10rem a arte+4rem para reflejar los controles sin la antigua transcripción. La medición intermedia detectó CLS ~0,016 por conservar la reserva anterior; se corrigió el espacio, sin cambiar streaming/caché. No se conservan esas mediciones intermedias como resultado final.

Medianas antes → después (tres ejecuciones por condición):

| Condición | Primera imagen, KiB de red | Pintura de imagen | LCP observado | TTFB | Siguiente imagen lista |
| --- | ---: | ---: | ---: | ---: | ---: |
| Escritorio frío | 27,8 → 36,5 | 648 → 812ms | 648 → 812ms | 204 → 221ms | 491 → 473ms |
| Escritorio caliente | 0 → 0 | 164 → 164ms | 164 → 164ms | 56 → 50ms | 513 → 476ms |
| Móvil lento frío | 66,8 → 90,6 | 2040 → 2352ms | 2040 → 2352ms | 230 → 224ms | 526 → 556ms |
| Móvil lento caliente | 0 → 0 | 664 → 680ms | 664 → 680ms | 155 → 155ms | 514 → 502ms |

Se informa el coste: **la variante más nítida pesa más y tardó más en frío**, ~164ms escritorio/~312ms móvil en estas muestras. No se presenta como una mejora de velocidad. La primera imagen fue la misma fuente: cuerpo WebP 27,4→36,1KiB a 384px y 66,4→90,1KiB a 750px; la tabla de red suma encabezados. La caché caliente evita transferir ese cuerpo, pero no todo coste de render/decodificación. El LCP coincidió con la imagen en estas ejecuciones; no se deduce de esa coincidencia que siempre mida la misma cosa. Las diferencias pequeñas de TTFB/navegación no se atribuyen a compresión: incluyen variación del proceso local, CDP y animación de 420ms. CLS final: 0 escritorio, ~0,000014 móvil frío y 0 caliente, sin aumento respecto del build anterior.

## Verificación y límites

Pruebas unitarias ejecutadas: 14/14 selector/disponibilidad y 94/94 i18n/validación/servidor con dobles. QA de presentación: 270 estados (tres idiomas × cinco anchos × tres DPR × dos escalas de texto × tres historias), más 15 selecciones iniciales aisladas. Se comprobaron texto completo único en el árbol accesible, Tab/Enter/Espacio, foco, movimiento reducido, retención de imágenes, ausencia de desbordamiento, una sola liga visible, fallback local y calidad 85.

La regresión del generador verifica además los siete diseños existentes y 216 estados; sus artefactos completos quedan ignorados, sin sobrescribir la evidencia histórica. Su prueba antigua sin hidratación se ajustó a la arquitectura aprobada: registra la limitación sin JavaScript, sin afirmar que el arte se vea cuando React no puede incorporar el stream.

Regresión de streaming: nueve casos y 36 estados, incluyendo valores/foco conservados al comenzar el formulario mientras el carrusel está pendiente, cero/una/dos/tres imágenes y recuperación de errores temporales. Regresión integrada: nueve flujos y 576 alineaciones. Regresión de envío: 45 POST interceptados, cero envíos reales. [Verificación pública final](./ui/assets/carousel-legibility/public-verification.json): tres imágenes optimizadas HTTP 200/WebP, calidad 85 y carga por navegación; no reaparecieron los 400 conocidos. Las ausencias confirmadas se verifican también con fixtures: no generan una petición rota al optimizador.

TypeScript, ESLint sin warnings, build de producción y `git diff --check`: correctos. Los valores de red pública quedan separados de las mediciones controladas; ninguna prueba realiza uploads ni envíos reales.

No hay cambios de lógica del formulario, consentimiento, payload, parser, backend, dependencias, panel, Storage ni esquema. Los originales públicos y variantes completas quedan ignorados. Se seleccionan seis PNG de evidencia (dos comparaciones y cuatro screenshots), resumen compacto, snapshot público e índice. Se conserva el historial anterior. Servidores y perfiles propios de QA se cierran al finalizar.

Comandos de verificación:

```text
node scripts/test-carousel-images.mjs
node scripts/test-form-i18n.mjs
pnpm.cmd exec tsc --noEmit --incremental false
pnpm.cmd exec eslint . --max-warnings 0
pnpm.cmd run build
node scripts/qa-carousel-legibility.mjs
node scripts/qa-carousel-images.mjs
node scripts/qa-carousel-first-visit.mjs --legibility
node scripts/qa-hero-form-integration.mjs --legibility
node scripts/qa-form-submit-validation.mjs --legibility
node scripts/qa-carousel-quality-capture.mjs --verify
node scripts/qa-carousel-summarize.mjs legibility
git diff --check
```

`qa-carousel-quality-capture.mjs` permite preparar los originales **ignorados** mediante lecturas públicas explícitamente autorizadas; el fixture replay y las regresiones no llaman al servicio real. En un checkout nuevo hay que preparar esas fuentes o proporcionar tres PNG 1080×1350 como `local/source-1.png` a `source-3.png`. La regresión de los siete diseños usa el generador sintético existente y no requiere fuentes públicas. El snapshot `--verify` es opcional para QA de servicios reales, no un requisito de las regresiones locales.

Los scripts experimentales `qa-carousel-quality-matrix.mjs` y `qa-carousel-quality-visual.mjs` se retiraron del seguimiento, conservando las copias locales ignoradas. Solo sirvieron para comparar 90 variantes y componer recortes de fuentes específicas; ninguna prueba los importa. Las tablas y capturas preservan la decisión 75/85/90, sin exigir otro build temporal con 90 para ejecutar los tests importantes.

`qa-carousel-legibility-performance.mjs --before` se ejecutó contra el build anterior (75/bloque inferior); sin el flag, contra el final. No reproduce un «antes» histórico ejecutándolo sobre el mismo build final. Son muestras locales pequeñas, no CWV ni garantía de latencia en producción. Caché mutable del mismo PNG, disponibilidad entre HEAD/GET, comportamiento del hosting/`after()` y necesidad de JavaScript del streaming mantienen las limitaciones de la etapa anterior.

## Auditoría de artefactos antes de publicar `07ea72e`

Se retiraron del seguimiento 13 reportes completos y los dos scripts experimentales anteriores, **sin borrarlos del disco**. Los dos informes del formulario tenían 18127 líneas cada uno, principalmente coordenadas repetidas de 576 alineaciones. Las matrices y dumps completos se regeneran localmente; los tests no los consumen como fixtures. La comparación técnica de compresión/latencia permanece en las tablas de estos informes, con sus límites originales.

Se versiona un `qa-summary.json` por etapa: resultados y casos, idiomas, tamaños, resoluciones, agregados de comprobaciones, número de envíos interceptados y límites manuales. `qa-carousel-summarize.mjs` transforma los reportes completos después del QA; no cambia aserciones, no minifica un dump masivo y falla si falta o es inválida una entrada. Tiene pruebas aisladas para resultados fallidos, cobertura, determinismo y conservación de originales. Las regresiones conservadas, el harness, fixtures, instrumentación de tiempos y preparación de fuentes siguen siendo reutilizables.

Las allowlists de assets solo aceptan los resúmenes, los tres snapshots pequeños (traza, pipeline, verificación pública), Markdown y las seis capturas seleccionadas. No se cambian evidencias de etapas anteriores a este commit. Los archivos retirados quedan ignorados incluso al regenerarlos; ninguna limpieza modifica carrusel, streaming, calidad 85, formulario o backend.

Verificación de la limpieza: 111 pruebas unitarias (3 de resúmenes, 14 de carrusel y 94 de i18n/validación), 270 estados visuales, 36 de streaming, nueve flujos/576 alineaciones y 45 envíos interceptados; ESLint del código nuevo, imports, enlaces y `git diff --check` correctos. Proyección del commit revisado: 63→53 archivos y 50657→1707 líneas añadidas (−48950, −96,6%); resúmenes de 235 y 369 líneas. No se hizo commit/amend; las 15 bajas del índice conservan los archivos locales.
