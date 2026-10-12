import { listTestimonials } from "./store";
import { toInboxItem, type AdminInboxItem } from "./view";

export type AdminInboxData = {
  items: AdminInboxItem[];
  loadError: string | null;
};

export async function loadAdminInbox(): Promise<AdminInboxData> {
  const listed = await listTestimonials();

  return {
    items: listed.ok ? listed.testimonials.map(toInboxItem) : [],
    loadError: listed.ok ? null : listed.message,
  };
}
