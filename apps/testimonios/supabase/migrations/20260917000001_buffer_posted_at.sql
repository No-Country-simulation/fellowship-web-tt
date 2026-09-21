-- Marca si Buffer ya encoló el post de Instagram / LinkedIn.
-- Si Buffer falla, published_at igual se escribe; el admin puede reintentar.

alter table public.testimonials
  add column buffer_instagram_posted_at timestamptz,
  add column buffer_linkedin_posted_at timestamptz;

comment on column public.testimonials.buffer_instagram_posted_at is
  'Cuando Buffer encoló el post de Instagram. Null = pendiente o no aplica.';

comment on column public.testimonials.buffer_linkedin_posted_at is
  'Cuando Buffer encoló el post de LinkedIn. Null = pendiente o no aplica.';
