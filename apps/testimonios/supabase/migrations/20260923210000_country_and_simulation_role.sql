-- País del testimonio (columna común) y puesto principal opcional en simulación.

alter table public.testimonials
  add column if not exists country text;

comment on column public.testimonials.country is
  'País de la persona. Se muestra junto al nombre. Null en envíos anteriores a este campo.';

alter table public.testimonials
  drop constraint if exists payload_matches_type;

alter table public.testimonials
  add constraint payload_matches_type check (
    (
      type = 'simulation'
      and (
        payload = '{}'::jsonb
        or (
          payload ? 'primary_role'
          and jsonb_typeof(payload -> 'primary_role') = 'string'
        )
      )
    )
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
  );

-- CREATE OR REPLACE no puede insertar una columna en el medio (42P16).
drop view if exists public.testimonials_public;

create view public.testimonials_public
with (security_invoker = false)
as
  select
    id,
    type,
    slug,
    full_name,
    country,
    instagram,
    linkedin,
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

grant select on public.testimonials_public to anon, authenticated;
