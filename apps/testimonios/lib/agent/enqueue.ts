import type { Plataforma } from "./types";

/**
 * Port for enqueueing FFmpeg media jobs.
 * Real queue wiring lands in later work units; this stub is injectable for tests.
 */
export async function enqueueMediaJob(
  testimonioId: string,
  plataforma: Plataforma,
): Promise<void> {
  void testimonioId;
  void plataforma;
  // Stub: worker consumer + queue backend arrive in Phase 3+.
}
