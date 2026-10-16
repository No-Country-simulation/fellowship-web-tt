# TestimonialCard

Card de un testimonio: avatar, tipo, nombre, quote y slots opcionales.

**Archivo:** `components/testimonial-card.tsx`

Uso previsto: grilla de galería y bloque de quote en la ficha.

## Import

```tsx
import { TestimonialCard } from "@/components/testimonial-card";
```

## Cuándo usarlo

- Listar testimonios (galería)
- Quote destacado en la ficha pública

No usarlo para la foto testimonial ni para el embed de YouTube: esos van aparte. No meter email ni historia completa adentro. No usarlo como preview de Discord, Instagram o LinkedIn.

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
| `variant` | `"default" \| "gallery"` | `"default"` | `gallery` separa la categoría y destaca el CTA; `default` conserva la presentación de la ficha |

## Ejemplos

### Galería (link + clamp + CTA)

```tsx
<TestimonialCard
  variant="gallery"
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

- Ambas variantes usan `rounded-card` (20px), categoría `type-eyebrow`, nombre de 16px semibold y cita `text-base leading-relaxed` (16px, interlineado 1.625). Estas utilidades de Tailwind mantienen el tamaño y el color al pasar por `cn()`. El clamp conserva su comportamiento anterior.
- `gallery` presenta la categoría sobre el autor, sin línea decorativa. Conserva el avatar real con `next/image` (44px; 56px en `default`) y el CTA con flecha decorativa. En mobile la altura depende del contenido; desde `md` mantiene un mínimo de 17rem y alinea el CTA al pie. No agrega enlaces anidados ni una altura máxima que pueda recortar contenido.
- La grilla usa filas automáticas: en mobile, con una sola card por fila, `h-full` sigue la altura natural de esa fila y `mt-auto` no añade espacio sobrante. Desde `md`, estas reglas conservan tarjetas uniformes por fila. La variante `default` mantiene sus clases y comportamiento.
- La columna del nombre usa `w-0 flex-1 min-w-0` para ocupar el espacio restante junto al avatar y conservar el truncado. La cita usa `wrap-anywhere` para que URLs o palabras extensas no ensanchen la tarjeta en mobile.
- Con `href` el `<article>` envuelve un único `<Link>` a altura completa. El hover del contenedor (`group/card`) mantiene un área estable mientras el enlace se eleva 4px, cambia el borde a cyan y aplica `shadow-card-hover`. Las transiciones duran 200ms. En una grilla, el `<li>` no hace falta que sea el link.
- El enlace muestra un contorno cyan de 2px, separado 4px de la tarjeta, con `focus-visible`. El CTA es texto dentro de ese enlace, no un segundo control.
- Con `prefers-reduced-motion: reduce` se desactivan el desplazamiento y las transiciones; los indicadores de hover y foco se conservan. El hover se aplica en dispositivos que lo permiten.
- Sin `href`, la tarjeta es informativa: no recibe estos estilos interactivos ni se agrega un tab stop.
- El avatar lleva `alt=""`: el nombre va al lado, no hace falta anunciarlo dos veces.
- El quote se envuelve en comillas tipográficas adentro del componente. No las pongas en el string.
- Avatar siempre hay (el form lo exige). No hay estado vacío de foto.
- No declara `"use client"`: en la ficha se renderiza desde el servidor y, al importarse desde `TestimonialsGallery`, integra el bundle cliente de la galería. Sus imports de runtime son compatibles con ese uso; no consulta Supabase.
