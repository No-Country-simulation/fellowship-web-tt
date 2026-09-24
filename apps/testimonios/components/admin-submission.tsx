import { ChevronDown } from "lucide-react";

import { YoutubeEmbed } from "@/components/youtube-embed";
import type { AdminTestimonial } from "@/lib/testimonials/admin-view";

type AdminSubmissionProps = {
  testimonial: AdminTestimonial;
};

/** Lo que mandó el talento: historia, media y datos. Va en un desplegable. */
export function AdminSubmission({ testimonial }: AdminSubmissionProps) {
  const hasMedia = Boolean(
    testimonial.captureUrl || testimonial.youtubeEmbedUrl || testimonial.videoUrl,
  );

  return (
    <details className="group min-w-0 rounded-md border border-border bg-card">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-sm px-md py-sm [&::-webkit-details-marker]:hidden">
        <span
          id="admin-submission-title"
          className="text-overline text-text-secondary"
        >
          Envío original
        </span>
        <ChevronDown
          aria-hidden
          className="size-5 shrink-0 text-text-muted transition-transform group-open:rotate-180"
        />
      </summary>

      <div className="flex flex-col gap-md border-t border-border px-md py-md">
      <figure>
        <figcaption className="text-body-small font-medium text-text-primary">
          Foto
        </figcaption>
        {/* Remote avatar from Storage. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={testimonial.avatarUrl}
          alt={`Foto de ${testimonial.fullName}`}
          className="mt-xs size-24 rounded-full border border-border object-cover"
        />
      </figure>

      <div>
        <h3 className="text-body-small font-medium text-text-primary">
          Historia
        </h3>
        <p className="mt-xs whitespace-pre-wrap break-words text-body text-text-primary">
          {testimonial.story}
        </p>
      </div>

      {hasMedia ? (
        <div className="flex flex-col gap-sm">
          {testimonial.captureUrl ? (
            <figure>
              <figcaption className="text-body-small font-medium text-text-primary">
                Captura del proyecto
              </figcaption>
              {/* Remote screenshot from Storage. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={testimonial.captureUrl}
                alt="Captura del proyecto"
                className="mt-xs max-h-72 w-auto max-w-full rounded-md border border-border object-contain"
              />
            </figure>
          ) : null}

          {testimonial.youtubeEmbedUrl ? (
            <div>
              <p className="text-body-small font-medium text-text-primary">
                Video
              </p>
              <div className="mt-xs">
                <YoutubeEmbed
                  src={testimonial.youtubeEmbedUrl}
                  title={`Video de ${testimonial.fullName}`}
                />
              </div>
            </div>
          ) : testimonial.videoUrl ? (
            <div>
              <p className="text-body-small font-medium text-text-primary">
                Video
              </p>
              <a
                href={testimonial.videoUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-xs block break-all text-body text-accent-cyan underline-offset-4 hover:underline"
              >
                {testimonial.videoUrl}
              </a>
            </div>
          ) : null}
        </div>
      ) : null}

      <dl className="grid gap-sm border-t border-border pt-md sm:grid-cols-2">
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
            <Fact
              label="Oficio anterior"
              value={testimonial.careerChange.previous_profession}
            />
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
      <dt className="text-overline text-text-secondary">{label}</dt>
      <dd
        className={
          muted
            ? "mt-xs break-words text-body-small text-text-muted"
            : "mt-xs break-words text-body-small text-text-primary"
        }
      >
        {value}
      </dd>
    </div>
  );
}
