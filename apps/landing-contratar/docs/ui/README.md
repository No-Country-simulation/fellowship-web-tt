# UI — guía para el equipo

Documentación del design system, de los primitivos shadcn (`components/ui`) y del chrome/producto reutilizable (`components/`).

**Objetivo:** cualquier dev puede usar tokens y componentes sin preguntar a quien los agregó.

Los bloques de `components/landing/` (hero, FAQ, etc.) no se documentan acá: son de la página, no primitivos reutilizables.

## Índice

| Recurso | Descripción |
| --- | --- |
| [Design system](./design-system.md) | Colores, tipografía, spacing, radius, sombras, layout |
| [Button](./components/button.md) | Variantes, sizes, ejemplos — paquete `@repo/ui` |
| [Badge](./components/badge.md) | Chips de roles, verticales, geos |
| [Separator](./components/separator.md) | Divisores en header, footer y bloques densos |
| [Navigation Menu](./components/navigation-menu.md) | Nav desktop con paneles |
| [Dropdown Menu](./components/dropdown-menu.md) | Submenús desktop (Simulación Laboral, Para Empresas, Sobre Nosotros) |
| [Sheet](./components/sheet.md) | Drawer / overlay (menú mobile full-screen en el header) |
| [Section](./components/section.md) | Wrapper de bloque (frame + container) |
| [SectionEyebrow](./components/section-eyebrow.md) | Pill de sección |
| [BrandLogo](./components/brand-logo.md) | Wordmark No Country |
| [AdvisorCta](./components/advisor-cta.md) | CTA “Hablar con un asesor” |
| [SiteHeader](./components/site-header.md) | Chrome del layout (nav desktop/mobile) |
| [SiteFooter](./components/site-footer.md) | Chrome del layout (columnas + redes) |

## Convención al agregar un componente

Cada componente nuevo en `components/ui` o chrome/producto reutilizable en `components/` debe incluir:

1. **Archivo de docs** en `docs/ui/components/<nombre>.md` con:
   - Para qué sirve
   - Import
   - Props / variantes
   - Ejemplos de uso
   - Notas (a11y, limitaciones, cuándo no usarlo)
2. **Entrada en esta tabla** (índice de arriba)
3. **JSDoc breve** en el export del componente (para IntelliSense en el IDE)

No documentar bloques de `components/landing/` ni utilidades no-UI (`json-ld`).

### Cómo agregar un componente de shadcn

```bash
pnpm dlx shadcn@latest add <nombre>
```

Correr desde `apps/landing-contratar` (esta app), no desde la raíz del monorepo.

Después: documentarlo en `docs/ui/components/` y linkearlo acá.

### Paths

| Alias | Dónde |
| --- | --- |
| `@repo/ui/button` | Button compartido (`packages/ui`) |
| `@/components/ui` | shadcn que todavía es de esta app |
| `@/components` | componentes de producto |
| `@/lib/utils` | `cn()` (reexporta `@repo/ui/utils`) |

Tokens y utilidades visuales viven en `app/globals.css`.
