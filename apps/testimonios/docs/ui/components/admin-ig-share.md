# AdminIgShare

Card de Instagram 1080×1350 (4:5): preview en canvas, descargar PNG y copiar caption.

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
- Después de publicar, Buffer manda el PNG. Descargar / copiar queda por si hay que reintentar a mano.

No usarlo en la galería pública.

## Props

| Prop | Tipo | Default | Descripción |
| --- | --- | --- | --- |
| `slug` | `string` | — | Nombre del PNG (`testimonio-{slug}.png`) |
| `quote` | `string` | — | Texto de la card |
| `caption` | `string` | — | Caption a copiar / mostrar |
| `type` | `TestimonialType` | — | Elige la variante: simulación, primer empleo o reconversión |
| `fullName` | `string` | — | Nombre en la ficha del autor |
| `country` | `string \| null` | — | País junto al nombre (`Nombre · país`) |
| `avatarUrl` | `string` | — | URL pública del avatar |
| `captureUrl` | `string \| null` | — | Foto de arriba; la captura que subió la persona |
| `company` | `string \| null` | — | Empresa, en la pastilla de primer empleo |
| `role` | `string \| null` | — | Puesto o rol nuevo, bajo el nombre |
| `previousRole` | `string \| null` | — | Oficio anterior, en la pastilla de reconversión |
| `mode` | `"preview" \| "share"` | `"share"` | Solo canvas, o canvas + descargar/copiar caption |

## Ejemplos

### Preview en revisión

```tsx
<AdminIgShare
  mode="preview"
  slug={testimonial.slug}
  caption={caption}
  {...igCardContent(testimonial, quote)}
/>
```

### Después de publicar

```tsx
<AdminIgShare mode="share" … />
```

## Notas

- La card en preview no supera `max-w-md` (448px). El tab (Discord / Instagram / LinkedIn) es full width.
- Layout según el tipo. Simulación: degradado horizontal magenta → índigo (más oscuro que el de marca), “Lo que aprendí”, y el bloque del autor con fondo oscuro semitransparente. Primer empleo: fondo claro y “Contratado por”. Reconversión: fondo oscuro y pastillas Antes → Ahora. La foto de arriba es la captura; si no hay, usa `public/brand/ig-fallback.jpg`. No incluye peer review, reseñas, equipos ni semanas.
- La preview debouncea el quote ~400 ms. Descargar usa el quote actual, no el debounceado.
- Avatar, captura y logo se fetchean con CORS. Si Storage no manda headers CORS, el preview puede fallar; el admin ve el error.
