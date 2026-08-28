# Dropdown Menu

Menú de acciones o links disparado por un botón. Basado en shadcn (`base-nova`) + Base UI Menu.

**Archivo:** `components/ui/dropdown-menu.tsx`

Uso previsto: submenú de un grupo en el nav desktop (`headerNav` con `type: "group"`). Hoy el header es de links planos; el componente sigue cableado para cuando vuelva un grupo.

## Import

```tsx
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
```

## Cuándo usarlo

- Lista corta de destinos o acciones anclada a un trigger
- Submenús, checkboxes o radios en un menú

Para la barra completa con paneles anchos, preferí `NavigationMenu`. Para el menú mobile, `Sheet`.

Es un Client Component (`"use client"`).

## Composición

```
DropdownMenu
├── DropdownMenuTrigger
└── DropdownMenuContent
    ├── DropdownMenuGroup
    │   ├── DropdownMenuLabel
    │   └── DropdownMenuItem
    ├── DropdownMenuSeparator
    └── DropdownMenuSub
        ├── DropdownMenuSubTrigger
        └── DropdownMenuSubContent
```

## Props relevantes

### `DropdownMenuTrigger`

Usar `render` para componer con `Button` (patrón Base UI, no `asChild` de Radix):

```tsx
<DropdownMenuTrigger render={<Button variant="ghost" />}>
  Plataforma
</DropdownMenuTrigger>
```

### `DropdownMenuContent`

| Prop | Tipo | Default | Descripción |
| --- | --- | --- | --- |
| `align` | `"start" \| "center" \| "end"` | `"start"` | Alineación al trigger |
| `side` | `"top" \| "bottom" \| "left" \| "right"` | `"bottom"` | Lado |
| `sideOffset` | `number` | `4` | Separación en px |
| `className` | `string` | — | Clases extra |

### `DropdownMenuItem`

| Prop | Tipo | Default | Descripción |
| --- | --- | --- | --- |
| `variant` | `"default" \| "destructive"` | `"default"` | Estilo |
| `inset` | `boolean` | — | Padding extra a la izquierda |
| `disabled` | `boolean` | — | Deshabilita el ítem |

También: `DropdownMenuCheckboxItem`, `DropdownMenuRadioGroup` + `DropdownMenuRadioItem`, `DropdownMenuShortcut`.

## Ejemplos

### Grupo en el nav (`headerNav` con `type: "group"`)

Hoy el header no tiene grupos; el patrón queda cableado en `SiteHeader` para cuando vuelva uno.

```tsx
<DropdownMenu>
  <DropdownMenuTrigger render={<Button variant="ghost" />}>
    Plataforma
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuGroup>
      <DropdownMenuLabel>Destinos</DropdownMenuLabel>
      <DropdownMenuItem>Buscar talento</DropdownMenuItem>
      <DropdownMenuItem>Cómo funciona</DropdownMenuItem>
    </DropdownMenuGroup>
    <DropdownMenuSeparator />
    <DropdownMenuItem disabled>Dashboard</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

Rutas hijas inexistentes: `disabled` o `href="#"` — no páginas vacías.

### Acción destructiva

```tsx
<DropdownMenuItem variant="destructive">Eliminar</DropdownMenuItem>
```

## Notas

- No mezclar con `Separator` genérico: dentro del menú usar `DropdownMenuSeparator`.
- El trigger suele ser `Button variant="ghost"` para que coincida con el header.
- Focus y teclado los maneja Base UI Menu (flechas, Enter, Escape).
