import { InboxList } from "@features/testimonials/components/InboxList";
import {
  inboxParamsFromRecord,
  readInboxQuery,
} from "@features/testimonials/infrastructure/inboxQuery";
import {
  getTestimonialRow,
  isTestimonialId,
  loadInboxFirstPage,
} from "@features/testimonials/infrastructure/repositories/testimonialRepository";
import { galleryFormHref } from "@features/testimonials/infrastructure/site";
import {
  isTestimonialStatus,
  type AdminInboxPage,
  type InboxStatusCounts,
  type TestimonialStatus,
} from "@features/testimonials/types/testimonial";

const emptyCounts: InboxStatusCounts = {
  in_review: null,
  published: null,
  archived: null,
  rejected: null,
};

/** Una sola carga para `/testimonials` y `/testimonials/[id]`. */
export async function InboxSlot({
  slug,
  searchParams,
}: {
  slug?: string[];
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const rawParams = await searchParams;
  const query = readInboxQuery(inboxParamsFromRecord(rawParams));
  const formHref = galleryFormHref();
  let status: TestimonialStatus = query.status ?? "in_review";
  let inbox: AdminInboxPage;

  try {
    status = await resolveInboxStatus(query.status, slug);
    inbox = await loadInboxFirstPage(status);
  } catch {
    inbox = {
      status,
      items: [],
      rowIds: [],
      omitted: 0,
      cursor: null,
      counts: emptyCounts,
      loadError: "No pudimos cargar el inbox. Probá de nuevo.",
    };
  }

  return (
    <InboxList
      formHref={formHref}
      status={inbox.status}
      items={inbox.items}
      rowIds={inbox.rowIds}
      omitted={inbox.omitted}
      cursor={inbox.cursor}
      counts={inbox.counts}
      loadError={inbox.loadError}
    />
  );
}

/** `status` válido de la query gana. Si no, el de la fila abierta. Si no hay fila, `in_review`. */
async function resolveInboxStatus(
  queryStatus: TestimonialStatus | null,
  slug: string[] | undefined,
): Promise<TestimonialStatus> {
  if (queryStatus) return queryStatus;
  const id = slug?.length === 1 ? slug[0] : undefined;
  if (!id || !isTestimonialId(id)) return "in_review";
  try {
    const row = await getTestimonialRow(id);
    if (!row.ok || !isTestimonialStatus(row.testimonial.status)) return "in_review";
    return row.testimonial.status;
  } catch {
    return "in_review";
  }
}
