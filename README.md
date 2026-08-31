# Fellowship Web

Monorepo No Country. **pnpm workspaces** define las apps y el install; **Turborepo** orquesta `dev` / `build` / `lint` / `start` y cachea lo que no cambió.

```
apps/                  productos (cada uno con su package.json)
packages/              código compartido (`@repo/ui` hoy: Button + `cn`)
package.json           scripts del repo
pnpm-workspace.yaml    paquetes: apps/*, packages/*
turbo.json             tasks de Turbo
```

Código compartido vive en `packages/` y las apps lo instalan con `"@repo/ui": "workspace:*"`.

| App | Qué es |
| --- | --- |
| [`landing-contratar`](./apps/landing-contratar) | Landing para contratar talento |

## Comandos

Desde la raíz, una sola vez:

```bash
pnpm install
```

| Script | Qué hace |
| --- | --- |
| `pnpm dev` | `turbo run dev` — levanta **todas** las apps con script `dev` |
| `pnpm build` | build de todas |
| `pnpm lint` | lint de todas |
| `pnpm start` | `next start` de todas (hace falta un build previo) |

Una app puntual:

```bash
pnpm turbo run dev --filter=landing-contratar
```

Si corrés más de una Next a la vez, cada una necesita su puerto (`next dev --port 3001` en la segunda). Env, UI y copy viven en el README de cada app.

## Nueva app

Crear `apps/<nombre>` con `package.json` (el `name` tiene que ser único) y los scripts que Turbo ya declara (`dev`, `build`, `lint`, `start`). pnpm la toma sola por `apps/*`. UI compartida: `"@repo/ui": "workspace:*"` (detalle de Next/Tailwind en el README de cada app).

## Deploy (Vercel)

Un proyecto Vercel por app. Root Directory: `apps/<nombre>`. El install sigue siendo `pnpm install` en la raíz del repo.
