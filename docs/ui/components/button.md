# Button

Botón de acción de la UI. Basado en shadcn (`base-nova`) + Base UI.

**Archivo:** `components/ui/button.tsx`

## Import

```tsx
import { Button } from "@/components/ui/button";
```

## Cuándo usarlo

- Acciones primarias/secundarias (submit, CTA, navegación que dispara acción)
- Acciones destructivas (eliminar, cancelar suscripción)
- Botones solo-ícono en toolbars

No usarlo para navegación pura tipo link de texto largo; ahí preferí `variant="link"` o un `<Link>` estilizado.

## Props

Extiende las props nativas de botón (Base UI) más:

| Prop | Tipo | Default | Descripción |
| --- | --- | --- | --- |
| `variant` | ver abajo | `"default"` | Estilo visual |
| `size` | ver abajo | `"default"` | Tamaño |
| `className` | `string` | — | Clases extra (se mergean con `cn`) |
| `disabled` | `boolean` | `false` | Deshabilita interacción |
| `type` | `"button" \| "submit" \| "reset"` | — | Tipo HTML |

Cualquier otra prop válida de `<button>` (p. ej. `onClick`, `aria-label`) se reenvía al primitivo.

### `variant`

| Valor | Uso |
| --- | --- |
| `default` | CTA principal (rosa de marca / `primary`) |
| `outline` | Acción secundaria con borde |
| `secondary` | Acción menos enfatizada sobre surface |
| `ghost` | Acción terciaria, sin fondo fuerte |
| `destructive` | Acciones peligrosas |
| `link` | Apariencia de enlace |

### `size`

| Valor | Uso |
| --- | --- |
| `default` | Uso general |
| `xs` / `sm` | Densidad alta (tables, filters) |
| `lg` | CTAs de hero / formularios destacados |
| `icon` / `icon-xs` / `icon-sm` / `icon-lg` | Solo ícono; el botón es cuadrado |

## Ejemplos

### Primario y secundario

```tsx
<Button>Buscar talento</Button>
<Button variant="outline">Cómo funciona</Button>
```

### CTA grande con glow de marca

```tsx
<Button size="lg" className="shadow-glow">
  Buscar talento
</Button>
```

### Destructivo

```tsx
<Button variant="destructive" onClick={onDelete}>
  Eliminar
</Button>
```

### Solo ícono (accesible)

```tsx
import { SearchIcon } from "lucide-react";

<Button size="icon" aria-label="Buscar">
  <SearchIcon />
</Button>
```

### Como submit en form

```tsx
<Button type="submit" disabled={isPending}>
  Guardar
</Button>
```

## Notas

- El color `default` usa `--primary` (`#fe0096`).
- Focus visible incluido (`ring`); no quitar outlines sin reemplazo a11y.
- Para íconos, Lucide ya está en el proyecto (`lucide-react`).
- Si necesitás el mismo look en otro elemento, exportamos `buttonVariants` desde el mismo archivo.

```tsx
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

<Link href="/login" className={buttonVariants({ variant: "outline" })}>
  Iniciar sesión
</Link>
```
