import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { buttonVariants } from "@repo/ui/button";

import { AdminReviewForm } from "@/components/admin-review-form";
import { PageShell, adminShellClassName } from "@/components/page-shell";
import { TestimonialCard } from "@/components/testimonial-card";
import { YoutubeEmbed } from "@/components/youtube-embed";
import { requireAdmin } from "@/lib/auth/admin";
import {
  formatSubmittedAt,
  toAdminTestimonial,
} from "@/lib/testimonials/admin-view";
import { getTestimonialById } from "@/lib/testimonials/store";
import { STATUS_LABELS } from "@/lib/testimonials/types";

export const metadata: Metadata = {
  title: "Revisar testimonio",
};

export default async function AdminReviewPage({
  params,
}: PageProps<"/admin/[id]">) {
  await requireAdmin();
  const { id } = await params;

  if (!id) {
    notFound();
  }

  const result = await getTestimonialById(id);
  if (!result.ok && result.notFound) {
    notFound();
  }
  if (!result.ok) {
    return (
      <PageShell
        title="No se pudo cargar"
        description={result.message}
        className={adminShellClassName}
        titleStart={<BackToInbox />}
      />
    );
  }

  const testimonial = toAdminTestimonial(result.testimonial);
  const inReview = testimonial.status === "in_review";

  return (
    <PageShell
      className={adminShellClassName}
      title={testimonial.fullName}
      titleStart={<BackToInbox />}
      titleAddon={
        <span className="ml-auto rounded-full border border-border bg-bg-surface-3 px-sm py-1 text-overline text-text-secondary">
          {testimonial.typeLabel}
        </span>
      }
    >
      <p className="mt-sm text-overline text-text-secondary">
        {STATUS_LABELS[testimonial.status]} ·{" "}
        {formatSubmittedAt(testimonial.submittedAt)}
      </p>

      <dl className="mt-lg grid gap-sm rounded-md border border-border bg-card p-md sm:grid-cols-2">
        <div>
          <dt className="text-overline text-text-secondary">Email</dt>
          <dd className="mt-xs text-body text-text-primary">
            {testimonial.email}
          </dd>
        </div>
        <div>
          <dt className="text-overline text-text-secondary">Instagram</dt>
          <dd className="mt-xs text-body text-text-primary">
            {testimonial.instagram ?? "Sin Instagram"}
          </dd>
        </div>
        {testimonial.firstJob ? (
          <>
            <div>
              <dt className="text-overline text-text-secondary">Empresa</dt>
              <dd className="mt-xs text-body text-text-primary">
                {testimonial.firstJob.company}
              </dd>
            </div>
            <div>
              <dt className="text-overline text-text-secondary">Puesto</dt>
              <dd className="mt-xs text-body text-text-primary">
                {testimonial.firstJob.role_achieved}
              </dd>
            </div>
          </>
        ) : null}
        {testimonial.careerChange ? (
          <>
            <div>
              <dt className="text-overline text-text-secondary">
                Oficio anterior
              </dt>
              <dd className="mt-xs text-body text-text-primary">
                {testimonial.careerChange.previous_profession}
              </dd>
            </div>
            <div>
              <dt className="text-overline text-text-secondary">Rol nuevo</dt>
              <dd className="mt-xs text-body text-text-primary">
                {testimonial.careerChange.new_role}
              </dd>
            </div>
          </>
        ) : null}
        {testimonial.videoUrl ? (
          <div className="sm:col-span-2">
            <dt className="text-overline text-text-secondary">YouTube</dt>
            <dd className="mt-xs break-all text-body text-text-primary">
              {testimonial.videoUrl}
            </dd>
          </div>
        ) : null}
        <div className="sm:col-span-2">
          <dt className="text-overline text-text-secondary">
            Historia completa
          </dt>
          <dd className="mt-xs whitespace-pre-wrap break-words text-body text-text-primary">
            {testimonial.story}
          </dd>
        </div>
      </dl>

      {inReview ? (
        <AdminReviewForm testimonial={testimonial} />
      ) : (
        <div className="mt-lg flex flex-col gap-lg">
          <section className="flex flex-col gap-sm">
            <p className="text-overline text-text-secondary">
              Preview de la card
            </p>
            <TestimonialCard
              name={testimonial.fullName}
              typeLabel={testimonial.typeLabel}
              quote={testimonial.quote}
              avatarUrl={testimonial.avatarUrl}
            />
          </section>
          {testimonial.captureUrl ? (
            <section className="flex flex-col gap-sm">
              <p className="text-overline text-text-secondary">
                Captura del proyecto
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={testimonial.captureUrl}
                alt="Captura del proyecto"
                className="max-h-72 w-auto max-w-full rounded-md border border-border object-contain"
              />
            </section>
          ) : null}
          {testimonial.youtubeEmbedUrl ? (
            <YoutubeEmbed
              src={testimonial.youtubeEmbedUrl}
              title={`Video de ${testimonial.fullName}`}
            />
          ) : null}
          {testimonial.status === "published" ? (
            <Link
              href={`/t/${testimonial.slug}`}
              className={buttonVariants({ variant: "outline" })}
            >
              Ver ficha pública
            </Link>
          ) : null}
        </div>
      )}
    </PageShell>
  );
}

function BackToInbox() {
  return (
    <Link
      href="/admin"
      aria-label="Volver al inbox"
      className="grid size-8 shrink-0 place-items-center rounded-button text-text-secondary hover:bg-bg-white-a5 hover:text-text-primary"
    >
      <ArrowLeft className="size-6" />
    </Link>
  );
}
