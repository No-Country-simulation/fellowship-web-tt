import Link from "next/link";
import { buttonVariants } from "@repo/ui/button";

import { PageShell } from "@/components/page-shell";
import { TestimonialCard } from "@/components/testimonial-card";
import { listPublishedTestimonials } from "@/lib/testimonials/public";

export default async function HomePage() {
  const listed = await listPublishedTestimonials();
  const testimonials = listed.ok ? listed.testimonials : [];
  const loadError = listed.ok ? null : listed.message;

  return (
    <PageShell
      className="max-w-5xl"
      eyebrow="Galería"
      title="Historias de talento"
      description="Simulación, primer empleo y reconversión. El equipo valida cada historia antes de que salga acá o en Discord."
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
          <div className="mt-md">
            <Link
              href="/enviar"
              className={buttonVariants({ variant: "gradient", size: "lg" })}
            >
              Enviar testimonio
            </Link>
          </div>
        </div>
      ) : (
        <>
        <p className="text-body text-text-secondary">
            Si estuviste en un Demo Day, también podés{" "}
            <Link href="/enviar" className="text-accent-cyan hover:underline">
              dejar tu testimonio
            </Link>
            .
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
