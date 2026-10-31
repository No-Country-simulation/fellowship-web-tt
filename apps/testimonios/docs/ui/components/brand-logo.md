# BrandLogo

Wordmark compartido en `@repo/ui`. Docs canónicas: [packages/ui/docs/brand-logo.md](../../../../../packages/ui/docs/brand-logo.md).

## Import

```tsx
import { BrandLogo } from "@repo/ui/brand-logo";
```

## Uso en esta app

`BrandLogo` siempre apunta a `/` y sigue disponible para navegación local. El navbar institucional utiliza el mismo PNG con `next/image` y un `<a>` al inicio oficial de No Country, sin modificar el componente compartido. Si hace falta el wordmark **sin** link, usá el mismo PNG.

```tsx
<BrandLogo loading="eager">
  <span className="text-body-small text-text-secondary">Testimonios</span>
</BrandLogo>
```

La card de Instagram (`drawIgCard` en canvas) usa el mismo PNG.
