# Fellowship Web

Proyecto Next.js del equipo Fellowship.

## Getting Started

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Abrí [http://localhost:3000](http://localhost:3000).

### Variables de entorno

Definidas en `.env.example`. Copiá ese archivo a `.env.local` (gitignored).

| Variable | Para qué |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Origen canónico (sitemap, JSON-LD, `canonical`). En local puede quedar vacío: cae a `http://localhost:3000`. En producción es obligatorio. |
| `WEB3FORMS_ACCESS_KEY` | Access key de [Web3Forms](https://web3forms.com). Llega al mail con el que te registrás. Sin esto el brief de requerimiento del cierre no envía. |

## UI / Design system

Tokens, tipografía y componentes documentados para el equipo:

- [docs/ui/README.md](./docs/ui/README.md) — índice y convención al agregar componentes
- [Design system](./docs/ui/design-system.md) — colores, type scale, spacing, sombras
- [Button](./docs/ui/components/button.md)

Al crear un componente en `components/ui`, documentarlo en `docs/ui/components/` antes del PR.

## SEO y GEO

Metadata, JSON-LD, sitemap/robots y `llms.txt` para buscadores y modelos de IA. Copy canónico en `lib/geo.ts`.

- [docs/seo-geo.md](./docs/seo-geo.md) — arquitectura, qué tocar según el cambio, cómo verificar
