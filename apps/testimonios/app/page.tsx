import Link from "next/link";
import { buttonVariants } from "@repo/ui/button";

import { PageShell } from "@/components/page-shell";
import { TestimonialCard } from "@/components/testimonial-card";
import { listPublishedTestimonials } from "@/lib/testimonials/public";

// Sin esto Next prerenderiza `/` en el build y los publicados después no aparecen.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const listed = await listPublishedTestimonials();
  const testimonials = listed.ok ? listed.testimonials : [];
  const loadError = listed.ok ? null : listed.message;

  return (
    <PageShell
      className="max-w-5xl"
      variant="featured"
      eyebrow="Galería"
      title="Historias de talento"
      description="Simulación, primer empleo y reconversión. El equipo valida cada historia antes de que salga acá o en Discord."
      actions={
        <Link
          href="/enviar"
          className={buttonVariants({ variant: "gradient", size: "lg" })}
        >
          Enviar testimonio
        </Link>
      }
    >
      {loadError ? (
        <p className="mt-lg text-body text-destructive" role="alert">
          {loadError}
        </p>
      ) : testimonials.length === 0 ? (
        <div className="mt-lg rounded-md border border-border bg-card p-md">
          <p className="text-body text-text-secondary">
            Todavía no hay envíos publicados. Si estuviste en un Demo Day, podés
            dejar el tuyo ahora. El equipo lo revisa antes de que salga acá o en
            Discord.
          </p>
        </div>
      ) : (
        <>
          <p className="text-body text-text-secondary">
            Si estuviste en un Demo Day, también podés dejar tu testimonio.
          </p>
          <ul className="mt-lg grid gap-md sm:grid-cols-2">
            {testimonials.map((testimonial) => (
              <li key={testimonial.id}>
                <TestimonialCard
                  name={testimonial.fullName}
                  typeLabel={testimonial.typeLabel}
                  quote={testimonial.quote}
                  avatarUrl={testimonial.avatarUrl}
                  href={`/t/${testimonial.slug}`}
                  lineClamp={3}
                  cta="Ver historia"
                />
              </li>
            ))}
          </ul>
        </>
      )}
    </PageShell>
  );
}
