alter table public.testimonials
  add column if not exists discord_caption text not null default '';

comment on column public.testimonials.discord_caption is
  'Texto de Discord que edita el panel. No entra en testimonials_public.';
