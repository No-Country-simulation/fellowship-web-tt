# HeroTestimonialCard

Vista presentacional de un testimonio público con la apariencia de «Cita». No consulta datos, publica, exporta imágenes, edita contenido ni incorpora dependencias del panel.

**Archivos:** `components/hero-testimonial-card.tsx` y `components/hero-testimonial-card.module.css`.

## Uso y contrato

```tsx
<HeroTestimonialCard story={story} />
```

`story: HeroTestimonialCardContent` requiere `type`, `quote`, `fullName`, `country`, `avatarUrl`, `role`, `company` y `previousRole`. País y campos profesionales admiten `null`. Solo muestra datos suministrados; no inventa puestos, empresas o experiencias. La inicial del autor sustituye al avatar cuando falta URL.

La selección y la adaptación de `PublicTestimonial` pertenecen a `gallery-hero-data.ts`. La vista se puede reutilizar sin el carrusel y sin acoplarla a una consulta de galería.

## Origen del diseño

Referencia: `apps/panel-admin/features/testimonials/infrastructure/ig-card-canvas.ts`:

| Función / constantes | Traslado visual |
| --- | --- |
| `drawQuoteDesign`, `quoteDesignPlacement` | Logo y badge arriba, comilla decorativa, kicker y cita central, separador y autor abajo. |
| `drawBody`, `learningGradient` | Simulación: degradado horizontal `#e63292 → #0e1f99`; Primer empleo: `#f4f2f6`; Reconversión: `#070b18`. |
| `PINK`, `INK` | `#ff3d9a`, `#16132b`. |
| `drawBadge`, `COPY` | Copy y colores propios de cada tipo, sin cambiar etiquetas del formulario. |
| `drawHexDecoration` | Hexágonos de radios 250 y 170, centro `(990,430)` del formato 1080×1350; opacidades por categoría. |
| `drawLogo` | Mismo asset, tintado con `mask` y `currentColor`. |
| `drawAuthorInline`, `drawHexAvatar` | Avatar hexagonal, borde rosa, nombre, país y rol. |
| `drawHiredPill`, `drawCheck`, `drawTransition` | Empresa o transición profesional solamente cuando existen los datos pertinentes. |

Los assets `/brand/logo-no-country.png` y `/brand/ig-fallback.jpg` ya son idénticos entre las dos apps. Esta vista solo necesita el logo y el avatar recibido, sin foto de respaldo.

La fuente del Canvas procede de `getComputedStyle(document.body).fontFamily`; el panel usa `ui-sans-serif, system-ui, sans-serif`. Se aplica esa pila únicamente a la publicación, manteniendo DM Sans en el resto de la app.

La escala se adapta al tamaño del hero; no multiplica indiscriminadamente medidas del Canvas. Con fuente raíz de 16px: cita `clamp(1.0625rem, 6.05cqi, 1.375rem)` (17–22px; 20,57px a 340px), peso 600 e interlineado `1.35`; nombre 15–17px (16px a 340px); país y rol 12px; kicker y badge 10px; empresa y transición 12px. El avatar se limita a 44–52px, el padding a 16px y la separación del autor a 10px incluso con fuente ampliada: no consumen ancho adicional que fuerce los metadatos a columnas estrechas. Los mínimos tipográficos en `rem` sí responden a fuente ampliada. Los colores se declaran en variables locales; no se sustituyen por el degradado global rosa/cyan.

## Variantes y selector administrativo

- `simulation`: badge «APRENDIZAJE», kicker «LO QUE APRENDÍ», blanco sobre degradado.
- `first_job`: badge «Conseguí empleo», kicker «MI PRIMER EMPLEO», tinta sobre fondo claro y empresa si existe.
- `career_change`: badge «RECONVERSIÓN PROFESIONAL», kicker «MI RECONVERSIÓN», fondo oscuro y transición si existen ambos roles.

El dibujante Canvas soporta los tres tipos, pero el selector administrativo **solo ofrece `quote` para Simulación**. La réplica conserva la categoría real: no significa que las otras variantes estén habilitadas en el selector ni que se hayan generado/publicado imágenes con ellas.

## HTML frente al PNG

El arte original es un PNG fijo 1080×1350 (4:5), con coordenadas absolutas, reducción de fuente hasta 30px y posible elipsis. Esta vista es HTML: no es ese archivo ni garantiza igualdad píxel a píxel.

Se conserva 4:5 como **altura mínima de referencia**, mediante `min-height: 125cqi`, con altura de contenido y estiramiento dentro de la pila. La publicación tiene un ancho máximo de 340px; una tarjeta habitual mide 340×425px. No hay altura máxima rígida, scroll interno ni recorte del encabezado o del bloque de autor.

La cita se limita **solo visualmente** con `-webkit-line-clamp`: seis líneas en Simulación y cinco en Primer empleo/Reconversión, reservando espacio para sus recursos específicos. El navegador muestra elipsis cuando corresponde. No hay `slice`, generación de otro extracto ni alteración de los datos. El texto íntegro permanece en el DOM; Chrome lo conserva en su árbol de accesibilidad, verificado con CDP. «Leer historia», fuera del arte, da acceso a la ficha completa.

El autor usa una grilla de avatar y columna `minmax(0,1fr)`: nombre en una línea con elipsis CSS, país debajo y puesto después del país. El nombre completo permanece en su nodo de texto y en el árbol accesible. País y rol son independientes y admiten wrapping; si faltan no generan filas vacías. Los nombres largos no desplazan el avatar, centrado respecto del bloque. No hay tooltip ni anuncios duplicados.

Diferencias deliberadas:

- Las citas largas quedan limitadas a cinco/seis líneas y los nombres a una; ambos textos completos se conservan para tecnologías de asistencia.
- Header, badges, país, puesto y pills permiten wrapping; el nombre tiene su propia fila y no comparte espacio con el país.
- Los metadatos extensos y la fuente ampliada pueden aumentar la altura para no esconder información esencial. La longitud ilimitada de la cita ya no determina esa altura.
- El HTML puede mover la cita respecto de las coordenadas exactas del Canvas para alojar esos contenidos.
- La pila comparte la mayor altura para que navegar no desplace los controles.
- Enlaces y flechas quedan fuera de la publicación.
- El sistema operativo y su rasterización pueden variar la fuente del sistema, como ocurre con el generador original.

El SVG decorativo es `aria-hidden`; el avatar tiene `alt=""` porque el autor ya se identifica en el `figcaption`. La comilla es decorativa. El texto original no se regenera; se utiliza la utilidad pública existente `stripWrappingQuotes` para evitar comillas duplicadas.

## Referencia del panel revisada el 30/10/2026

Se releyeron `drawAuthorText`, `drawNameAndCountry`, `truncateToWidth`, `layoutQuote` y la preview `IgShare` del checkout actual (último commit local del generador: `4dbcfb2`). El Canvas reserva como máximo 42% del ancho de autor para el país, limita el nombre al resto, trunca país/rol por ancho y reduce la cita hasta 30px antes de añadir elipsis. Su preview conserva el PNG 4:5 con `max-w-md`.

El generador ya separa nombre y país, y el HTML del hero conserva su propio criterio (nombre en una línea con elipsis). Se vuelve a ejecutar ese generador sin modificarlo para comparar PNG y HTML a 340px, con los mismos fixtures normales y extensos.

## Validación

Véase [QA y comparación con el Canvas real](../capture-landing-qa.md). Las imágenes de QA usan fixtures identificados; no son testimonios ni publicaciones reales. Las URLs finales `share-cards/{slug}/instagram.png` no se consultan para dibujar esta tarjeta.
