# TestimonialsGallery

Exploración interactiva de las historias publicadas: buscador, filtros, contador, grilla y estados vacíos.

**Archivo:** `components/testimonials-gallery.tsx`

**Estado:** temporalmente fuera del home desde la landing de captación (issue 1). Se conserva la implementación completa para reutilización futura: no se monta, no carga su bundle ni expone buscador, filtros, contador o estados de exploración en `/`.

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

## Búsqueda y categorías

- El estado inicial es `Todos`. Las categorías reales salen de `TESTIMONIAL_TYPES` y `TYPE_LABELS`: Simulación, Primer empleo y Reconversión.
- El buscador tiene placeholder “Buscar por nombre o historia” y busca exclusivamente en `fullName` y `quote`. No recibe campos privados ni incorpora historias fuera del array público proporcionado por el servidor.
- El texto se normaliza con Unicode NFD, eliminación de marcas diacríticas (`\p{M}`), minúsculas y `trim`. Así, “Jose” encuentra “José”, incluso con acentos descompuestos. Se aplica la misma normalización a la consulta, el nombre y el extracto.
- La coincidencia es por subcadena literal en cualquiera de esos dos campos; no hay búsqueda por relevancia, sugerencias ni interpretación de expresiones regulares.
- Búsqueda y categoría actúan juntas e inmediatamente sobre el array recibido. `visible` se deriva de las props y de los estados `filter` y `query`, sin guardar otra copia de los resultados. No cambian el orden, la URL ni realizan consultas adicionales; tampoco requieren debounce.
- Cambiar de categoría conserva el texto. El botón con `X`, “Limpiar búsqueda”, vacía solo el texto y devuelve el foco al input. La consulta conserva lo escrito visualmente; espacios exteriores y diferencias de acentos/caso no alteran la coincidencia. Una consulta solo de espacios se considera inactiva.
- El contador indica la cantidad visible, con singular/plural. Solo su nodo es una región `aria-live="polite"`, con `aria-atomic`.
- Quien reutilice este componente debe resolver los errores de carga antes de montarlo, sin presentarlos como resultados vacíos. Actualmente el error del home se comunica en `GalleryHero` y no monta esta galería.

## Estados vacíos

Se muestra un único estado según el array original y los criterios activos:

| Caso | Mensaje y acción |
| --- | --- |
| Array sin testimonios publicados | “Todavía no hay envíos publicados.”, descripción original y enlace a `/enviar`. El buscador no se muestra. |
| Búsqueda sin coincidencias, categoría Todos | “No encontramos testimonios con esa búsqueda.”, sugerencia de probar otro nombre o palabras y “Limpiar búsqueda”. Conserva la categoría y enfoca el input. |
| Búsqueda y categoría sin coincidencias | “No encontramos testimonios con esa búsqueda y esos filtros.” y “Restablecer filtros”. Restaura Todos, vacía la consulta y enfoca el input. |
| Categoría sin coincidencias, sin búsqueda activa | “No hay historias en esta categoría.” y “Ver todas”. Conserva el comportamiento anterior: restaura Todos y enfoca ese filtro. |

La limpieza del input conserva siempre la categoría, incluso cuando se muestra
el vacío combinado. El contador utiliza en todos los casos la cantidad resultante,
incluidos cero y uno, con singular/plural correctos.

## Presentación y accesibilidad

Buscador y filtros comparten una única barra oscura con borde y esquinas
redondeadas. Hasta `lg`, el buscador ocupa la primera fila a ancho completo y los
filtros se acomodan debajo, separados por 24px. Antes de `sm`, los filtros forman
una grilla de dos columnas iguales: Todos/Simulación y Primer empleo/Reconversión,
con cada botón a todo el ancho de su columna. Desde `sm` recuperan su ancho natural
y permiten wrapping. Desde `lg` (1024px), los filtros quedan a la izquierda sin
comprimirse y el buscador a la derecha, con un ancho de 288px; desde `xl`, de 320px,
sin crecer para llenar el espacio sobrante. El contador queda fuera de la barra, encima,
separado por 8px y sin otra superficie; conserva la única región de estado.

Con texto ampliado, la barra permite que sus grupos pasen a otra fila también
desde `lg`; filtros y buscador se limitan al ancho disponible. Los filtros pueden
envolver sus etiquetas y, antes de `sm`, pasan de dos columnas a una cuando el
ancho interior de la barra es menor que `14rem`. A fuente base de 16px se conserva
la grilla 2 × 2 en 320/375px y la disposición horizontal desktop aprobada.

El buscador usa superficie oscura, borde de los controles existentes y foco cyan.
El input nativo `type="search"` tiene label
accesible oculto asociado mediante un `useId` estable y `aria-controls` hacia
los resultados. El ícono Search es decorativo; el botón de limpieza tiene nombre
“Limpiar búsqueda” e ícono X decorativo. Se oculta la limpieza nativa de WebKit
para evitar dos indicadores superpuestos. El input tiene una altura de `2.75rem`
(44px a fuente base de 16px); el botón de limpieza conserva un área de 44×44px,
centrada verticalmente. Los íconos de 16px y las reservas laterales de 40/48px
no crecen con la fuente, dejando espacio para escribir incluso en 320px con
fuente base de 32px. El texto del input sí respeta la ampliación del navegador.

Escribir y seleccionar categorías conserva el foco en el control utilizado.
Tab y Shift+Tab permiten recorrer el input, su limpieza cuando existe, los
filtros y las tarjetas. Las acciones de los estados vacíos devuelven el foco a
un control que permanece montado. No se implementa un combobox ni otra región
que anuncie los mismos resultados.

La barra usa 16px de padding vertical y 8px desde `lg`. Los filtros son botones nativos de al menos 44px, con forma pill (`rounded-full`), texto de 13px, `aria-pressed` y foco visible. El padding horizontal es de 8px en mobile y 10px desde `sm`, para mantener las etiquetas legibles en la grilla. Todos los estados conservan `font-medium` y un borde de 2px para evitar cambios de ancho al enfocar o seleccionar.

Cada filtro mantiene una capa decorativa absoluta, con `aria-hidden` y sin eventos de puntero: borde `--gradient-brand`, interior de superficies oscuras y sombra interior tenue. Su opacidad cambia entre 0 y 1 según `aria-pressed`, con una transición de 200ms `ease-out`; tanto la salida como la entrada del estado seleccionado se suavizan sin montar ni desmontar la capa. El texto se mantiene por encima y el borde normal conserva su hover debajo de la capa.

El foco es independiente de la selección: el contorno `focus-visible` aparece inmediatamente, sin animar su color ni su geometría. El botón solo transiciona texto y borde; la capa solo transiciona opacidad. Con `prefers-reduced-motion: reduce`, ambas transiciones se desactivan.

La grilla muestra todos los resultados: una columna en mobile, dos desde `md` (768px) y tres desde `lg` (1024px), con gap de 24px. No hay paginación ni límite nuevo.

Cada historia utiliza `TestimonialCard variant="gallery"`, con avatar real, cita recortada a tres líneas y enlace a `/t/[slug]`. En mobile, las filas automáticas permiten una altura independiente según el contenido; desde `md`, la card conserva un mínimo de 17rem. Mantiene hover, foco y reducción de movimiento. El componente y la grilla no agregan nuevos contenedores de scroll.

Los textos provisionales se agrupan en `GALLERY_COPY`. El componente declara `"use client"` para el estado de la búsqueda y del filtro; la carga de datos y el hero permanecen en el servidor. `app/page.tsx` conserva `force-dynamic` y el contrato público existente.
