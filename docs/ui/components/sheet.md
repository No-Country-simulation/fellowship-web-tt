# Sheet

Panel que entra desde un borde de la pantalla (drawer). Basado en shadcn (`base-nova`) + Base UI Dialog.

**Archivo:** `components/ui/sheet.tsx`

Uso previsto: menú mobile del header.

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

En `left` / `right` el ancho es `w-3/4` con `sm:max-w-sm`.

### `SheetTrigger` / `SheetClose`

Componer con `Button` vía `render` (Base UI, no `asChild`):

```tsx
<SheetTrigger render={<Button variant="ghost" size="icon" />}>
  <span className="sr-only">Abrir menú</span>
  {/* ícono hamburguesa */}
</SheetTrigger>
```

## Ejemplos

### Menú mobile

```tsx
<Sheet>
  <SheetTrigger render={<Button variant="ghost" size="icon" />}>
    <span className="sr-only">Abrir menú</span>
  </SheetTrigger>
  <SheetContent side="right">
    <SheetHeader>
      <SheetTitle>Menú</SheetTitle>
    </SheetHeader>
    <nav className="flex flex-col gap-2 px-4">
      <SheetClose render={<a href="#" />}>Para Empresas</SheetClose>
      <SheetClose render={<a href="#" />}>Showcase</SheetClose>
    </nav>
  </SheetContent>
</Sheet>
```

### Sin botón cerrar

```tsx
<SheetContent side="left" showCloseButton={false}>
  …
</SheetContent>
```

## Notas

- Overlay: `bg-black/10` + blur. El panel usa `bg-popover`.
- Incluir `SheetTitle` (aunque sea visualmente discreto) para el nombre accesible del diálogo.
- El botón cerrar ya tiene `<span className="sr-only">Close</span>`; el trigger del menú también necesita nombre accesible.
- Focus trap y cierre con Escape los maneja Base UI Dialog.
