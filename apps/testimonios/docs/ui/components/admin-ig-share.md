# AdminIgShare

Card de Instagram 1080×1080: preview en canvas, descargar PNG y copiar caption.

**Archivo:** `components/admin-ig-share.tsx`

Uso previsto: `/admin/[id]`, tab Instagram. En revisión (`mode="preview"`) solo el canvas; el caption lo edita el form al lado (`AdminCaptionField` + Generar con IA). Después de publicar (`mode="share"`) suma **Descargar imagen** y **Copiar caption**, con la card a la izquierda y el caption a la derecha.

El dibujo vive en `lib/testimonials/ig-card-canvas.ts` (`drawIgCard`). Tamaño y nombre de archivo: `lib/testimonials/ig-card.ts`. No hay ruta `/admin/[id]/ig-card` ni `next/og`.

## Import

```tsx
import { AdminIgShare } from "@/components/admin-ig-share";
```

## Cuándo usarlo

- Preview de la card mientras el admin retoca el quote
- El caption se edita en el form (columna derecha del tab, con Generar con IA), no adentro de este componente. LinkedIn sí edita adentro del preview (`LinkedInPublishPreview`).
- Descargar el PNG y copiar el caption para subir a Instagram a mano

No usarlo en la galería pública. Instagram en v1 no se postea solo.

## Props

| Prop | Tipo | Default | Descripción |
| --- | --- | --- | --- |
| `slug` | `string` | — | Nombre del PNG (`testimonio-{slug}.png`) |
| `quote` | `string` | — | Texto de la card |
| `caption` | `string` | — | Caption a copiar / mostrar |
| `fullName` | `string` | — | Nombre al pie |
| `avatarUrl` | `string` | — | URL pública del avatar |
| `instagram` | `string \| null` | — | Handle (`@nombre`) o null |
| `typeLabel` | `string` | — | Tipo debajo del logo, en mayúsculas |
| `contextLine` | `string \| null` | — | Puesto/empresa o reconversión |
| `mode` | `"preview" \| "share"` | `"share"` | Solo canvas, o canvas + descargar/copiar caption |

## Ejemplos

### Preview en revisión

```tsx
<AdminIgShare
  mode="preview"
  slug={testimonial.slug}
  quote={quote}
  caption={caption}
  fullName={testimonial.fullName}
  avatarUrl={testimonial.avatarUrl}
  instagram={testimonial.instagram}
  typeLabel={testimonial.typeLabel}
  contextLine={adminContextLine(testimonial)}
/>
```

### Después de publicar

```tsx
<AdminIgShare mode="share" … />
```

## Notas

- La card en preview no supera `max-w-md` (448px). El tab (Discord / Instagram / LinkedIn) es full width.
- Layout de la card: barra rosa, logo, tipo, avatar, quote, contexto, nombre, handle.
- La preview debouncea el quote ~400 ms. Descargar usa el quote actual, no el debounceado.
- El avatar y el logo se fetchean con CORS. Si Storage no manda headers CORS, el preview puede fallar; el admin ve el error.
