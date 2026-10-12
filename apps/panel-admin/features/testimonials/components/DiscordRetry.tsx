import { buttonVariants } from "@repo/ui/button";
import { cn } from "@repo/ui/utils";

import { retryCommunityDiscord } from "../actions/testimonialActions";
import { formatSubmittedAt } from "../infrastructure/mappers/testimonialMapper";

/** Estado del post al canal de comunidad, con reintento si falló. */
export function DiscordRetry({
  id,
  discordPostedAt,
  discordStatus,
  canRetry,
}: {
  id: string;
  discordPostedAt: string | null;
  discordStatus: "ok" | "failed" | null;
  canRetry: boolean;
}) {
  if (discordPostedAt) {
    return (
      <p className="text-admin-caption text-tone-success" role="status">
        Posteado en Discord el {formatSubmittedAt(discordPostedAt)}.
      </p>
    );
  }

  if (discordStatus === "ok") {
    return (
      <p className="text-admin-caption text-tone-success" role="status">
        Posteado en Discord.
      </p>
    );
  }

  if (!canRetry) {
    return (
      <p className="text-admin-caption text-muted-foreground">
        Discord no está configurado; no se postea automáticamente.
      </p>
    );
  }

  const retry = retryCommunityDiscord.bind(null, id);

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3">
      <p className="text-admin-caption text-destructive" role="alert">
        {discordStatus === "failed"
          ? "Quedó publicado, pero el post a Discord falló."
          : "Todavía no está en el canal de comunidad."}
      </p>
      <form action={retry}>
        <button type="submit" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
          Reintentar Discord
        </button>
      </form>
    </div>
  );
}
