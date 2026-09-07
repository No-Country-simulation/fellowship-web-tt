import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@repo/ui/button";

import { PageShell, adminShellClassName } from "@/components/page-shell";
import { TestimonialCard } from "@/components/testimonial-card";
import { requireAdmin } from "@/lib/auth/admin";
import {
  formatSubmittedAt,
  toInboxItem,
} from "@/lib/testimonials/admin-view";
import { countTestimonialsByStatus, listTestimonials } from "@/lib/testimonials/store";
import {
  STATUS_LABELS,
  TESTIMONIAL_STATUSES,
  isTestimonialStatus,
  type TestimonialStatus,
} from "@/lib/testimonials/types";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Admin",
};

export default async function AdminPage({
  searchParams,
}: PageProps<"/admin">) {
  await requireAdmin();
  const params = await searchParams;
  const statusRaw = firstParam(params.status) ?? "";
  const status: TestimonialStatus = isTestimonialStatus(statusRaw)
    ? statusRaw
    : "in_review";

  const [listed, counted] = await Promise.all([
    listTestimonials(status),
    countTestimonialsByStatus(),
  ]);

  const counts = counted.ok
    ? counted.counts
    : { in_review: 0, published: 0, rejected: 0 };
  const items = listed.ok ? listed.testimonials.map(toInboxItem) : [];
  const loadError = !listed.ok ? listed.message : !counted.ok ? counted.message : null;

  return (
    <PageShell className={adminShellClassName} title="Inbox de testimonios">
      <nav aria-label="Estado" className="mt-md flex flex-wrap gap-xs">
        {TESTIMONIAL_STATUSES.map((value) => {
          const active = value === status;
          return (
            <Link
              key={value}
              href={value === "in_review" ? "/admin" : `/admin?status=${value}`}
              className={cn(
                buttonVariants({
                  variant: active ? "secondary" : "outline",
                  size: "sm",
                }),
              )}
              aria-current={active ? "page" : undefined}
            >
              {STATUS_LABELS[value]}
              <span className="text-text-muted"> {counts[value]}</span>
            </Link>
          );
        })}
      </nav>

      {loadError ? (
        <p className="mt-lg text-body text-destructive" role="alert">
          {loadError}
        </p>
      ) : items.length === 0 ? (
        <div className="mt-lg rounded-md border border-dashed border-border bg-card p-md">
          <p className="text-overline text-text-secondary">
            {STATUS_LABELS[status]}
          </p>
          <p className="mt-xs text-body text-text-secondary">
            {status === "in_review"
              ? "No hay envíos pendientes. Cuando alguien complete /enviar, aparece acá."
              : `No hay testimonios con estado ${STATUS_LABELS[status].toLowerCase()}.`}
          </p>
        </div>
      ) : (
        <ul className="mt-lg grid grid-cols-1 gap-sm sm:grid-cols-3">
          {items.map((item) => (
            <li key={item.id} className="min-w-0">
              <TestimonialCard
                name={item.fullName}
                typeLabel={item.typeLabel}
                quote={item.quote}
                avatarUrl={item.avatarUrl}
                href={`/admin/${item.id}`}
                lineClamp={3}
                footer={formatSubmittedAt(item.submittedAt)}
              />
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  );
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
