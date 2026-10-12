import { ChevronDown } from "lucide-react";

import type { AdminTestimonial } from "../types/testimonial";
import { YoutubeEmbed } from "./YoutubeEmbed";

/** Lo que mandó el talento: historia, media y datos. Va en un desplegable. */
export function Submission({ testimonial }: { testimonial: AdminTestimonial }) {
  const hasMedia = Boolean(
    testimonial.captureUrl || testimonial.youtubeEmbedUrl || testimonial.videoUrl,
  );

  return (
    <details className="group min-w-0 rounded-lg border border-border bg-card">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 [&::-webkit-details-marker]:hidden">
        <span id="admin-submission-title" className="text-admin-micro uppercase tracking-wide text-muted-foreground">
          Envío original
        </span>
        <ChevronDown
          aria-hidden
          className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
        />
      </summary>

      <div className="flex flex-col gap-4 border-t border-border px-4 py-4">
        <figure>
          <figcaption className="text-admin-caption font-medium text-foreground">Foto</figcaption>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={testimonial.avatarUrl}
            alt={`Foto de ${testimonial.fullName}`}
            className="mt-1 size-24 rounded-full border border-border object-cover"
          />
        </figure>

        <div>
          <h3 className="text-admin-caption font-medium text-foreground">Historia</h3>
          <p className="mt-1 whitespace-pre-wrap break-words text-admin-body text-foreground">
            {testimonial.story}
          </p>
        </div>

        {hasMedia ? (
          <div className="flex flex-col gap-3">
            {testimonial.captureUrl ? (
              <figure>
                <figcaption className="text-admin-caption font-medium text-foreground">
                  Captura del proyecto
                </figcaption>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={testimonial.captureUrl}
                  alt="Captura del proyecto"
                  className="mt-1 max-h-72 w-auto max-w-full rounded-lg border border-border object-contain"
                />
              </figure>
            ) : null}

            {testimonial.youtubeEmbedUrl ? (
              <div>
                <p className="text-admin-caption font-medium text-foreground">Video</p>
                <div className="mt-1">
                  <YoutubeEmbed
                    src={testimonial.youtubeEmbedUrl}
                    title={`Video de ${testimonial.fullName}`}
                  />
                </div>
              </div>
            ) : testimonial.videoUrl ? (
              <div>
                <p className="text-admin-caption font-medium text-foreground">Video</p>
                <a
                  href={testimonial.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 block break-all text-admin-body text-primary underline-offset-4 hover:underline"
                >
                  {testimonial.videoUrl}
                </a>
              </div>
            ) : null}
          </div>
        ) : null}

        <dl className="grid gap-3 border-t border-border pt-4 sm:grid-cols-2">
          <Fact label="País" value={testimonial.country ?? "No indicó país"} muted={!testimonial.country} />
          <Fact label="Email" value={testimonial.email} />
          <Fact
            label="Instagram"
            value={testimonial.instagram ?? "No dejó Instagram"}
            muted={!testimonial.instagram}
          />
          <Fact
            label="LinkedIn"
            value={testimonial.linkedin ?? "No dejó LinkedIn"}
            muted={!testimonial.linkedin}
          />
          {testimonial.simulation?.primary_role ? (
            <Fact label="Puesto principal" value={testimonial.simulation.primary_role} />
          ) : null}
          {testimonial.firstJob ? (
            <>
              <Fact label="Empresa" value={testimonial.firstJob.company} />
              <Fact label="Puesto" value={testimonial.firstJob.role_achieved} />
            </>
          ) : null}
          {testimonial.careerChange ? (
            <>
              <Fact label="Oficio anterior" value={testimonial.careerChange.previous_profession} />
              <Fact label="Rol nuevo" value={testimonial.careerChange.new_role} />
            </>
          ) : null}
        </dl>
      </div>
    </details>
  );
}

function Fact({
  label,
  value,
  muted = false,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-admin-micro uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd
        className={
          muted
            ? "mt-1 break-words text-admin-caption text-muted-foreground"
            : "mt-1 break-words text-admin-caption text-foreground"
        }
      >
        {value}
      </dd>
    </div>
  );
}
