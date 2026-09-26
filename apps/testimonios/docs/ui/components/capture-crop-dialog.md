# CaptureCropDialog

Preview para recortar una foto justo después de elegir el archivo. 16:9 para la foto testimonial, cuadrado para el perfil.

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

## Uso

```tsx
<CaptureCropDialog
  imageUrl={sourceUrl}
  kind="avatar"
  confirming={cropping}
  onCancel={closeCrop}
  onConfirm={applyCrop}
/>
```

## Notas

- `react-easy-crop` solo marca el recuadro (arrastrar y zoom) y devuelve los píxeles. El JPG lo recorta `lib/testimonials/prepare-image.ts` con canvas: 1080×608 (16:9) la testimonial, 720×720 el perfil.
- El recorte de perfil es un cuadrado chico (`18rem` / `40vh`) para que el modal no se estire.
- Escape o click fuera cancela.
