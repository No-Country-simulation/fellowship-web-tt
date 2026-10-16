# TestimonialsGallery

Exploración interactiva de las historias publicadas: filtros, contador, grilla y estados vacíos.

**Archivo:** `components/testimonials-gallery.tsx`

## Import y uso

```tsx
import { TestimonialsGallery } from "@/components/testimonials-gallery";

<TestimonialsGallery testimonials={testimonials} />
```

## Props

| Prop | Tipo | Descripción |
| --- | --- | --- |
| `testimonials` | `GalleryTestimonial[]` | Historias obtenidas en el servidor, en su orden de publicación |

`GalleryTestimonial` selecciona exclusivamente `id`, `slug`, `type`, `typeLabel`, `fullName`, `quote` y `avatarUrl` de `PublicTestimonial`. La referencia a `public.ts` es un import de tipo; no incorpora sus funciones de servidor al bundle cliente.

## Filtros y estados

- El estado inicial es `Todos`. Las categorías reales salen de `TESTIMONIAL_TYPES` y `TYPE_LABELS`: Simulación, Primer empleo y Reconversión.
- Los filtros actúan inmediatamente sobre el array recibido. No cambian el orden, la URL ni realizan consultas adicionales.
- El contador indica la cantidad visible, con singular/plural. Solo su nodo es una región `aria-live="polite"`, con `aria-atomic`.
- Sin historias publicadas, muestra el mensaje de estado vacío y un enlace al formulario.
- Un filtro sin coincidencias muestra un mensaje específico y `Ver todas`, que restaura `Todos` y devuelve el foco a ese filtro.
- El error de carga se representa en `app/page.tsx` con `role="alert"`, en lugar de montar este componente con resultados aparentes.

## Presentación y accesibilidad

La barra usa 8px de padding vertical y mantiene el contador a la derecha cuando hay espacio. Los filtros son botones nativos de al menos 44px, con forma pill (`rounded-full`), texto de 13px, `aria-pressed`, foco visible y wrapping en mobile. Todos los estados conservan `font-medium` y un borde de 2px para evitar cambios de ancho al enfocar o seleccionar.

Cada filtro mantiene una capa decorativa absoluta, con `aria-hidden` y sin eventos de puntero: borde `--gradient-brand`, interior de superficies oscuras y sombra interior tenue. Su opacidad cambia entre 0 y 1 según `aria-pressed`, con una transición de 200ms `ease-out`; tanto la salida como la entrada del estado seleccionado se suavizan sin montar ni desmontar la capa. El texto se mantiene por encima y el borde normal conserva su hover debajo de la capa.

El foco es independiente de la selección: el contorno `focus-visible` aparece inmediatamente, sin animar su color ni su geometría. El botón solo transiciona texto y borde; la capa solo transiciona opacidad. Con `prefers-reduced-motion: reduce`, ambas transiciones se desactivan.

La grilla muestra todos los resultados: una columna en mobile, dos desde `md` (768px) y tres desde `lg` (1024px), con gap de 24px. No hay paginación ni límite nuevo.

Cada historia utiliza `TestimonialCard variant="gallery"`, con avatar real, cita recortada a tres líneas y enlace a `/t/[slug]`. En mobile, las filas automáticas permiten una altura independiente según el contenido; desde `md`, la card conserva un mínimo de 17rem. Mantiene hover, foco y reducción de movimiento. El componente y la grilla no agregan nuevos contenedores de scroll.

Los textos provisionales se agrupan en `GALLERY_COPY`. El componente declara `"use client"` para el estado del filtro; la carga de datos y el hero permanecen en el servidor.
