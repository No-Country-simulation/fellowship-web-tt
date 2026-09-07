-- Testimonios v1: enums, tabla, vista pública, RLS, Storage, admin.
-- Aplicar con `npx supabase db push` desde la raíz (proyecto ya linkeado).

create type public.testimonial_type as enum (
  'simulation',
  'first_job',
  'career_change'
);

create type public.testimonial_status as enum (
  'in_review',
  'published',
  'rejected'
);

create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  type public.testimonial_type not null,
  status public.testimonial_status not null default 'in_review',
  slug text not null unique,
  full_name text not null,
  email text not null,
  instagram text,
  story text not null,
  quote text not null,
  ig_caption text not null,
  avatar_path text not null,
  capture_path text,
  video_url text,
  payload jsonb not null default '{}'::jsonb,
  consent_at timestamptz not null,
  submitted_at timestamptz not null default now(),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payload_is_object check (jsonb_typeof(payload) = 'object'),
  constraint payload_matches_type check (
    (type = 'simulation' and payload = '{}'::jsonb)
    or (
      type = 'first_job'
      and payload ? 'company'
      and payload ? 'role_achieved'
    )
    or (
      type = 'career_change'
      and payload ? 'previous_profession'
      and payload ? 'new_role'
    )
  ),
  constraint video_url_youtube check (
    video_url is null
    or video_url ~* '^https?://([a-z0-9-]+\.)*(youtube\.com|youtu\.be)/'
  )
);

comment on table public.testimonials is
  'Un envío de testimonio. email solo lo ve un admin autenticado.';
comment on column public.testimonials.email is
  'Solo admin. No se expone en testimonials_public.';
comment on column public.testimonials.avatar_path is
  'Path en el bucket avatars. Foto de perfil, obligatoria.';
comment on column public.testimonials.capture_path is
  'Path en el bucket captures. Screenshot del proyecto/demo, opcional.';
comment on column public.testimonials.video_url is
  'URL de YouTube. Vacío o youtube.com / youtu.be.';

create index testimonials_status_submitted_idx
  on public.testimonials (status, submitted_at desc);

create index testimonials_type_idx
  on public.testimonials (type);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger testimonials_set_updated_at
before update on public.testimonials
for each row
execute function public.set_updated_at();

-- Vista sin email. security_invoker = false para que anon no dependa de
-- un SELECT sobre testimonials (eso filtraría email por RLS, no lo ocultaría).
create view public.testimonials_public
with (security_invoker = false)
as
  select
    id,
    type,
    slug,
    full_name,
    instagram,
    story,
    quote,
    avatar_path,
    capture_path,
    video_url,
    payload,
    published_at
  from public.testimonials
  where status = 'published';

comment on view public.testimonials_public is
  'Galería y /t/[slug]. Rol anon. Sin email.';

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$;

comment on function public.is_admin() is
  'True si auth.users.app_metadata.role = admin. La allowlist de emails vive en la app (ADMIN_EMAILS) y usa service_role.';

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

alter table public.testimonials enable row level security;
alter table public.testimonials force row level security;

revoke all on table public.testimonials from anon, authenticated, public;
grant select, update on table public.testimonials to authenticated;
grant select on public.testimonials_public to anon, authenticated;

create policy "Admins can select testimonials"
on public.testimonials
for select
to authenticated
using (public.is_admin());

create policy "Admins can update testimonials"
on public.testimonials
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Storage: lectura pública (Discord y galería). Escritura solo service_role.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'avatars',
    'avatars',
    true,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'captures',
    'captures',
    true,
    8388608,
    array['image/jpeg', 'image/png', 'image/webp']
  )
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Public can read avatars"
on storage.objects
for select
to public
using (bucket_id = 'avatars');

create policy "Public can read captures"
on storage.objects
for select
to public
using (bucket_id = 'captures');
