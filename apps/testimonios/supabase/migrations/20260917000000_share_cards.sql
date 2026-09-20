-- Staging público para la card PNG de Instagram.
-- Buffer no acepta upload: necesita una URL HTTPS mientras baja el archivo.
-- Path: {slug}/instagram.png. Escritura solo service_role.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'share-cards',
  'share-cards',
  true,
  5242880,
  array['image/png']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Public can read share-cards"
on storage.objects
for select
to public
using (bucket_id = 'share-cards');
