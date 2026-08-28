# SiteHeader

Chrome del sitio: logo a la izquierda, nav centrado, “Iniciar Sesión” como botón outlined a la derecha. En viewport `< xl` el nav pasa a un Sheet.

**Archivo:** `components/site-header.tsx`

Se monta una sola vez en `app/layout.tsx`. No instanciarlo en páginas ni en bloques de landing.

## Import

```tsx
import { SiteHeader } from "@/components/site-header";
```

## Cuándo usarlo

- Solo en el root layout. Cualquier página nueva hereda header y footer.

No copiar el markup del header en un bloque. Para el wordmark aislado usá `BrandLogo`. Para un menú suelto, `NavigationMenu` / `DropdownMenu` / `Sheet`.

## Props

Ninguna. Labels, hrefs y grupos salen de `lib/nav.ts` (`headerNav`, `loginNav`).

## Uso

```tsx
// app/layout.tsx
<SiteHeader />
{children}
<SiteFooter />
```

## Composición

```
SiteHeader
├── BrandLogo (eager, sin preload)
├── DesktopNav (xl+, centrado)
│   └── NavigationMenu (links planos)
├── Iniciar Sesión (botón outlined, xl+)
└── MobileNav (< xl)
    └── Sheet (full-screen, bg-bg-base, sin X default)
        ├── BrandLogo (SheetClose) + X outlined (SheetClose)
        ├── nav (links text-body / text-secondary)
        └── Iniciar Sesión (outlined, full width)
```

Links internos usan `next/link`. Externos y `PLACEHOLDER_HREF` (`#`) van en `<a>`.

## Cómo cambiar copy o rutas

Editar `lib/nav.ts`, no el componente:

| Export | Qué controla |
| --- | --- |
| `headerNav` | Ítems y grupos del menú |
| `loginNav` | Label y href de “Iniciar Sesión” |
| `PLACEHOLDER_HREF` | Rutas hijas que todavía no existen |

## Notas

- Es Client Component (`"use client"`): DropdownMenu y Sheet lo requieren.
- Alto fijo `h-[4.5rem]`. El fondo es transparente (el starfield del `body` se ve detrás).
- Frame más compacto que el resto de la página: `px-sm` / `md:px-lg` (16px / 32px), sin `container-content`. Secciones y footer siguen en `px-md` / `md:px-3xl` (24px / 80px).
- Breakpoint del menú hamburger: `xl`, no `md`.
- El Sheet mobile es overlay a pantalla completa (`bg-bg-base`), no drawer al 75%. Logo + X arriba, “Iniciar Sesión” anclado abajo.
- Ítems `disabled` en `headerNav` se renderizan como texto muted, sin link.
