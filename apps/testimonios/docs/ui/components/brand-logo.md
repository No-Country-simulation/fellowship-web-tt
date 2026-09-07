# BrandLogo

Wordmark compartido en `@repo/ui`. Docs canónicas: [packages/ui/docs/brand-logo.md](../../../../../packages/ui/docs/brand-logo.md).

## Import

```tsx
import { BrandLogo } from "@repo/ui/brand-logo";
```

## Uso en esta app

El header pasa el nombre del producto como `children`. Si hace falta el wordmark **sin** link, usá el mismo PNG: `BrandLogo` siempre apunta a `/`.

```tsx
<BrandLogo loading="eager">
  <span className="text-body-small text-text-secondary">{SITE_NAME}</span>
</BrandLogo>
```

La card de Instagram (`next/og`) usa el mismo PNG.
