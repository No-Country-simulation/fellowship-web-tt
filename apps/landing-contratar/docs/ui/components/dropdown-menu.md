# Dropdown Menu

Menú de acciones o links disparado por un botón. Basado en shadcn (`base-nova`) + Base UI Menu.

**Archivo:** `components/ui/dropdown-menu.tsx`

Uso previsto: submenú de un grupo en el nav desktop (`headerNav` con `type: "group"`). Hoy: Simulación Laboral, Para Empresas y Sobre Nosotros. En mobile esos grupos van en acordeón dentro del `Sheet`, no acá.

## Import

```tsx
import { Button } from "@repo/ui/button";
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

El header no usa `Button` en el trigger: chrome de texto + chevron, panel `bg-bg-surface-1`. Cada ítem es un link (`nativeButton={false}` + `render`).

```tsx
<DropdownMenu>
  <DropdownMenuTrigger>
    Para Empresas
    <ChevronDownIcon className="size-3" aria-hidden="true" />
  </DropdownMenuTrigger>
  <DropdownMenuContent align="start" sideOffset={8} className="bg-bg-surface-1">
    <DropdownMenuItem nativeButton={false} render={<Link href="/" />}>
      Contratar talento
    </DropdownMenuItem>
    <DropdownMenuItem nativeButton={false} render={<a href="#" />}>
      Producto
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

Rutas hijas inexistentes: `disabled` o `href="#"` — no páginas vacías. El markup real vive en `SiteHeader`; no copiar clases a mano.

### Acción destructiva

```tsx
<DropdownMenuItem variant="destructive">Eliminar</DropdownMenuItem>
```

## Notas

- No mezclar con `Separator` genérico: dentro del menú usar `DropdownMenuSeparator`.
- En el header el trigger es chrome de texto, no `Button`. En menús sueltos sí: `Button variant="ghost"`.
- Focus y teclado los maneja Base UI Menu (flechas, Enter, Escape).
