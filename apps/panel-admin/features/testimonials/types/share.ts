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

/** "Discord, Instagram y LinkedIn". */
export function formatNetworkList(networks: readonly ShareNetwork[]): string {
  const labels = networks.map((network) => SHARE_NETWORK_LABELS[network]);
  if (labels.length < 2) {
    return labels[0] ?? "";
  }
  return `${labels.slice(0, -1).join(", ")} y ${labels.at(-1)}`;
}
