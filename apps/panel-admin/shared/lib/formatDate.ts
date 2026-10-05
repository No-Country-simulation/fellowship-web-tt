const shortDate = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/** Fechas date-only (el back las manda como medianoche UTC). */
export function formatShortDate(iso: string): string {
  return shortDate.format(new Date(iso));
}
