# SEO y GEO

Cómo este sitio se hace entendible para buscadores (SEO) y para modelos de IA / motores generativos (GEO). El copy canónico vive en un solo lugar; metadata, JSON-LD y `llms.txt` se derivan de ahí.

**Objetivo:** cualquier dev puede actualizar hechos, FAQs o URLs sin romper canonical, schema ni el texto que leen los crawlers.

GEO acá significa *Generative Engine Optimization*: servir hechos verificables en HTML del servidor, datos estructurados y texto plano para que ChatGPT, Claude, Perplexity y similares citen el producto con precisión.

## Arquitectura

```
lib/geo.ts          hechos, keywords, FAQs, países, roles
lib/landing.ts      copy de secciones (pasos, evidencia, garantía)
        │
        ├── lib/metadata.ts     title, description, canonical, OG, robots
        ├── lib/json-ld.ts      schema.org (@graph)
        └── lib/llms-txt.ts     /llms.txt y /llms-full.txt
```

`lib/site.ts` resuelve el origen canónico. Lo usan sitemap, robots, JSON-LD, canonical y los links de `llms.txt`. Orden:

1. `NEXT_PUBLIC_SITE_URL` — override cuando ya hay dominio estable (custom o `*.vercel.app` de producción). No hace falta para el primer deploy: todavía no existe esa URL.
2. `VERCEL_PROJECT_PRODUCTION_URL` — host de producción que Vercel inyecta en el build.
3. `VERCEL_URL` — host de *este* deployment. Cubre el primer deploy, cuando el proyecto todavía no tiene URL de producción.
4. En local (`next dev`): `http://localhost:3000`.

El build de producción solo falla si no hay ninguna de esas (p. ej. `next build` en una máquina sin env de Vercel y sin `NEXT_PUBLIC_SITE_URL`). Así no se indexa `localhost`. No falla el primer deploy en Vercel.

## Fuente de verdad del copy

| Qué | Dónde | Quién lo consume |
| --- | --- | --- |
| Nombre, title, description, keywords | `lib/geo.ts` | metadata, JSON-LD, llms |
| Hechos del servicio (`productFacts`) | `lib/geo.ts` | llms (resumen y full) |
| FAQs | `lib/geo.ts` | landing (`<details>`), JSON-LD `FAQPage`, llms |
| Roles, conocimientos, países, aliados, métricas | `lib/geo.ts` | landing, JSON-LD `Service`, llms |
| Pasos, evidencia, garantía, perfiles | `lib/landing.ts` | landing, JSON-LD `HowTo`, llms-full |

Reglas:

- No inventar respuestas de FAQ. Si no hay respuesta, omitir el ítem (`getAnsweredFaqs()` filtra los que no tienen `answer`).
- Hechos y plazos de `lib/landing.ts` tienen que coincidir con `lib/geo.ts`.
- Cifras con fecha de corte en `metricsAsOf`. Al actualizar números, actualizar también esa fecha.
- Tras un cambio de contenido, actualizar `CONTENT_LAST_MODIFIED` en `app/sitemap.ts` (fecha fija, no `new Date()`).

## SEO

### Metadata (`lib/metadata.ts` → `app/layout.tsx`)

`getSiteMetadata()` exporta el objeto `metadata` del root layout. Incluye:

- `metadataBase` y `alternates.canonical` (`/`) con el origen de `getSiteUrl()`
- title (`Talento junior… | No Country`) y `template` `%s | No Country` para páginas hijas
- description, keywords, authors, robots (`index, follow`, Googlebot con snippet/imagen amplios)
- Open Graph (`locale: es_AR`) y Twitter `summary_large_image`
- `alternates.types` `text/plain` apuntando a `/llms.txt` y `/llms-full.txt`

Imágenes de share: `app/opengraph-image.jpg` y `app/twitter-image.jpg` (convención de Next: se inyectan solas). Favicon: `app/favicon.ico`.

Idioma: `<html lang="es">`.

### Sitemap y robots

| Archivo | Ruta pública | Qué hace |
| --- | --- | --- |
| `app/sitemap.ts` | `/sitemap.xml` | Home (priority 1), `llms.txt` (0.8), `llms-full.txt` (0.7). `lastModified` = `CONTENT_LAST_MODIFIED`. |
| `app/robots.ts` | `/robots.txt` | `Allow: /` para `*` y para crawlers de IA (GPTBot, ClaudeBot, Perplexity, Google-Extended, etc.). Declara el sitemap. |

### JSON-LD (`lib/json-ld.ts`)

Dos grafos, inyectados con `components/json-ld.tsx` (`application/ld+json`, `<` escapado a `\u003c`):

| Función | Dónde se renderiza | Tipos schema.org |
| --- | --- | --- |
| `getSiteJsonLd()` | root layout | `Organization`, `WebSite` |
| `getLandingJsonLd()` | `app/page.tsx` | `WebPage`, `Service`, `HowTo`, `FAQPage` (si hay FAQs con respuesta) |

Los nodos se referencian por `@id` (`/#organization`, `/#website`, `/#webpage`, `/#service`, `/#howto`, `/#faq`). `HowTo` apunta a `#como-funciona`. `Organization.sameAs` usa las URLs de `lib/nav.ts`. `Service.areaServed` usa `countriesServed`.

No documentar este componente en `docs/ui`: no es un primitivo de UI.

### HTML semántico (landing)

- Un solo `h1` en el hero; cada sección con `h2` e `id` estable para anclas y schema (`#como-funciona`, `#faq`, `#evidencia`, `#garantia`, `#perfiles`, …).
- FAQ con `<details>`/`<summary>` en el HTML del servidor. No usar un acordeón cliente: la respuesta tiene que existir para crawlers sin hidratar JS.
- Logo de marca con `alt`; logos de aliados en el marquee van con `alt=""` (decorativos; el nombre ya está en copy/JSON-LD).

## GEO

Tres capas, de más corta a más completa:

1. **HTML + JSON-LD** — lo que scrapean SearchGPT / Perplexity si visitan la landing.
2. **`/llms.txt`** — resumen en texto plano: descripción, hechos, FAQs, links. Convención [llmstxt.org](https://llmstxt.org/).
3. **`/llms-full.txt`** — lo mismo más pasos, garantía, evidencia, perfiles, stats y enlaces de producto.

Rutas: `app/llms.txt/route.ts` y `app/llms-full.txt/route.ts` (`force-static`, `Content-Type: text/plain; charset=utf-8`). Generadores: `getLlmsTxt()` / `getLlmsFullTxt()` en `lib/llms-txt.ts`.

Descubrimiento:

- `<link rel="describedby" href="…/llms.txt">` en el `<head>` del layout
- `alternates.types` en metadata
- ambas URLs en el sitemap
- robots permite explícitamente bots de IA

## Qué tocar según el cambio

| Cambio | Archivos |
| --- | --- |
| Title, description, keywords | `lib/geo.ts` (metadata y JSON-LD se actualizan solos) |
| FAQ | `lib/geo.ts` → landing, JSON-LD, ambos llms |
| Pasos / evidencia / garantía | `lib/landing.ts` → UI, HowTo, llms-full |
| Cifras o fecha de corte | `lib/geo.ts` (`productFacts` + `metricsAsOf`) |
| Países, roles, conocimientos | `lib/geo.ts` |
| URL canónica / dominio | `NEXT_PUBLIC_SITE_URL` cuando ya exista (sin slash final). El primer deploy no la necesita. |
| Contenido publicado | `CONTENT_LAST_MODIFIED` en `app/sitemap.ts` |
| Imagen de share | `app/opengraph-image.jpg` / `app/twitter-image.jpg` |
| Bots de IA extra | `AI_CRAWLERS` en `app/robots.ts` |
| Redes / sameAs | `lib/nav.ts` |

## Verificar en local

Con `pnpm dev` y `NEXT_PUBLIC_SITE_URL` vacío (cae a `http://localhost:3000`):

```bash
# metadata / schema en el HTML
curl -s http://localhost:3000 | head

# texto para modelos
curl -s http://localhost:3000/llms.txt
curl -s http://localhost:3000/llms-full.txt

# descubrimiento
curl -s http://localhost:3000/robots.txt
curl -s http://localhost:3000/sitemap.xml
```

En el HTML de `/` tiene que haber: `rel="canonical"`, `rel="describedby"` a `/llms.txt`, y dos `<script type="application/ld+json">` (sitio + landing). Validar schema con [Rich Results Test](https://search.google.com/test/rich-results) contra la URL de producción.

Cuando el sitio ya tenga dominio estable, setear `NEXT_PUBLIC_SITE_URL` (ej. `https://fellowship.nocountry.tech`), sin slash final. Ver `.env.example`. El primer deploy en Vercel no la necesita.
