# Button

Botón compartido en `@repo/ui`. Docs canónicas: [packages/ui/docs/button.md](../../../../../packages/ui/docs/button.md).

## Import

```tsx
import { Button } from "@repo/ui/button";
```

## Uso en esta app

CTAs de landing: `variant="gradient"` + `size="lg"` + `shadow-glow`. En bandas `surface="light"`, `globals.css` fuerza el texto blanco de `.bg-brand-gradient`.

Navegación que debe verse como botón: `buttonVariants` sobre `<Link>` (p. ej. “Iniciar Sesión”).
