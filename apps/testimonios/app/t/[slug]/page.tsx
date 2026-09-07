import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buttonVariants } from "@repo/ui/button";

import { PageShell } from "@/components/page-shell";
import { TestimonialCard } from "@/components/testimonial-card";
import { YoutubeEmbed } from "@/components/youtube-embed";
import {
  formatPublishedAt,
  getPublishedTestimonialBySlug,
  type PublicTestimonial,
} from "@/lib/testimonials/public";

export async function generateMetadata({
  params,
}: PageProps<"/t/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const result = await getPublishedTestimonialBySlug(slug);

  if (!result.ok) {
    return { title: "Testimonio" };
  }

  return {
    title: result.testimonial.fullName,
    description: result.testimonial.quote,
  };
}

export default async function TestimonyPage({
  params,
}: PageProps<"/t/[slug]">) {
  const { slug } = await params;
  const result = await getPublishedTestimonialBySlug(slug);

  if (!result.ok && result.notFound) {
    notFound();
  }

  if (!result.ok) {
    return (
      <PageShell
        eyebrow="Ficha"
        title="No se pudo cargar"
        description={result.message}
      >
        <div className="mt-lg">
          <Link href="/" className={buttonVariants({ variant: "outline" })}>
            Volver a la galería
          </Link>
        </div>
      </PageShell>
    );
  }

  const testimonial = result.testimonial;
  const extra = extraLine(testimonial);

  return (
    <PageShell
      eyebrow={testimonial.typeLabel}
      title={testimonial.fullName}
      description={
        testimonial.publishedAt
          ? `Publicado el ${formatPublishedAt(testimonial.publishedAt)}`
          : undefined
      }
    >
      <div className="mt-lg flex flex-col gap-lg">
        <TestimonialCard
          name={testimonial.fullName}
          typeLabel={testimonial.typeLabel}
          quote={testimonial.quote}
          avatarUrl={testimonial.avatarUrl}
        />

        {extra ? (
          <p className="text-body text-text-secondary">{extra}</p>
        ) : null}

        {testimonial.story !== testimonial.quote ? (
          <section>
            <p className="text-overline text-text-secondary">Historia</p>
            <p className="mt-xs whitespace-pre-wrap text-body text-text-secondary">
              {testimonial.story}
            </p>
          </section>
        ) : null}

        {testimonial.captureUrl ? (
          <figure>
            <p className="text-overline text-text-secondary">
              Captura del proyecto
            </p>
            {/* Unknown screenshot aspect; keep the native ratio. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={testimonial.captureUrl}
              alt={`Captura del proyecto de ${testimonial.fullName}`}
              className="mt-xs max-h-72 w-auto max-w-full rounded-md border border-border object-contain"
            />
          </figure>
        ) : null}

        {testimonial.youtubeEmbedUrl ? (
          <section>
            <p className="text-overline text-text-secondary">YouTube</p>
            <div className="mt-xs">
              <YoutubeEmbed
                src={testimonial.youtubeEmbedUrl}
                title={`Video de ${testimonial.fullName}`}
              />
            </div>
          </section>
        ) : null}

        <div>
          <Link href="/" className={buttonVariants({ variant: "outline" })}>
            Volver a la galería
          </Link>
        </div>
      </div>
    </PageShell>
  );
}

function extraLine(testimonial: PublicTestimonial) {
  if (testimonial.firstJob) {
    return `${testimonial.firstJob.role_achieved} en ${testimonial.firstJob.company}`;
  }
  if (testimonial.careerChange) {
    return `De ${testimonial.careerChange.previous_profession} a ${testimonial.careerChange.new_role}`;
  }
  return null;
}
