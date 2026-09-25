-- Video pipeline: Sanity stores files; Supabase stores URLs + review state.
-- Original stays until processed video is approved (space). Approvals are
-- independent from testimonio publish. Social (Buffer) unchanged.

create type public.video_status as enum (
  'none',
  'original',
  'processing',
  'processed',
  'approved',
  'rejected'
);

alter table public.testimonials
  add column video_status public.video_status not null default 'none',
  add column video_original_url text,
  add column video_original_asset_id text,
  add column video_processed_url text,
  add column video_processed_asset_id text,
  add column video_share_url text,
  add column video_ffmpeg_job_id text,
  add column video_error text;

comment on column public.testimonials.video_status is
  'Estado del mp4 en Sanity/FFmpeg. Independiente de status del testimonio.';
comment on column public.testimonials.video_original_url is
  'CDN Sanity del original. Se borra el asset al aprobar el procesado.';
comment on column public.testimonials.video_processed_url is
  'CDN Sanity del video con watermark + subtítulos.';
comment on column public.testimonials.video_share_url is
  'Link para enviarle al fellow (copia del processed al aprobar).';
comment on column public.testimonials.video_url is
  'Legacy YouTube opcional (Discord). El mp4 va por columnas video_*.';

-- YouTube check stays for video_url only; Sanity URLs live in video_* columns.
alter table public.testimonials
  drop constraint if exists video_url_youtube;

alter table public.testimonials
  add constraint video_url_youtube check (
    video_url is null
    or video_url ~* '^https?://([a-z0-9-]+\.)*(youtube\.com|youtu\.be)/'
  );

alter table public.testimonials
  add constraint video_original_consistency check (
    (video_original_url is null and video_original_asset_id is null)
    or (video_original_url is not null and video_original_asset_id is not null)
  );

alter table public.testimonials
  add constraint video_processed_consistency check (
    (video_processed_url is null and video_processed_asset_id is null)
    or (video_processed_url is not null and video_processed_asset_id is not null)
  );

-- Pública: country + YouTube opcional + share URL si video aprobado.
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
    case
      when video_status = 'approved' then video_share_url
      else null
    end as video_share_url,
    payload,
    published_at
  from public.testimonials
  where status = 'published';

comment on view public.testimonials_public is
  'Galería y /t/[slug]. Rol anon. Sin email. video_share_url solo si video aprobado.';

grant select on public.testimonials_public to anon, authenticated;
