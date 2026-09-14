# DiscordEmbedPreview

Recreación visual del embed que manda el webhook al canal de comunidad.

**Archivo:** `components/discord-embed-preview.tsx`

Uso previsto: preview en `/admin/[id]` (revisión y publicado), tab Discord (por defecto). El panel limita el embed a la mitad del ancho. El payload real lo arma `buildCommunityEmbed` / `communityEmbedFromRow` (`lib/testimonials/community-embed.ts`); este componente solo lo pinta.

Para un `AdminTestimonial` + quote en vivo usá `DiscordPublishPreview` (wrapper, misma carpeta).

## Import

```tsx
import { DiscordEmbedPreview } from "@/components/discord-embed-preview";
import { DiscordPublishPreview } from "@/components/discord-publish-preview";
```

## Cuándo usarlo

- Mostrar cómo queda el post de Discord mientras el admin edita el quote
- Confirmar el embed después de publicar

No es el webhook. No mandar este markup a Discord.

## Props

| Prop | Tipo | Default | Descripción |
| --- | --- | --- | --- |
| `embed` | `CommunityEmbed` | — | Autor, título, quote, campos, captura, footer |

## Ejemplos

### Desde un testimonio admin (quote en vivo)

```tsx
<DiscordPublishPreview
  testimonial={testimonial}
  quote={quote || testimonial.quote}
  hideLabel
/>
```

### Embed ya armado

```tsx
<DiscordEmbedPreview embed={buildCommunityEmbed({ … })} />
```

## Notas

- Colores de Discord (`#2b2d31`, barra `brand-pink`), no tokens de la app.
- Campos inline en dos columnas; el de Video (YouTube) va en bloque.
- La captura, si hay, es `<img>` de Storage (misma URL que usa el webhook).
- Es Server Component (sin `"use client"`).
