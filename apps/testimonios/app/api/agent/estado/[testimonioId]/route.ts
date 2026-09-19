import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/agent/require-admin-api";
import { createSupabaseContenidoRepository } from "@/lib/agent/supabase-repo";
import { memoryContenidoRepo } from "@/lib/agent/memory-store";
import { hasSupabaseServiceRoleEnv } from "@/lib/supabase/env";

type RouteContext = {
  params: Promise<{ testimonioId: string }>;
};

/**
 * GET /api/agent/estado/[testimonioId]
 * Prefer Realtime in admin UI; this is a snapshot fallback.
 */
export async function GET(
  _request: Request,
  context: RouteContext,
): Promise<Response> {
  const admin = await requireAdminUser();
  if (!admin.ok) {
    return NextResponse.json(
      { ok: false, error: admin.error },
      { status: admin.status },
    );
  }

  const { testimonioId } = await context.params;
  if (!testimonioId?.trim()) {
    return NextResponse.json(
      { ok: false, error: "testimonioId es obligatorio." },
      { status: 400 },
    );
  }

  const repo = hasSupabaseServiceRoleEnv()
    ? createSupabaseContenidoRepository()
    : memoryContenidoRepo;
  const rows = await repo.listByTestimonio(testimonioId);
  const estados = rows.map((row) => ({
    plataforma: row.plataforma,
    status: row.status,
    id: row.id,
    draftCopy: row.draftCopy ?? null,
    mediaAssetPath: row.mediaAssetPath ?? null,
  }));

  return NextResponse.json(
    { ok: true, testimonioId, estados },
    { status: 200 },
  );
}
