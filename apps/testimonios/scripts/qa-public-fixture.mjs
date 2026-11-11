// Preloaded ONLY by the local browser QA server. Never imported by the application.
// Public queries receive synthetic rows; other external requests are blocked.
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const sharp = createRequire(require.resolve("next/package.json"))("sharp");
const avatar = await sharp(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="104" height="104"><rect width="104" height="104" fill="#12132a"/><circle cx="52" cy="35" r="20" fill="#02beef"/><ellipse cx="52" cy="104" rx="42" ry="44" fill="#7983f5"/></svg>')).png().toBuffer();
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

globalThis.fetch = async (input, init) => {
  const url = new URL(typeof input === "string" || input instanceof URL ? input : input.url);
  const method = init?.method ?? (input instanceof Request ? input.method : "GET");
  if (url.pathname === "/rest/v1/testimonials_public" && method === "GET") {
    const slug = url.searchParams.get("slug");
    return Response.json(slug ? rows.filter(item => slug === `eq.${item.slug}`) : rows);
  }
  if (method === "GET" && url.pathname === "/storage/v1/object/public/avatars/qa-avatar.png") {
    return new Response(avatar, { headers: { "Content-Type": "image/png" } });
  }
  if (url.protocol === "http:" && ["127.0.0.1", "localhost", "[::1]"].includes(url.hostname)) {
    return originalFetch(input, init);
  }
  throw new Error("QA blocked external request");
};
