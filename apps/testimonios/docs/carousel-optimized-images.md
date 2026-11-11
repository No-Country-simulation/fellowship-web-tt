# Carrusel del hero con imágenes optimizadas

**Actualización de disponibilidad:** la [corrección de archivos faltantes](./carousel-image-availability.md) agrega selección con HEAD cacheados en servidor y espera acotada. Las mediciones y capturas de esta página corresponden a la migración anterior a ese filtro y se conservan como evidencia de esa etapa; no incluyen su coste de descubrimiento.

Rama `feat/testimonios-carousel-optimized-images`. Implementación del 11/11/2026, pendiente de revisión manual del desarrollador antes del commit. Alcance exclusivo: carrusel de `/enviar`; formulario, consentimiento, validaciones, payload, acciones y servicios conservados. No se modifican panel, esquema ni `packages/ui`.

## Investigación y decisión

Se elige **`next/image` con el optimizador predeterminado de Next 16.3**, ya disponible en la app. `next.config.ts` permite HTTPS `*.supabase.co` bajo `/storage/v1/object/public/**`; incluye `share-cards` sin cambiar configuración global ni contratar infraestructura. No hay `output: export`, loader externo ni `unoptimized` en esta tarjeta.

| Alternativa | Resultado de la revisión |
| --- | --- |
| Next Image | Viable y ejecutado realmente en el build local de producción: fuente PNG → `/_next/image` → WebP redimensionado. Se verifican MIME, bytes, resolución y caché, sin interceptar respuestas optimizadas. |
| Transformaciones de Storage | La [documentación oficial](https://supabase.com/docs/guides/storage/serving/image-transformations) requiere Pro o superior. Permite dimensiones 1–2500px, calidad 20–100 y negociación automática a WebP. No se conocen el plan ni la habilitación del entorno; la petición de una muestra devolvió 400 y no prueba su disponibilidad ni su ausencia. No se depende de esta alternativa. |
| Derivados persistidos u otro servicio | Exigirían generación, publicación, sincronización o infraestructura adicional. No son necesarios para esta migración. |

Guías locales leídas antes de editar: `node_modules/next/dist/docs/01-app/01-getting-started/12-images.md`, referencia `02-components/image.md` y guía de producción. El informe `.next/carousel-audit/report.md` ya no existía; los valores facilitados por el desarrollador se conservan como referencia histórica, no como mediciones repetidas.

**Coste real:** un fallo de caché del optimizador necesita descargar el PNG completo desde Storage al servidor, decodificarlo y generar el tamaño solicitado. El ahorro medido corresponde a la transferencia al navegador, no a eliminar el egreso de origen ni el trabajo de codificación. Cada combinación de fuente, ancho, calidad y formato tiene su propia entrada. En producción habrá latencia de red, límites/costes del hosting y caché distribuida que localhost no mide.

Una primera comprobación GET devolvió HTTP 400 desde Storage, optimizador y URL de transformación; no permitió clasificar la causa ni deducir el plan. Una segunda consulta de la misma fuente pública eligió tres candidatos y **los tres PNG respondieron 200**, de 1080×1350, con `Cache-Control: public, max-age=3600`. El optimizador local sobre esas URLs públicas reales devolvió **WebP 750×938 y 200**: 40150, 45282 y 42752 bytes, con caché de 14400s. En conjunto: **3,57MiB PNG → 125,2KiB WebP**. Esto confirma la viabilidad remota de la alternativa elegida, sin garantizar que todos los publicados dispongan de imagen. No verifica disponibilidad de transformaciones de Supabase. [public-probe.json](./ui/assets/carousel-optimized/public-probe.json) conserva estados, formatos y tamaños, sin URLs, nombres o errores arbitrarios. No se consultaron credenciales, panel desplegado ni configuración administrativa; solo GET sobre los candidatos ya publicados, sin listar Storage.

## Origen y contrato de imágenes

Revisión de solo lectura del panel local:

- `features/testimonials/infrastructure/ig-card.ts`: 1080×1350, PNG, relación 4:5.
- `ig-card-canvas.ts`: `photo`, `quote`, `portrait`, `offer`, `journey`, `shift`, `profile`. Su aspecto depende del diseño y categoría; no se intenta replicarlo con CSS.
- `repositories/testimonialRepository.ts`: `shareCardPath(slug)`, `prepareShareCard()` y `uploadShareCard()` usan `share-cards/{slug}/instagram.png`, `contentType: image/png`, `upsert: true`, sin `cacheControl` explícito.
- Migración versionada `20260917000000_share_cards.sql`: bucket público, PNG, hasta 5MiB, lectura pública y escritura de servidor.

El panel local es un mock y no acredita la versión oficial desplegada ni que cada publicado tenga arte generado. No se toma Storage como catálogo. `app/enviar/page.tsx` y `lib/testimonials/public.ts` permanecen intactos: una consulta existente a `testimonials_public`; después `selectHeroStories()` elige hasta tres. El mapper agrega una URL candidata por slug y el relato público completo que ya estaba disponible. Rechaza segmentos de ruta inválidos para el arte, sin borrar ni alterar el testimonio. No realiza HEAD, listado ni nuevas consultas por tarjeta. El GET de la propia imagen y `onError` determinan su disponibilidad.

Los campos personales/profesionales visibles proceden de la vista pública y del tipo activo. No se transfieren emails, captions privados ni estados de moderación. El texto complementario representa los datos públicos; si el panel oficial modifica solo el PNG, la coherencia editorial entre ese arte y la vista pública debe revisarse allí.

## Tamaños y carga

El arte ocupa como máximo 340px CSS, con el ancho móvil disponible menos 48px de gutters. La reserva lateral de la pila se conserva. `width=1080`, `height=1350`, `aspect-ratio: 4/5` y `object-fit: contain` reservan espacio sin recortar texto ni deformar otras proporciones.

`sizes="(max-width: 387px) calc(100vw - 48px), 340px"` describe el tamaño real; Next genera `srcset` con los tamaños ya configurados. La matriz DPR1/DPR2 recibe habitualmente 384px y 640/750px según viewport; DPR superiores pueden seleccionar 1080px u otros candidatos existentes. No se fuerza una resolución insuficiente para DPR2. Calidad predeterminada 75; WebP mediante `Accept`, con PNG optimizado como alternativa para clientes sin soporte WebP. No se habilita AVIF: la codificación inicial adicional no tiene un beneficio medido en esta integración.

Al iniciar solo se monta la imagen del índice 0, `loading="eager"` y `fetchPriority="high"`. No se oculta mediante CSS hasta la hidratación: puede pintarse desde el HTML, incluso con JavaScript desactivado; React solo actualiza el mensaje de carga/error. No basta con `loading="lazy"` para las inactivas, que podrían estar dentro del umbral de descarga: directamente no tienen `img` ni `srcset` hasta ser solicitadas al navegar. Se conservan las imágenes visitadas para volver sin descargarlas de nuevo. Las superficies posteriores inicialmente son neutras, conservando la pila y sus animaciones.

No se precarga la siguiente: la medida local de navegación a una tarjeta nueva ronda 0,5s incluida la animación. Su texto aparece inmediatamente y el área del arte muestra un estado de carga. No se ha demostrado beneficio suficiente de descargar publicaciones que quizá no se visiten. Una precarga futura necesitaría medir Storage remoto y respetar ahorro de datos/red lenta.

Se conserva el enlace «Leer historia», con `prefetch={false}` para evitar que una ficha futura compita en la carga inicial. Su destino no cambia.

## Accesibilidad, legibilidad y errores

El PNG no puede adaptar su tipografía al 200%; sus textos pequeños pueden ser difíciles de leer a 272px. Se elimina la réplica visual completa y se ofrece **una lectura semántica independiente del diseño**:

- Autor, categoría localizada y país siempre visibles.
- `details/summary` nativo «Leer testimonio en texto», traducido ES/EN/PT, con cita, relato íntegro y contexto profesional. Texto seleccionable, saltos de línea, wrapping y fuente ampliable sin clamp.
- El arte tiene `alt=""` y wrapper `aria-hidden`, evitando una segunda lectura extensa del PNG. El texto no se duplica en las diapositivas ocultas: existe una sola transcripción de la historia activa.
- Inactivas con `aria-hidden`/`inert`; controles con nombres localizados, foco visible, 44px, teclado Enter/Espacio y anuncio de posición sin autoplay. El texto expandido se cierra al cambiar la historia; no se desplaza el foco de las flechas.

No se exige usar `/t/[slug]` para acceder al relato completo. Esa ruta sigue disponible mediante el enlace existente, pero su aprobación/restricción de publicación es una tarea independiente, igual que la galería `/`.

URL ausente/inválida: estado no disponible. Archivo faltante, contenido no válido, error de Storage, optimizador o red: `onError` elimina el elemento roto, conserva el área reservada y muestra un mensaje localizado que invita a leer debajo. La aplicación no asigna una URL directa del PNG como fallback, no reintenta automáticamente y no registra datos personales o errores arbitrarios. Otro montaje permite intentarlo de nuevo. No se conserva ninguna variante visual de la antigua plantilla HTML.

**Límite del optimizador estándar comprobado en su código instalado:** `image-optimizer.js` puede devolver el buffer original si detecta una animación o falla la codificación y reconoce el formato de origen. Por tanto, `next/image` no garantiza WebP ante cualquier fallo interno. Los siete PNG estáticos válidos de este QA sí se redimensionaron y codificaron; un recurso corrupto/HTTP fallido activa el respaldo textual. No se promete que el optimizador jamás transfiera bytes originales en un fallo de codec. Impedir también ese fallback interno requeriría otro contrato de derivados o un servicio/handler que rechace respuestas sin transformar; no se añade esa infraestructura en esta solución. Se debe vigilar MIME/tamaño en producción, especialmente si cambia el generador.

## Caché y regeneración: limitación pendiente

Se conservan los valores de Next existentes: WebP, calidad 75 y `minimumCacheTTL` predeterminado **14400s (4 horas)**. La duración efectiva considera el mayor valor entre mínimo y caché de origen; no es una garantía de frescura al vencer, porque la revalidación puede servir contenido anterior mientras actualiza. No se modifica globalmente la caché de avatares u otras rutas.

La subida del panel no cambia la URL ni publica una versión del arte. `testimonials_public` no incluye `updated_at` y no hay evidencia de que una regeneración actualice esa columna; `published_at` tampoco representa una revisión del PNG. Usar un hash del texto omitiría cambios exclusivos de diseño. Ninguno se utiliza como versión ficticia, ni se agregan timestamps aleatorios.

La [caché Smart CDN de Storage](https://supabase.com/docs/guides/storage/cdn/smart-cdn) puede invalidarse cuando se sobrescribe un archivo si el plan la ofrece; eso **no purga** las copias de Next y del navegador. Next no proporciona una invalidación pública inmediata por fuente. Puede mostrarse un arte anterior después de regenerar y la nueva consulta de datos públicos no lo resuelve.

**Dependencia futura del panel/contrato público:** publicar una ruta inmutable por revisión o un identificador real de versión del archivo accesible con los datos públicos; luego cambiar `imageUrl` al regenerar. Así el CDN y Next reciben una fuente nueva. Alternativamente se necesita una operación de purga coordinada por el hosting, cuya disponibilidad no se verificó. Nada de esto se implementa en esta feature. La revisión debe aceptar explícitamente la actualización diferida actual; no se promete frescura inmediata.

## Rendimiento local antes/después

Builds de producción en el mismo equipo/Chrome, tres muestras por condición. Antes: réplica HTML y avatar sintético. Después: arte real del Canvas local con datos sintéticos; no es la muestra de PNG públicos de 4MiB facilitada en el pedido. Fría: nuevo servidor/perfil y caché del optimizador vacía. Caliente: recarga en el mismo servidor/navegador. Móvil: 375px, DPR2, 1,6Mbps, latencia 150ms y CPU×4. Escritorio: 1440px/DPR1 sin throttling. No se tomaron capturas durante las mediciones de red.

| Condición | Transferencia total KiB antes → después | Solicitudes antes → después | LCP mediano antes → después |
| --- | --- | --- | --- |
| Escritorio, fría | 308,4 → 292,9 | 22 → 19 | 452 → 456ms |
| Escritorio, caliente | 16,8 → 14,5 | 21 → 18 | 148 → 172ms |
| Móvil lento, fría | 308,6 → 303,0 | 22 → 19 | 1132 → 1116ms |
| Móvil lento, caliente | 16,8 → 14,5 | 21 → 18 | 664 → 636ms |

La transferencia incluye HTML, fuentes, JS, CSS e imágenes, con `transferSize` de Resource Timing; no cuenta bytes internos Storage→optimizador. En caliente los recursos de caché aportan cero bytes aunque figuren como entradas de solicitudes. Eliminar la máscara del logo de la réplica también elimina su PNG adicional de ~21KiB; no se atribuye todo el ahorro al WebP.

La imagen de publicación inicial fue WebP: aproximadamente **9,1KiB a 384px** y **19,3KiB a 750px** de cuerpo; los reportes de red incluyen encabezados. Solo una publicación se descargó inicialmente. No se descargó ningún PNG original de Storage al navegador. Los otros dos se solicitaron al activarlos; volver no agregó otra solicitud de publicación. CLS mediano: escritorio 0; móvil frío ~0,000014 antes y después; caliente 0.

La primera imagen del hero terminó de cargar aproximadamente a 393ms escritorio/1042ms móvil frío, y 84ms/321ms caliente. **Antes ese indicador medía el avatar, no el primer render de texto HTML**: no debe presentarse como una mejora comparable de tiempo de tarjeta. El primer arte queda disponible al finalizar su carga; en móvil está debajo del CTA y puede quedar fuera del viewport inicial. Navegar a la segunda tarjeta, incluyendo animación y comprobación por CDP, dio medianas ~504ms escritorio y ~524ms móvil frío; la réplica anterior no tiene esa medición de navegación registrada.

El LCP queda prácticamente estable en esta muestra, con diferencias pequeñas en ambas direcciones según condición, sin significación estadística ni garantías de producción. No son CWV ni resultados comparables directamente con la auditoría aislada original. La latencia y el coste del PNG real remoto, la complejidad del diseño, codificación fría, proveedor/CDN y contenido de LCP requieren medición en el despliegue real.

Reportes completos: [antes](./ui/assets/carousel-optimized/performance-before.json), [después](./ui/assets/carousel-optimized/performance-after.json), [matriz y siete diseños](./ui/assets/carousel-optimized/qa-results.json).

Los siete diseños del Canvas local produjeron WebP de **19,3–32,4KiB a 750×938px**, desde originales PNG de 198,6KiB–1,69MiB; la altura redondea la proporción en menos de un píxel. Se comprobó HIT al repetir cada variante optimizada. La prueba adicional de cliente sin WebP recibió PNG **redimensionado** 750×938, 135,8KiB frente a 1,69MiB de origen. DPR3 seleccionó 1080px WebP.

## QA reproducible

Desde `apps/testimonios`, después de build:

```text
node scripts/test-carousel-images.mjs
node scripts/test-form-i18n.mjs
pnpm.cmd exec tsc --noEmit --incremental false
pnpm.cmd exec eslint . --max-warnings 0
pnpm.cmd run build
node scripts/qa-carousel-generate.mjs
node scripts/qa-carousel-images.mjs
node scripts/qa-carousel-performance.mjs
node scripts/qa-hero-form-integration.mjs --carousel-images
node scripts/qa-form-submit-validation.mjs --carousel-images
git diff --check
```

`qa-carousel-generate.mjs` ejecuta el renderer Canvas local sin modificarlo; usa solo su módulo visual y constantes, nunca el repository, cliente administrativo o acciones. Los originales generados se ignoran. `qa-public-fixture.mjs` intercepta consultas públicas y todas las peticiones remotas de servidor; el navegador bloquea POST y destinos externos. El optimizador Next recibe PNG sintético como fuente y responde realmente: no se intercepta para fingir WebP.

`--baseline` en el script de rendimiento se utiliza **antes** de sustituir las tarjetas. El reporte anterior ya conservado corresponde al checkout inicial de esta rama; ejecutarlo después de la migración no reconstruye esa versión. Los scripts temporales de las muestras públicas quedaron bajo `.next` y se eliminaron después de ejecutarlos (el primero al compilar); sus resultados seguros se conservan, no los diagnósticos temporales.

Resultados técnicos y matriz final se registran también en el [índice de evidencias](./ui/assets/carousel-optimized/README.md). La revisión visual humana, dispositivos físicos, Safari/Firefox, zoom nativo y lectores de pantalla reales permanecen pendientes. El 200% automatizado corresponde a fuente raíz ampliada; no acredita esos otros entornos. Las cuatro capturas seleccionadas son datos de QA, no testimonios reales ni aprobación de publicación.

Comprobaciones ejecutadas: selector 5/5; suite i18n/validación/servidor con dobles 94/94; TypeScript, ESLint y build correctos; matriz de carrusel 216 estados más DPR3, siete diseños y cantidades/errores; regresión integrada de nueve flujos, 576 alineaciones y controles del checkbox; 45 POST interceptados en la regresión de envío. Cero envíos, uploads o notificaciones reales. Las cuatro capturas se inspeccionaron visualmente sin superposiciones ni desbordamientos observados. El primer intento de build en sandbox no alcanzó Google Fonts; el build normal con acceso de red completó correctamente, sin cambiar las fuentes del proyecto.
