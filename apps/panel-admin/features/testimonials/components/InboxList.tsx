"use client";

import { useMemo, useRef, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { buttonVariants } from "@repo/ui/button";
import { cn } from "@repo/ui/utils";

import { loadInboxPage } from "../actions/testimonialActions";
import { boundInboxSearch, inboxHref, INBOX_SEARCH_MAX } from "../infrastructure/inboxQuery";
import { inboxItemMeta } from "../infrastructure/mappers/testimonialMapper";
import type { BulkDeleteState } from "../types/reviewState";
import { BulkDeleteToolbar } from "./BulkDeleteToolbar";
import { CopyFormLinkButton } from "./CopyFormLinkButton";
import { useInboxListState, useInboxSelection } from "./InboxShell";
import {
  BULK_DELETE_MAX,
  INBOX_PAGE_SIZE,
  STATUS_LABELS,
  TESTIMONIAL_STATUSES,
  TESTIMONIAL_TYPES,
  TYPE_LABELS,
  type AdminInboxItem,
  type InboxPageCursor,
  type InboxPageSlice,
  type InboxStatusCounts,
  type TestimonialStatus,
} from "../types/testimonial";
import { useInboxFilters } from "./InboxFilters";

const EMPTY_PAGES: InboxPageSlice[] = [];
const morePageError = "No pudimos cargar más testimonios. Probá de nuevo.";

/** Firma de la primera página: estado, total y ids crudos en orden. */
function inboxPageSignature(
  status: TestimonialStatus,
  total: number | null,
  rowIds: readonly string[],
) {
  return `${status}\n${total === null ? "" : String(total)}\n${rowIds.join("\n")}`;
}

function omittedLabel(count: number) {
  return count === 1 ? "Quedó 1 afuera." : `Quedaron ${count} afuera.`;
}

function statusOptionLabel(value: TestimonialStatus, count: number | null) {
  const label = STATUS_LABELS[value];
  return count === null ? label : `${label} (${count})`;
}

/** Un valor vacío no viaja en la query: el server lo trataría como inválido. */
function submitInboxFilters(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
  const form = event.currentTarget;
  const search = form.elements.namedItem("s");
  if (search instanceof HTMLInputElement) {
    const bounded = boundInboxSearch(search.value).trim();
    search.value = bounded;
    if (!bounded) search.removeAttribute("name");
  }
  const typeField = form.elements.namedItem("type");
  if (typeField instanceof HTMLSelectElement && typeField.value === "all") {
    typeField.removeAttribute("name");
  }
}

function normalize(value: string) {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

function filterSelectClass(isDefault: boolean) {
  // Sin cn: tailwind-merge trata text-admin-caption como color y lo pisa.
  return [
    "h-8 w-full min-w-0 cursor-pointer rounded-md border bg-background px-1.5 text-admin-caption outline-none focus-visible:ring-2 focus-visible:ring-ring",
    isDefault ? "border-input text-muted-foreground" : "border-primary text-foreground",
  ].join(" ");
}

export function InboxList({
  formHref,
  status,
  items,
  rowIds,
  omitted,
  cursor,
  counts,
  loadError,
}: {
  formHref: string | null;
  status: TestimonialStatus;
  items: AdminInboxItem[];
  rowIds: string[];
  omitted: number;
  cursor: InboxPageCursor | null;
  counts: InboxStatusCounts;
  loadError: string | null;
}) {
  const filters = useInboxFilters();
  const { activeId: selectedId, onSelect } = useInboxSelection();
  const {
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
  } = useInboxListState();
  const inFlightRef = useRef<string | null>(null);
  const router = useRouter();
  // Selección efectiva: este set ∩ filas visibles. Sin efecto: al filtrar o al
  // desaparecer un borrado deja de contar; el que falló sigue en la lista y queda marcado.
  const type = filters.type ?? "all";
  const query = filters.search;
  const filtering = query.trim() !== "" || type !== "all";
  // Se comparan en el render. Si la primera página cambió, esas páginas no se usan.
  const signature = inboxPageSignature(status, counts[status], rowIds);
  const bucket = extraBySignature[signature];
  const extraPages = loadError ? EMPTY_PAGES : (bucket?.pages ?? EMPTY_PAGES);
  const moreError = loadError ? null : (bucket?.error ?? null);
  const loadingMore = pendingSignature === signature;
  const allItems = useMemo(() => {
    if (loadError) return [];
    if (extraPages.length === 0) return items;
    return extraPages.reduce<AdminInboxItem[]>((all, page) => all.concat(page.items), items);
  }, [loadError, items, extraPages]);
  const visible = useMemo(() => {
    const needle = normalize(query.trim());
    return allItems.filter(
      (item) =>
        item.status === status &&
        (type === "all" || item.type === type) &&
        (!needle ||
          normalize(item.fullName).includes(needle) ||
          normalize(item.quote).includes(needle)),
    );
  }, [allItems, status, type, query]);
  const requestedRows =
    (loadError ? 0 : rowIds.length) + extraPages.reduce((sum, page) => sum + page.rowIds.length, 0);
  const latestRows = loadError
    ? 0
    : extraPages.length > 0
      ? (extraPages[extraPages.length - 1]?.rowIds.length ?? 0)
      : rowIds.length;
  const total = counts[status];
  const hasMore = latestRows === INBOX_PAGE_SIZE && (total === null || total > requestedRows);
  const totalOmitted =
    (loadError ? 0 : omitted) + extraPages.reduce((sum, page) => sum + page.omitted, 0);
  const nothingValid = allItems.length === 0;
  const showOmitted = totalOmitted > 0;
  const showFilterEmpty =
    visible.length === 0 && filtering && !hasMore && !(nothingValid && totalOmitted > 0);
  const showStatusEmpty = visible.length === 0 && !filtering && nothingValid && totalOmitted === 0;

  const rejectedTab = status === "rejected";
  const matchedSelection = rejectedTab ? visible.filter((item) => selected.has(item.id)) : [];
  const selectedItems = matchedSelection.slice(0, BULK_DELETE_MAX);
  const droppedSelection = matchedSelection.slice(BULK_DELETE_MAX);
  if (droppedSelection.length > 0) {
    setSelected((current) => {
      const next = new Set(current);
      let changed = false;
      for (const item of droppedSelection) {
        if (next.delete(item.id)) changed = true;
      }
      return changed ? next : current;
    });
  }
  const selectable = visible.slice(0, BULK_DELETE_MAX);
  const allSelected =
    rejectedTab && selectable.length > 0 && selectable.every((item) => selected.has(item.id));
  const atCap = selectedItems.length >= BULK_DELETE_MAX;
  const selectedVisibleIds = new Set(selectedItems.map((item) => item.id));

  async function loadMore() {
    if (loadError || inFlightRef.current === signature) return;
    const pages = extraPages;
    const nextCursor = pages.length > 0 ? (pages[pages.length - 1]?.cursor ?? null) : cursor;
    if (!nextCursor) {
      setExtraBySignature((current) => ({
        ...current,
        [signature]: { pages, error: morePageError },
      }));
      return;
    }

    inFlightRef.current = signature;
    setPendingSignature(signature);
    let result: Awaited<ReturnType<typeof loadInboxPage>>;
    try {
      result = await loadInboxPage({ status, cursor: nextCursor });
    } catch (error) {
      if (isFrameworkNavigationError(error)) throw error;
      result = { ok: false, message: morePageError };
    } finally {
      if (inFlightRef.current === signature) inFlightRef.current = null;
      setPendingSignature((current) => (current === signature ? null : current));
    }

    setExtraBySignature((current) => {
      const prev = current[signature]?.pages ?? [];
      if (!result.ok) {
        return { ...current, [signature]: { pages: prev, error: result.message } };
      }
      return { ...current, [signature]: { pages: [...prev, result.page], error: null } };
    });
  }

  function toggleItem(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
        return next;
      }
      const visibleSelected = visible.filter((item) => next.has(item.id)).length;
      if (visibleSelected >= BULK_DELETE_MAX) return current;
      next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((current) => {
      const next = new Set(current);
      const capped = visible.slice(0, BULK_DELETE_MAX);
      const allOn = capped.length > 0 && capped.every((item) => next.has(item.id));
      for (const item of visible) next.delete(item.id);
      if (!allOn) {
        for (const item of capped) next.add(item.id);
      }
      return next;
    });
  }

  function handleDeleted(result: BulkDeleteState) {
    setBulkState(result);
    if (result.status !== "done") return;

    const gone = new Set(result.deletedIds);
    if (gone.size > 0) {
      setSelected((current) => {
        const next = new Set(current);
        for (const id of gone) next.delete(id);
        return next;
      });
    }

    if (!selectedId || !gone.has(selectedId)) {
      router.refresh();
      return;
    }
    // Con ?status= se usa listHref (conserva status, tipo y búsqueda).
    // Si la pestaña Rechazados salió del envío abierto, se fija status para no caer en En revisión.
    // Se sale de la ficha antes de refrescar: refrescar esa ruta, ya borrada, muestra un 404.
    const href = filters.status
      ? filters.listHref
      : inboxHref("/testimonials", {
          status: "rejected",
          type: filters.type,
          search: filters.search,
        });
    if (filters.pathname === "/testimonials") {
      router.replace(href, { scroll: false });
      router.refresh();
      return;
    }
    markRefreshAfterLeave();
    router.replace(href, { scroll: false });
  }

  return (
    <>
      <div className="flex flex-col gap-2 px-3 py-3">
        {selectedId ? null : <h1 className="sr-only">Inbox de testimonios</h1>}
        <form
          key={`${query}:${type}`}
          role="search"
          action={filters.pathname}
          className="flex flex-col gap-1"
          onSubmit={(event) => {
            submitInboxFilters(event);
            const params = new URLSearchParams();
            for (const [key, value] of new FormData(event.currentTarget)) {
              if (typeof value === "string") params.append(key, value);
            }
            const qs = params.toString();
            router.push(qs ? `${filters.pathname}?${qs}` : filters.pathname, { scroll: false });
          }}
        >
          {filters.share ? <input type="hidden" name="share" value={filters.share} /> : null}
          <div
            className={cn(
              "grid items-start gap-1",
              formHref ? "grid-cols-[minmax(0,4fr)_minmax(0,1fr)]" : "grid-cols-1",
            )}
          >
            <div className="relative min-w-0">
              <Search
                aria-hidden
                className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="search"
                name="s"
                defaultValue={query}
                maxLength={INBOX_SEARCH_MAX}
                placeholder="Buscar nombre o cita"
                aria-label="Buscar testimonios"
                className="h-8 w-full rounded-md border border-input bg-background pl-7 pr-7 text-admin-caption text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-search-cancel-button]:hidden"
              />
              {query ? (
                <Link
                  href={filters.href({ search: "" })}
                  scroll={false}
                  aria-label="Limpiar búsqueda"
                  className="absolute right-1 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded text-muted-foreground hover:text-foreground"
                >
                  <X aria-hidden className="size-3.5" />
                </Link>
              ) : null}
            </div>
            <CopyFormLinkButton href={formHref} compact />
          </div>
          <div className="grid grid-cols-2 gap-1">
            <select
              key={status}
              name="status"
              defaultValue={status}
              aria-label="Filtrar por estado"
              className={filterSelectClass(status === "in_review")}
              onChange={(event) => {
                event.currentTarget.form?.requestSubmit();
              }}
            >
              {TESTIMONIAL_STATUSES.map((value) => (
                <option key={value} value={value}>
                  {statusOptionLabel(value, counts[value])}
                </option>
              ))}
            </select>
            <select
              name="type"
              defaultValue={type}
              aria-label="Filtrar por tipo"
              className={filterSelectClass(type === "all")}
              onChange={(event) => {
                const select = event.currentTarget;
                if (select.value === "all") select.removeAttribute("name");
                else select.name = "type";
                select.form?.requestSubmit();
              }}
            >
              <option value="all">Todos</option>
              {TESTIMONIAL_TYPES.map((value) => (
                <option key={value} value={value}>
                  {TYPE_LABELS[value]}
                </option>
              ))}
            </select>
          </div>
        </form>
      </div>

      {rejectedTab && (visible.length > 0 || bulkState.status !== "idle") ? (
        <BulkDeleteToolbar
          visibleCount={visible.length}
          selectedCount={selectedItems.length}
          allSelected={allSelected}
          overMax={visible.length > BULK_DELETE_MAX}
          ids={selectedItems.map((item) => item.id)}
          names={selectedItems.map((item) => item.fullName)}
          deleting={deleting}
          state={bulkState}
          onToggleAll={toggleAll}
          onDeletingChange={setDeleting}
          onResult={handleDeleted}
        />
      ) : null}

      {loadError ? (
        <p className="px-4 pb-4 text-admin-body text-destructive" role="alert">
          {loadError}
        </p>
      ) : (
        <>
          {visible.length > 0 ? (
            <ul className="flex flex-col gap-1 px-2 pb-2">
              {visible.map((item) => {
                const current = item.id === selectedId;
                const checked = selectedVisibleIds.has(item.id);
                const link = (
                  <Link
                    href={filters.itemHref(item.id)}
                    aria-current={current ? "page" : undefined}
                    className={cn(
                      "flex min-w-0 items-center gap-2 rounded-lg border px-2 py-2 transition-colors",
                      rejectedTab && "flex-1",
                      current
                        ? "border-primary bg-muted"
                        : "border-transparent hover:border-border hover:bg-muted",
                    )}
                    onClick={() => {
                      if (item.id !== selectedId) {
                        onSelect(item.id);
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
                );

                if (!rejectedTab) {
                  return <li key={item.id}>{link}</li>;
                }

                return (
                  <li key={item.id} className="flex items-center">
                    <label
                      className={cn(
                        "flex size-11 shrink-0 items-center justify-center",
                        deleting || (atCap && !checked) ? "cursor-not-allowed" : "cursor-pointer",
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={deleting || (atCap && !checked)}
                        aria-label={`Seleccionar ${item.fullName}`}
                        className="size-4 accent-primary outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed"
                        onChange={() => toggleItem(item.id)}
                      />
                    </label>
                    {link}
                  </li>
                );
              })}
            </ul>
          ) : null}

          {showOmitted ? (
            <p className="px-4 pb-4 text-admin-caption text-muted-foreground">{omittedLabel(totalOmitted)}</p>
          ) : null}

          {showFilterEmpty ? (
            <div className="mx-3 mb-4 rounded-lg border border-dashed border-border bg-muted p-4">
              <p className="text-admin-caption text-muted-foreground">
                Ningún testimonio de este estado coincide con los filtros.
              </p>
              <Link
                href={filters.href({ type: null, search: "" })}
                scroll={false}
                className="mt-2 text-admin-caption text-primary hover:underline"
              >
                Limpiar filtros
              </Link>
            </div>
          ) : null}

          {showStatusEmpty ? (
            <div className="mx-3 mb-4 rounded-lg border border-dashed border-border bg-muted p-4">
              <p className="text-admin-micro uppercase tracking-wide text-muted-foreground">
                {STATUS_LABELS[status]}
              </p>
              <p className="mt-1 text-admin-caption text-muted-foreground">
                {status === "in_review"
                  ? formHref
                    ? "No hay envíos pendientes. Cuando alguien complete el formulario, aparece acá."
                    : "No hay envíos pendientes. Cuando alguien complete /enviar, aparece acá."
                  : status === "archived"
                    ? "No hay testimonios archivados."
                    : `No hay testimonios con estado ${STATUS_LABELS[status].toLowerCase()}.`}
              </p>
              {status === "in_review" && formHref ? (
                <div className="mt-2">
                  <CopyFormLinkButton href={formHref} />
                </div>
              ) : null}
            </div>
          ) : null}

          {moreError ? (
            <div className="px-4 pb-3" role="alert">
              <p className="text-admin-body text-destructive">{moreError}</p>
              <button
                type="button"
                className="mt-2 text-admin-caption text-primary hover:underline disabled:opacity-50"
                disabled={loadingMore}
                onClick={() => void loadMore()}
              >
                Reintentar
              </button>
            </div>
          ) : null}

          {hasMore && !moreError ? (
            <button
              type="button"
              className={cn(buttonVariants({ variant: "outline" }), "mx-3 mb-4 w-[calc(100%-1.5rem)]")}
              disabled={loadingMore}
              onClick={() => void loadMore()}
            >
              Cargar más
            </button>
          ) : null}
        </>
      )}
    </>
  );
}

function isFrameworkNavigationError(error: unknown) {
  if (typeof error !== "object" || error === null || !("digest" in error)) return false;
  const digest = (error as { digest?: unknown }).digest;
  return typeof digest === "string" && digest.startsWith("NEXT_");
}
