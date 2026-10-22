"use client";

import { createContext, useContext, type ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import {
  inboxHref,
  inboxQueryString,
  inboxShareExtra,
  readInboxQuery,
  type InboxQuery,
} from "../infrastructure/inboxQuery";
import { PageBackLink } from "@shared/ui/patterns/PageHeader";
import type { TestimonialStatus, TestimonialType } from "../types/testimonial";

type InboxFiltersController = {
  status: TestimonialStatus | null;
  type: TestimonialType | null;
  search: string;
  /** Path actual, para el `action` del formulario de búsqueda. */
  pathname: string;
  share: "ok" | "failed" | null;
  listHref: string;
  itemHref: (id: string) => string;
  /** Misma query, con los campos que se pisan. El resto se conserva. */
  href: (next: Partial<InboxQuery>) => string;
  /** Query válida para el campo oculto. El redirect no usa la URL del browser. */
  filtersField: string;
};

const InboxFiltersContext = createContext<InboxFiltersController | null>(null);

/**
 * Estado, tipo y búsqueda viven en la query, como en simulaciones y proyectos.
 * Sin `?status=`, la pestaña sale del envío abierto (lo resuelve la lista).
 * El layout no recibe searchParams: se leen acá.
 */
export function InboxFiltersProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = readInboxQuery(searchParams);
  const share = inboxShareExtra(searchParams)?.share ?? null;

  function href(next: Partial<InboxQuery>) {
    return inboxHref(
      pathname,
      {
        status: next.status !== undefined ? next.status : query.status,
        type: next.type !== undefined ? next.type : query.type,
        search: next.search !== undefined ? next.search : query.search,
      },
      share ? { share } : undefined,
    );
  }

  const value: InboxFiltersController = {
    status: query.status,
    type: query.type,
    search: query.search,
    pathname,
    share,
    listHref: inboxHref("/testimonials", query),
    itemHref: (id) => inboxHref(`/testimonials/${id}`, query, share ? { share } : undefined),
    href,
    filtersField: inboxQueryString(query),
  };

  return <InboxFiltersContext.Provider value={value}>{children}</InboxFiltersContext.Provider>;
}

export function useInboxFilters() {
  const value = useContext(InboxFiltersContext);
  if (!value) {
    throw new Error("useInboxFilters debe usarse dentro del inbox.");
  }
  return value;
}

export function InboxBackLink({ children }: { children: ReactNode }) {
  const { listHref } = useInboxFilters();
  return <PageBackLink href={listHref}>{children}</PageBackLink>;
}
