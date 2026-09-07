# `@repo/ui`

Componentes compartidos del monorepo. Las apps los instalan con `"@repo/ui": "workspace:*"` y `transpilePackages: ["@repo/ui"]`.

La ficha canónica de cada export vive acá, no en `docs/ui` de una app. Las apps solo linkean y, si hace falta, anotan uso local.

| Export | Docs |
| --- | --- |
| `@repo/ui/button` | [docs/button.md](./docs/button.md) |
| `@repo/ui/brand-logo` | [docs/brand-logo.md](./docs/brand-logo.md) |
| `@repo/ui/utils` | `cn()` — sin ficha; lo reexportan las apps desde `@/lib/utils` |

Al agregar un export: archivo en `src/`, entrada en `package.json` `exports`, ficha en `docs/`, JSDoc en el componente apuntando a esa ficha.
