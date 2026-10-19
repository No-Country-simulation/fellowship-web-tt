import { cn } from "@repo/ui/utils";

import { SHARE_NETWORK_LABELS, SHARE_NETWORKS, type ShareChannels } from "../types/share";

/** Redes a las que sale la publicación. Las que no tienen credenciales quedan apagadas. */
export function ShareTargets({ channels }: { channels: ShareChannels }) {
  return (
    <ul aria-label="Se publica en" className="flex flex-wrap gap-1.5">
      {SHARE_NETWORKS.map((network) => {
        const on = channels[network];
        return (
          <li
            key={network}
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-admin-caption ${
              on ? "border-primary/40 bg-muted text-foreground" : "border-dashed border-border text-muted-foreground"
            }`}
          >
            <span
              aria-hidden
              className={cn("size-1.5 rounded-full", on ? "bg-tone-success" : "bg-muted-foreground/50")}
            />
            {SHARE_NETWORK_LABELS[network]}
            {on ? null : <span className="text-admin-micro">· sin configurar</span>}
          </li>
        );
      })}
    </ul>
  );
}
