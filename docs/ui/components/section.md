# Section

Wrapper de bloque de landing: margen horizontal de frame + contenedor de contenido (max-width 1280px).

**Archivo:** `components/section.tsx`

Uso previsto: cada banda de la landing (hero, evidencia, FAQ, CTA). El card es la unidad visual interna; `Section` es el padding de página.

## Import

```tsx
import { Section } from "@/components/section";
```

## Cuándo usarlo

- Cualquier bloque de página que deba respetar el frame (24px mobile / 80px desktop) y el `container-content`
- Bandas claras (`surface="light"`) sobre el fondo oscuro del sitio

No usarlo como card ni como wrapper de un ítem de grilla. Para eso está `Card`. El padding vertical va por `className`, no lo impone el componente.

## Props

Extiende las props nativas de `<section>` más:

| Prop | Tipo | Default | Descripción |
| --- | --- | --- | --- |
| `surface` | `"light"` | — | Remapea tokens solo en este bloque (`[data-surface=light]` en `globals.css`). Sin valor, hereda el dark del sitio |
| `containerClassName` | `string` | — | Clases del inner `container-content` |
| `className` | `string` | — | Clases del `<section>` (padding vertical, `id`, etc.) |

Cualquier otra prop de `<section>` (`id`, `aria-labelledby`) se reenvía al elemento.

## Ejemplos

### Bloque oscuro (default)

```tsx
<Section className="py-2xl md:py-3xl" id="como-funciona">
  <h2 className="text-heading-2">Cómo funciona</h2>
</Section>
```

### Banda clara

```tsx
<Section surface="light" className="py-2xl md:py-3xl" id="evidencia">
  <h2 className="text-heading-2">Evidencia</h2>
</Section>
```

### Ajuste del contenedor interno

```tsx
<Section containerClassName="flex flex-col gap-xl">
  …
</Section>
```

## Notas

- Horizontal fijo: `px-md` (24px) / `md:px-3xl` (80px). No reimplementar ese frame a mano.
- `overflow-x-clip` y `min-w-0` evitan scroll horizontal en bloques densos.
- `surface="light"` no cambia el tema global: solo el subárbol con `data-surface="light"`.
- En el borde con una sección oscura, el fondo claro se difumina hacia el starfield (máscara + blur). Entre dos bandas claras seguidas no hay costura.
- Es Server Component (sin `"use client"`).
