import { buttonVariants } from "@repo/ui/button";
import { cn } from "@repo/ui/utils";
import { StatusBadge } from "@shared/ui/patterns/StatusBadge";
import type { VisualTone } from "@shared/ui/patterns/visualTone";

import { formatSubmittedAt } from "../infrastructure/mappers/testimonialMapper";
import { igCardContent } from "../infrastructure/ig-card";
import {
  formatNetworkList,
  SHARE_NETWORK_LABELS,
  SHARE_NETWORKS,
  type BufferPostState,
  type BufferPostStates,
  type ShareChannels,
  type ShareNetwork,
} from "../types/share";
import type { AdminTestimonial } from "../types/testimonial";
import { IgShare } from "./IgShare";
import { ShareRetry } from "./ShareRetry";

type NetworkState = {
  label: string;
  tone: VisualTone;
  detail: string | null;
  postUrl?: string | null;
};

/**
 * Después de publicar: la misma card sale por Discord, Instagram y LinkedIn.
 * Cada red tiene su texto. Discord no lleva mención ni hashtags; la cita queda en la imagen.
 * El tab de cada texto muestra si esa red salió o falló.
 * Un solo reintento cubre las redes sin fecha y las de Buffer cuyo estado es error.
 */
export function PublishedPanel({
  testimonial,
  channels,
  shareStatus,
  shareCardUrl,
  bufferStates,
  publicHref,
  scheduled,
}: {
  testimonial: AdminTestimonial;
  channels: ShareChannels;
  shareStatus: "ok" | "failed" | null;
  /** La card que se subió al publicar. Sin ella se redibuja con el diseño base. */
  shareCardUrl: string | null;
  /** Estado consultado a Buffer al cargar la ficha. Sin él se usa la hora guardada. */
  bufferStates: BufferPostStates | null;
  /** Ficha en la galería. Null si no hay `GALLERY_URL`. */
  publicHref: string | null;
  /** Buffer programa el post en vez de publicarlo ya. */
  scheduled: boolean;
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
  const missing = SHARE_NETWORKS.filter((network) => {
    if (!channels[network]) {
      return false;
    }
    if (!postedAt[network]) {
      return true;
    }
    return network !== "discord" && bufferStates?.[network]?.status === "error";
  });
  const card = igCardContent(testimonial, testimonial.quote, "photo");

  function stateOf(network: ShareNetwork): NetworkState {
    const live = network === "discord" ? null : bufferStates?.[network];
    if (live) {
      return bufferState(live);
    }

    const at = postedAt[network];
    if (at) {
      const waiting = network !== "discord" && scheduled;
      return {
        label: waiting ? "Programado" : "Publicado",
        tone: waiting ? "info" : "success",
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

  const networkStates = {
    discord: stateOf("discord"),
    instagram: stateOf("instagram"),
    linkedin: stateOf("linkedin"),
  };

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
              Ya está en la galería. La misma imagen sale en todas las redes. Cada red tiene su
              texto. Discord no lleva mención ni hashtags; la cita queda en la imagen.
            </p>
          </div>
          {publicHref ? (
            <a
              href={publicHref}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Ver ficha pública
            </a>
          ) : null}
        </header>

        {shareStatus === "ok" ? (
          <p
            className="rounded-lg border border-tone-success/40 bg-tone-success/10 px-3 py-2 text-admin-caption text-tone-success"
            role="status"
          >
            Salió en las redes.
          </p>
        ) : null}

        <ul aria-label="Estado por red" className="divide-y divide-border rounded-lg border border-border">
          {SHARE_NETWORKS.map((network) => {
            const state = networkStates[network];
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
                <span className="flex shrink-0 items-center gap-2">
                  {state.postUrl ? (
                    <a
                      href={state.postUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={buttonVariants({ variant: "outline", size: "xs" })}
                    >
                      Ver post
                    </a>
                  ) : null}
                  <StatusBadge tone={state.tone}>{state.label}</StatusBadge>
                </span>
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
              className={cn(
                "text-admin-caption",
                shareStatus === "failed" ? "text-destructive" : "text-muted-foreground",
              )}
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
              ? "La imagen que salió en las redes. Si hay que subirla a mano, descargala y copiá la descripción de la red activa."
              : "No quedó guardada la imagen publicada: se muestra con el diseño base. Si hay que subirla a mano, descargala y copiá la descripción de la red activa."}
          </p>
        </header>
        <IgShare
          mode="share"
          testimonialId={testimonial.id}
          tabNotes={{
            discord: { text: networkStates.discord.label, tone: networkStates.discord.tone },
            instagram: { text: networkStates.instagram.label, tone: networkStates.instagram.tone },
            linkedin: { text: networkStates.linkedin.label, tone: networkStates.linkedin.tone },
          }}
          slug={testimonial.slug}
          igCaption={testimonial.igCaption}
          liCaption={testimonial.liCaption}
          discordCaption={testimonial.discordCaption}
          imageUrl={shareCardUrl}
          {...card}
        />
      </section>
    </div>
  );
}

function bufferState(post: BufferPostState): NetworkState {
  const buffer = (iso: string | null) => (iso ? `Buffer · ${formatSubmittedAt(iso)}` : "Buffer");

  switch (post.status) {
    case "scheduled":
    case "needs_approval":
      return { label: "Programado", tone: "info", detail: buffer(post.dueAt) };
    case "sending":
      return { label: "Enviando", tone: "info", detail: "Buffer" };
    case "sent":
      return {
        label: "Publicado",
        tone: "success",
        detail: buffer(post.sentAt),
        postUrl: post.externalLink,
      };
    case "error":
      return {
        label: "Falló",
        tone: "destructive",
        detail: post.errorMessage ? `Buffer · ${post.errorMessage}` : "Buffer",
      };
    case "draft":
      return { label: "Borrador", tone: "neutral", detail: "Buffer" };
  }
}
