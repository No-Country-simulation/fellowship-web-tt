# GalleryHeroCarousel

Carrusel del hero con hasta tres testimonios publicados reales, navegación manual y sin autoplay ni consultas propias.

**Archivos:** `components/gallery-hero-carousel.tsx`, `components/gallery-hero-carousel.module.css` y `components/gallery-hero-data.ts`.

## Import y uso

```tsx
import { GalleryHeroCarousel } from "@/components/gallery-hero-carousel";

<GalleryHeroCarousel stories={heroStories} />
```

Es un Client Component integrado por `GalleryHero`, que permanece en el servidor.

## Contrato y selección

Recibe `stories: readonly HeroStory[]`, ya seleccionado y serializado por el servidor. `HeroStory` es un `Pick<PublicTestimonial>` limitado a `id`, `slug`, `quote`, `fullName`, `typeLabel` y `avatarUrl`. No recibe la historia completa, campos profesionales ni datos de contacto. El import desde `public.ts` es solo de tipo.

`app/page.tsx` reutiliza su única llamada a `listPublishedTestimonials()`, que consulta `testimonials_public`. `selectHeroStories`, en el módulo `gallery-hero-data.ts` protegido con `server-only`, conserva los registros disponibles si hay hasta tres. Con más de tres, aplica tres pasos de Fisher–Yates sobre una copia y toma las primeras tres posiciones: selección aleatoria sin reemplazo, sin duplicar posiciones ni alterar el array de la galería. Los IDs de los registros publicados son las claves de las tarjetas.

La selección ocurre una vez por renderizado de servidor; no hay aleatoriedad durante el render cliente, inicializadores o efectos. El array no se reordena al navegar y la hidratación usa la misma selección. Una nueva carga de página puede mostrar otros testimonios. La galería conserva `force-dynamic`, la búsqueda y su orden de publicación.

## Cantidades y error de carga

| Datos | Presentación |
| --- | --- |
| Cero publicados | `GalleryHero` muestra «Pronto vas a encontrar historias de nuestra comunidad.». No monta el carrusel, tarjetas ficticias, controles ni región de estado. El componente también admite `[]` y devuelve `null`. |
| Uno | Una única tarjeta, sin pila, controles, semántica de carrusel o anuncios de navegación. |
| Dos | Dos tarjetas con navegación circular, una sola tarjeta posterior y reserva lateral de 24px desde `sm`. |
| Tres o más | El servidor selecciona hasta tres y conserva la pila original; reserva lateral de 40px desde `sm`. |
| Error | `GalleryHero` recibe `null` y omite la zona de historias. El aviso existente con `role="alert"` permanece solo en la sección inferior; no se interpreta el error como ausencia de publicaciones. |

Cuando cambian los IDs recibidos o su orden, una clave derivada de esa secuencia reinicia el stack y su índice en cero. Evita conservar índices o animaciones de una selección anterior, sin efectos de sincronización. Si solo cambian los datos de las mismas identidades, las tarjetas actualizan su contenido y se conserva la navegación. La identidad del stack no cambia al navegar.

## Tarjetas y enlaces

Cada tarjeta muestra el `quote` público ya preparado por el servidor, `fullName` y `typeLabel`, sin generar ni sustituir contenido. Conserva comillas decorativas, superficies, borde degradado, radio y sombra de los tokens locales. No modifica `TestimonialCard`.

El avatar utiliza `next/image` con `fill`, `sizes="40px"`, `object-cover` y contenedor relativo circular de 40px. Sigue el patrón público de `TestimonialCard`; la configuración existente permite las rutas públicas de Storage en `*.supabase.co`. Usa `alt=""` y contenedor decorativo porque el nombre está al lado. Si no hay URL, conserva `UserRound` como fallback neutro. No agrega fotografías de respaldo inventadas.

El enlace discreto «Ver historia» apunta a `/t/${slug}` y tiene altura mínima de 44px y foco visible. Las tarjetas inactivas son `inert` y no permiten enfocar sus enlaces. Los botones de navegación permanecen fuera de las tarjetas, en la ubicación aprobada, sin interferencia con el enlace.

## Pila y animaciones

Todas las tarjetas suministradas permanecen montadas en `grid-area: 1 / 1`. El stack tiene una altura mínima de 368px en mobile y 384px desde `sm`, con una fila `minmax(0, 1fr)` y altura automática. Las tarjetas se estiran a la altura compartida: conservan el tamaño habitual, pero pueden crecer cuando el texto ampliado o los datos del autor necesitan más espacio. Todas participan en ese cálculo, por lo que navegar entre autores no cambia la altura. Las tarjetas posteriores mantienen su escala visual; su altura de layout coincide con la frontal.

La cita conserva su tipografía y `wrap-anywhere`. Su área flexible usa contención de tamaño y reserva al menos una línea completa (`min-height: 1lh`); el párrafo interior tiene `line-clamp` visual con puntos suspensivos. El texto de la cita no aporta altura intrínseca al stack, por lo que una cita extensa no vuelve a alargar las tarjetas. Las consultas de contenedor seleccionan únicamente el número de líneas completas que cabe en el espacio restante, hasta cinco en mobile y seis desde `sm`. Nombres o categorías más extensos pueden reducir ese número, siempre con espacio real para la línea mínima. Las comillas decorativas y el pie no se comprimen. El recorte se aplica únicamente al párrafo, sin scroll interno ni `overflow-hidden` sobre la tarjeta, por lo que los indicadores de foco permanecen visibles.

El pie permite wrapping entre avatar y datos del autor; estos últimos usan una base flexible de 6rem y pueden pasar a la fila siguiente cuando falta ancho. El nombre y la categoría se conservan completos, y el enlace admite wrapping dentro del ancho disponible. Las flechas mantienen botones de 44×44px también al ampliar la fuente, con la reserva inferior en mobile y lateral desde `sm`. Permanecen fuera de las tarjetas y conservan su identidad y foco; el crecimiento de la altura compartida evita que se superpongan al contenido.

El texto original recibido se conserva íntegro en los datos y en el DOM; no se recortan caracteres con JavaScript ni se agregan tooltips o anuncios que dupliquen la cita. «Ver historia» continúa llevando a la ficha completa mediante el slug real.

La posición se calcula con `(index + total - activeIndex) % total`, únicamente con un total positivo. La frontal tiene escala 1; las posteriores ocupan solo las posiciones existentes, a 18px/0.97 y 36px/0.94. Una capa opaca `::after` atenúa el fondo al 35 % y 60 %, con el contenido posterior oculto visualmente.

Desde `sm`, las posiciones transicionan en 380ms. En «Siguiente», la frontal sale 40px hacia la izquierda y regresa al fondo; en «Anterior», la nueva frontal entra desde 48px a la izquierda. La animación dura 420ms con `cubic-bezier(0.22, 1, 0.36, 1)`. El punto final de retorno se adapta mediante variables CSS: con dos tarjetas, 18px/0.97; con tres, 36px/0.94. Así no se anima hacia una tercera posición inexistente. El texto saliente desaparece al 30 % y el entrante comienza al 45 %.

En mobile, salida y entrada se suceden sin desplazamiento lateral: salida durante el primer 45 % y entrada desde el 50 %, en un ciclo de 420ms.

Durante una animación se ignoran nuevas pulsaciones sin encolarlas ni usar `disabled`; los controles conservan identidad y foco. El efecto existente usa `getAnimations({ subtree: true })` y `Promise.allSettled` sobre `finished`. Resuelve finalización, cancelación y ausencia de animaciones, también al cambiar de breakpoint o preferencia de movimiento. La limpieza y la comparación por identidad de `motion` evitan que un efecto anterior borre una navegación nueva. No usa temporizadores.

Con movimiento reducido, la navegación actualiza el índice sin crear `motion` ni esperar animaciones, incluso ante pulsaciones rápidas. No hay cambios de foco programáticos ni autoplay.

## Responsive y accesibilidad

- Ancho máximo de 28rem, con la reserva lateral correspondiente únicamente si hay pila. En mobile, las inactivas se ocultan sin desplazamiento horizontal.
- Con navegación, los controles mantienen su espacio debajo del autor en mobile y a su derecha desde `sm`. Citas y nombres pueden envolver sin desbordar.
- Con varias historias, región «Testimonios publicados de la comunidad» identificada como carrusel, y diapositivas «N de total». Con una, región «Testimonio publicado de la comunidad» y figura nativa sin semántica interactiva de carrusel.
- Solo la activa se expone a tecnologías asistivas; las inactivas mantienen `aria-hidden` e `inert` booleano de React 19, incluso durante animaciones.
- Controles de 44×44px con etiquetas «Testimonio anterior» / «Siguiente testimonio», `aria-controls`, hover cyan y foco visible inmediato.
- Una única región `aria-live="polite"` del carrusel, solo con varias historias e inicialmente vacía. Tras navegar anuncia «Testimonio N de total», sin repetir citas. La galería conserva su región independiente de conteo.
- `prefers-reduced-motion` desactiva transiciones y animaciones de tarjetas, contenido y controles.

La comprobación de altura cubre anchos de 320, 375, 768, 1024 y 1440px con fuentes base de 16, 20, 24 y 32px, citas breves/extensas/sin espacios, nombres largos y uno, dos o tres elementos. El mínimo habitual no se interpreta como un límite máximo cuando la accesibilidad del contenido requiere crecer.
