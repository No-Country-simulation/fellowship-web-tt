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
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="px-5 pt-5">
        <InboxBackLink>Testimonios</InboxBackLink>
      </div>
      <div className="flex min-h-0 min-w-0 flex-1 items-center justify-center overflow-y-auto px-6 py-8">
        <div className="flex max-w-md flex-col items-center text-center">
          <PageHeader>
            <PageHeaderTitle>Algo salió mal</PageHeaderTitle>
            <PageHeaderDescription>No pudimos mostrar esta pantalla. Probá de nuevo.</PageHeaderDescription>
          </PageHeader>
          <button type="button" className={buttonVariants({ className: "mt-4" })} onClick={() => reset()}>
            Reintentar
          </button>
        </div>
      </div>
    </div>
  );
}
