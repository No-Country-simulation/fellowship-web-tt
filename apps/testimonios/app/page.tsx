import { GalleryHero } from "@/components/gallery-hero";
import { TestimonialsGallery } from "@/components/testimonials-gallery";
import { listPublishedTestimonials } from "@/lib/testimonials/public";

// Sin esto Next prerenderiza `/` en el build y los publicados después no aparecen.
export const dynamic = "force-dynamic";

// Copy provisional de la sección de exploración.
const GALLERY_COPY = {
  heading: "Explorá las historias",
  description: "Elegí el tipo de experiencia que te interesa conocer.",
} as const;

export default async function HomePage() {
  const listed = await listPublishedTestimonials();
  const testimonials = listed.ok
    ? listed.testimonials.map(
        ({ id, slug, type, typeLabel, fullName, quote, avatarUrl }) => ({
          id,
          slug,
          type,
          typeLabel,
          fullName,
          quote,
          avatarUrl,
        }),
      )
    : [];
  const loadError = listed.ok ? null : listed.message;

  return (
    <main className="min-h-0 min-w-0 flex-1 overflow-y-auto bg-bg-base">
      <GalleryHero />
      <section
        aria-labelledby="gallery-stories-title"
        className="px-md py-lg md:px-lg md:py-xl"
      >
        <div className="mx-auto w-full max-w-[70rem]">
          <div className="mb-md flex flex-col gap-xs md:flex-row md:items-end md:justify-between md:gap-md">
            <h2
              id="gallery-stories-title"
              className="text-2xl font-bold tracking-tight text-text-primary"
            >
              {GALLERY_COPY.heading}
            </h2>
            <p className="text-sm leading-relaxed text-text-secondary">
              {GALLERY_COPY.description}
            </p>
          </div>
          {loadError ? (
            <p
              className="rounded-card border border-border bg-card p-md text-base leading-relaxed text-destructive"
              role="alert"
            >
              {loadError}
            </p>
          ) : (
            <TestimonialsGallery testimonials={testimonials} />
          )}
        </div>
      </section>
    </main>
  );
}
