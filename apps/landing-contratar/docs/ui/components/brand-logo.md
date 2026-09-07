# BrandLogo

Wordmark compartido en `@repo/ui`. Docs canónicas: [packages/ui/docs/brand-logo.md](../../../../../packages/ui/docs/brand-logo.md).

## Import

```tsx
import { BrandLogo } from "@repo/ui/brand-logo";
```

## Uso en esta app

Header (eager, sin `priority`: el LCP es el H1) y footer (`width={120}`). En el Sheet mobile, `SheetClose` compone con `BrandLogo`.

El diferencial **no** usa `BrandLogo`: el wordmark es un H3, no un link. Ahí va el mismo PNG con `next/image`.

`public/brand/logo-no-country.jpg` es solo JSON-LD (`Organization.logo`), no UI.
