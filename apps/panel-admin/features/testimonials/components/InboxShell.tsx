"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@repo/ui/utils";

import type { AdminInboxData } from "../types/testimonial";
import { DetailLoading } from "./DetailLoading";
import { InboxFiltersProvider } from "./InboxFilters";
import { InboxList } from "./InboxList";

function selectedIdFromPath(pathname: string) {
  const match = pathname.match(/^\/testimonials\/([^/]+)$/);
  return match?.[1];
}

/** Lista a la izquierda y ficha a la derecha, dentro del padding del shell. */
export function InboxShell({
  inbox,
  formHref,
  children,
}: {
  inbox: AdminInboxData;
  formHref: string | null;
  children: ReactNode;
}) {
  return (
    <InboxFiltersProvider>
      <InboxFrame formHref={formHref} inbox={inbox}>
        {children}
      </InboxFrame>
    </InboxFiltersProvider>
  );
}

function InboxFrame({
  inbox,
  formHref,
  children,
}: {
  inbox: AdminInboxData;
  formHref: string | null;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const selectedId = selectedIdFromPath(pathname);
  const [pending, setPending] = useState<{ id: string; from: string } | null>(null);
  const showLoading = Boolean(
    pending &&
      pending.id !== selectedId &&
      (pathname === pending.from || pathname === `/testimonials/${pending.id}`),
  );
  const activeId = showLoading ? pending?.id : selectedId;

  return (
    <div className="flex h-[calc(100vh-6rem)] min-h-0 overflow-hidden rounded-lg border border-border bg-card">
      {/* Mismo nodo con o sin ficha. Cambiar aside/section remonta la lista,
          pierde el aviso de borrado y no refresca al salir de la ficha. */}
      <div
        role={activeId ? "complementary" : "region"}
        aria-label="Inbox de testimonios"
        className={cn(
          "flex w-full shrink-0 flex-col overflow-y-auto bg-card",
          "md:w-80 md:border-r md:border-border",
          activeId && "hidden md:flex",
        )}
      >
        <InboxList
          formHref={formHref}
          items={inbox.items}
          loadError={inbox.loadError}
          selectedId={activeId}
          onSelect={(id) => setPending({ id, from: pathname })}
        />
      </div>

      <div
        className={cn(
          "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-background",
          !activeId && "hidden md:flex",
        )}
      >
        {showLoading ? <DetailLoading /> : children}
      </div>
    </div>
  );
}
