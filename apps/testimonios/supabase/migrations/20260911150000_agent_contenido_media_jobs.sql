-- Agent pipeline: contenido_generado + media_jobs (FK → testimonials)

CREATE TABLE IF NOT EXISTS public.contenido_generado (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  testimonio_id uuid NOT NULL REFERENCES public.testimonials (id) ON DELETE CASCADE,
  plataforma text NOT NULL CHECK (plataforma IN ('instagram', 'linkedin')),
  status text NOT NULL DEFAULT 'pendiente'
    CHECK (
      status IN (
        'pendiente',
        'procesando_media',
        'generando_copy',
        'listo_revision',
        'aprobado',
        'rechazado',
        'publicado',
        'error'
      )
    ),
  draft_copy text,
  draft_title text,
  media_asset_path text,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT contenido_generado_testimonio_plataforma_unique
    UNIQUE (testimonio_id, plataforma)
);

CREATE INDEX IF NOT EXISTS contenido_generado_testimonio_id_idx
  ON public.contenido_generado (testimonio_id);

CREATE INDEX IF NOT EXISTS contenido_generado_status_idx
  ON public.contenido_generado (status);

CREATE TABLE IF NOT EXISTS public.media_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id text NOT NULL UNIQUE,
  testimonio_id uuid NOT NULL REFERENCES public.testimonials (id) ON DELETE CASCADE,
  plataforma text NOT NULL CHECK (plataforma IN ('instagram', 'linkedin')),
  status text NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued', 'processing', 'done', 'error')),
  source_video_key text,
  source_audio_key text,
  media_asset_path text,
  error_message text,
  webhook_acked boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS media_jobs_testimonio_id_idx
  ON public.media_jobs (testimonio_id);

ALTER TABLE public.contenido_generado ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS contenido_generado_admin_select ON public.contenido_generado;
CREATE POLICY contenido_generado_admin_select ON public.contenido_generado
  FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS contenido_generado_admin_update ON public.contenido_generado;
CREATE POLICY contenido_generado_admin_update ON public.contenido_generado
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS media_jobs_admin_select ON public.media_jobs;
CREATE POLICY media_jobs_admin_select ON public.media_jobs
  FOR SELECT TO authenticated
  USING (public.is_admin());

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.contenido_generado;
EXCEPTION
  WHEN undefined_object THEN NULL;
  WHEN duplicate_object THEN NULL;
END $$;

INSERT INTO storage.buckets (id, name, public)
VALUES ('testimonios-media', 'testimonios-media', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS testimonios_media_admin_select ON storage.objects;
CREATE POLICY testimonios_media_admin_select ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'testimonios-media' AND public.is_admin());

DROP POLICY IF EXISTS testimonios_media_service_all ON storage.objects;
CREATE POLICY testimonios_media_service_all ON storage.objects
  FOR ALL TO service_role
  USING (bucket_id = 'testimonios-media')
  WITH CHECK (bucket_id = 'testimonios-media');

COMMENT ON TABLE public.contenido_generado IS
  'Per-platform agent drafts (ADR-002); FK to testimonials.';
COMMENT ON TABLE public.media_jobs IS
  'FFmpeg worker queue for agent pipeline.';
