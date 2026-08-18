# UI — guía para el equipo

Documentación del design system y de los componentes en `components/ui`.

**Objetivo:** cualquier dev puede usar tokens y componentes sin preguntar a quien los agregó.

## Índice

| Recurso | Descripción |
| --- | --- |
| [Design system](./design-system.md) | Colores, tipografía, spacing, radius, sombras, layout |
| [Button](./components/button.md) | Variantes, sizes, ejemplos |
| [Accordion](./components/accordion.md) | FAQ / paneles colapsables |
| [Badge](./components/badge.md) | Chips de roles, verticales, geos |
| [Card](./components/card.md) | Diferencial, evidencia, pasos, stats, garantía, testimonial |
| [Separator](./components/separator.md) | Divisores en header, footer y bloques densos |
| [Navigation Menu](./components/navigation-menu.md) | Nav desktop con paneles |
| [Dropdown Menu](./components/dropdown-menu.md) | Menús desplegables (Para Empresas, Sobre Nosotros) |
| [Sheet](./components/sheet.md) | Menú mobile (drawer) |

## Convención al agregar un componente

Cada componente nuevo en `components/ui` debe incluir:

1. **Archivo de docs** en `docs/ui/components/<nombre>.md` con:
   - Para qué sirve
   - Import
   - Props / variantes
   - Ejemplos de uso
   - Notas (a11y, limitaciones, cuándo no usarlo)
2. **Entrada en esta tabla** (índice de arriba)
3. **JSDoc breve** en el export del componente (para IntelliSense en el IDE)

### Cómo agregar un componente de shadcn

```bash
pnpm dlx shadcn@latest add <nombre>
```

Después: documentarlo en `docs/ui/components/` y linkearlo acá.

### Paths

| Alias | Carpeta |
| --- | --- |
| `@/components/ui` | componentes shadcn |
| `@/components` | componentes de producto |
| `@/lib/utils` | `cn()` para mergear clases |

Tokens y utilidades visuales viven en `app/globals.css`.
