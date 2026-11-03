"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@repo/ui/utils";

import { initialBulkDeleteState, type BulkDeleteState } from "../types/reviewState";
import type { InboxPageSlice } from "../types/testimonial";
import { DetailLoading } from "./DetailLoading";
import { InboxFiltersProvider } from "./InboxFilters";

type InboxSelection = {
  activeId: string | undefined;
  onSelect: (id: string) => void;
};

type ExtraBucket = {
  pages: InboxPageSlice[];
  error: string | null;
};

type InboxListState = {
  selected: Set<string>;
  setSelected: Dispatch<SetStateAction<Set<string>>>;
  deleting: boolean;
  setDeleting: Dispatch<SetStateAction<boolean>>;
  bulkState: BulkDeleteState;
  setBulkState: Dispatch<SetStateAction<BulkDeleteState>>;
  extraBySignature: Record<string, ExtraBucket>;
  setExtraBySignature: Dispatch<SetStateAction<Record<string, ExtraBucket>>>;
  pendingSignature: string | null;
  setPendingSignature: Dispatch<SetStateAction<string | null>>;
  markRefreshAfterLeave: () => void;
};

const InboxSelectionContext = createContext<InboxSelection | null>(null);

export function useInboxSelection() {
  const value = useContext(InboxSelectionContext);
  if (!value) {
    throw new Error("useInboxSelection debe usarse dentro del inbox.");
  }
  return value;
}

const InboxListStateContext = createContext<InboxListState | null>(null);

export function useInboxListState() {
  const value = useContext(InboxListStateContext);
  if (!value) {
    throw new Error("useInboxListState debe usarse dentro del inbox.");
  }
  return value;
}

/**
 * El estado de la lista vive en el layout: abrir la ficha cambia la page del
 * slot y, si viviera ahí, se perderían las páginas extra, la selección y el aviso.
 */
function InboxListStateProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [deleting, setDeleting] = useState(false);
  const [bulkState, setBulkState] = useState<BulkDeleteState>(initialBulkDeleteState);
  const [extraBySignature, setExtraBySignature] = useState<Record<string, ExtraBucket>>({});
  const [pendingSignature, setPendingSignature] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const refreshListAfterLeaveRef = useRef(false);

  useEffect(() => {
    if (!refreshListAfterLeaveRef.current || pathname !== "/testimonials") return;
    refreshListAfterLeaveRef.current = false;
    router.refresh();
  }, [pathname, router]);

  function markRefreshAfterLeave() {
    refreshListAfterLeaveRef.current = true;
  }

  return (
    <InboxListStateContext.Provider
      value={{
        selected,
        setSelected,
        deleting,
        setDeleting,
        bulkState,
        setBulkState,
        extraBySignature,
        setExtraBySignature,
        pendingSignature,
        setPendingSignature,
        markRefreshAfterLeave,
      }}
    >
      {children}
    </InboxListStateContext.Provider>
  );
}

function selectedIdFromPath(pathname: string) {
  const match = pathname.match(/^\/testimonials\/([^/]+)$/);
  return match?.[1];
}

/** Lista a la izquierda y ficha a la derecha, dentro del padding del shell. */
export function InboxShell({ list, children }: { list: ReactNode; children: ReactNode }) {
  return (
    <InboxFiltersProvider>
      <InboxListStateProvider>
        <InboxFrame list={list}>{children}</InboxFrame>
      </InboxListStateProvider>
    </InboxFiltersProvider>
  );
}

function InboxFrame({ list, children }: { list: ReactNode; children: ReactNode }) {
  const pathname = usePathname();
  const selectedId = selectedIdFromPath(pathname);
  const [pending, setPending] = useState<{ id: string; from: string } | null>(null);
  if (pending && selectedId === pending.id) {
    setPending(null);
  }
  const showLoading = Boolean(
    pending &&
      pending.id !== selectedId &&
      (pathname === pending.from || pathname === `/testimonials/${pending.id}`),
  );
  const activeId = showLoading ? pending?.id : selectedId;

  function onSelect(id: string) {
    setPending({ id, from: pathname });
  }

  return (
    <InboxSelectionContext.Provider value={{ activeId, onSelect }}>
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
          {list}
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
    </InboxSelectionContext.Provider>
  );
}
