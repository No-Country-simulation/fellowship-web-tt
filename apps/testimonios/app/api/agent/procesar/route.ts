import { NextResponse } from "next/server";
import {
  runCopyGenerationForTestimonio,
  startProcessing,
} from "@/lib/agent";
import type { Plataforma } from "@/lib/agent";
import { requireAdminUser } from "@/lib/agent/require-admin-api";
import {
  createSupabaseContenidoRepository,
  enqueueMediaJobRow,
  lookupMediaSourceKeys,
  lookupStoryFromDb,
  lookupTypeFromDb,
  resolveHasMediaFromDb,
} from "@/lib/agent/supabase-repo";
import {
  lookupStoryText,
  memoryContenidoRepo,
  resolveHasMedia,
} from "@/lib/agent/memory-store";
import { hasSupabaseServiceRoleEnv } from "@/lib/supabase/env";
import { randomUUID } from "node:crypto";

type ProcesarBody = {
  testimonioId?: unknown;
  plataformas?: unknown;
};

/**
 * POST /api/agent/procesar
 * Admin-gated. Uses Supabase when service role is configured; memory fallback for tests.
 */
export async function POST(request: Request): Promise<Response> {
  const admin = await requireAdminUser();
  if (!admin.ok) {
    return NextResponse.json(
      { ok: false, error: admin.error },
      { status: admin.status },
    );
  }

  let body: ProcesarBody;
  try {
    body = (await request.json()) as ProcesarBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Cuerpo JSON inválido." },
      { status: 400 },
    );
  }

  if (typeof body.testimonioId !== "string" || body.testimonioId.trim() === "") {
    return NextResponse.json(
      { ok: false, error: "testimonioId es obligatorio." },
      { status: 400 },
    );
  }

  const plataformas = Array.isArray(body.plataformas)
    ? (body.plataformas as Plataforma[])
    : [];

  const useSb = hasSupabaseServiceRoleEnv();
  const repo = useSb
    ? createSupabaseContenidoRepository()
    : memoryContenidoRepo;

  const hasMedia = useSb
    ? await resolveHasMediaFromDb(body.testimonioId)
    : resolveHasMedia(body.testimonioId);

  const result = await startProcessing(
    {
      testimonioId: body.testimonioId,
      plataformas,
      hasMedia,
    },
    {
      repo,
      enqueue: {
        async enqueueMediaJob(testimonioId, plataforma) {
          if (!useSb) return;
          const jobId = randomUUID();
          const keys = await lookupMediaSourceKeys(testimonioId);
          await enqueueMediaJobRow({
            jobId,
            testimonioId,
            plataforma,
            sourceVideoKey: keys.videoKey,
            sourceAudioKey: keys.audioKey,
          });
        },
      },
    },
  );

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error },
      { status: 400 },
    );
  }

  if (!hasMedia) {
    const sourceText = useSb
      ? await lookupStoryFromDb(body.testimonioId)
      : lookupStoryText(body.testimonioId);
    const typeHint = useSb
      ? await lookupTypeFromDb(body.testimonioId)
      : null;
    await runCopyGenerationForTestimonio(
      {
        testimonioId: body.testimonioId,
        sourceText: sourceText || "(sin historia)",
        plataformas,
        typeHint,
      },
      { repo },
    );
  }

  const rows = await repo.listByTestimonio(body.testimonioId);
  return NextResponse.json({ ok: true, rows }, { status: 200 });
}
