# GalleryHeroCarousel

Carrusel manual de hasta tres testimonios publicados. Conserva selección, navegación y accesibilidad; su vista utiliza [HeroTestimonialCard](./hero-testimonial-card.md), una réplica HTML de la plantilla Canvas `quote`.

**Archivos:** `components/gallery-hero-carousel.tsx`, `components/gallery-hero-carousel.module.css` y `components/gallery-hero-data.ts`.

## Uso y datos

```tsx
<GalleryHeroCarousel stories={heroStories} />
```

Recibe `stories: readonly HeroStory[]`, preparado en servidor y serializado. `HeroStory` contiene `id`, `slug`, `typeLabel` y el contrato visual: `type`, `quote`, `fullName`, `avatarUrl`, `country`, `role`, `company` y `previousRole`.

Los campos profesionales proceden únicamente de los payloads ya analizados en `PublicTestimonial`, según su tipo real. Se omiten valores ausentes. No se envían historia completa, datos de contacto, captions ni información privada. Las referencias a tipos del servidor se borran al compilar.

`app/(public)/page.tsx` hace una sola llamada a `listPublishedTestimonials()`, que lee `testimonials_public`. `selectHeroStories`, protegido con `server-only`, conserva hasta tres registros; con más, aplica Fisher–Yates parcial sobre una copia. No cambia el orden de los datos originales ni vuelve a consultar Supabase. La selección permanece estable durante la navegación y la hidratación; otra carga puede elegir otros publicados.

## Cantidades y errores

| Datos | Resultado |
| --- | --- |
| Cero | Devuelve `null`; el hero presenta su estado sin publicaciones. |
| Uno | Una figura y enlace a su ficha; sin pila, flechas, contador ni anuncios de navegación. |
| Dos | Navegación circular, una tarjeta posterior; reserva lateral de 16px desde `sm`. |
| Tres | Navegación circular, dos tarjetas posteriores; reserva lateral de 32px desde `sm`. |
| Error | El hero recibe `null` y muestra un estado diferente del vacío; no monta el carrusel. |

La clave del stack depende de los IDs y su orden. Cambiar esa secuencia reinicia el índice; cambiar únicamente los datos conserva la navegación.

## Publicación y herramientas

Cada diapositiva contiene una figura con logo, badge, extracto visual de cinco/seis líneas, autor y metadatos reales. La cita completa permanece en los datos y el DOM; el clamp CSS muestra elipsis sin modificar palabras en JavaScript. El nombre tiene elipsis visual en una sola línea, seguido por país y puesto independientes. No se utiliza el PNG de Storage ni se representa la réplica como arte ya publicado.

«Leer historia», las flechas y el contador visible están **debajo de la pila**, fuera de la composición de la publicación. El enlace apunta al slug activo y su nombre accesible incluye al autor. No se oculta dentro de una diapositiva inactiva. Las flechas conservan identidad y foco al navegar.

## Altura, pila y movimiento

Todas las diapositivas permanecen en `grid-area: 1 / 1` y comparten la altura necesaria para la más alta. La publicación tiene un máximo de **340px**, con 4:5 como referencia mínima (`125cqi`, normalmente 425px de alto). La cita ya no aporta un número ilimitado de líneas. La altura puede crecer con metadatos extensos o fuente ampliada; no hay altura máxima rígida ni scroll interno. El ancho de la publicación no aumenta al ampliar la fuente: se permite crecer en altura.

El carrusel reserva únicamente lo necesario para la pila: hasta 340px con una tarjeta o en móvil, 356px con dos y 372px con tres desde `sm`. La vista recibe ese espacio mediante variables CSS locales, sin cambiar el ancho de la tarjeta por la cantidad disponible.

En móvil, las inactivas se ocultan y la transición secuencial no desplaza lateralmente. Desde `sm`, las posteriores ocupan `12px / 0.97` y `24px / 0.94`, con fondos visibles, contenido oculto y atenuación al 35% / 60%. Las variables de retorno usan los mismos desplazamientos para evitar saltos al finalizar la animación.

Se mantiene el ciclo de 420ms, la transición de posiciones de 380ms y `cubic-bezier(0.22, 1, 0.36, 1)`. Al avanzar, sale la frontal y regresa al fondo; al retroceder, entra la anterior. El contenido saliente desaparece antes de entrar el siguiente. Los selectores de animación apuntan a los bloques internos mediante `data-publication-content`, sin apagar el fondo de la plantilla.

Durante una transición se ignoran clics adicionales, sin encolarlos ni deshabilitar controles. `getAnimations({ subtree: true })` y `Promise.allSettled` resuelven finalización, cancelación y ausencia de animaciones. Con movimiento reducido se cambia directamente el índice y se desactivan transiciones y animaciones.

## Accesibilidad

- Región identificada como carrusel solamente con varias historias; diapositivas «N de total».
- Solo la activa se expone: las otras tienen `aria-hidden` e `inert`.
- Botones de 44×44px con etiquetas, `aria-controls` y foco visible.
- Una única región `aria-live="polite"`, inicialmente vacía, anuncia la posición después de navegar.
- Contador visual `N / total` decorativo para evitar anuncios duplicados.
- Sin autoplay, cambios de foco programáticos ni consultas durante la navegación.
- Nombre y cita completos conservados en DOM y árbol accesible de Chrome; el recorte es CSS y el enlace conduce a la historia completa.

Véase [QA, matriz responsive y limitaciones](../capture-landing-qa.md).
