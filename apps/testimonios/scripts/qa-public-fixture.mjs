// Preloaded ONLY by the local browser QA server. Never imported by the application.
// Public queries receive synthetic rows; other external requests are blocked.
import { createRequire } from "node:module";
import { appendFile, readFile } from "node:fs/promises";
const require = createRequire(import.meta.url);
const sharp = createRequire(require.resolve("next/package.json"))("sharp");
const avatar = await sharp(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="104" height="104"><rect width="104" height="104" fill="#12132a"/><circle cx="52" cy="35" r="20" fill="#02beef"/><ellipse cx="52" cy="104" rx="42" ry="44" fill="#7983f5"/></svg>')).png().toBuffer();
const card = await sharp({ create: { width: 1080, height: 1350, channels: 3, background: "#12132a" } }).png().toBuffer();
const originalFetch = globalThis.fetch;
const row = {
  id: "00000000-0000-4000-8000-000000000001", slug: "historia-qa", type: "first_job",
  full_name: "Persona QA", country: "Argentina",
  story: "Historia sintética de QA. Trabajar en equipo me ayudó a desarrollar mis habilidades y preparar mi siguiente paso profesional.",
  quote: "Trabajar en equipo me ayudó a desarrollar mis habilidades.",
  avatar_path: "qa-avatar.png", capture_path: null, video_url: null,
  payload: { company: "Empresa QA", role_achieved: "Desarrollo QA" },
  published_at: "2026-11-01T12:00:00Z",
};
const rows = [row,
  { ...row, id: "00000000-0000-4000-8000-000000000002", slug: "simulacion-qa", type: "simulation", full_name: "Simulación QA", payload: { primary_role: "Desarrollo QA" } },
  { ...row, id: "00000000-0000-4000-8000-000000000003", slug: "reconversion-qa", type: "career_change", full_name: "Reconversión QA", payload: { previous_profession: "Docencia", new_role: "Desarrollo QA" } },
];

async function availabilityState() {
  if (process.env.QA_CAROUSEL_STATE) return JSON.parse(await readFile(process.env.QA_CAROUSEL_STATE, "utf8"));
  return { available: 10 };
}
async function fixtureFetch(input, init) {
  const url = new URL(typeof input === "string" || input instanceof URL ? input : input.url);
  const method = init?.method ?? (input instanceof Request ? input.method : "GET");
  if (url.pathname === "/rest/v1/testimonials_public" && method === "GET") {
    if (process.env.QA_CAROUSEL_AVAILABILITY) {
      await new Promise(resolve => setTimeout(resolve, Number(process.env.QA_CAROUSEL_PUBLIC_DELAY ?? 50)));
      const synthetic = Array.from({ length: 10 }, (_, index) => ({ ...rows[index % rows.length], id: `fixture-${index}`, slug: `availability-${process.env.QA_CAROUSEL_AVAILABILITY}-${index}` }));
      const slug = url.searchParams.get("slug");
      return Response.json(slug ? synthetic.filter(row => slug === `eq.${row.slug}`) : synthetic);
    }
    const slug = url.searchParams.get("slug");
    const visible = rows.slice(0, process.env.QA_CAROUSEL_COUNT === undefined ? 3 : Number(process.env.QA_CAROUSEL_COUNT))
      .map(row => {
        const variant = process.env.QA_CAROUSEL_DESIGN || process.env.QA_CAROUSEL_IMAGE_ERROR;
        return variant ? { ...row, slug: row.slug + "-" + variant } : row;
      });
    return Response.json(slug ? visible.filter(item => slug === `eq.${item.slug}`) : visible);
  }
  if (method === "HEAD" && url.pathname.startsWith("/storage/v1/object/public/share-cards/")) {
    if (process.env.QA_CAROUSEL_AVAILABILITY) {
      const state = await availabilityState();
      await new Promise((resolve, reject) => {
        const signal = init?.signal;
        const onAbort = () => { clearTimeout(timer); reject(new DOMException("Synthetic timeout", "AbortError")); };
        const timer = setTimeout(() => { signal?.removeEventListener("abort", onAbort); resolve(); }, state.delay ?? 50);
        if (signal?.aborted) onAbort(); else signal?.addEventListener("abort", onAbort, { once: true });
      });
      if (state.failure === "network") throw new TypeError("Synthetic HEAD failure");
      const index = Number(url.pathname.split("/").at(-2).split("-").at(-1));
      return new Response(null, { status: state.failure ? 503 : index < state.available ? 200 : 400, headers: { "content-type": "image/png" } });
    }
    return new Response(null, { status: process.env.QA_CAROUSEL_IMAGE_ERROR === "missing" ? 400 : process.env.QA_CAROUSEL_IMAGE_ERROR === "network" ? 503 : 200, headers: { "content-type": "image/png" } });
  }
  if (method === "GET" && url.pathname === "/storage/v1/object/public/avatars/qa-avatar.png") {
    return new Response(avatar, { headers: { "Content-Type": "image/png" } });
  }
  if (method === "GET" && url.pathname.startsWith("/storage/v1/object/public/share-cards/")) {
    const slug = url.pathname.split("/").at(-2);
    if (process.env.QA_CAROUSEL_AVAILABILITY) {
      const state = await availabilityState(), index = Number(slug.split("-").at(-1));
      if (state.failure || index >= state.available) return new Response(null, { status: state.failure ? 503 : 400 });
    }
    if (process.env.QA_CAROUSEL_IMAGE_ERROR === "missing") return new Response(null, { status: 404 });
    if (process.env.QA_CAROUSEL_IMAGE_ERROR === "invalid") return new Response("not an image", { headers: { "Content-Type": "image/png" } });
    if (process.env.QA_CAROUSEL_IMAGE_ERROR === "network") throw new TypeError("Synthetic storage network failure");
    const requested = process.env.QA_CAROUSEL_DESIGN;
    const designs = ["photo", "quote", "portrait", "offer", "journey", "shift", "profile"];
    const design = designs.includes(requested) ? requested : slug === "historia-qa" ? "offer" : slug === "simulacion-qa" ? "quote" : "shift";
    let image;
    try { image = await readFile(new URL(`../docs/ui/assets/carousel-optimized/generated/${design}.png`, import.meta.url)); }
    catch { image = card; }
    return new Response(image, { headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=3600" } });
  }
  if (url.protocol === "http:" && ["127.0.0.1", "localhost", "[::1]"].includes(url.hostname)) {
    return originalFetch(input, init);
  }
  throw new Error("QA blocked external request");
}

globalThis.fetch = async (input, init) => {
  const url = new URL(typeof input === "string" || input instanceof URL ? input : input.url);
  const method = init?.method ?? (input instanceof Request ? input.method : "GET");
  const kind = url.pathname === "/rest/v1/testimonials_public" ? "published-query" : url.pathname.includes("/share-cards/") ? method === "HEAD" ? "availability" : "optimizer-source" : null;
  const started = performance.now(); let status = null;
  try { const response = await fixtureFetch(input, init); status = response.status; return response; }
  finally {
    if (kind && process.env.QA_CAROUSEL_METRICS) await appendFile(process.env.QA_CAROUSEL_METRICS, JSON.stringify({ kind, method, status, startedMs: started, ms: performance.now() - started }) + "\n");
  }
};
