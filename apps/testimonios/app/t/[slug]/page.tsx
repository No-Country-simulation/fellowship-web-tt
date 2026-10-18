import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buttonVariants } from "@repo/ui/button";

import { PageShell } from "@/components/page-shell";
import { TestimonialDetail } from "@/components/testimonial-detail";
import { getPublishedTestimonialBySlug } from "@/lib/testimonials/public";

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

  return <TestimonialDetail testimonial={result.testimonial} />;
}
