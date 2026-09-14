"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";

import { AdminDetailLoading } from "@/components/admin-detail-loading";
import { AdminInboxList } from "@/components/admin-inbox-list";
import type { AdminInboxData } from "@/lib/testimonials/admin-inbox";
import { cn } from "@/lib/utils";

type AdminInboxShellProps = {
  inbox: AdminInboxData;
  children: ReactNode;
};

function selectedIdFromPath(pathname: string) {
  const match = pathname.match(/^\/admin\/([^/]+)$/);
  return match?.[1];
}

/** Inbox + detalle: lista a la izquierda, ficha a la derecha. */
export function AdminInboxShell({ inbox, children }: AdminInboxShellProps) {
  const pathname = usePathname();
  const selectedId = selectedIdFromPath(pathname);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const activeId = pendingId ?? selectedId;
  const showLoading = Boolean(pendingId && pendingId !== selectedId);
  const ListTag = activeId ? "aside" : "main";

  useEffect(() => {
    if (pathname === "/admin") {
      setPendingId(null);
      return;
    }
    if (pendingId && selectedId === pendingId) {
      setPendingId(null);
    }
  }, [pathname, pendingId, selectedId]);

  return (
    <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
      <ListTag
        aria-label="Inbox de testimonios"
        className={cn(
          "flex w-full shrink-0 flex-col overflow-y-auto border-border bg-bg-base",
          "md:w-80 md:border-r",
          activeId && "hidden md:flex",
        )}
      >
        <AdminInboxList
          items={inbox.items}
          loadError={inbox.loadError}
          selectedId={activeId}
          onSelect={setPendingId}
        />
      </ListTag>

      <div
        className={cn(
          "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden",
          !activeId && "hidden md:flex",
        )}
      >
        {showLoading ? <AdminDetailLoading /> : children}
      </div>
    </div>
  );
}
