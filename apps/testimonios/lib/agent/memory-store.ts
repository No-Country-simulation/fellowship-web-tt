import type {
  ContenidoGeneradoRow,
  ContenidoRepository,
  ContenidoStatus,
  Plataforma,
} from "./types";

/**
 * Shared in-memory ContenidoRepository for agent API routes until Supabase wiring.
 * TODO(supabase): replace with Postgres-backed repository (service role / RLS).
 */
const rowsByTestimonio = new Map<string, ContenidoGeneradoRow[]>();

/** Optional hasMedia flags keyed by testimonioId (default false = text-only). */
const hasMediaByTestimonio = new Map<string, boolean>();

let idSeq = 0;

/** Optional story text keyed by testimonioId (text-only /enviar until Supabase). */
const storyByTestimonio = new Map<string, string>();

export const memoryContenidoRepo: ContenidoRepository = {
  async createRows(plans) {
    const created = plans.map((plan) => ({
      ...plan,
      id: `mem-agent-${++idSeq}`,
      draftCopy: plan.draftCopy ?? null,
      mediaAssetPath: plan.mediaAssetPath ?? null,
    }));
    for (const row of created) {
      const list = rowsByTestimonio.get(row.testimonioId) ?? [];
      list.push(row);
      rowsByTestimonio.set(row.testimonioId, list);
    }
    return created;
  },
  async listByTestimonio(testimonioId) {
    return [...(rowsByTestimonio.get(testimonioId) ?? [])].map((r) => ({
      ...r,
    }));
  },
  async updateStatus(testimonioId, plataforma, status) {
    const list = rowsByTestimonio.get(testimonioId) ?? [];
    const row = list.find((r) => r.plataforma === plataforma);
    if (!row) return null;
    row.status = status;
    return { ...row };
  },
  async saveDraftCopy(testimonioId, plataforma, draftCopy) {
    const list = rowsByTestimonio.get(testimonioId) ?? [];
    const row = list.find((r) => r.plataforma === plataforma);
    if (!row) return null;
    row.draftCopy = draftCopy;
    return { ...row };
  },
  async saveMediaAssetPath(testimonioId, plataforma, mediaAssetPath) {
    const list = rowsByTestimonio.get(testimonioId) ?? [];
    const row = list.find((r) => r.plataforma === plataforma);
    if (!row) return null;
    row.mediaAssetPath = mediaAssetPath;
    return { ...row };
  },
};

/** Resolve whether a testimonio has media (Storage lookup TBD). */
export function resolveHasMedia(testimonioId: string): boolean {
  return hasMediaByTestimonio.get(testimonioId) ?? false;
}

/** Test/dev helper to seed hasMedia before Supabase. */
export function setHasMedia(testimonioId: string, hasMedia: boolean): void {
  hasMediaByTestimonio.set(testimonioId, hasMedia);
}

/** Test/dev helper: seed testimonio story text for copy generation. */
export function setStoryText(testimonioId: string, story: string): void {
  storyByTestimonio.set(testimonioId, story);
}

export function lookupStoryText(testimonioId: string): string {
  return storyByTestimonio.get(testimonioId) ?? "";
}

/** Test helper: seed a row status without going through createRows. */
export function seedMemoryRow(row: ContenidoGeneradoRow): void {
  const list = rowsByTestimonio.get(row.testimonioId) ?? [];
  const idx = list.findIndex((r) => r.plataforma === row.plataforma);
  if (idx >= 0) {
    list[idx] = { ...row };
  } else {
    list.push({ ...row });
  }
  rowsByTestimonio.set(row.testimonioId, list);
}

export function resetMemoryStore(): void {
  rowsByTestimonio.clear();
  hasMediaByTestimonio.clear();
  storyByTestimonio.clear();
  idSeq = 0;
}

export type { ContenidoStatus, Plataforma };
