export type Plataforma = "instagram" | "linkedin";

export type ContenidoStatus =
  | "pendiente"
  | "procesando_media"
  | "generando_copy"
  | "listo_revision"
  | "aprobado"
  | "rechazado"
  | "publicado"
  | "error";

export type ContenidoGeneradoRow = {
  id: string;
  testimonioId: string;
  plataforma: Plataforma;
  status: ContenidoStatus;
  /** Per-platform draft text from Gemini (text only). */
  draftCopy?: string | null;
  /** FFmpeg-owned Storage path; copy generation MUST NOT mutate this. */
  mediaAssetPath?: string | null;
};

export type ContenidoRowPlan = Omit<ContenidoGeneradoRow, "id">;

export type ContenidoRepository = {
  createRows: (plans: ContenidoRowPlan[]) => Promise<ContenidoGeneradoRow[]>;
  listByTestimonio: (testimonioId: string) => Promise<ContenidoGeneradoRow[]>;
  updateStatus: (
    testimonioId: string,
    plataforma: Plataforma,
    status: ContenidoStatus,
  ) => Promise<ContenidoGeneradoRow | null>;
  /** Persist draft copy without clearing mediaAssetPath. */
  saveDraftCopy: (
    testimonioId: string,
    plataforma: Plataforma,
    draftCopy: string,
  ) => Promise<ContenidoGeneradoRow | null>;
  /** Set FFmpeg media path (media-listo only; never cleared by copy). */
  saveMediaAssetPath: (
    testimonioId: string,
    plataforma: Plataforma,
    mediaAssetPath: string,
  ) => Promise<ContenidoGeneradoRow | null>;
};

/** Idempotency store for media-listo jobIds (in-memory for tests). */
export type MediaJobStore = {
  isProcessed: (jobId: string) => Promise<boolean>;
  markProcessed: (jobId: string) => Promise<void>;
};

export type MediaListoPayload = {
  jobId: string;
  testimonioId: string;
  plataforma: Plataforma;
  mediaAssetPath: string;
};

export type MediaListoResult = {
  status: number;
  body: { ok: boolean; error?: string; duplicate?: boolean };
};

export type MediaEnqueue = {
  enqueueMediaJob: (
    testimonioId: string,
    plataforma: Plataforma,
  ) => Promise<void> | void;
};

export type StartProcessingInput = {
  testimonioId: string;
  plataformas: Plataforma[];
  hasMedia: boolean;
};

export type StartProcessingResult =
  | { ok: true; rows: ContenidoGeneradoRow[] }
  | { ok: false; error: string };

export type PublishResult =
  | { ok: true; published: ContenidoGeneradoRow[] }
  | { ok: false; error: string };
