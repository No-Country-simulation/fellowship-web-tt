-- Id del post en Buffer, para consultar su estado y el link al post publicado.
-- No va en testimonials_public: la galería no lo usa.

alter table public.testimonials
  add column if not exists buffer_instagram_post_id text,
  add column if not exists buffer_linkedin_post_id text;

comment on column public.testimonials.buffer_instagram_post_id is
  'Id del post de Instagram en Buffer. Null = pendiente, falló o se publicó antes de guardar el id.';

comment on column public.testimonials.buffer_linkedin_post_id is
  'Id del post de LinkedIn en Buffer. Null = pendiente, falló o se publicó antes de guardar el id.';
