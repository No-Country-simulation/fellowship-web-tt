import Link from "next/link";
import { buttonVariants } from "@repo/ui/button";

import { AdminBufferRetry } from "@/components/admin-buffer-retry";
import { AdminDiscordRetry } from "@/components/admin-discord-retry";
import { AdminIgShare } from "@/components/admin-ig-share";
import { AdminShareTabs } from "@/components/admin-share-tabs";
import { DiscordPublishPreview } from "@/components/discord-publish-preview";
import { LinkedInPublishPreview } from "@/components/linkedin-publish-preview";
import { bufferPublishesImmediately } from "@/lib/buffer";
import { formatSubmittedAt } from "@/lib/testimonials/admin-view";
import { igCardContent } from "@/lib/testimonials/ig-card";
import type { AdminTestimonial } from "@/lib/testimonials/admin-view";

type AdminPublishedPanelProps = {
  testimonial: AdminTestimonial;
  discordStatus: "ok" | "failed" | null;
  bufferStatus: "ok" | "failed" | null;
  canRetryDiscord: boolean;
  canRetryInstagram: boolean;
  canRetryLinkedin: boolean;
};

/**
 * Después de publicar: Discord por webhook; Instagram y LinkedIn por Buffer.
 * Las tabs sirven para revisar o copiar si hay que reintentar a mano.
 */
export function AdminPublishedPanel({
  testimonial,
  discordStatus,
  bufferStatus,
  canRetryDiscord,
  canRetryInstagram,
  canRetryLinkedin,
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
            Ya está en la galería. Discord, Instagram y LinkedIn se envían al
            publicar.
            {bufferPublishesImmediately()
              ? " Buffer publica al momento."
              : " Buffer programa el post para dentro de 24 horas."}{" "}
            Si falla, reintentá abajo o copiá el post desde las tabs.
          </p>
        </header>

        <AdminDiscordRetry
          id={testimonial.id}
          discordPostedAt={testimonial.discordPostedAt}
          discordStatus={discordStatus}
          canRetry={canRetryDiscord}
        />
        <AdminBufferRetry
          id={testimonial.id}
          instagramPostedAt={testimonial.bufferInstagramPostedAt}
          linkedinPostedAt={testimonial.bufferLinkedinPostedAt}
          bufferStatus={bufferStatus}
          canRetryInstagram={canRetryInstagram}
          canRetryLinkedin={canRetryLinkedin}
          igCard={igCardContent(testimonial, testimonial.quote)}
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
            caption={testimonial.igCaption}
            {...igCardContent(testimonial, testimonial.quote)}
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
