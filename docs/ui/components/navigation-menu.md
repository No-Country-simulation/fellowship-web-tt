# Navigation Menu

Colección de links de sitio, con paneles desplegables. Basado en shadcn (`base-nova`) + Base UI.

**Archivo:** `components/ui/navigation-menu.tsx`

Uso previsto: links de primer nivel del nav desktop. Los grupos (Para Empresas, Sobre Nosotros) van con `DropdownMenu`. En mobile usar `Sheet`.

## Import

```tsx
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
```

## Cuándo usarlo

- Barra de navegación desktop con mega-menú o listas de links
- Items con y sin panel (link directo vs trigger + content)

No usarlo en viewport mobile: el patrón del sitio es `Sheet`. Para un menú de acciones (no nav de sitio), preferí `DropdownMenu`.

## Composición

```
NavigationMenu
├── NavigationMenuList
│   ├── NavigationMenuItem
│   │   ├── NavigationMenuTrigger
│   │   └── NavigationMenuContent
│   │       └── NavigationMenuLink
│   └── NavigationMenuItem
│       └── NavigationMenuLink
```

El `NavigationMenu` monta el positioner/viewport solo. No hace falta poner `NavigationMenuPositioner` a mano.

## Props

### `NavigationMenu`

| Prop | Tipo | Default | Descripción |
| --- | --- | --- | --- |
| `align` | Positioner `align` | `"start"` | Alineación del panel |
| `className` | `string` | — | Clases extra |

El resto se reenvía al root de Base UI Navigation Menu.

### `NavigationMenuLink`

Para Next.js `Link`, usar `render`:

```tsx
import Link from "next/link";

<NavigationMenuLink render={<Link href="#" />} className={navigationMenuTriggerStyle()}>
  Talento
</NavigationMenuLink>
```

Las rutas hijas de la landing aún no existen: `href="#"` o deshabilitar, no crear páginas vacías.

## Ejemplos

### Desktop: trigger + panel

```tsx
<NavigationMenu>
  <NavigationMenuList>
    <NavigationMenuItem>
      <NavigationMenuTrigger>Para Empresas</NavigationMenuTrigger>
      <NavigationMenuContent>
        <NavigationMenuLink href="#">Buscar talento</NavigationMenuLink>
        <NavigationMenuLink href="#">Cómo funciona</NavigationMenuLink>
      </NavigationMenuContent>
    </NavigationMenuItem>
    <NavigationMenuItem>
      <NavigationMenuLink href="#" className={navigationMenuTriggerStyle()}>
        Sobre Nosotros
      </NavigationMenuLink>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>
```

## Notas

- `navigationMenuTriggerStyle()` alinea visualmente un link suelto con los triggers.
- Focus visible incluido (`ring`); no quitar outlines.
- El chevron del trigger rota al abrir (`data-open` / `data-popup-open`).
