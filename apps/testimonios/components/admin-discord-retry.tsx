import { buttonVariants } from "@repo/ui/button";

import { retryCommunityDiscord } from "@/lib/testimonials/admin-actions";
import { formatSubmittedAt } from "@/lib/testimonials/admin-view";
import { cn } from "@/lib/utils";

type AdminDiscordRetryProps = {
  id: string;
  discordPostedAt: string | null;
  discordStatus: "ok" | "failed" | null;
  /** Hay webhook configurado y todavía no se posteó. */
  canRetry: boolean;
};

/** Estado del post al canal de comunidad, con reintento si falló. */
export function AdminDiscordRetry({
  id,
  discordPostedAt,
  discordStatus,
  canRetry,
}: AdminDiscordRetryProps) {
  if (discordPostedAt) {
    return (
      <p className="text-body-small text-accent-mint" role="status">
        Posteado en Discord el {formatSubmittedAt(discordPostedAt)}.
      </p>
    );
  }

  if (discordStatus === "ok") {
    return (
      <p className="text-body-small text-accent-mint" role="status">
        Posteado en Discord.
      </p>
    );
  }

  if (!canRetry) {
    return (
      <p className="text-body-small text-text-muted">
        Discord no está configurado; no se postea automáticamente.
      </p>
    );
  }

  const retry = retryCommunityDiscord.bind(null, id);

  return (
    <div className="flex flex-wrap items-center justify-between gap-sm rounded-md border border-destructive/40 bg-destructive/10 p-sm">
      <p className="text-body-small text-destructive" role="alert">
        {discordStatus === "failed"
          ? "Quedó publicado, pero el post a Discord falló."
          : "Todavía no está en el canal de comunidad."}
      </p>
      <form action={retry}>
        <button
          type="submit"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Reintentar Discord
        </button>
      </form>
    </div>
  );
}
