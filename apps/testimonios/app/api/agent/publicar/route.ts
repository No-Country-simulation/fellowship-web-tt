import { NextResponse } from "next/server";
import { publishApproved } from "@/lib/agent";
import { requireAdminUser } from "@/lib/agent/require-admin-api";
import { createSupabaseContenidoRepository } from "@/lib/agent/supabase-repo";
import { memoryContenidoRepo } from "@/lib/agent/memory-store";
import { hasSupabaseServiceRoleEnv } from "@/lib/supabase/env";

type PublicarBody = { testimonioId?: unknown };

/**
 * POST /api/agent/publicar
 * Marks aprobado → publicado in DB only (manual social posting outside the app).
 */
export async function POST(request: Request): Promise<Response> {
  const admin = await requireAdminUser();
  if (!admin.ok) {
    return NextResponse.json(
      { ok: false, error: admin.error },
      { status: admin.status },
    );
  }

  let body: PublicarBody;
  try {
    body = (await request.json()) as PublicarBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Cuerpo JSON inválido." },
      { status: 400 },
    );
  }

  if (typeof body.testimonioId !== "string" || !body.testimonioId.trim()) {
    return NextResponse.json(
      { ok: false, error: "testimonioId es obligatorio." },
      { status: 400 },
    );
  }

  const repo = hasSupabaseServiceRoleEnv()
    ? createSupabaseContenidoRepository()
    : memoryContenidoRepo;

  const result = await publishApproved(body.testimonioId, { repo });
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error },
      { status: 409 },
    );
  }

  return NextResponse.json(
    {
      ok: true,
      published: result.published,
      note: "Estados actualizados en DB. El posteo a IG/LinkedIn es manual.",
    },
    { status: 200 },
  );
}
