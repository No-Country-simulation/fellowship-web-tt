-- Motivo de rechazo. Solo admin. No entra en testimonials_public.
-- Si status es rejected, reject_reason puede ser null (rechazados históricos sin motivo)
-- o un texto no vacío (btrim) de hasta 500. La obligatoriedad se exige en la action del panel.
-- En cualquier otro estado, reject_reason queda null.

alter table public.testimonials
  add column if not exists reject_reason text;

alter table public.testimonials
  drop constraint if exists testimonials_reject_reason_matches_status;

alter table public.testimonials
  add constraint testimonials_reject_reason_matches_status check (
    (
      status = 'rejected'
      and (
        reject_reason is null
        or (
          btrim(reject_reason) <> ''
          and char_length(reject_reason) <= 500
        )
      )
    )
    or (
      status <> 'rejected'
      and reject_reason is null
    )
  );

comment on column public.testimonials.reject_reason is
  'Motivo de rechazo. Solo admin. No entra en testimonials_public.';
