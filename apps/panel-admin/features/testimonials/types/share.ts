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

/** Id del post en Buffer por red. `null` si no se creó. */
export type BufferPostIds = Record<"instagram" | "linkedin", string | null>;

export type ShareReport = {
  result: ShareResult;
  bufferPostIds: BufferPostIds;
};

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

/** Tope del PNG de la card, en el cliente y en el server action. */
export const SHARE_CARD_MAX_BYTES = 8 * 1024 * 1024;

/** "Discord, Instagram y LinkedIn". */
export function formatNetworkList(networks: readonly ShareNetwork[]): string {
  const labels = networks.map((network) => SHARE_NETWORK_LABELS[network]);
  if (labels.length < 2) {
    return labels[0] ?? "";
  }
  return `${labels.slice(0, -1).join(", ")} y ${labels.at(-1)}`;
}
