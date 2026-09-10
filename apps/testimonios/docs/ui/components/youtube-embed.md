# YoutubeEmbed

Iframe 16:9 para un video de YouTube ya parseado.

**Archivo:** `components/youtube-embed.tsx`

Uso previsto: ficha pública (`/t/[slug]`) y envío original del admin (`AdminSubmission`). V1 no sube mp4: solo embebe un link.

## Import

```tsx
import { YoutubeEmbed } from "@/components/youtube-embed";
```

## Cuándo usarlo

- Mostrar el video que el talento pegó en `/enviar`
- El envío original en `/admin/[id]` (`AdminSubmission`)

No pasarle una URL de watch (`youtube.com/watch?v=`). El `src` tiene que ser `https://www.youtube.com/embed/{id}`. Para convertir el link crudo usá `youtubeEmbedSrc` de `lib/testimonials/parse.ts` (ya lo hacen `public.ts` y `admin-view.ts` como `youtubeEmbedUrl`).

## Props

| Prop | Tipo | Default | Descripción |
| --- | --- | --- | --- |
| `src` | `string` | — | URL de embed (`youtube.com/embed/…`) |
| `title` | `string` | `"Video de YouTube"` | `title` del iframe (a11y). Preferí incluir el nombre |

## Ejemplos

### Ficha pública

```tsx
{testimonial.youtubeEmbedUrl ? (
  <YoutubeEmbed
    src={testimonial.youtubeEmbedUrl}
    title={`Video de ${testimonial.fullName}`}
  />
) : null}
```

### Desde un URL crudo

```tsx
import { youtubeEmbedSrc } from "@/lib/testimonials/parse";

const src = youtubeEmbedSrc(videoUrl);
if (src) {
  return <YoutubeEmbed src={src} title="Video de Ana Pérez" />;
}
```

## Notas

- Contenedor `aspect-video`, `rounded-md`, borde. El iframe es `size-full`.
- `allowFullScreen` y permisos estándar de YouTube (autoplay, picture-in-picture, etc.).
- Si no hay video, no renderices el componente: no hay empty state.
- Es Server Component (sin `"use client"`).
