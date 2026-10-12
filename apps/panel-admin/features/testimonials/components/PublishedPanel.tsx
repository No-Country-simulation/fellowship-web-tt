import { buttonVariants } from "@repo/ui/button";

import { bufferPublishesImmediately } from "../lib/buffer";
import { formatSubmittedAt, type AdminTestimonial } from "../lib/view";
import { igCardContent } from "../lib/ig-card";
import { publicTestimonialHref } from "../lib/site";
import { BufferRetry } from "./BufferRetry";
import { DiscordPublishPreview } from "./DiscordPublishPreview";
import { DiscordRetry } from "./DiscordRetry";
import { IgShare } from "./IgShare";
import { LinkedInPublishPreview } from "./LinkedInPublishPreview";
import { ShareTabs } from "./ShareTabs";

/**
 * Después de publicar: Discord por webhook; Instagram y LinkedIn por Buffer.
 * Las tabs sirven para revisar o copiar si hay que reintentar a mano.
 */
export function PublishedPanel({
  testimonial,
  discordStatus,
  bufferStatus,
  canRetryDiscord,
  canRetryInstagram,
  canRetryLinkedin,
}: {
  testimonial: AdminTestimonial;
  discordStatus: "ok" | "failed" | null;
  bufferStatus: "ok" | "failed" | null;
  canRetryDiscord: boolean;
  canRetryInstagram: boolean;
  canRetryLinkedin: boolean;
}) {
  if (testimonial.status !== "published") {
    return (
      <section className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4">
        <header className="flex flex-col gap-1">
          <h2 className="text-admin-heading font-semibold text-foreground">Rechazado</h2>
          <p className="text-admin-caption text-muted-foreground">
            No sale en la galería ni en Discord. El envío queda guardado arriba por si hace falta
            volver a verlo.
          </p>
        </header>
      </section>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <section aria-labelledby="admin-published-title" className="flex flex-col gap-2">
        <header className="flex flex-col gap-1">
          <h2 id="admin-published-title" className="text-admin-heading font-semibold text-foreground">
            Publicado
            {testimonial.publishedAt ? ` · ${formatSubmittedAt(testimonial.publishedAt)}` : null}
          </h2>
          <p className="text-admin-caption text-muted-foreground">
            Ya está en la galería. Discord, Instagram y LinkedIn se envían al publicar.
            {bufferPublishesImmediately()
              ? " Buffer publica al momento."
              : " Buffer programa el post para dentro de 24 horas."}{" "}
            Si falla, reintentá abajo o copiá el post desde las tabs.
          </p>
        </header>

        <DiscordRetry
          id={testimonial.id}
          discordPostedAt={testimonial.discordPostedAt}
          discordStatus={discordStatus}
          canRetry={canRetryDiscord}
        />
        <BufferRetry
          id={testimonial.id}
          instagramPostedAt={testimonial.bufferInstagramPostedAt}
          linkedinPostedAt={testimonial.bufferLinkedinPostedAt}
          bufferStatus={bufferStatus}
          canRetryInstagram={canRetryInstagram}
          canRetryLinkedin={canRetryLinkedin}
          igCard={igCardContent(testimonial, testimonial.quote)}
        />
      </section>

      <ShareTabs
        discord={<DiscordPublishPreview testimonial={testimonial} quote={testimonial.quote} />}
        instagram={
          <IgShare
            mode="share"
            slug={testimonial.slug}
            caption={testimonial.igCaption}
            {...igCardContent(testimonial, testimonial.quote)}
          />
        }
        linkedin={
          <LinkedInPublishPreview testimonial={testimonial} caption={testimonial.liCaption} showCopy />
        }
      />

      <div className="flex flex-wrap gap-2">
        <a
          href={publicTestimonialHref(testimonial.slug)}
          className={buttonVariants({ variant: "outline", size: "lg" })}
        >
          Ver ficha pública
        </a>
      </div>
    </div>
  );
}
