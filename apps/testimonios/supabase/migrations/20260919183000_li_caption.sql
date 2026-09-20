-- Caption de LinkedIn (admin) + perfil LinkedIn del fellow.

alter table public.testimonials
  add column if not exists li_caption text not null default '';

alter table public.testimonials
  add column if not exists linkedin text;

comment on column public.testimonials.li_caption is
  'Caption de LinkedIn. Lo edita el admin; no sale en testimonials_public.';
comment on column public.testimonials.linkedin is
  'Perfil LinkedIn del fellow. URL o handle. Opcional.';

create or replace view public.testimonials_public
with (security_invoker = false)
as
  select
    id,
    type,
    slug,
    full_name,
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

grant select on public.testimonials_public to anon, authenticated;
