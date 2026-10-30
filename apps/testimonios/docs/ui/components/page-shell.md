# PageShell

Wrapper de página: `<main>` en el flujo del documento + eyebrow, título y descripción.

**Archivo:** `components/page-shell.tsx`

Uso actual: estado de error de `/t/[slug]`. La ficha exitosa usa la composición propia de [`TestimonialDetail`](./testimonial-detail.md). La landing de captación usa un `<main>` propio con `GalleryHero`; `TestimonialsGallery` se conserva sin montarse. `/enviar` también compone su propio `<main>` y encabezado editorial en `app/enviar/page.tsx`, conservando el ancho `max-w-3xl`. Todas las rutas usan el scroll del documento.

## Import

```tsx
import { PageShell } from "@/components/page-shell";
```

## Cuándo usarlo

- Cualquier página que necesite frame, H1 y área de contenido

No anidar un `PageShell` dentro de otro. No usarlo como card ni como ítem de grilla.

## Props

| Prop | Tipo | Default | Descripción |
| --- | --- | --- | --- |
| `title` | `string` | — | Texto del `<h1>` |
| `eyebrow` | `string` | — | Overline arriba del título (tipo, “Galería”, “Ficha”) |
| `description` | `string` | — | Lead bajo el título (`text-body-large`) |
| `variant` | `"default" \| "featured"` | `"default"` | Presentación del encabezado |
| `actions` | `ReactNode` | — | Acciones junto al título; el contenido define enlaces o botones |
| `className` | `string` | — | Clases del inner `container-content` (ancho, no el `<main>`) |
| `children` | `ReactNode` | — | Cuerpo de la página |

El default del contenedor es `max-w-3xl`.

## Variantes

- `default`: conserva el eyebrow `text-overline`, el título `text-heading-3` y la descripción con `ml-auto`. Es la presentación actual del estado de error de `/t/[slug]`. La variante y su comportamiento permanecen disponibles sin cambios.
- `featured`: usa `type-eyebrow` y `type-section`. La descripción queda alineada a la izquierda, con ancho máximo de `45rem` (720px con base de 16px). Sigue disponible como variante opcional; la galería ya no la utiliza.

## Ejemplos

### Página pública

```tsx
<PageShell
  title="Contanos tu experiencia"
  description="Compartí tu experiencia con la comunidad."
>
  {children}
</PageShell>
```

### Variante opcional con acción destacada

```tsx
import Link from "next/link";
import { buttonVariants } from "@repo/ui/button";
import { PageShell } from "@/components/page-shell";

<PageShell
  variant="featured"
  className="max-w-5xl"
  eyebrow="Comunidad"
  title="Contenido destacado"
  description="Ejemplo de composición con una acción en el encabezado."
  actions={
    <Link
      href="/enviar"
      className={buttonVariants({ variant: "gradient", size: "lg" })}
    >
      Enviar testimonio
    </Link>
  }
>
  {children}
</PageShell>
```

## Notas

- El `<main>` ocupa el resto de la columna del `body` (`flex-1`) y crece con su contenido. El documento proporciona el scroll; el header institucional es sticky y su altura real forma parte del offset de scroll.
- Padding de página: `px-md py-md`. El inner usa `container-content`.
- `className` ajusta el contenedor (ancho), no el `<main>`. Por ejemplo: `className="max-w-5xl"`.
- `featured` apila el título y las acciones en mobile; desde `md` (768px) los ubica en una fila. El título puede ocupar varias líneas y las acciones permiten wrapping dentro de su contenedor.
- `actions` es opcional y funciona en ambas variantes. En `default`, las acciones siguen el layout flex con wrapping existente. Usar enlaces para navegación y botones para acciones, conservando nombres accesibles y estilos de foco.
- Cada instancia mantiene un único `<h1>`; `actions` no debe agregar otro.
- Es Server Component (sin `"use client"`).
