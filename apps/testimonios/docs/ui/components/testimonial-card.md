# TestimonialCard

Card de un testimonio: avatar, tipo, nombre, quote y slots opcionales.

**Archivo:** `components/testimonial-card.tsx`

Uso previsto: grilla de galería y bloque de quote en la ficha. El inbox admin usa filas en `AdminInboxList`, no esta card. El preview al revisar es Discord + card IG (`DiscordPublishPreview`, `AdminIgShare`) en tabs (`AdminShareTabs`).

## Import

```tsx
import { TestimonialCard } from "@/components/testimonial-card";
```

## Cuándo usarlo

- Listar testimonios (galería)
- Quote destacado en la ficha pública

No usarlo para la captura del proyecto ni para el embed de YouTube: esos van aparte. No meter email ni historia completa adentro. No usarlo como preview de Discord ni de Instagram.

## Props

| Prop | Tipo | Default | Descripción |
| --- | --- | --- | --- |
| `name` | `string` | — | Nombre completo |
| `typeLabel` | `string` | — | Overline (Simulación / Primer empleo / Reconversión) |
| `quote` | `string` | — | Texto recortado (no la historia completa) |
| `avatarUrl` | `string` | — | URL pública del avatar (Storage) |
| `href` | `string` | — | Si está, la card es un `<Link>` a esa ruta |
| `cta` | `string` | — | Texto cyan al pie (“Ver historia”) |
| `footer` | `ReactNode` | — | Meta muted al fondo |
| `lineClamp` | `2 \| 3 \| 4 \| 5 \| 6` | `3` si hay `href` | Cortes del quote. Sin `href` y sin valor: quote completo |
| `className` | `string` | — | Clases del `<article>` |

## Ejemplos

### Galería (link + clamp + CTA)

```tsx
<TestimonialCard
  name={testimonial.fullName}
  typeLabel={testimonial.typeLabel}
  quote={testimonial.quote}
  avatarUrl={testimonial.avatarUrl}
  href={`/t/${testimonial.slug}`}
  lineClamp={3}
  cta="Ver historia"
/>
```

### Ficha o preview estático (sin link)

```tsx
<TestimonialCard
  name={testimonial.fullName}
  typeLabel={testimonial.typeLabel}
  quote={testimonial.quote}
  avatarUrl={testimonial.avatarUrl}
/>
```

## Notas

- Con `href` el `<article>` envuelve un `<Link>` a altura completa y el borde pasa a cyan en hover. En una grilla, el `<li>` no hace falta que sea el link.
- El avatar lleva `alt=""`: el nombre va al lado, no hace falta anunciarlo dos veces.
- El quote se envuelve en comillas tipográficas adentro del componente. No las pongas en el string.
- Avatar siempre hay (el form lo exige). No hay estado vacío de foto.
- Es Server Component (sin `"use client"`).
