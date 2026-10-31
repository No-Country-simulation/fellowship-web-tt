"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { cn } from "@repo/ui/utils";

import { boundInboxSearch, inboxHref, INBOX_SEARCH_MAX } from "../infrastructure/inboxQuery";
import { inboxItemMeta } from "../infrastructure/mappers/testimonialMapper";
import { initialBulkDeleteState, type BulkDeleteState } from "../types/reviewState";
import { BulkDeleteToolbar } from "./BulkDeleteToolbar";
import { CopyFormLinkButton } from "./CopyFormLinkButton";
import {
  BULK_DELETE_MAX,
  STATUS_LABELS,
  TESTIMONIAL_STATUSES,
  TESTIMONIAL_TYPES,
  TYPE_LABELS,
  type AdminInboxItem,
  type TestimonialStatus,
} from "../types/testimonial";
import { useInboxFilters } from "./InboxFilters";

/** Un valor vacío no viaja en la query: el server lo trataría como inválido. */
function submitInboxFilters(event: FormEvent<HTMLFormElement>) {
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
  items,
  loadError,
  selectedId,
  onSelect,
}: {
  formHref: string | null;
  items: AdminInboxItem[];
  loadError: string | null;
  selectedId?: string;
  onSelect?: (id: string) => void;
}) {
  const filters = useInboxFilters();
  const router = useRouter();
  // Selección efectiva: este set ∩ filas visibles. Sin efecto: al filtrar o al
  // desaparecer un borrado deja de contar; el que falló sigue en la lista y queda marcado.
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [deleting, setDeleting] = useState(false);
  const [bulkState, setBulkState] = useState<BulkDeleteState>(initialBulkDeleteState);
  const refreshListAfterLeave = useRef(false);
  const selectedStatus = items.find((item) => item.id === selectedId)?.status;
  // Sin ?status= el estado sigue al envío abierto. Si la persona eligió uno, queda en la URL.
  const status: TestimonialStatus = filters.status ?? selectedStatus ?? "in_review";
  const type = filters.type ?? "all";
  const query = filters.search;
  const filtering = query.trim() !== "" || type !== "all";
  const visible = useMemo(() => {
    const needle = normalize(query.trim());
    return items.filter(
      (item) =>
        item.status === status &&
        (type === "all" || item.type === type) &&
        (!needle ||
          normalize(item.fullName).includes(needle) ||
          normalize(item.quote).includes(needle)),
    );
  }, [items, status, type, query]);

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

  useEffect(() => {
    if (!refreshListAfterLeave.current || filters.pathname !== "/testimonials") return;
    refreshListAfterLeave.current = false;
    router.refresh();
  }, [filters.pathname, router]);

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
    refreshListAfterLeave.current = true;
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
          onSubmit={submitInboxFilters}
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
                  {STATUS_LABELS[value]}
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
      ) : visible.length === 0 && filtering ? (
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
      ) : visible.length === 0 ? (
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
      ) : (
        <ul className="flex flex-col gap-1 px-2 pb-4">
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
      )}
    </>
  );
}
