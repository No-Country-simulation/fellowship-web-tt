import type { Metadata } from "next";
import { cookies } from "next/headers";
import { FORM_LOCALE_COOKIE, resolvePreferredFormLocale } from "@/lib/form-i18n/locales";

import { GalleryHero } from "@/components/gallery-hero";
import { selectHeroStories } from "@/components/gallery-hero-data";
import { listPublishedTestimonials } from "@/lib/testimonials/public";

// El carrusel debe reflejar los publicados nuevos, también después del build.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "Comparte tu testimonio · No Country" },
  description:
    "Comparte tu experiencia con No Country, destaca tu recorrido profesional y ten la oportunidad de ganar visibilidad en nuestros canales oficiales.",
};

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const [params, cookieStore] = await Promise.all([searchParams, cookies()]);
  const locale = resolvePreferredFormLocale(params, cookieStore.get(FORM_LOCALE_COOKIE)?.value);
  const listed = await listPublishedTestimonials();
  const heroStories = listed.ok ? selectHeroStories(listed.testimonials) : null;

  return (
    <main className="min-w-0 flex-1 bg-bg-base">
      <GalleryHero stories={heroStories} locale={locale} />
      {/* Galería temporalmente fuera del home; componentes y fichas se conservan. */}
    </main>
  );
}
