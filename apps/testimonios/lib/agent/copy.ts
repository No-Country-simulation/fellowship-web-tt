import {
  createFakeCopyGenerator,
  generatePlatformCopy,
  type CopyGenerator,
} from "./copy-generator";
import { createGeminiCopyGenerator } from "./gemini-client";
import { assertTransition } from "./states";
import type {
  ContenidoGeneradoRow,
  ContenidoRepository,
  MediaListoPayload,
  Plataforma,
} from "./types";

export type RunCopyGenerationInput = {
  testimonioId: string;
  plataforma: Plataforma;
  /** Story / testimonio text used for understand + draft. */
  sourceText: string;
  /** Form testimonial type when available. */
  typeHint?: string | null;
  /**
   * Optional FFmpeg path for context only.
   * When omitted, uses the path already stored on the row (if any).
   * This function MUST NOT clear or replace mediaAssetPath.
   */
  mediaAssetPath?: string | null;
};

export type RunCopyGenerationResult =
  | { ok: true; row: ContenidoGeneradoRow }
  | { ok: false; error: string };

export type TestimonyTextLookup = (
  testimonioId: string,
) => Promise<string> | string;

/**
 * Resolve default CopyGenerator: real Gemini when GEMINI_API_KEY is set.
 */
export function resolveCopyGenerator(): CopyGenerator {
  if (process.env.GEMINI_API_KEY?.trim()) {
    return createGeminiCopyGenerator();
  }
  return createFakeCopyGenerator();
}

/**
 * Sets draft_copy and transitions generando_copy → listo_revision.
 * Never mutates mediaAssetPath (FFmpeg-owned).
 */
export async function runCopyGeneration(
  input: RunCopyGenerationInput,
  deps: {
    repo: ContenidoRepository;
    generator?: CopyGenerator;
  },
): Promise<RunCopyGenerationResult> {
  const generator = deps.generator ?? resolveCopyGenerator();
  const rows = await deps.repo.listByTestimonio(input.testimonioId);
  const row = rows.find((r) => r.plataforma === input.plataforma);

  if (!row) {
    return {
      ok: false,
      error: "Contenido no encontrado para la plataforma.",
    };
  }

  try {
    assertTransition(row.status, "listo_revision");
  } catch {
    return {
      ok: false,
      error: `Estado no permite copy: ${row.status}.`,
    };
  }

  const mediaBefore = row.mediaAssetPath ?? null;
  const mediaForContext =
    input.mediaAssetPath !== undefined ? input.mediaAssetPath : mediaBefore;

  const { draftCopy } = await generatePlatformCopy(
    {
      plataforma: input.plataforma,
      sourceText: input.sourceText,
      mediaAssetPath: mediaForContext,
      typeHint: input.typeHint,
    },
    generator,
  );

  const withDraft = await deps.repo.saveDraftCopy(
    input.testimonioId,
    input.plataforma,
    draftCopy,
  );
  if (!withDraft) {
    return { ok: false, error: "No se pudo guardar draft_copy." };
  }

  // Invariant: copy must not clear/replace FFmpeg media path.
  if ((withDraft.mediaAssetPath ?? null) !== mediaBefore) {
    return {
      ok: false,
      error: "Invariante rota: mediaAssetPath mutado por copy.",
    };
  }

  const updated = await deps.repo.updateStatus(
    input.testimonioId,
    input.plataforma,
    "listo_revision",
  );
  if (!updated) {
    return { ok: false, error: "No se pudo actualizar a listo_revision." };
  }

  if ((updated.mediaAssetPath ?? null) !== mediaBefore) {
    return {
      ok: false,
      error: "Invariante rota: mediaAssetPath mutado al cambiar estado.",
    };
  }

  return { ok: true, row: updated };
}

/**
 * Default onCopyTrigger for media-listo: run copy after fan-in to generando_copy.
 * mediaAssetPath is already persisted by handleMediaListo (FFmpeg-owned).
 */
export function createMediaListoCopyTrigger(deps: {
  repo: ContenidoRepository;
  generator?: CopyGenerator;
  lookupSourceText: TestimonyTextLookup;
}): (payload: MediaListoPayload) => Promise<void> {
  return async (payload) => {
    const sourceText = await deps.lookupSourceText(payload.testimonioId);
    const result = await runCopyGeneration(
      {
        testimonioId: payload.testimonioId,
        plataforma: payload.plataforma,
        sourceText,
        mediaAssetPath: payload.mediaAssetPath,
      },
      { repo: deps.repo, generator: deps.generator },
    );

    if (!result.ok) {
      throw new Error(result.error);
    }
  };
}

/**
 * Run copy for all rows of a testimonio already in generando_copy (text-only path).
 */
export async function runCopyGenerationForTestimonio(
  input: {
    testimonioId: string;
    sourceText: string;
    plataformas?: Plataforma[];
    typeHint?: string | null;
  },
  deps: {
    repo: ContenidoRepository;
    generator?: CopyGenerator;
  },
): Promise<RunCopyGenerationResult[]> {
  const rows = await deps.repo.listByTestimonio(input.testimonioId);
  const targets = rows.filter((row) => {
    if (row.status !== "generando_copy") return false;
    if (input.plataformas && !input.plataformas.includes(row.plataforma)) {
      return false;
    }
    return true;
  });

  const results: RunCopyGenerationResult[] = [];
  for (const row of targets) {
    results.push(
      await runCopyGeneration(
        {
          testimonioId: input.testimonioId,
          plataforma: row.plataforma,
          sourceText: input.sourceText,
          mediaAssetPath: row.mediaAssetPath,
          typeHint: input.typeHint,
        },
        deps,
      ),
    );
  }
  return results;
}
