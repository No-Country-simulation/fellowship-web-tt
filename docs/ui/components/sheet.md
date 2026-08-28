# Sheet

Panel que entra desde un borde de la pantalla (drawer). Basado en shadcn (`base-nova`) + Base UI Dialog.

**Archivo:** `components/ui/sheet.tsx`

Uso previsto: menú mobile del header. El header **no** usa el drawer default: overridea a overlay full-screen (`showCloseButton={false}`, `bg-bg-base`). Ver [SiteHeader](./site-header.md).

## Import

```tsx
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
```

## Cuándo usarlo

- Navegación mobile (reemplazo del `NavigationMenu` desktop)
- Paneles laterales de filtros o detalle

No usarlo en desktop para la nav principal. No es un modal centrado (si hace falta uno, más adelante irá `Dialog`).

Depende de `Button` para el botón cerrar. No reinstalar `button`.

Es un Client Component (`"use client"`).

## Composición

```
Sheet
├── SheetTrigger
└── SheetContent
    ├── SheetHeader
    │   ├── SheetTitle
    │   └── SheetDescription
    └── SheetFooter
```

## Props

### `SheetContent`

| Prop | Tipo | Default | Descripción |
| --- | --- | --- | --- |
| `side` | `"top" \| "right" \| "bottom" \| "left"` | `"right"` | Borde desde el que entra |
| `showCloseButton` | `boolean` | `true` | Botón X (usa `Button` ghost `icon-sm`) |
| `className` | `string` | — | Clases extra |

En `left` / `right` el default es `w-3/4` con `sm:max-w-sm`. El header pisa eso a `w-full` / `h-dvh`.

### `SheetTrigger` / `SheetClose`

Componer con `Button` vía `render` (Base UI, no `asChild`):

```tsx
<SheetTrigger render={<Button variant="ghost" size="icon" />}>
  <span className="sr-only">Abrir menú</span>
  {/* ícono hamburguesa */}
</SheetTrigger>
```

## Ejemplos

### Drawer default (filtros, detalle)

```tsx
<Sheet>
  <SheetTrigger render={<Button variant="ghost" size="icon" />}>
    <span className="sr-only">Abrir panel</span>
  </SheetTrigger>
  <SheetContent side="right">
    <SheetHeader>
      <SheetTitle>Filtros</SheetTitle>
    </SheetHeader>
  </SheetContent>
</Sheet>
```

### Sin botón cerrar (chrome custom, como el header)

```tsx
<SheetContent side="right" showCloseButton={false} className="h-dvh w-full">
  …
</SheetContent>
```

El menú mobile real vive en `SiteHeader`: logo + X propios, nav y “Iniciar Sesión”. No copiar el drawer default para el header.

## Notas

- Overlay: `bg-black/10` + blur. El panel default usa `bg-popover`; el header lo pinta `bg-bg-base`.
- Incluir `SheetTitle` (aunque sea `sr-only`) para el nombre accesible del diálogo.
- Si `showCloseButton` queda en `true`, el X default ya tiene `<span className="sr-only">Close</span>`. Con chrome custom, el trigger y el X propio también necesitan nombre accesible.
- `SheetClose` puede componer con `BrandLogo` o un `<a>` vía `render` (Base UI, no `asChild`).
- Focus trap y cierre con Escape los maneja Base UI Dialog.
