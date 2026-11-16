# Precarga progresiva del carrusel

16/11/2026 · rama de implementación: `perf/testimonios-carousel-preload` · **implementación y revisión manual en localhost completadas el 16/11/2026, con QA aprobado**. El desarrollador confirmó imágenes secundarias disponibles al navegar y una experiencia considerablemente más fluida. La base ya mergeada en dev se conserva: Suspense, disponibilidad, caché/backoff, selección aleatoria, calidad 85, resolución, estilos, texto alternativo, hero/consentimiento y formulario no cambian. Este registro no afirma un despliegue en producción.

## Estrategia

Se reutiliza **el mismo `next/image` de cada tarjeta**, no se crean URLs manuales, objetos `Image` ni `<link rel=preload>`. Mantiene el loader de Next 16.3, sus `srcSet`, `sizes`, calidad 85 y dimensiones. Las guías locales de Image (`node_modules/next/dist/docs/01-app/03-api-reference/02-components/image.md`) distinguen eager/fetchPriority de preload; no se usa preload de alta prioridad para las tres.

1. En SSR solo se monta la primera imagen, eager/high, sin ninguna espera nueva.
2. Su `onLoad` de Next (posterior a decode) o `onError` marca el índice como terminado y monta la segunda, eager/low.
3. Cuando termina la segunda se monta la tercera, eager/low. No hay temporizador ni precarga de historias ajenas a la selección.
4. Las imágenes montadas permanecen disponibles. Un fallo libera la cola y conserva el fallback textual dentro del marco. Sin URL no se intenta descargar; con cero historias no se monta el carrusel, con una no hay trabajo adicional y con dos se prepara solo la segunda.

`carousel-image-queue.ts` añade al estado existente de solicitudes los índices `settled`. `requested` deja de significar solo «visitada»: incluye las precargadas. No se confunde ese estado de red con validaciones o datos del formulario. La cola es pura, idempotente y no muta sus entradas.

Navegar siempre monta el destino inmediatamente si aún no se solicitó. Una imagen activa usa high; las otras low. Activar una precarga pendiente conserva su nodo y URL y cambia el atributo a high. La cola espera a que terminen las solicitudes actuales antes de iniciar otra de fondo. No se cancelan/reinician recursos para imponer prioridad.

**Prioridad nativa:** Chrome registró High/Low/Low en el flujo automático y High al saltar a una tercera imagen aún no solicitada mientras la segunda seguía Low. En la precarga ya iniciada, el atributo pasó a high pero CDP no notificó promoción nativa: las prioridades son indicaciones del navegador. En ese caso no se añade otra precarga competidora hasta que termine. No se promete que cambiar un atributo reordene toda petición en vuelo en cualquier motor.

Las tarjetas inactivas mantienen `aria-hidden`/`inert`, las imágenes son decorativas y sus superficies no muestran el contenido de fondo. La región textual activa, controles, anuncio de posición, áreas táctiles, animaciones y manejo de foco no cambian.

## Comparación medida

Builds de producción local anterior/nuevo; Chrome 157; tres parejas fría/caliente por modo (24 visitas en total). Los mismos tres PNG públicos ya disponibles localmente se reproducen mediante el fixture, sin llamadas a Supabase ni variación de su red. El orden se fija solo en QA. Frío: servidor/perfil nuevos y URLs de fuente nuevas; caliente: recarga en la misma pareja tras haber visitado las tres imágenes. No se elimina caché compartida ni se cambia la selección de producción.

Escritorio: 1440px/DPR1; móvil lento: 375px/DPR2, 1,6Mbps/150ms/CPU×4. La imagen se desplaza al viewport para medir pintura mediante Element Timing. Esto no es el LCP orgánico de la primera pantalla móvil. El snapshot «inicial» se toma tras **3 segundos de lectura de QA desde la primera pintura**, antes de usar flechas, igual antes/después; ese timer no existe en producción. No se ejecutaron otras baterías de navegador en paralelo con las mediciones.

Medianas antes → después:

| Condición | Primera pintura | LCP observado | KiB iniciales totales | KiB iniciales de arte | Solicitudes iniciales |
| --- | ---: | ---: | ---: | ---: | ---: |
| Escritorio frío | 752 → 768ms | 752 → 768ms | 320,9 → 374,1 | 36,4 → 89,3 | 19 → 21 |
| Escritorio caliente | 148 → 144ms | 148 → 144ms | 15,0 → 15,0 | 0 → 0 | 18 → 20 |
| Móvil lento frío | 2332 → 2348ms | 2332 → 2348ms | 375,0 → 490,9 | 90,4 → 206,1 | 19 → 21 |
| Móvil lento caliente | 700 → 660ms | 700 → 660ms | 15,0 → 15,0 | 0 → 0 | 18 → 20 |

LCP y pintura se observaron por separado aunque coincidieran en estas muestras. Carga nativa de la primera imagen: escritorio frío 725→739ms, móvil frío 2288→2291ms. La primera pintura varió 16ms en frío y quedó dentro del rango observado del baseline: escritorio 748–1048ms frente a 764–780ms; móvil 2324–2348ms frente a 2304–2348ms. Tres repeticiones no prueban equivalencia estadística ni una mejora de velocidad inicial; no se observó un perjuicio considerable en esta muestra. CLS: 0 escritorio, ~0,000014 móvil frío, 0 caliente en ambas versiones.

| Condición | Espera del recurso 1→2 | Espera del recurso 2→3 | Navegación lista 1→2, incluida animación | Navegación lista 2→3, incluida animación |
| --- | ---: | ---: | ---: | ---: |
| Escritorio frío | 129 → 0ms | 120 → 0ms | 495 → 498ms | 462 → 476ms |
| Escritorio caliente | 55 → 0ms | 36 → 0ms | 490 → 518ms | 472 → 459ms |
| Móvil lento frío | 468 → 0ms | 497 → 0ms | 511 → 519ms | 538 → 462ms |
| Móvil lento caliente | 64 → 0ms | 47 → 0ms | 520 → 482ms | 481 → 465ms |

«Espera del recurso» mide hasta el evento nativo load desde la activación, con mínimo 0 si ya ocurrió. Incluye montaje/evento y no es una medida pura de red (en caliente no se transfieren bytes). La prueba también espera el estado cargado de Next y fin de animación para «navegación lista». Se elimina la espera adicional por recurso en el escenario medido, no la animación de 420ms ni toda latencia de interacción. Las diferencias pequeñas del tiempo total incluyen CDP y variación local; no se presentan como una mejora uniforme de milisegundos de animación.

Network confirmó tres solicitudes automáticas, en orden, con prioridades High/Low/Low, sin clic previo: segunda después de load de la primera, tercera después de load de la segunda. Las tres usaron 384px en escritorio y 750px en móvil, WebP/q85. Navegar y volver no añadió solicitudes ni otra variante en el mismo viewport/DPR. El cambio anticipa **dos solicitudes y ~53KiB escritorio/~116KiB móvil**; si se visitan las tres, ambas versiones terminan usando los mismos tres recursos. Si no se navega, la nueva versión transfiere trabajo adicional de forma intencional. En caliente hubo entradas de recurso pero 0 bytes de arte desde red.

## QA y reproducción

- Cuatro pruebas nuevas de la cola: 0/1/2/3, ausencias, navegación temprana, error, idempotencia y conservación del estado de navegación.
- Regresión dirigida de red: carga inicial exclusiva, segundo/tercero automáticos, activación de la misma URL en vuelo, salto directo a tercero high con segundo low, retención, fallos de fondo y 0/1/2/3 testimonios.
- Matrices existentes: 270 estados ES/EN/PT a 320/375/768/1440/1920px, DPR1/2/3 y fuente 100/200%; siete diseños/216 estados adicionales; foco, teclado, texto único y fallback.
- Streaming: nueve casos/36 estados, incluyendo interacción con el formulario antes de resolver el carrusel. Las expectativas antiguas de una única descarga se adaptaron a la precarga; las comprobaciones de campos/foco no se redujeron.

Resultado: **115 pruebas unitarias correctas** (4 nuevas de cola, 14 de selector/disponibilidad, 94 de i18n/validación y 3 de resúmenes); ocho casos dirigidos de precarga; matrices y streaming anteriores correctos. Regresión integrada: nueve flujos y 576 alineaciones; envío: 45 POST interceptados, cero envíos reales. TypeScript, ESLint sin warnings, build y `git diff --check` correctos. El primer build restringido no pudo obtener Google Fonts; el build normal con acceso a esa fuente terminó correctamente. No se inspeccionaron `.env*` ni credenciales, ni hubo uploads o cambios externos. Los servidores/perfiles propios se cerraron al terminar.

```text
node scripts/test-carousel-preload.mjs
node scripts/test-carousel-images.mjs
node scripts/test-form-i18n.mjs
node scripts/test-carousel-summary.mjs
pnpm.cmd exec tsc --noEmit --incremental false
pnpm.cmd exec eslint . --max-warnings 0
pnpm.cmd run build
node scripts/qa-carousel-preload-performance.mjs --before  # SOLO contra el build anterior
node scripts/qa-carousel-preload-performance.mjs           # Contra el build nuevo
node scripts/qa-carousel-preload.mjs
node scripts/qa-carousel-preload-performance.mjs --summarize
node scripts/qa-carousel-legibility.mjs
node scripts/qa-carousel-images.mjs
node scripts/qa-carousel-first-visit.mjs --legibility
node scripts/qa-hero-form-integration.mjs --legibility
node scripts/qa-form-submit-validation.mjs --legibility
git diff --check
```

El fixture de replay requiere los tres PNG locales documentados en la etapa de nitidez; la captura pública no se ejecutó en esta iteración. No se deben regenerar un «antes» sobre el build nuevo ni sobrescribir evidencias históricas con otra arquitectura. Los dumps nuevos quedan en `docs/ui/assets/carousel-preload/local/`, ignorados. Solo se selecciona el [resumen compacto](./ui/assets/carousel-preload/results-summary.json) y su [índice](./ui/assets/carousel-preload/README.md); no se incorporan capturas nuevas de una UI que conserva el diseño.

## Límites

Las prioridades son hints; navegar antes de completar la descarga todavía puede mostrar el estado de carga. Una precarga fallida mantiene el fallback y no se reintenta automáticamente, igual que antes. Cambiar viewport/DPR puede solicitar otra resolución legítima y no es un duplicado del mismo recurso. La caché por URL mutable y las carreras HEAD/GET conservan sus límites anteriores.

El navegador recibe arte optimizado, no los PNG de origen. Un MISS del optimizador necesita leer el PNG desde Storage y codificarlo; anticipar imágenes puede anticipar también ese coste/egreso en el servidor. La prueba local no mide red real de Storage, CDN, varias instancias ni saturación del hosting. No es CWV. Dispositivos físicos, Safari/Firefox, zoom nativo y lectores reales requieren revisión manual. La lectura de raster con ampliación conserva los límites de la etapa anterior.
