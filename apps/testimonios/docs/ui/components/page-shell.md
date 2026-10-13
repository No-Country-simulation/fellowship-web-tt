# PageShell

Wrapper de página: `<main>` scrolleable + eyebrow, título y descripción.

**Archivo:** `components/page-shell.tsx`

Uso previsto: galería, `/enviar` y ficha `/t/[slug]`.

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
| `className` | `string` | — | Clases del inner `container-content` (ancho, no el `<main>`) |
| `children` | `ReactNode` | — | Cuerpo de la página |

El default del contenedor es `max-w-3xl`.

## Ejemplos

### Página pública

```tsx
<PageShell
  eyebrow="Galería"
  title="Historias de talento"
  description="El equipo valida cada historia antes de que salga acá."
>
  {children}
</PageShell>
```

## Notas

- El `<main>` ocupa el resto de la columna del `body` (`flex-1`, `overflow-y-auto`). El header queda fijo.
- Padding de página: `px-md py-md`. El inner usa `container-content`.
- `className` ajusta el contenedor (ancho), no el `<main>`. Para galería ancha: `className="max-w-5xl"`.
- Es Server Component (sin `"use client"`).
