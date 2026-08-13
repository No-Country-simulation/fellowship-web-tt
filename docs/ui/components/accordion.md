# Accordion

Paneles colapsables apilados. Basado en shadcn (`base-nova`) + Base UI.

**Archivo:** `components/ui/accordion.tsx`

Uso previsto en la landing: FAQ.

## Import

```tsx
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
```

## Cuándo usarlo

- Preguntas frecuentes
- Bloques de contenido donde el usuario elige qué abrir

No usarlo para navegación primaria ni para mostrar varios bloques que deban verse todos a la vez (ahí va `Card`).

## Composición

```
Accordion
├── AccordionItem
│   ├── AccordionTrigger
│   └── AccordionContent
└── AccordionItem
    ├── AccordionTrigger
    └── AccordionContent
```

## Props

### `Accordion`

Extiende el root de Base UI Accordion.

| Prop | Tipo | Default | Descripción |
| --- | --- | --- | --- |
| `defaultValue` | `string[]` | — | Ítems abiertos al montar (no controlado) |
| `value` | `string[]` | — | Ítems abiertos (controlado) |
| `onValueChange` | `(value: string[]) => void` | — | Callback al cambiar |
| `multiple` | `boolean` | `false` | Permite varios ítems abiertos a la vez |
| `className` | `string` | — | Clases extra |

Por defecto solo un ítem abierto. `defaultValue` es un **array**, no un string.

### `AccordionItem`

| Prop | Tipo | Default | Descripción |
| --- | --- | --- | --- |
| `value` | `string` | auto | Id único; necesario si usás `defaultValue` / `value` |
| `disabled` | `boolean` | `false` | Deshabilita el ítem |
| `className` | `string` | — | Clases extra |

### `AccordionTrigger` / `AccordionContent`

Aceptan `className` y children. El trigger ya incluye el chevron.

## Ejemplos

### FAQ (un ítem abierto)

```tsx
<Accordion defaultValue={["faq-1"]}>
  <AccordionItem value="faq-1">
    <AccordionTrigger>¿Cómo funciona la garantía?</AccordionTrigger>
    <AccordionContent>
      30 días de reemplazo. Si no encaja, proponemos otro perfil en 72 h.
    </AccordionContent>
  </AccordionItem>
  <AccordionItem value="faq-2">
    <AccordionTrigger>¿Hay comisión de incorporación?</AccordionTrigger>
    <AccordionContent>
      Incorporación sin comisión a los 3–6 meses.
    </AccordionContent>
  </AccordionItem>
</Accordion>
```

### Varios abiertos a la vez

```tsx
<Accordion multiple>
  <AccordionItem value="a">
    <AccordionTrigger>Ítem A</AccordionTrigger>
    <AccordionContent>…</AccordionContent>
  </AccordionItem>
  <AccordionItem value="b">
    <AccordionTrigger>Ítem B</AccordionTrigger>
    <AccordionContent>…</AccordionContent>
  </AccordionItem>
</Accordion>
```

## Notas

- Un solo `h1` en la página: los triggers de FAQ no deben ser `h1`. El trigger ya es un heading interactivo de Base UI.
- No inventar respuestas: si un FAQ no tiene `answer`, no incluir el ítem.
- Focus visible incluido (`ring`); no quitar outlines sin reemplazo a11y.
- Las animaciones `accordion-down` / `accordion-up` vienen de `shadcn/tailwind.css`.
