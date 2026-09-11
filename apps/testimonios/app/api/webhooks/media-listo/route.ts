import { NextResponse } from "next/server";
import {
  MEDIA_WEBHOOK_SIGNATURE_HEADER,
  createMediaListoCopyTrigger,
  handleMediaListo,
} from "@/lib/agent";
import {
  createSupabaseContenidoRepository,
  createSupabaseMediaJobStore,
  lookupStoryFromDb,
} from "@/lib/agent/supabase-repo";
import {
  lookupStoryText,
  memoryContenidoRepo,
} from "@/lib/agent/memory-store";
import { hasSupabaseServiceRoleEnv } from "@/lib/supabase/env";

const processedJobIds = new Set<string>();
const memoryJobs = {
  async isProcessed(jobId: string) {
    return processedJobIds.has(jobId);
  },
  async markProcessed(jobId: string) {
    processedJobIds.add(jobId);
  },
};

/**
 * POST /api/webhooks/media-listo
 * HMAC only — no admin session.
 */
export async function POST(request: Request): Promise<Response> {
  const secret = process.env.MEDIA_WEBHOOK_SECRET?.trim();
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "MEDIA_WEBHOOK_SECRET no configurado." },
      { status: 503 },
    );
  }

  const rawBody = await request.text();
  const signatureHeader = request.headers.get(MEDIA_WEBHOOK_SIGNATURE_HEADER);

  const useSb = hasSupabaseServiceRoleEnv();
  const repo = useSb
    ? createSupabaseContenidoRepository()
    : memoryContenidoRepo;
  const jobs = useSb ? createSupabaseMediaJobStore() : memoryJobs;

  const onCopyTrigger = createMediaListoCopyTrigger({
    repo,
    lookupSourceText: useSb ? lookupStoryFromDb : lookupStoryText,
  });

  const result = await handleMediaListo({
    rawBody,
    signatureHeader,
    secret,
    repo,
    jobs,
    onCopyTrigger,
  });

  return NextResponse.json(result.body, { status: result.status });
}
