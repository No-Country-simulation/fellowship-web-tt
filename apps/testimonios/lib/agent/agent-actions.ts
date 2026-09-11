"use server";

import { randomUUID } from "node:crypto";
import {
  publishApproved,
  runCopyGenerationForTestimonio,
  startProcessing,
} from "@/lib/agent";
import type { ContenidoStatus, Plataforma } from "@/lib/agent/types";
import { requireAdminUser } from "@/lib/agent/require-admin-api";
import {
  createSupabaseContenidoRepository,
  enqueueMediaJobRow,
  lookupMediaSourceKeys,
  lookupStoryFromDb,
  resolveHasMediaFromDb,
} from "@/lib/agent/supabase-repo";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export type AdminContenido = {
  id: string;
  testimonio_id: string;
  plataforma: Plataforma;
  status: ContenidoStatus;
  draft_copy: string | null;
  media_asset_path: string | null;
};

async function assertAdmin() {
  const admin = await requireAdminUser();
  if (!admin.ok) throw new Error(admin.error);
}

export async function listContenidoAdmin(
  testimonioId: string,
): Promise<AdminContenido[]> {
  await assertAdmin();
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("contenido_generado")
    .select(
      "id, testimonio_id, plataforma, status, draft_copy, media_asset_path",
    )
    .eq("testimonio_id", testimonioId);
  if (error) throw new Error(error.message);
  return (data ?? []) as AdminContenido[];
}

export async function updateDraftAndStatus(input: {
  testimonioId: string;
  plataforma: Plataforma;
  draftCopy: string;
  status: "aprobado" | "rechazado" | "listo_revision";
}): Promise<void> {
  await assertAdmin();
  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("contenido_generado")
    .update({
      draft_copy: input.draftCopy,
      status: input.status,
      updated_at: new Date().toISOString(),
    })
    .eq("testimonio_id", input.testimonioId)
    .eq("plataforma", input.plataforma);
  if (error) throw new Error(error.message);
}

export async function callProcesar(
  testimonioId: string,
  plataformas: Plataforma[],
): Promise<{ ok: boolean; error?: string }> {
  try {
    await assertAdmin();
    const repo = createSupabaseContenidoRepository();
    const hasMedia = await resolveHasMediaFromDb(testimonioId);
    const result = await startProcessing(
      { testimonioId, plataformas, hasMedia },
      {
        repo,
        enqueue: {
          async enqueueMediaJob(tid, plataforma) {
            const keys = await lookupMediaSourceKeys(tid);
            await enqueueMediaJobRow({
              jobId: randomUUID(),
              testimonioId: tid,
              plataforma,
              sourceVideoKey: keys.videoKey,
              sourceAudioKey: keys.audioKey,
            });
          },
        },
      },
    );
    if (!result.ok) return { ok: false, error: result.error };
    if (!hasMedia) {
      const sourceText = await lookupStoryFromDb(testimonioId);
      await runCopyGenerationForTestimonio(
        {
          testimonioId,
          sourceText: sourceText || "(sin historia)",
          plataformas,
        },
        { repo },
      );
    }
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Error al procesar",
    };
  }
}

export async function callPublicar(
  testimonioId: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await assertAdmin();
    const repo = createSupabaseContenidoRepository();
    const result = await publishApproved(testimonioId, { repo });
    if (!result.ok) return { ok: false, error: result.error };
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Error al publicar",
    };
  }
}
