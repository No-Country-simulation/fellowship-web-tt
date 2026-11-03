"use client";

import { useEffect } from "react";
import { buttonVariants } from "@repo/ui/button";

import { InboxBackLink } from "@features/testimonials/components/InboxFilters";
import { PageHeader, PageHeaderDescription, PageHeaderTitle } from "@shared/ui/patterns/PageHeader";

export default function TestimonialsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
      <PageHeader>
        <InboxBackLink>Testimonios</InboxBackLink>
        <PageHeaderTitle>Algo salió mal</PageHeaderTitle>
        <PageHeaderDescription>No pudimos mostrar esta pantalla. Probá de nuevo.</PageHeaderDescription>
      </PageHeader>
      <button type="button" className={buttonVariants({ className: "mt-4" })} onClick={() => reset()}>
        Reintentar
      </button>
    </div>
  );
}
