import { InboxSlot } from "./InboxSlot";

export const dynamic = "force-dynamic";

export default function TestimonialsInboxPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <InboxSlot searchParams={searchParams} />;
}
