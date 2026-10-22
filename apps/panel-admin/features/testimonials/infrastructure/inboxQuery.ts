import {
  isTestimonialStatus,
  isTestimonialType,
  type TestimonialStatus,
  type TestimonialType,
} from "../types/testimonial";

/** Tope de `?s=`. La búsqueda filtra en memoria y vuelve en el redirect. */
export const INBOX_SEARCH_MAX = 100;

export const INBOX_FILTERS_FIELD = "filters";

const INBOX_FILTERS_FIELD_MAX = 2048;

function stripControls(value: string): string {
  return value.replace(/[\u0000-\u001F\u007F]/g, "");
}

function hasControls(value: string): boolean {
  return /[\u0000-\u001F\u007F]/.test(value);
}

export type InboxQuery = {
  status: TestimonialStatus | null;
  type: TestimonialType | null;
  search: string;
};

type ParamSource = {
  get(name: string): string | null;
};

export function emptyInboxQuery(): InboxQuery {
  return { status: null, type: null, search: "" };
}

export function boundInboxSearch(value: string | null | undefined): string {
  if (!value) return "";
  return stripControls(value).slice(0, INBOX_SEARCH_MAX);
}

/** Lee `status`, `type` y `s`. Cualquier otro valor se ignora. */
export function readInboxQuery(source: ParamSource): InboxQuery {
  const status = source.get("status");
  const type = source.get("type");
  return {
    status: status && isTestimonialStatus(status) ? status : null,
    type: type && isTestimonialType(type) ? type : null,
    search: boundInboxSearch(source.get("s")),
  };
}

export function inboxQueryString(query: InboxQuery): string {
  const params = new URLSearchParams();
  if (query.status && isTestimonialStatus(query.status)) {
    params.set("status", query.status);
  }
  if (query.type && isTestimonialType(query.type)) {
    params.set("type", query.type);
  }
  const search = boundInboxSearch(query.search);
  if (search.trim()) params.set("s", search);
  return params.toString();
}

type MultiParamSource = {
  getAll(name: string): string[];
};

/**
 * `status`, `type` o `s` repetidos, fuera de la lista, o una búsqueda que no
 * cabe en el tope. Esos valores no tienen que quedar en la URL.
 */
export function inboxSearchNeedsCleanup(source: MultiParamSource): boolean {
  const statuses = source.getAll("status");
  if (statuses.length > 1 || (statuses[0] !== undefined && !isTestimonialStatus(statuses[0]))) {
    return true;
  }

  const types = source.getAll("type");
  if (types.length > 1 || (types[0] !== undefined && !isTestimonialType(types[0]))) {
    return true;
  }

  const searches = source.getAll("s");
  if (searches.length > 1) return true;
  const search = searches[0];
  if (search !== undefined && (search !== boundInboxSearch(search) || !search.trim())) {
    return true;
  }

  return false;
}

/** `?share=ok` o `?share=failed`, si vino. El resto se descarta. */
export function inboxShareExtra(source: ParamSource): { share: "ok" | "failed" } | undefined {
  const share = source.get("share");
  return share === "ok" || share === "failed" ? { share } : undefined;
}

/** Misma forma que usa el redirect: filtros válidos y, si vino, `share`. */
export function canonicalInboxHref(path: string, source: ParamSource & MultiParamSource): string {
  return inboxHref(path, readInboxQuery(source), inboxShareExtra(source));
}

export function inboxParamsFromRecord(
  raw: Record<string, string | string[] | undefined>,
): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === "string") {
      params.append(key, value);
    } else if (Array.isArray(value)) {
      for (const item of value) params.append(key, item);
    }
  }
  return params;
}

/** Arma un path propio del panel. `extra` lo define el server (por ejemplo `share`). */
export function inboxHref(
  path: string,
  query: InboxQuery,
  extra?: Record<string, string>,
): string {
  const params = new URLSearchParams(inboxQueryString(query));
  if (extra) {
    for (const [key, value] of Object.entries(extra)) {
      params.set(key, value);
    }
  }
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

/**
 * Campo oculto del formulario. No se usa el string crudo: solo estado y tipo
 * conocidos, y una búsqueda acotada. Si el valor no cumple, no hay filtros.
 */
export function inboxQueryFromField(raw: unknown): InboxQuery {
  if (typeof raw !== "string" || raw.length === 0 || raw.length > INBOX_FILTERS_FIELD_MAX) {
    return emptyInboxQuery();
  }
  if (raw.includes("://") || raw.startsWith("/") || hasControls(raw)) {
    return emptyInboxQuery();
  }
  const body = raw.startsWith("?") ? raw.slice(1) : raw;
  const parsed = readInboxQuery(new URLSearchParams(body));
  return { ...parsed, search: parsed.search.trim() };
}
