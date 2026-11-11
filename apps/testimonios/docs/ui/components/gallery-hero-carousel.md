# GalleryHeroCarousel

Carrusel manual de hasta tres testimonios publicados del hero de `/enviar`. Renderiza el PNG administrativo mediante [HeroTestimonialCard](./hero-testimonial-card.md), optimizado por Next. No afecta las tarjetas de la galería futura.

**Archivos:** `components/gallery-hero-carousel.tsx`, `gallery-hero-carousel.module.css` y `gallery-hero-data.ts`.

```tsx
<GalleryHeroCarousel stories={heroStories} locale={locale} />
```

`stories: readonly HeroStory[]` se prepara en servidor con la misma consulta `listPublishedTestimonials()` sobre `testimonials_public`. La selección Fisher–Yates parcial conserva hasta tres registros sin reemplazo y no muta la lista de la galería. El mapper deriva la URL por slug; el wrapper de selección aplica la disponibilidad cacheada descrita abajo, sin listar Storage. Solo transmite campos públicos: identidad, categoría, cita, relato completo, país y contexto profesional activo. No necesita avatar remoto adicional.

`locale` localiza controles, estados de imagen, categorías y etiquetas ES/EN/PT. Los textos de participantes y el arte administrativo no se traducen.

**Selección actual:** `/enviar` usa `selectAvailableHeroStories()` antes de esta vista. Comprueba las URLs candidatas con HEAD públicos cacheados cinco minutos, hasta seis simultáneos y una espera máxima de 200ms; completa los pendientes con `after()`. Selecciona hasta tres con imagen confirmada, o conserva testimonios con `imageUrl: null` si no hay positivos a tiempo. No hay una lista fija de slugs excluidos. [Detalles, revalidación y mediciones](../../carousel-image-availability.md). La selección pura y la composición descritas aquí permanecen; la galería y las fichas no se filtran.

| Cantidad | Comportamiento |
| --- | --- |
| Cero | No monta el carrusel; el hero mantiene su estado vacío. |
| Uno | Arte, alternativa textual y enlace; sin flechas ni contador. |
| Dos / tres | Navegación circular y una / dos superficies posteriores neutras, con reservas laterales de 16 / 32px desde `sm`. |
| Error de listado | El hero muestra su estado de indisponibilidad, distinto de vacío. |

La clave de la pila sigue dependiendo de IDs y orden. El estado de navegación añade únicamente los índices cuya imagen ya se solicitó. Al comenzar solo contiene `0`. La primera imagen se descubre desde el HTML con prioridad alta; una tarjeta futura no tiene `img`, por lo que su ubicación en la pila no dispara lazy loading anticipado. Al navegar se monta su imagen y permanece disponible al volver. No se introduce precarga especulativa.

Las diapositivas mantienen las posiciones, animaciones de 420ms, protección frente a clics durante la transición y resolución con `getAnimations()`/`Promise.allSettled`. Movimiento reducido cambia directamente el índice. El área del arte es siempre 4:5; la lectura textual está fuera de la pila. Se conserva el ancho máximo 340px y las áreas de 44px de los controles.

Solo la activa se expone: las otras conservan `aria-hidden` e `inert`. Un único texto complementario, fuera de las imágenes decorativas, identifica autor, categoría y país y ofrece un `details/summary` nativo para leer la cita, el relato íntegro y los campos profesionales públicos. No se clampa ni recorta ese texto. Expandirlo permite leerlo con fuente ampliada y sin visitar una ruta futura. Cambiar de historia cierra la lectura expandida de la anterior, manteniendo el foco en la flecha utilizada.

«Leer historia» conserva `/t/{slug}` y el nombre accesible del autor. Se desactiva únicamente su prefetch para no competir con el arte inicial ni consultar una ficha no solicitada. Las flechas mantienen su identidad/foco; el contador es decorativo y una única región `aria-live="polite"` anuncia la nueva posición. No hay autoplay ni cambios de foco programáticos.

Ante imagen ausente, red, Storage u optimizador fallidos, el espacio 4:5 muestra un mensaje localizado y la alternativa textual sigue operativa. No se descargan PNG originales como respaldo.

La ruta de detalle sigue siendo una funcionalidad futura y su restricción de publicación es independiente. Estrategia, mediciones, limitación de caché y evidencias actuales: [imágenes optimizadas](../../carousel-optimized-images.md). [QA de la antigua réplica](../capture-landing-qa.md) conserva su carácter histórico.
