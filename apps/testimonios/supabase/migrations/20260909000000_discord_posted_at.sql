-- Marca si el webhook de comunidad ya posteó este testimonio publicado.
-- Si el POST falla, published_at igual se escribe; el admin puede reintentar.

alter table public.testimonials
  add column discord_posted_at timestamptz;

comment on column public.testimonials.discord_posted_at is
  'Cuando el webhook de comunidad posteó con éxito. Null = pendiente o no aplica.';
