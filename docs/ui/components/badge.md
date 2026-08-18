# Badge

Chip o etiqueta compacta. Basado en shadcn (`base-nova`).

**Archivo:** `components/ui/badge.tsx`

Uso previsto en la landing: chips de roles, verticales y geos.

## Import

```tsx
import { Badge } from "@/components/ui/badge";
```

## Cuándo usarlo

- Etiquetas cortas (rol, vertical, país, estado)
- Contadores o flags junto a un título

No usarlo como botón de acción; para eso está `Button`. Si el chip navega, usar `render` con un `Link`.

## Props

Extiende un `<span>` (vía `useRender` de Base UI) más:

| Prop | Tipo | Default | Descripción |
| --- | --- | --- | --- |
| `variant` | ver abajo | `"default"` | Estilo visual |
| `className` | `string` | — | Clases extra (se mergean con `cn`) |
| `render` | `ReactElement` | — | Sustituye el `<span>` (p. ej. `Link`) |

### `variant`

| Valor | Uso |
| --- | --- |
| `default` | Énfasis de marca (rosa / `--primary`) |
| `secondary` | Menos énfasis, sobre surface |
| `outline` | Chip con borde; default para listados de tags |
| `ghost` | Casi sin fondo |
| `destructive` | Alerta / error |
| `link` | Apariencia de enlace |

## Ejemplos

### Chips de roles / verticales / geos

```tsx
<Badge variant="outline">Frontend</Badge>
<Badge variant="outline">Fintech</Badge>
<Badge variant="outline">LatAm</Badge>
```

### Con ícono

```tsx
import { MapPinIcon } from "lucide-react";

<Badge variant="secondary">
  <MapPinIcon data-icon="inline-start" />
  Argentina
</Badge>
```

`data-icon="inline-start"` o `"inline-end"` ajusta el padding alrededor del ícono.

### Como link

```tsx
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

<Badge variant="outline" render={<Link href="/roles/frontend" />}>
  Frontend
</Badge>
```

## Notas

- Radio pill (`rounded-4xl`). No forzar `rounded-lg` (en el design system `lg` es 32px).
- Texto corto: el badge es `whitespace-nowrap` y `h-5`.
- Si necesitás el mismo look en otro elemento, exportamos `badgeVariants` desde el mismo archivo.
