import { YoutubeEmbed } from "@/components/youtube-embed";
import type { AdminTestimonial } from "@/lib/testimonials/admin-view";

type AdminSubmissionProps = {
  testimonial: AdminTestimonial;
};

/** Lo que mandó el talento: historia, media y datos de contacto. Siempre visible. */
export function AdminSubmission({ testimonial }: AdminSubmissionProps) {
  const hasMedia = Boolean(
    testimonial.captureUrl || testimonial.youtubeEmbedUrl || testimonial.videoUrl,
  );

  return (
    <section
      aria-labelledby="admin-submission-title"
      className="flex min-w-0 flex-col gap-md rounded-md border border-border bg-card p-md"
    >
      <header className="flex flex-col gap-xs">
        <h2
          id="admin-submission-title"
          className="text-overline text-text-secondary"
        >
          Envío original
        </h2>
        <p className="text-body-small text-text-secondary">
          Lo que escribió el talento. No se edita; el quote sale de acá.
        </p>
      </header>

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
        <Fact label="Email" value={testimonial.email} />
        <Fact
          label="Instagram"
          value={testimonial.instagram ?? "No dejó Instagram"}
          muted={!testimonial.instagram}
        />
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
    </section>
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
