"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@repo/ui/utils";

import type { AdminInboxData } from "../lib/inbox";
import { DetailLoading } from "./DetailLoading";
import { InboxList } from "./InboxList";

function selectedIdFromPath(pathname: string) {
  const match = pathname.match(/^\/testimonials\/([^/]+)$/);
  return match?.[1];
}

/** Lista a la izquierda y ficha a la derecha, dentro del padding del shell. */
export function InboxShell({
  inbox,
  children,
}: {
  inbox: AdminInboxData;
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
  const ListTag = activeId ? "aside" : "section";

  return (
    <div className="flex h-[calc(100vh-6rem)] min-h-0 overflow-hidden rounded-lg border border-border bg-card">
      <ListTag
        aria-label="Inbox de testimonios"
        className={cn(
          "flex w-full shrink-0 flex-col overflow-y-auto bg-card",
          "md:w-80 md:border-r md:border-border",
          activeId && "hidden md:flex",
        )}
      >
        <InboxList
          items={inbox.items}
          loadError={inbox.loadError}
          selectedId={activeId}
          onSelect={(id) => setPending({ id, from: pathname })}
        />
      </ListTag>

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
