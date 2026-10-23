# TestimonialCapture

Foto testimonial con estados de carga y error, aparición suave y ampliación accesible. Es el límite cliente de la ficha, dedicado a la presentación e interacción de este medio. Conserva el nombre técnico `TestimonialCapture` y el contrato `captureUrl`.

**Archivo:** `components/testimonial-capture.tsx`.

## Import y uso

```tsx
import { TestimonialCapture } from "@/components/testimonial-capture";

{testimonial.captureUrl ? (
  <TestimonialCapture
    src={testimonial.captureUrl}
    participantName={testimonial.fullName}
  />
) : null}
```

| Prop | Tipo | Descripción |
| --- | --- | --- |
| `src` | `string` | URL pública existente de la foto testimonial, sin transformaciones |
| `participantName` | `string` | Nombre para el texto alternativo y los nombres accesibles |

## Presentación

La foto vive dentro de una superficie con borde y esquinas redondeadas. Usa un `img` nativo porque no se conocen sus dimensiones: `w-auto h-auto max-w-full` conserva su proporción y evita escalar sobre su resolución natural. No tiene altura máxima en la ficha. `TestimonialDetail` limita su contenedor a 768px (`w-full max-w-3xl`), alineado a la izquierda y ajustado al espacio disponible en mobile. El marco interno respeta ese límite sin recortar fotos verticales o cuadradas. Tanto la vista inicial como la ampliada usan `loading="lazy"` y `decoding="async"`.

El control muestra “Ampliar foto” debajo de la imagen para no taparla ni desbordar imágenes pequeñas. No hay `figcaption` ni otro pie visible. El alt es “Foto testimonial de [nombre]”, el botón listo se llama “Ampliar foto testimonial de [nombre]” y el diálogo “Foto testimonial de [nombre], vista ampliada”. En el diálogo nativo, la imagen completa se ajusta al viewport con ancho y alto automáticos, límites máximos y `object-contain`, sin recortes ni deformaciones. El máximo de 768px de la vista integrada no limita esta ampliación.

## Carga, caché y errores

- Mientras se descarga y decodifica la foto, aparece una superficie estática `bg-bg-surface-3`, con “Cargando foto testimonial…” y `aria-busy` en la figura. No utiliza shimmer ni pulsos.
- `onLoad` espera a `HTMLImageElement.decode()` antes de revelar la imagen con una transición de opacidad de 200ms. `motion-reduce:transition-none` elimina la transición cuando se solicita movimiento reducido.
- El callback de la ref también revisa `complete` y `naturalWidth`: si la imagen ya llegó desde caché o terminó antes de la hidratación, inicia su decodificación sin depender de recibir otro evento `load`. El placeholder se retira al estar lista.
- Cada `src` monta una instancia interna con estado independiente mediante `key`. Al cambiar de testimonio no se reutiliza el estado listo de la imagen anterior. Las promesas de decodificación comprueban que su nodo siga siendo el actual antes de actualizar el estado; resultados tardíos de nodos desmontados se descartan.
- Si falla la descarga o la decodificación, la imagen se oculta y el placeholder se reemplaza por “No pudimos cargar la foto testimonial.”. Una única región `role="status"` fuera del botón comunica el estado a lectores de pantalla incluso cuando el control está deshabilitado; los textos visibles de estado son decorativos. Se desactiva `aria-busy` y se indica “Foto testimonial no disponible”, sin icono de imagen rota ni carga permanente. No se reintenta automáticamente ni se modifica la URL.
- El `<figure>` usa `relative` para contener la posición absoluta de esa región `sr-only`. Así el anuncio permanece dentro de la figura sin ampliar el documento con espacio vacío. No se cambia el padding de la ficha.
- El disparador permanece deshabilitado durante la carga o el error. Solo ofrece la ampliación cuando la imagen está disponible y decodificada; el diálogo conserva su imagen nativa y utiliza el recurso ya descargado.

## Reserva de espacio y limitación

La ficha recibe la URL sin dimensiones explícitas. El flujo actual del formulario prepara fotos testimoniales horizontales de 1080×608, pero esa convención no permite atribuir el mismo tamaño a todos los archivos existentes. Sin modificar consultas ni agregar campos, el navegador puede descubrir las dimensiones reales mediante `naturalWidth` y `naturalHeight` al leer el recurso.

Hasta conocerlas, el control aprovecha todo el ancho disponible y el marco utiliza una proporción **provisional de 16:9**, coherente con las fotos horizontales del formulario. Esta proporción pertenece al placeholder; no se aplica a la imagen final como recorte.

Un `ResizeObserver` detecta los cambios de tamaño del `img` nativo oculto y consulta sus dimensiones intrínsecas. Algunos formatos y respuestas permiten conocerlas antes de completar la descarga. También se comprueban al conectar la ref y en `onLoad`, incluyendo imágenes en caché. El observador se desconecta al obtener las dimensiones, ante un error o al desmontar el nodo; no agrega peticiones ni sondeos periódicos.

Una vez conocidas, el marco conserva el ancho natural limitado al espacio disponible y la proporción exacta de esa imagen, durante el resto de la carga, la decodificación y el fade-in. El cambio a estado listo solo modifica la opacidad y retira el fondo del skeleton, sin eliminar la reserva geométrica. Una foto vertical, cuadrada o pequeña usa sus propias dimensiones, aunque difieran de la estimación inicial. El control puede ser algo más ancho que una imagen pequeña para alojar su etiqueta; la imagen no se amplía.

Las etiquetas de carga y ampliación comparten una celda de grid; la etiqueta inactiva conserva su espacio con `invisible`. Así el texto y el icono tampoco modifican las dimensiones del botón durante el fade-in, incluso con imágenes pequeñas. Estas etiquetas están dentro del flujo del control y son decorativas para accesibilidad; el anuncio de estado sigue separado del botón.

El `img` queda posicionado dentro del marco con ancho y alto automáticos y `max-w-full`, sin deformaciones ni ampliación sobre su resolución natural. El marco contiene su overflow mientras se descubre el tamaño; cuando la imagen es visible, su proporción coincide con la del marco y se muestra completa. El `<figure relative>` sigue conteniendo el anuncio accesible para evitar espacio vacío al final del documento.

La solución mantiene estable la transición **desde que se conocen las dimensiones reales**, pero no garantiza eliminar el layout shift de la primera carga: una foto vertical, cuadrada o pequeña puede requerir corregir la estimación 16:9. Si el navegador no expone dimensiones durante la descarga, ese ajuste ocurre en `onLoad`, antes de revelar la imagen. La caché permite resolverlas de inmediato cuando el recurso ya está disponible. No se agregan props de dimensiones, consultas, transformaciones de URLs ni cambios de esquema.

## Tamaño visual y transferencia

El límite CSS de la ficha reduce el ancho renderizado, no la resolución ni el peso del archivo descargado. Ambos `img` mantienen el mismo `src` original, sin `srcset`, miniaturas ni transformaciones de Storage. El diálogo puede reutilizar el recurso según la caché HTTP del navegador; limitar el ancho no garantiza una transferencia menor ni una única petición en cualquier política de caché.

Una optimización real podría requerir una miniatura independiente para la vista integrada y el original para ampliar. Debe evaluarse como trabajo futuro, confirmando compatibilidad de variantes, rutas y procesamiento; no se modifica la compresión ni los límites del formulario en esta presentación.

## Accesibilidad

- El disparador es un `button` con nombre accesible específico, `aria-haspopup="dialog"` y `aria-controls` asociado a un ID generado con `useId`.
- `showModal()` abre un `<dialog>` nativo en la capa modal. El navegador mantiene inerte el contenido exterior y administra la navegación de foco del modal.
- Al abrir se enfoca el botón visible “Cerrar”. Escape utiliza el cierre nativo; el botón también llama a `close()`.
- `onClose` devuelve el foco al disparador sin cambiar el scroll, tanto al cerrar con Escape como con el botón.
- Los controles tienen foco visible y al menos 44px de alto. Los iconos son decorativos. Las transiciones respetan `prefers-reduced-motion`.
- `html:has(dialog:modal)` bloquea el scroll del documento desde `app/globals.css`. `scrollbar-gutter: stable` conserva el ancho al abrir y cerrar. No se agregan listeners globales ni cambios imperativos en el body.

No requiere librerías adicionales. Presupone navegadores modernos compatibles con diálogo modal nativo, `:modal`, `:has()` y `scrollbar-gutter`, acordes al stack de la app. Si se reutiliza fuera de esta app, el documento anfitrión debe ocuparse del bloqueo de scroll. No usar como herramienta de recorte o editor de imágenes.
