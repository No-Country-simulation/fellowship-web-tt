import { createServiceRoleClient } from "@/lib/supabase/service-role";
import type {
  ContenidoGeneradoRow,
  ContenidoRepository,
  ContenidoRowPlan,
  ContenidoStatus,
  MediaJobStore,
  Plataforma,
} from "@/lib/agent/types";

type DbRow = {
  id: string;
  testimonio_id: string;
  plataforma: Plataforma;
  status: ContenidoStatus;
  draft_copy: string | null;
  media_asset_path: string | null;
};

function mapRow(row: DbRow): ContenidoGeneradoRow {
  return {
    id: row.id,
    testimonioId: row.testimonio_id,
    plataforma: row.plataforma,
    status: row.status as ContenidoStatus,
    draftCopy: row.draft_copy,
    mediaAssetPath: row.media_asset_path,
  };
}

/** Postgres ContenidoRepository against testimonials FK (service role). */
export function createSupabaseContenidoRepository(): ContenidoRepository {
  const supabase = createServiceRoleClient();

  return {
    async createRows(plans: ContenidoRowPlan[]) {
      const payload = plans.map((p) => ({
        testimonio_id: p.testimonioId,
        plataforma: p.plataforma,
        status: p.status,
        draft_copy: p.draftCopy ?? null,
        media_asset_path: p.mediaAssetPath ?? null,
      }));
      const { data, error } = await supabase
        .from("contenido_generado")
        .insert(payload)
        .select(
          "id, testimonio_id, plataforma, status, draft_copy, media_asset_path",
        );
      if (error) throw new Error(`contenido createRows: ${error.message}`);
      return (data as DbRow[]).map(mapRow);
    },

    async listByTestimonio(testimonioId: string) {
      const { data, error } = await supabase
        .from("contenido_generado")
        .select(
          "id, testimonio_id, plataforma, status, draft_copy, media_asset_path",
        )
        .eq("testimonio_id", testimonioId);
      if (error) throw new Error(`contenido list: ${error.message}`);
      return (data as DbRow[]).map(mapRow);
    },

    async updateStatus(testimonioId, plataforma, status) {
      const { data, error } = await supabase
        .from("contenido_generado")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("testimonio_id", testimonioId)
        .eq("plataforma", plataforma)
        .select(
          "id, testimonio_id, plataforma, status, draft_copy, media_asset_path",
        )
        .maybeSingle();
      if (error) throw new Error(`contenido updateStatus: ${error.message}`);
      return data ? mapRow(data as DbRow) : null;
    },

    async saveDraftCopy(testimonioId, plataforma, draftCopy) {
      const { data, error } = await supabase
        .from("contenido_generado")
        .update({
          draft_copy: draftCopy,
          updated_at: new Date().toISOString(),
        })
        .eq("testimonio_id", testimonioId)
        .eq("plataforma", plataforma)
        .select(
          "id, testimonio_id, plataforma, status, draft_copy, media_asset_path",
        )
        .maybeSingle();
      if (error) throw new Error(`contenido saveDraft: ${error.message}`);
      return data ? mapRow(data as DbRow) : null;
    },

    async saveMediaAssetPath(testimonioId, plataforma, mediaAssetPath) {
      const { data, error } = await supabase
        .from("contenido_generado")
        .update({
          media_asset_path: mediaAssetPath,
          updated_at: new Date().toISOString(),
        })
        .eq("testimonio_id", testimonioId)
        .eq("plataforma", plataforma)
        .select(
          "id, testimonio_id, plataforma, status, draft_copy, media_asset_path",
        )
        .maybeSingle();
      if (error) throw new Error(`contenido saveMedia: ${error.message}`);
      return data ? mapRow(data as DbRow) : null;
    },
  };
}

export function createSupabaseMediaJobStore(): MediaJobStore {
  const supabase = createServiceRoleClient();
  return {
    async isProcessed(jobId: string) {
      const { data, error } = await supabase
        .from("media_jobs")
        .select("webhook_acked")
        .eq("job_id", jobId)
        .maybeSingle();
      if (error) throw new Error(`media_jobs isProcessed: ${error.message}`);
      return Boolean(data?.webhook_acked);
    },
    async markProcessed(jobId: string) {
      const { error } = await supabase
        .from("media_jobs")
        .update({
          webhook_acked: true,
          updated_at: new Date().toISOString(),
        })
        .eq("job_id", jobId);
      if (error) throw new Error(`media_jobs markProcessed: ${error.message}`);
    },
  };
}

export async function resolveHasMediaFromDb(
  testimonioId: string,
): Promise<boolean> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("testimonials")
    .select("payload, video_url, capture_path")
    .eq("id", testimonioId)
    .maybeSingle();
  if (error) throw new Error(`resolveHasMedia: ${error.message}`);
  const payload = (data?.payload ?? {}) as Record<string, unknown>;
  return Boolean(
    payload.audio_path ||
      payload.video_path ||
      data?.video_url ||
      data?.capture_path,
  );
}

export async function lookupStoryFromDb(testimonioId: string): Promise<string> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("testimonials")
    .select("story")
    .eq("id", testimonioId)
    .maybeSingle();
  if (error) throw new Error(`lookupStory: ${error.message}`);
  return data?.story ?? "";
}

export async function lookupTypeFromDb(
  testimonioId: string,
): Promise<string | null> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("testimonials")
    .select("type")
    .eq("id", testimonioId)
    .maybeSingle();
  if (error) throw new Error(`lookupType: ${error.message}`);
  return typeof data?.type === "string" ? data.type : null;
}

export async function lookupMediaSourceKeys(testimonioId: string): Promise<{
  videoKey: string | null;
  audioKey: string | null;
}> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("testimonials")
    .select("payload, video_url, capture_path")
    .eq("id", testimonioId)
    .maybeSingle();
  if (error) throw new Error(`lookupMediaSourceKeys: ${error.message}`);
  const payload = (data?.payload ?? {}) as Record<string, unknown>;
  const videoKey =
    (typeof payload.video_path === "string" && payload.video_path) ||
    (typeof data?.video_url === "string" && data.video_url.startsWith("http")
      ? null
      : typeof data?.video_url === "string"
        ? data.video_url
        : null) ||
    (typeof data?.capture_path === "string" ? data.capture_path : null);
  const audioKey =
    typeof payload.audio_path === "string" ? payload.audio_path : null;
  return { videoKey, audioKey };
}

export async function enqueueMediaJobRow(input: {
  jobId: string;
  testimonioId: string;
  plataforma: Plataforma;
  sourceVideoKey?: string | null;
  sourceAudioKey?: string | null;
}): Promise<void> {
  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("media_jobs").upsert(
    {
      job_id: input.jobId,
      testimonio_id: input.testimonioId,
      plataforma: input.plataforma,
      status: "queued",
      source_video_key: input.sourceVideoKey ?? null,
      source_audio_key: input.sourceAudioKey ?? null,
    },
    { onConflict: "job_id" },
  );
  if (error) throw new Error(`enqueue media_jobs: ${error.message}`);
}
