import { buttonVariants } from "@repo/ui/button";
import { cn } from "@repo/ui/utils";
import { StatusBadge } from "@shared/ui/patterns/StatusBadge";
import type { VisualTone } from "@shared/ui/patterns/visualTone";

import { bufferPublishesImmediately } from "../infrastructure/buffer";
import { formatSubmittedAt } from "../infrastructure/mappers/testimonialMapper";
import { igCardContent } from "../infrastructure/ig-card";
import { galleryTestimonialHref } from "../infrastructure/site";
import {
  formatNetworkList,
  SHARE_NETWORK_LABELS,
  SHARE_NETWORKS,
  type ShareChannels,
  type ShareNetwork,
} from "../types/share";
import type { AdminTestimonial } from "../types/testimonial";
import { IgShare } from "./IgShare";
import { ShareRetry } from "./ShareRetry";

type NetworkState = { label: string; tone: VisualTone; detail: string | null };

/**
 * Después de publicar: la misma card y el mismo texto salen por Discord (webhook) e
 * Instagram y LinkedIn (Buffer). Un solo reintento cubre las redes que falten.
 */
export function PublishedPanel({
  testimonial,
  channels,
  shareStatus,
  shareCardUrl,
}: {
  testimonial: AdminTestimonial;
  channels: ShareChannels;
  shareStatus: "ok" | "failed" | null;
  /** La card que se subió al publicar. Sin ella se redibuja con el diseño base. */
  shareCardUrl: string | null;
}) {
  if (testimonial.status !== "published") {
    return (
      <section className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4">
        <header className="flex flex-col gap-1">
          <h2 className="text-admin-heading font-semibold text-foreground">Rechazado</h2>
          <p className="text-admin-caption text-muted-foreground">
            No sale en la galería ni en las redes. El envío queda guardado arriba por si hace falta
            volver a verlo.
          </p>
        </header>
      </section>
    );
  }

  const postedAt: Record<ShareNetwork, string | null> = {
    discord: testimonial.discordPostedAt,
    instagram: testimonial.bufferInstagramPostedAt,
    linkedin: testimonial.bufferLinkedinPostedAt,
  };
  const missing = SHARE_NETWORKS.filter((network) => channels[network] && !postedAt[network]);
  const card = igCardContent(testimonial, testimonial.quote, "photo");

  function stateOf(network: ShareNetwork): NetworkState {
    const at = postedAt[network];
    if (at) {
      const scheduled = network !== "discord" && !bufferPublishesImmediately();
      return {
        label: scheduled ? "Programado" : "Publicado",
        tone: scheduled ? "info" : "success",
        detail: network === "discord" ? formatSubmittedAt(at) : `Buffer · ${formatSubmittedAt(at)}`,
      };
    }
    if (!channels[network]) {
      return { label: "Sin configurar", tone: "neutral", detail: "No se postea sola" };
    }
    return shareStatus === "failed"
      ? { label: "Falló", tone: "destructive", detail: null }
      : { label: "Pendiente", tone: "warning", detail: null };
  }

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <section
        aria-labelledby="admin-published-title"
        className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4"
      >
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <h2
              id="admin-published-title"
              className="text-admin-heading font-semibold text-foreground"
            >
              Publicado
              {testimonial.publishedAt ? ` · ${formatSubmittedAt(testimonial.publishedAt)}` : null}
            </h2>
            <p className="text-admin-caption text-muted-foreground">
              Ya está en la galería. La misma imagen y el mismo texto salen en todas las redes.
            </p>
          </div>
          <a
            href={galleryTestimonialHref(testimonial.slug)}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Ver ficha pública
          </a>
        </header>

        <ul aria-label="Estado por red" className="divide-y divide-border rounded-lg border border-border">
          {SHARE_NETWORKS.map((network) => {
            const state = stateOf(network);
            return (
              <li key={network} className="flex items-center justify-between gap-3 px-3 py-2.5">
                <span className="flex min-w-0 flex-col">
                  <span className="text-admin-body font-medium text-foreground">
                    {SHARE_NETWORK_LABELS[network]}
                  </span>
                  {state.detail ? (
                    <span className="text-admin-caption text-muted-foreground">{state.detail}</span>
                  ) : null}
                </span>
                <StatusBadge tone={state.tone}>{state.label}</StatusBadge>
              </li>
            );
          })}
        </ul>

        {missing.length > 0 ? (
          <div
            className={cn(
              "flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3",
              shareStatus === "failed"
                ? "border-destructive/40 bg-destructive/10"
                : "border-border bg-muted",
            )}
          >
            <p
              className={`text-admin-caption ${shareStatus === "failed" ? "text-destructive" : "text-muted-foreground"}`}
              role={shareStatus === "failed" ? "alert" : undefined}
            >
              {shareStatus === "failed"
                ? `Quedó publicado, pero no salió en ${formatNetworkList(missing)}.`
                : `Todavía no salió en ${formatNetworkList(missing)}.`}
            </p>
            <ShareRetry
              id={testimonial.id}
              card={shareCardUrl ? null : card}
              label={`Reintentar ${formatNetworkList(missing)}`}
            />
          </div>
        ) : null}
      </section>

      <section
        aria-labelledby="admin-post-title"
        className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4"
      >
        <header className="flex flex-col gap-1">
          <h2 id="admin-post-title" className="text-admin-heading font-semibold text-foreground">
            Publicación
          </h2>
          <p className="text-admin-caption text-muted-foreground">
            {shareCardUrl
              ? "La imagen que salió en las redes. Si hay que subirla a mano, descargala y copiá el texto."
              : "No quedó guardada la imagen publicada: se muestra con el diseño base. Si hay que subirla a mano, descargala y copiá el texto."}
          </p>
        </header>
        <IgShare
          mode="share"
          slug={testimonial.slug}
          caption={testimonial.caption}
          imageUrl={shareCardUrl}
          {...card}
        />
      </section>
    </div>
  );
}
