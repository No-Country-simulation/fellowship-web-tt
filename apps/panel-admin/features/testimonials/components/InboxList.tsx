"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { cn } from "@repo/ui/utils";

import { inboxItemMeta } from "../infrastructure/mappers/testimonialMapper";
import {
  STATUS_LABELS,
  TESTIMONIAL_STATUSES,
  TESTIMONIAL_TYPES,
  TYPE_LABELS,
  type AdminInboxItem,
  type TestimonialStatus,
  type TestimonialType,
} from "../types/testimonial";

function normalize(value: string) {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

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
  const [query, setQuery] = useState("");
  const [type, setType] = useState<TestimonialType | "all">("all");
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

  return (
    <>
      <div className="flex flex-col gap-2 px-3 py-3">
        {selectedId ? null : <h1 className="sr-only">Inbox de testimonios</h1>}
        <div role="search" className="flex gap-1">
          <div className="relative min-w-0 flex-1">
            <Search
              aria-hidden
              className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar nombre o cita"
              aria-label="Buscar testimonios"
              className="h-8 w-full rounded-md border border-input bg-background pl-7 pr-7 text-admin-caption text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-search-cancel-button]:hidden"
            />
            {query ? (
              <button
                type="button"
                aria-label="Limpiar búsqueda"
                className="absolute right-1 top-1/2 flex size-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded text-muted-foreground hover:text-foreground"
                onClick={() => setQuery("")}
              >
                <X aria-hidden className="size-3.5" />
              </button>
            ) : null}
          </div>
          <select
            value={type}
            onChange={(event) => setType(event.target.value as TestimonialType | "all")}
            aria-label="Filtrar por tipo"
            className={`h-8 w-28 shrink-0 cursor-pointer rounded-md border bg-background px-1.5 text-admin-caption outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              type === "all" ? "border-input text-muted-foreground" : "border-primary text-foreground"
            }`}
          >
            <option value="all">Todos</option>
            {TESTIMONIAL_TYPES.map((value) => (
              <option key={value} value={value}>
                {TYPE_LABELS[value]}
              </option>
            ))}
          </select>
        </div>
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
                  "flex min-w-0 cursor-pointer flex-col items-center rounded-md border px-1 py-1.5 text-center leading-tight",
                  active
                    ? "border-primary bg-muted text-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
                )}
                onClick={() => setStatus(value)}
              >
                <span className="max-w-full truncate text-admin-caption">{STATUS_LABELS[value]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {loadError ? (
        <p className="px-4 pb-4 text-admin-body text-destructive" role="alert">
          {loadError}
        </p>
      ) : visible.length === 0 && filtering ? (
        <div className="mx-3 mb-4 rounded-lg border border-dashed border-border bg-muted p-4">
          <p className="text-admin-caption text-muted-foreground">
            Ningún testimonio de esta pestaña coincide con los filtros.
          </p>
          <button
            type="button"
            className="mt-2 cursor-pointer text-admin-caption text-primary hover:underline"
            onClick={() => {
              setQuery("");
              setType("all");
            }}
          >
            Limpiar filtros
          </button>
        </div>
      ) : visible.length === 0 ? (
        <div className="mx-3 mb-4 rounded-lg border border-dashed border-border bg-muted p-4">
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
