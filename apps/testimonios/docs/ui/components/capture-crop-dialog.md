# CaptureCropDialog

Diálogo modal nativo para recortar una foto justo después de elegir el archivo.
16:9 para la foto testimonial, cuadrado para el perfil.

## Import

```tsx
import { CaptureCropDialog } from "@/components/capture-crop-dialog";
```

## Props

| Prop | Tipo | Default | Descripción |
| --- | --- | --- | --- |
| `imageUrl` | `string` | — | `objectURL` local de la foto original |
| `kind` | `"capture" \| "avatar"` | `"capture"` | 16:9 o cuadrado |
| `onCancel` | `() => void` | — | Cierra sin guardar |
| `onConfirm` | `(area: Area) => void` | — | Píxeles del recorte |
| `confirming` | `boolean` | `false` | Deshabilita acciones mientras se genera el jpg |
| `returnFocusRef` | `RefObject<HTMLElement \| null>` | Elemento activo al abrir | Control al que devolver el foco al cerrar, si sigue montado |

## Uso

```tsx
<CaptureCropDialog
  imageUrl={sourceUrl}
  kind="avatar"
  confirming={cropping}
  returnFocusRef={inputRef}
  onCancel={closeCrop}
  onConfirm={applyCrop}
/>
```

## Notas

- `react-easy-crop` solo marca el recuadro (arrastrar y zoom) y devuelve los píxeles. El JPG lo recorta `lib/testimonials/prepare-image.ts` con canvas: 1080×608 (16:9) la testimonial, 720×720 el perfil.
- El recorte de perfil es un cuadrado chico (`18rem` / `40vh`) para que el modal no se estire.
- Se abre con `showModal()`, sin animaciones de escala. El título recibe el foco
  inicial; el diálogo tiene nombre y descripción asociados. La modalidad nativa
  deja el contenido exterior inerte. Una guarda local cierra el ciclo de Tab y
  Shift+Tab, evitando que el foco pase a la interfaz del navegador.
- Escape, Cancelar o un clic que empieza y termina fuera del panel cancelan una
  sola vez. Arrastrar desde el recorte hacia el fondo no cancela. Al desmontar se
  cierra el diálogo y se devuelve el foco al control de origen, si sigue disponible.
- Tab permite llegar al área de recorte, Zoom y las acciones. Las flechas mueven
  la foto; Shift reduce el paso para ajustar con precisión. El desplazamiento está
  limitado por los bordes de la imagen: puede requerir aumentar Zoom para tener
  margen de movimiento. El rango Zoom admite las teclas nativas, incluidas las
  flechas, Inicio y Fin. Se mantienen el arrastre y los gestos táctiles.
- Durante la confirmación se bloquean Escape, fondo, Cancelar, Zoom y el área de
  recorte. Una guarda adicional evita confirmaciones simultáneas.
- `closedby="none"` mantiene el cierre bajo control del componente. Escape se
  gestiona dentro del diálogo, sin listeners globales ni cierres nativos que
  puedan interrumpir una confirmación.
- El panel tiene scroll propio limitado al viewport. El recuadro no se comprime
  para ocultar los controles; las acciones pueden envolver en ventanas estrechas.
- El documento exterior bloquea su scroll mediante `html:has(dialog:modal)` en
  `app/globals.css`. `scrollbar-gutter: stable` evita cambios de ancho; el cierre
  conserva la posición y devuelve el foco sin desplazamiento automático.
- El área de carga de `FileField` excluye su placeholder del anclaje mediante
  `overflow-anchor: none`. Evita que el cambio a “Recortando…” desplace el fondo
  al montar el diálogo, sin añadir otro bloqueo ni restauración imperativa del body.
- `FileField` conserva la foto confirmada mientras este diálogo prepara un
  reemplazo. Cancelar o fallar el procesamiento conserva esa foto y su preview;
  la sustitución se aplica después de generar el nuevo archivo correctamente.
