# Separator

Línea divisoria visual (y semántica). Basado en shadcn (`base-nova`) + Base UI.

**Archivo:** `components/ui/separator.tsx`

Uso previsto: footer y bloques densos. El header ya no lo usa.

## Import

```tsx
import { Separator } from "@/components/ui/separator";
```

## Cuándo usarlo

- Separar grupos de links en el footer
- Dividir bloques densos sin meter un borde ad-hoc en cada wrapper

No usarlo para layout de columnas (ahí va grid/flex + gap). Si el divisor es solo visual y no debe anunciarse, preferí un `border-b` / `border-l` en el contenedor.

## Props

Extiende el Separator de Base UI.

| Prop | Tipo | Default | Descripción |
| --- | --- | --- | --- |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | Dirección |
| `className` | `string` | — | Clases extra |

Es un Client Component (`"use client"`).

## Ejemplos

### Horizontal (footer / bloques)

```tsx
<Separator />
```

### Vertical (nav)

```tsx
<div className="flex h-6 items-center gap-3">
  <a href="#talento">Talento</a>
  <Separator orientation="vertical" />
  <a href="#empresas">Empresas</a>
</div>
```

El padre de un separator vertical necesita altura (`h-*` o `self-stretch` en un flex row).

## Notas

- Color: `bg-border` (`#2a2c4a` en el design system).
- Horizontal: `h-px w-full`. Vertical: `w-px self-stretch`.
- Dentro de un `DropdownMenu` usar `DropdownMenuSeparator`, no este componente.
