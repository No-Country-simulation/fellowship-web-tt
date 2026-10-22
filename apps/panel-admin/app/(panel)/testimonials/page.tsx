import { redirect } from "next/navigation";

import {
  canonicalInboxHref,
  inboxParamsFromRecord,
  inboxSearchNeedsCleanup,
} from "@features/testimonials/infrastructure/inboxQuery";

export default async function TestimonialsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = inboxParamsFromRecord(await searchParams);
  if (inboxSearchNeedsCleanup(params)) {
    redirect(canonicalInboxHref("/testimonials", params));
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1 items-center justify-center px-6 py-8">
      <p className="max-w-md text-center text-admin-body text-muted-foreground">
        Elegí un envío de la lista para revisar la publicación. La misma imagen sale en Discord,
        Instagram y LinkedIn.
      </p>
    </div>
  );
}
