import {
  formatSubmittedAt,
  toInboxItem,
  type AdminInboxItem,
} from "@/lib/testimonials/admin-view";
import { listTestimonials } from "@/lib/testimonials/store";
import type { TestimonialStatus } from "@/lib/testimonials/types";

export type AdminInboxData = {
  items: AdminInboxItem[];
  loadError: string | null;
};

export function inboxItemMeta(item: AdminInboxItem) {
  return `${item.typeLabel} · ${formatSubmittedAt(item.submittedAt)}`;
}

export function countInboxByStatus(items: AdminInboxItem[]) {
  const counts = {
    in_review: 0,
    published: 0,
    rejected: 0,
  } satisfies Record<TestimonialStatus, number>;

  for (const item of items) {
    counts[item.status] += 1;
  }

  return counts;
}

export async function loadAdminInbox(): Promise<AdminInboxData> {
  const listed = await listTestimonials();

  return {
    items: listed.ok ? listed.testimonials.map(toInboxItem) : [],
    loadError: listed.ok ? null : listed.message,
  };
}
