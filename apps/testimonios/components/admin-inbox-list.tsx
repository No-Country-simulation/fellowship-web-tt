"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import {
  countInboxByStatus,
  inboxItemMeta,
} from "@/lib/testimonials/admin-inbox";
import type { AdminInboxItem } from "@/lib/testimonials/admin-view";
import {
  STATUS_LABELS,
  TESTIMONIAL_STATUSES,
  type TestimonialStatus,
} from "@/lib/testimonials/types";
import { cn } from "@/lib/utils";

type AdminInboxListProps = {
  items: AdminInboxItem[];
  loadError: string | null;
  selectedId?: string;
  onSelect?: (id: string) => void;
};

/** Filtros de estado y lista del inbox. El filtro es local, no navega. */
export function AdminInboxList({
  items,
  loadError,
  selectedId,
  onSelect,
}: AdminInboxListProps) {
  const selectedStatus = items.find((item) => item.id === selectedId)?.status;
  const [status, setStatus] = useState<TestimonialStatus>(
    selectedStatus ?? "in_review",
  );
  const counts = useMemo(() => countInboxByStatus(items), [items]);
  const visible = useMemo(
    () => items.filter((item) => item.status === status),
    [items, status],
  );

  return (
    <>
      <div className="flex flex-col gap-sm px-md py-md">
        {selectedId ? (
          <p className="text-heading-3 text-text-primary">Inbox</p>
        ) : (
          <h1 className="text-heading-3 text-text-primary">Inbox</h1>
        )}
        <div
          role="tablist"
          aria-label="Estado"
          className="grid grid-cols-3 gap-xs"
        >
          {TESTIMONIAL_STATUSES.map((value) => {
            const active = value === status;
            return (
              <button
                key={value}
                type="button"
                role="tab"
                title={STATUS_LABELS[value]}
                aria-selected={active}
                className={cn(
                  "flex min-w-0 flex-col items-center rounded-button border px-1 py-xs text-center text-overline leading-tight text-xs cursor-pointer",
                  active
                    ? "border-accent-cyan/70 bg-bg-surface-3 text-text-primary"
                    : "border-border bg-card text-text-secondary hover:border-accent-cyan/40 hover:text-text-primary",
                )}
                onClick={() => setStatus(value)}
              >
                <span className="max-w-full truncate">
                  {STATUS_LABELS[value]}
                </span>
                {/* <span className="text-text-muted">{counts[value]}</span> */}
              </button>
            );
          })}
        </div>
      </div>

      {loadError ? (
        <p className="px-md pb-md text-body text-destructive" role="alert">
          {loadError}
        </p>
      ) : visible.length === 0 ? (
        <div className="mx-md mb-md rounded-md border border-dashed border-border bg-card p-md">
          <p className="text-overline text-text-secondary">
            {STATUS_LABELS[status]}
          </p>
          <p className="mt-xs text-body-small text-text-secondary">
            {status === "in_review"
              ? "No hay envíos pendientes. Cuando alguien complete /enviar, aparece acá."
              : `No hay testimonios con estado ${STATUS_LABELS[status].toLowerCase()}.`}
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-xs px-sm pb-md">
          {visible.map((item) => {
            const selected = item.id === selectedId;
            return (
              <li key={item.id}>
                <Link
                  href={`/admin/${item.id}`}
                  aria-current={selected ? "page" : undefined}
                  className={cn(
                    "flex min-w-0 items-center gap-sm rounded-md border px-sm py-sm transition-colors",
                    selected
                      ? "border-accent-cyan/70 bg-bg-surface-3"
                      : "border-transparent hover:border-border hover:bg-card",
                  )}
                  onClick={() => {
                    if (item.id !== selectedId) {
                      onSelect?.(item.id);
                    }
                  }}
                >
                  <div className="relative size-10 shrink-0 overflow-hidden rounded-full bg-bg-surface-3">
                    <Image
                      src={item.avatarUrl}
                      alt=""
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-body-small font-medium text-text-primary">
                      {item.fullName}
                    </p>
                    <p className="truncate text-overline text-text-muted">
                      {inboxItemMeta(item)}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
