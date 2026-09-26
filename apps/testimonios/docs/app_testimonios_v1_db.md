# Testimonios v1 — tablas de Supabase

Solo lo que hace falta para la v1: texto, avatar, link de YouTube, admin. Sin jobs de video.

Auth de admin: `auth.users` de Supabase (no se crea tabla de usuarios). Un email allowlist o `app_metadata.role = admin`.

Storage (no es tabla):

- bucket `avatars` — `{id}/avatar.{ext}` (obligatorio en v1)
- bucket `captures` — `{id}/capture.{ext}` (opcional; foto del entorno de trabajo, no la cara)
- bucket `share-cards` — `{slug}/instagram.png` (PNG que Buffer descarga para Instagram)

Los datos que **cambian según el tipo** van en un solo `payload jsonb`. Así `testimonials` no tiene columnas vacías (`company`, `puesto`, `oficio anterior`, etc.).

---

## Enums

**`testimonial_type`**

- `simulation` — testimonio de simulación
- `first_job` — primer empleo IT
- `career_change` — reconversión

**`testimonial_status`**

- `in_review` — entra así el form
- `published` — sale a galería y redes
- `rejected` — archivado o eliminado

---

## `testimonials`

Una fila por envío. Campos comunes en columnas; lo específico del tipo en `payload`.

| Columna | Tipo | Nulo | Default | Notas |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | no | `gen_random_uuid()` | PK |
| `type` | `testimonial_type` | no | | Rama del form. Define la forma de `payload` |
| `status` | `testimonial_status` | no | `in_review` | |
| `slug` | `text` | no | | Único. URL `/t/{slug}` |
| `full_name` | `text` | no | | Público |
| `country` | `text` | sí | | País. Se muestra junto al nombre. Null en envíos anteriores |
| `email` | `text` | no | | **Solo admin** |
| `instagram` | `text` | sí | | Handle o URL. El caption de IG lo menciona |
| `linkedin` | `text` | sí | | Perfil (`linkedin.com/in/…`) o handle. El caption de LI lo menciona |
| `story` | `text` | no | | Texto largo (experiencia / cómo ayudó / por qué cambió) |
| `quote` | `text` | no | | Recorte literal de `story` |
| `ig_caption` | `text` | no | | Intro No Country + quote entre comillas + nombre + IG + hashtags |
| `li_caption` | `text` | no | `''` | Igual que IG, con LinkedIn en vez de Instagram. Solo admin |
| `avatar_path` | `text` | no | | Path en `avatars`. Foto de **perfil**. Obligatorio |
| `capture_path` | `text` | sí | | Path en `captures`. Foto del **entorno de trabajo** (equipo, oficina, reunión), no la cara ni una captura del proyecto |
| `video_url` | `text` | sí | | URL de YouTube |
| `payload` | `jsonb` | no | `'{}'` | Solo campos del tipo (abajo) |
| `consent_at` | `timestamptz` | no | | |
| `submitted_at` | `timestamptz` | no | `now()` | |
| `published_at` | `timestamptz` | sí | | Al publicar. Se escribe aunque Discord o Buffer fallen |
| `discord_posted_at` | `timestamptz` | sí | | Cuando el webhook de comunidad posteó con éxito. Null = pendiente, falló, o no hay webhook |
| `buffer_instagram_posted_at` | `timestamptz` | sí | | Cuando Buffer encoló Instagram. Null = pendiente, falló, o no hay canal |
| `buffer_linkedin_posted_at` | `timestamptz` | sí | | Cuando Buffer encoló LinkedIn. Null = pendiente, falló, o no hay canal |
| `created_at` | `timestamptz` | no | `now()` | |
| `updated_at` | `timestamptz` | no | `now()` | Trigger `on update` |

Índices: `unique (slug)`, `(status, submitted_at desc)`, `(type)`.

`video_url` vacío o YouTube (`youtube.com` / `youtu.be`). Validar forma de `payload` en la app y, si se quiere, con un check JSON.

`discord_posted_at` sale de [`20260909000000_discord_posted_at.sql`](../supabase/migrations/20260909000000_discord_posted_at.sql). Buffer (`share-cards` + `buffer_*_posted_at`) de [`20260917000000_share_cards.sql`](../supabase/migrations/20260917000000_share_cards.sql) y [`20260917000001_buffer_posted_at.sql`](../supabase/migrations/20260917000001_buffer_posted_at.sql). `linkedin` y `li_caption` de [`20260919183000_li_caption.sql`](../supabase/migrations/20260919183000_li_caption.sql). `country` y el puesto de simulación de [`20260923210000_country_and_simulation_role.sql`](../supabase/migrations/20260923210000_country_and_simulation_role.sql). `li_caption` y los `buffer_*` no van en `testimonials_public`. `linkedin` sí: la galería puede mostrarlo.

---

## Forma de `payload` según `type`

**`simulation`** — el puesto principal es opcional. Sin puesto, el payload queda vacío.

```json
{}
```

```json
{ "primary_role": "Frontend Developer" }
```

**`first_job`**

```json
{
  "company": "Exisoft S.A.",
  "role_achieved": "Desarrollador IBM"
}
```

**`career_change`**

```json
{
  "previous_profession": "Ingeniero Mecánico",
  "new_role": "Tester QA"
}
```

En TypeScript:

```ts
type SimulationPayload = { primary_role?: string }

type FirstJobPayload = {
  company: string
  role_achieved: string
}

type CareerChangePayload = {
  previous_profession: string
  new_role: string
}

type TestimonialPayload =
  | SimulationPayload
  | FirstJobPayload
  | CareerChangePayload
```

---

## Vista `testimonials_public`

Galería y `/t/[slug]` (rol `anon`). **Sin** `email`.

Columnas: `id`, `type`, `slug`, `full_name`, `country`, `instagram`, `linkedin`, `story`, `quote`, `avatar_path`, `capture_path`, `video_url`, `payload`, `published_at`.

`where status = 'published'`.

---

## RLS (resumen)

- **anon:** `select` solo `testimonials_public`. El form escribe con server action + `service_role`.
- **authenticated admin:** `select/update` de toda la fila (incluye `email`).
- Buckets `avatars`, `captures` y `share-cards`: lectura pública. Escritura solo server.

---

## Qué no va en v1

No hay `video_jobs` ni paths de video procesado. No hay tabla `admins`.
