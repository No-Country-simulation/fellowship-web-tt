# GalleryHeroCarousel

Carrusel específico del hero. Sustituye la tarjeta informativa con tres tarjetas reales apiladas y navegación manual, sin autoplay ni consultas.

**Archivos:** `components/gallery-hero-carousel.tsx`, `components/gallery-hero-carousel.module.css` y `components/gallery-hero-data.ts`.

## Import y uso

```tsx
import { GalleryHeroCarousel } from "@/components/gallery-hero-carousel";

<GalleryHeroCarousel />
```

No recibe props. Es un Client Component pequeño integrado por `GalleryHero`, que permanece en el servidor.

## Datos y presentación

`HERO_STORIES` contiene tres entradas locales tipadas con `id`, `quote`, `displayName` y `category`, una por categoría. Los participantes tienen identificaciones genéricas y una representación neutra con `UserRound`; no se usan fotografías ni enlaces a fichas.

La indicación visible **«Ejemplo ilustrativo»** identifica estos contenidos. El `TODO` junto al array exige reemplazarlos por historias reales autorizadas antes de producción. No deben presentarse como testimonios auténticos.

Cada tarjeta incluye comillas tipográficas decorativas con `text-brand-gradient`, cita, autor y categoría. Las superficies, borde degradado tenue, radio y sombra utilizan los tokens locales. No modifica `TestimonialCard`.

## Pila y navegación

Las tres tarjetas permanecen montadas, con claves estables, en `grid-area: 1 / 1`. Todas participan en el cálculo de la altura; el contenido más alto reserva el espacio y evita saltos al navegar, sin recortar las citas.

La posición se calcula con `(index + total - activeIndex) % total`. La frontal tiene escala 1; las posteriores se desplazan 18px y 36px, con escalas 0.97 y 0.94. Sus superficies permanecen opacas: una capa `::after` las oscurece al 35 % y 60 %, sin transparentar las citas. El contenido de las tarjetas posteriores se oculta visualmente.

Desde `sm`, los cambios de posición transicionan en 380ms. En «Siguiente», la frontal sale 40px hacia la izquierda, se desvanece y regresa al fondo; en «Anterior», la nueva frontal entra desde 48px a la izquierda. Estas animaciones duran 420ms con `cubic-bezier(0.22, 1, 0.36, 1)`. El texto saliente termina de desaparecer al 30 % y el entrante comienza a aparecer al 45 %: no hay dos citas visibles mezcladas durante el movimiento.

En mobile, la salida y la entrada se suceden sin desplazamiento lateral: la tarjeta saliente se desvanece durante el primer 45 % y la entrante aparece desde el 50 %, en un ciclo total de 420ms. Las tres tarjetas siguen montadas y contribuyendo a la altura.

Los botones anterior/siguiente recorren el array de forma circular. Permanecen fuera de las tarjetas, superpuestos abajo a la derecha, y conservan su identidad y foco. Durante una animación se ignoran nuevas pulsaciones, sin encolarlas ni aplicar `disabled`; una vez finalizada se puede navegar nuevamente.

`motion` guarda la dirección y la tarjeta saliente. Un efecto obtiene las animaciones CSS reales del stack y sus descendientes mediante `getAnimations({ subtree: true })`; `Promise.allSettled` espera sus promesas `finished`, tanto si terminan como si se cancelan. También resuelve si no hay animaciones. Así un cambio de breakpoint o de preferencia de movimiento no deja el carrusel bloqueado. La limpieza comprueba la identidad de `motion` y descarta efectos anteriores para no borrar una navegación nueva. No depende de `onAnimationEnd` ni utiliza temporizadores.

Con movimiento reducido, `navigate` actualiza el índice sin crear `motion` ni esperar animaciones, incluso ante pulsaciones rápidas. No hay cambios de foco programáticos.

## Responsive y accesibilidad

- Ancho máximo de `28rem`. Desde `sm` se reservan 40px para las tarjetas posteriores; por debajo, las inactivas se ocultan visualmente y no se desplazan lateralmente.
- En mobile, los controles tienen su propio espacio debajo del autor. Desde `sm`, comparten visualmente la fila inferior, con espacio reservado para evitar solapamientos.
- Citas y nombres pueden envolver; todas las tarjetas contribuyen a una altura común.
- Región identificada como carrusel; solo la diapositiva activa se expone a tecnologías asistivas. Las posteriores usan `aria-hidden` e `inert` booleano de React 19 y no reciben interacción.
- Botones de 44×44px, etiquetas «Testimonio anterior» / «Siguiente testimonio», `aria-controls`, hover cyan y foco visible inmediato.
- Estado `aria-live="polite"` inicialmente vacío. Tras una acción anuncia únicamente «Testimonio N de 3»; no repite las tres citas. Hay un indicador visual de posición junto a la aclaración ilustrativa.
- `prefers-reduced-motion` desactiva transiciones y animaciones de tarjetas, contenido y controles; la navegación sigue funcionando.
