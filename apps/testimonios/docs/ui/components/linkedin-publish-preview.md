# LinkedInPublishPreview

Preview del post de LinkedIn: caption (texto) + campo Video + captura. Sin card PNG ni header de perfil.

**Archivo:** `components/linkedin-publish-preview.tsx`

Uso previsto: `/admin/[id]`, tab LinkedIn. En revisión el caption se edita adentro del preview (`edit`). Después de publicar Buffer lo encola; el preview queda solo lectura + **Copiar caption** por si hay que reintentar a mano.

## Import

```tsx
import { LinkedInPublishPreview } from "@/components/linkedin-publish-preview";
```

## Cuándo usarlo

- Ver y editar el caption de LinkedIn mientras se revisa el testimonio
- Copiar el texto (caption + YouTube si no está en el caption) después de publicar

No usarlo para Instagram (ahí va `AdminIgShare`). No genera imagen.

## Props

| Prop | Tipo | Default | Descripción |
| --- | --- | --- | --- |
| `testimonial` | `AdminTestimonial` | — | Nombre, captura, YouTube, LinkedIn |
| `caption` | `string` | — | Texto del post (`li_caption`) |
| `showCopy` | `boolean` | `false` | Botón copiar (detalle publicado) |
| `edit` | `{ testimonioId, quote, onChange }` | — | Si está, el caption es un textarea + Generar con IA |

## Ejemplos

### Revisión

```tsx
<LinkedInPublishPreview
  testimonial={testimonial}
  caption={liCaption}
  edit={{
    testimonioId: testimonial.id,
    quote,
    onChange: setLiCaption,
  }}
/>
```

### Publicado

```tsx
<LinkedInPublishPreview
  testimonial={testimonial}
  caption={testimonial.liCaption}
  showCopy
/>
```

## Notas

- El tab LinkedIn usa el mismo marco que Discord e Instagram (`AdminShareTabs`): card full width.
- El YouTube se muestra como campo **Video**, igual que en Discord. No va adentro del textarea.
- La captura, si hay, va debajo (se adjunta al post; no es card generada).
- Es Client Component (`"use client"`).
