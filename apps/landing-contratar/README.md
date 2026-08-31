# landing-contratar

Landing Next.js para contratar talento (No Country). Cómo corre el monorepo: [README de la raíz](../../README.md).

## Getting Started

```bash
pnpm install
cp .env.example .env.local
pnpm turbo run dev --filter=landing-contratar
```

Desde esta carpeta también vale `pnpm dev`. Abrí [http://localhost:3000](http://localhost:3000).

### Variables de entorno

Definidas en `.env.example`. Copiá ese archivo a `.env.local` (gitignored).

| Variable | Para qué |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Origen canónico (sitemap, JSON-LD, `canonical`). Opcional: en local cae a `http://localhost:3000`; en el primer deploy de Vercel usa la URL del deployment. Setearla después, cuando exista el dominio estable (sin slash final). |
| `WEB3FORMS_ACCESS_KEY` | Access key de [Web3Forms](https://web3forms.com). Llega al mail con el que te registrás. Sin esto el brief de requerimiento del cierre no envía. |

Deploy: en Vercel, Root Directory `apps/landing-contratar`.

## UI / Design system

- [docs/ui/README.md](./docs/ui/README.md) — índice y convención al agregar componentes
- [Design system](./docs/ui/design-system.md) — colores, type scale, spacing, sombras
- [Button](./docs/ui/components/button.md) — vive en `@repo/ui` (`packages/ui`)

Al crear un componente en `components/ui`, documentarlo en `docs/ui/components/` antes del PR. shadcn de esta app se corre desde este directorio. El Button compartido se edita en `packages/ui`. Esta app ya tiene `transpilePackages: ["@repo/ui"]` y `@source` de ese paquete en `app/globals.css`.

## SEO y GEO

Copy canónico en `lib/geo.ts`.

- [docs/seo-geo.md](./docs/seo-geo.md) — arquitectura, qué tocar según el cambio, cómo verificar
