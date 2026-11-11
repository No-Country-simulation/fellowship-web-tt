import { InboxSlot } from "../InboxSlot";

export const dynamic = "force-dynamic";

export default async function TestimonialsInboxDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  return <InboxSlot slug={[id]} searchParams={searchParams} />;
}
