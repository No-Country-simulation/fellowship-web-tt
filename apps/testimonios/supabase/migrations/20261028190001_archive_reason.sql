-- Motivo de archivo. Solo admin. No entra en testimonials_public.
-- Si status es archived, el texto no puede quedar vacío (btrim) y tiene tope de 500.
-- En cualquier otro estado, archive_reason queda null.

alter table public.testimonials
  add column if not exists archive_reason text;

alter table public.testimonials
  drop constraint if exists testimonials_archive_reason_matches_status;

alter table public.testimonials
  add constraint testimonials_archive_reason_matches_status check (
    (
      status = 'archived'
      and archive_reason is not null
      and btrim(archive_reason) <> ''
      and char_length(archive_reason) <= 500
    )
    or (
      status <> 'archived'
      and archive_reason is null
    )
  );

comment on column public.testimonials.archive_reason is
  'Motivo de archivo. Solo admin. No entra en testimonials_public.';
