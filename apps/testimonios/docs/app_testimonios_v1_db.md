# Testimonios v1 — tablas de Supabase

Solo lo que hace falta para la v1: texto, avatar, link de YouTube, admin. Sin jobs de video.

Auth de admin: `auth.users` de Supabase (no se crea tabla de usuarios). Un email allowlist o `app_metadata.role = admin`.

Storage (no es tabla):

- bucket `avatars` — `{id}/avatar.{ext}` (obligatorio en v1)
- bucket `captures` — `{id}/capture.{ext}` (opcional; screenshot del proyecto/demo)

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
| `email` | `text` | no | | **Solo admin** |
| `instagram` | `text` | sí | | Handle o URL. El caption puede usarlo |
| `story` | `text` | no | | Texto largo (experiencia / cómo ayudó / por qué cambió) |
| `quote` | `text` | no | | Recorte literal de `story` |
| `ig_caption` | `text` | no | | Quote + nombre + IG si hay + hashtags |
| `avatar_path` | `text` | no | | Path en `avatars`. Foto de **perfil**. Obligatorio |
| `capture_path` | `text` | sí | | Path en `captures`. Screenshot del **proyecto/demo**, no la cara |
| `video_url` | `text` | sí | | URL de YouTube |
| `payload` | `jsonb` | no | `'{}'` | Solo campos del tipo (abajo) |
| `consent_at` | `timestamptz` | no | | |
| `submitted_at` | `timestamptz` | no | `now()` | |
| `published_at` | `timestamptz` | sí | | Al publicar |
| `created_at` | `timestamptz` | no | `now()` | |
| `updated_at` | `timestamptz` | no | `now()` | Trigger `on update` |

Índices: `unique (slug)`, `(status, submitted_at desc)`, `(type)`.

`video_url` vacío o YouTube (`youtube.com` / `youtu.be`). Validar forma de `payload` en la app y, si se quiere, con un check JSON.

---

## Forma de `payload` según `type`

**`simulation`** — no hay extras; la historia está en `story`.

```json
{}
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
type SimulationPayload = Record<string, never>

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

Columnas: `id`, `type`, `slug`, `full_name`, `instagram`, `story`, `quote`, `avatar_path`, `capture_path`, `video_url`, `payload`, `published_at`.

`where status = 'published'`.

---

## RLS (resumen)

- **anon:** `select` solo `testimonials_public`. El form escribe con server action + `service_role`.
- **authenticated admin:** `select/update` de toda la fila (incluye `email`).
- Buckets `avatars` y `captures`: lectura pública de publicados (o signed URL). Escritura solo server.

---

## Qué no va en v1

No hay `video_jobs` ni paths de video procesado. No hay tabla `admins`.
