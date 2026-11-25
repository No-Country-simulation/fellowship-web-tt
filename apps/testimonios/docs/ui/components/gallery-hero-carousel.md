# GalleryHeroCarousel

Carrusel manual de hasta tres testimonios publicados del hero de `/enviar`. Renderiza el PNG administrativo mediante [HeroTestimonialCard](./hero-testimonial-card.md), optimizado por Next. No afecta las tarjetas de la galería futura.

**Archivos:** `components/gallery-hero-carousel.tsx`, `gallery-hero-carousel.module.css` y `gallery-hero-data.ts`.

```tsx
<GalleryHeroCarousel stories={heroStories} locale={locale} />
```

`stories: readonly HeroStory[]` se prepara en servidor con la misma consulta `listPublishedTestimonials()` sobre `testimonials_public`. La selección Fisher–Yates parcial conserva hasta tres registros sin reemplazo y no muta la lista de la galería. El mapper deriva la URL por slug; el wrapper de selección aplica la disponibilidad cacheada descrita abajo, sin listar Storage. Solo transmite campos públicos: identidad, categoría, cita, relato completo, país y contexto profesional activo. No necesita avatar remoto adicional.

`locale` localiza controles, estados de imagen, categorías y etiquetas ES/EN/PT. Los textos de participantes y el arte administrativo no se traducen.

**Selección actual:** `/enviar` inicia las historias como promesa y el hero consume su resultado dentro de un `Suspense` exclusivo del carrusel. `selectAvailableHeroStories()` entrega hasta tres confirmadas sin esperar las restantes, o espera a terminar las comprobaciones acotadas si hay menos; `after()` completa el resto. No hay corte de 200ms que congele una respuesta textual. Confirmados/ausentes usan Next Data Cache cinco minutos; fallos transitorios no se almacenan como ausencias y tienen backoff de 15s por proceso. Se mantiene máximo de seis HEAD/800ms y no hay exclusión fija de slugs. [Streaming, caché y mediciones](../../carousel-first-visit.md); [etapa anterior](../../carousel-image-availability.md). La galería y las fichas no se filtran.

| Cantidad | Comportamiento |
| --- | --- |
| Cero | No monta el carrusel; el hero mantiene su estado vacío. |
| Uno | Arte, alternativa textual y enlace; sin flechas ni contador. |
| Dos / tres | Navegación circular y una / dos superficies posteriores neutras, con reservas laterales de 16 / 32px desde `sm`. |
| Error de listado | El hero muestra su estado de indisponibilidad, distinto de vacío. |

La clave de la pila sigue dependiendo de IDs y orden. `requested` conserva los índices cuyas imágenes se montaron, por navegación o precarga, y `settled` registra las que terminaron en carga o error. La primera se descubre desde el HTML, eager/high. Cuando termina, se monta la segunda eager/low; al terminar ésta, la tercera eager/low. La cola vive en `carousel-image-queue.ts` y no usa timers, efectos de polling ni URLs alternativas. No se espera a un clic.

Si la persona navega antes, el destino se monta inmediatamente con prioridad high o se conserva su mismo `Image` en vuelo y su atributo pasa a high. No se desmontan las visitadas/precargadas, ni se inician nuevas descargas de fondo mientras las solicitadas sigan pendientes. Cambiar prioridad no cambia `srcSet`, `sizes`, calidad 85 ni la identidad del elemento: se reutiliza el recurso del navegador. Un error libera la cola y conserva el fallback. Solo se consideran los archivos de las historias seleccionadas con URL disponible.

`fetchPriority` es una indicación al navegador. Chrome mostró High/Low/Low al descargar automáticamente y High para un destino nuevo activado antes de tiempo; no notificó cambio nativo de prioridad para una petición Low ya iniciada aunque su atributo pasara a high. No se reinicia esa petición ni se prometen prioridades estrictas entre navegadores. Estrategia, mediciones, límites y comandos: [precarga progresiva](../../carousel-preload.md).

Las diapositivas mantienen las posiciones, animaciones de 420ms, protección frente a clics durante la transición y resolución con `getAnimations()`/`Promise.allSettled`. Movimiento reducido cambia directamente el índice. El área del arte es siempre 4:5; el equivalente textual pertenece a esa misma tarjeta. Se conserva el ancho máximo 340px y las áreas de 44px de los controles.

Solo la activa se expone: las otras conservan `aria-hidden` e `inert`. No hay autor/categoría visibles debajo del arte ni `details/summary`. [HeroTestimonialCard](./hero-testimonial-card.md) aporta una única región con relato completo, contexto público y autor; el bitmap es decorativo. Su equivalente textual se revela dentro de 4:5 ante fallo, foco de teclado o relación ancho/fuente insuficiente (incluye la matriz al 200%); los relatos largos tienen scroll nativo. No se duplica el texto debajo ni se requiere visitar la ficha para leer el fallback. Cambiar de historia mantiene el foco en la flecha utilizada.

«Leer historia» conserva `/t/{slug}` y el nombre accesible del autor. Se desactiva únicamente su prefetch para no competir con el arte inicial ni consultar una ficha no solicitada. Las flechas mantienen su identidad/foco; el contador es decorativo y una única región `aria-live="polite"` anuncia la nueva posición. No hay autoplay ni cambios de foco programáticos.

Ante imagen ausente, red, Storage u optimizador fallidos, el espacio 4:5 muestra el relato completo con un estado localizado. No se descargan PNG originales como respaldo. La interfaz normal conserva arte, un solo enlace «Leer historia» y controles. Calidad 85 solo para publicaciones, mediciones y límites de accesibilidad visual: [nitidez y carrusel compacto](../../carousel-legibility.md).

La ruta de detalle sigue siendo una funcionalidad futura y su restricción de publicación es independiente. Estrategia, mediciones, limitación de caché y evidencias actuales: [imágenes optimizadas](../../carousel-optimized-images.md). [QA de la antigua réplica](../capture-landing-qa.md) conserva su carácter histórico.
