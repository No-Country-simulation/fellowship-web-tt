"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@repo/ui/utils";

import { inboxItemMeta, type AdminInboxItem } from "../lib/view";
import {
  STATUS_LABELS,
  TESTIMONIAL_STATUSES,
  type TestimonialStatus,
} from "../lib/types";

export function InboxList({
  items,
  loadError,
  selectedId,
  onSelect,
}: {
  items: AdminInboxItem[];
  loadError: string | null;
  selectedId?: string;
  onSelect?: (id: string) => void;
}) {
  const selectedStatus = items.find((item) => item.id === selectedId)?.status;
  const [status, setStatus] = useState<TestimonialStatus>(selectedStatus ?? "in_review");
  const visible = useMemo(
    () => items.filter((item) => item.status === status),
    [items, status],
  );

  return (
    <>
      <div className="flex flex-col gap-3 px-4 py-4">
        {selectedId ? (
          <p className="text-admin-heading font-semibold text-foreground">Inbox</p>
        ) : (
          <h1 className="text-admin-heading font-semibold text-foreground">Inbox</h1>
        )}
        <div role="tablist" aria-label="Estado" className="grid grid-cols-3 gap-1">
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
                  "flex min-w-0 cursor-pointer flex-col items-center rounded-lg border px-1 py-2 text-center text-admin-micro leading-tight",
                  active
                    ? "border-primary bg-muted text-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
                )}
                onClick={() => setStatus(value)}
              >
                <span className="max-w-full truncate">{STATUS_LABELS[value]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {loadError ? (
        <p className="px-4 pb-4 text-admin-body text-destructive" role="alert">
          {loadError}
        </p>
      ) : visible.length === 0 ? (
        <div className="mx-4 mb-4 rounded-lg border border-dashed border-border bg-muted p-4">
          <p className="text-admin-micro uppercase tracking-wide text-muted-foreground">
            {STATUS_LABELS[status]}
          </p>
          <p className="mt-1 text-admin-caption text-muted-foreground">
            {status === "in_review"
              ? "No hay envíos pendientes. Cuando alguien complete /enviar, aparece acá."
              : `No hay testimonios con estado ${STATUS_LABELS[status].toLowerCase()}.`}
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-1 px-2 pb-4">
          {visible.map((item) => {
            const selected = item.id === selectedId;
            return (
              <li key={item.id}>
                <Link
                  href={`/testimonials/${item.id}`}
                  aria-current={selected ? "page" : undefined}
                  className={cn(
                    "flex min-w-0 items-center gap-2 rounded-lg border px-2 py-2 transition-colors",
                    selected
                      ? "border-primary bg-muted"
                      : "border-transparent hover:border-border hover:bg-muted",
                  )}
                  onClick={() => {
                    if (item.id !== selectedId) {
                      onSelect?.(item.id);
                    }
                  }}
                >
                  <div className="relative size-10 shrink-0 overflow-hidden rounded-full bg-muted">
                    <Image
                      src={item.avatarUrl}
                      alt=""
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-admin-caption font-medium text-foreground">
                      {item.fullName}
                    </p>
                    <p className="truncate text-admin-micro text-muted-foreground">
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
