# Dropdown Menu

Menú de acciones o links disparado por un botón. Basado en shadcn (`base-nova`) + Base UI Menu.

**Archivo:** `components/ui/dropdown-menu.tsx`

Uso previsto: nav desktop compacto (Para Empresas, Sobre Nosotros) cuando el panel de `NavigationMenu` es más de lo que hace falta.

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
  Para Empresas
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

### Nav: Para Empresas

```tsx
<DropdownMenu>
  <DropdownMenuTrigger render={<Button variant="ghost" />}>
    Para Empresas
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuGroup>
      <DropdownMenuLabel>Plataforma</DropdownMenuLabel>
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
