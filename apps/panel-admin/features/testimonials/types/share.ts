export const SHARE_NETWORKS = ["discord", "instagram", "linkedin"] as const;

export type ShareNetwork = (typeof SHARE_NETWORKS)[number];

export const SHARE_NETWORK_LABELS: Record<ShareNetwork, string> = {
  discord: "Discord",
  instagram: "Instagram",
  linkedin: "LinkedIn",
};

/** Qué redes tienen credenciales en el entorno. */
export type ShareChannels = Record<ShareNetwork, boolean>;

export type ShareOutcome = "posted" | "skipped" | "failed";

export type ShareResult = Record<ShareNetwork, ShareOutcome>;

export type BufferPostStatus =
  | "draft"
  | "error"
  | "needs_approval"
  | "scheduled"
  | "sending"
  | "sent";

/** Lo que Buffer dice hoy del post. `externalLink` solo viene si es https. */
export type BufferPostState = {
  status: BufferPostStatus;
  dueAt: string | null;
  sentAt: string | null;
  externalLink: string | null;
  errorMessage: string | null;
};

/** `null` por red si no hay id guardado o Buffer no respondió. */
export type BufferPostStates = Record<"instagram" | "linkedin", BufferPostState | null>;

/** Tope del PNG de la card. El bucket `share-cards` corta en este tamaño. */
export const SHARE_CARD_MAX_BYTES = 5 * 1024 * 1024;

/** Cuando el PNG supera `SHARE_CARD_MAX_BYTES`. */
export const SHARE_CARD_TOO_LARGE_MESSAGE = "La imagen pasa el tope de 5 MB.";

/** Mismo tope, en publicar: el envío sigue en revisión. */
export const SHARE_CARD_TOO_LARGE_PUBLISH_MESSAGE = `${SHARE_CARD_TOO_LARGE_MESSAGE} El testimonio no se publicó.`;

/** "Discord, Instagram y LinkedIn". */
export function formatNetworkList(networks: readonly ShareNetwork[]): string {
  const labels = networks.map((network) => SHARE_NETWORK_LABELS[network]);
  if (labels.length < 2) {
    return labels[0] ?? "";
  }
  return `${labels.slice(0, -1).join(", ")} y ${labels.at(-1)}`;
}
