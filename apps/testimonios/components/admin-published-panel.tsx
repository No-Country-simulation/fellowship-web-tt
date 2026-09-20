import Link from "next/link";
import { buttonVariants } from "@repo/ui/button";

import { AdminDiscordRetry } from "@/components/admin-discord-retry";
import { AdminIgShare } from "@/components/admin-ig-share";
import { AdminShareTabs } from "@/components/admin-share-tabs";
import { DiscordPublishPreview } from "@/components/discord-publish-preview";
import { LinkedInPublishPreview } from "@/components/linkedin-publish-preview";
import { adminContextLine, formatSubmittedAt } from "@/lib/testimonials/admin-view";
import type { AdminTestimonial } from "@/lib/testimonials/admin-view";

type AdminPublishedPanelProps = {
  testimonial: AdminTestimonial;
  discordStatus: "ok" | "failed" | null;
  canRetryDiscord: boolean;
};

/**
 * Después de publicar: Discord, Instagram y LinkedIn en tabs.
 */
export function AdminPublishedPanel({
  testimonial,
  discordStatus,
  canRetryDiscord,
}: AdminPublishedPanelProps) {
  if (testimonial.status !== "published") {
    return (
      <section className="flex flex-col gap-md rounded-md border border-border bg-card p-md">
        <header className="flex flex-col gap-xs">
          <h2 className="text-overline text-text-secondary">Rechazado</h2>
          <p className="text-body-small text-text-secondary">
            No sale en la galería ni en Discord. El envío queda guardado arriba
            por si hace falta volver a verlo.
          </p>
        </header>
      </section>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-lg">
      <section
        aria-labelledby="admin-published-title"
        className="flex flex-col gap-sm"
      >
        <header className="flex flex-col gap-xs">
          <h2
            id="admin-published-title"
            className="text-overline text-text-secondary"
          >
            Publicado
            {testimonial.publishedAt
              ? ` · ${formatSubmittedAt(testimonial.publishedAt)}`
              : null}
          </h2>
          <p className="text-body-small text-text-secondary">
            Ya está en la galería. Instagram: descargá la imagen (1080×1080) y
            copiá el caption. LinkedIn: copiá el texto (sin PNG).
          </p>
        </header>

        <AdminDiscordRetry
          id={testimonial.id}
          discordPostedAt={testimonial.discordPostedAt}
          discordStatus={discordStatus}
          canRetry={canRetryDiscord}
        />
      </section>

      <AdminShareTabs
        discord={
          <DiscordPublishPreview
            testimonial={testimonial}
            quote={testimonial.quote}
            hideLabel
          />
        }
        instagram={
          <AdminIgShare
            mode="share"
            slug={testimonial.slug}
            quote={testimonial.quote}
            caption={testimonial.igCaption}
            fullName={testimonial.fullName}
            avatarUrl={testimonial.avatarUrl}
            instagram={testimonial.instagram}
            typeLabel={testimonial.typeLabel}
            contextLine={adminContextLine(testimonial)}
          />
        }
        linkedin={
          <LinkedInPublishPreview
            testimonial={testimonial}
            caption={testimonial.liCaption}
            showCopy
          />
        }
      />

      <div className="flex flex-wrap gap-sm">
        <Link
          href={`/t/${testimonial.slug}`}
          className={buttonVariants({ variant: "outline", size: "lg" })}
        >
          Ver ficha pública
        </Link>
      </div>
    </div>
  );
}
