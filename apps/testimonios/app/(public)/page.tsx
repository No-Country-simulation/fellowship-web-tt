import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@repo/ui/button";
import { TestimonialsGallery } from "@/components/testimonials-gallery";
import { listPublishedTestimonials } from "@/lib/testimonials/public";
import { buildFormHref, resolveFormLocale } from "@/lib/form-i18n/locales";

// La galería debe reflejar los publicados nuevos, también después del build.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "Testimonios · No Country" },
  description:
    "Comparte tu experiencia con No Country, destaca tu recorrido profesional y ten la oportunidad de ganar visibilidad en nuestros canales oficiales.",
};

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const formHref = params.lang === undefined ? "/enviar" : buildFormHref(resolveFormLocale(params));
  const listed = await listPublishedTestimonials();

  return (
    <main className="min-w-0 flex-1 wrap-anywhere bg-bg-base px-md py-lg">
      <div className="mx-auto w-full max-w-[70rem]">
        <div className="mb-lg flex min-w-0 flex-wrap items-center justify-between gap-md">
          <h1 className="type-section text-text-primary">Historias de nuestra comunidad</h1>
          <Link id="hero-consent" href={formHref} className={buttonVariants({ variant: "outline", className: "min-h-11 max-w-full whitespace-normal" })}>
            Compartir mi testimonio
          </Link>
        </div>
        {listed.ok ? <TestimonialsGallery testimonials={listed.testimonials} /> : (
          <p role="status" className="text-body text-text-secondary">{listed.message}</p>
        )}
      </div>
    </main>
  );
}
