// Preloaded ONLY by the local browser QA server. Never imported by the application.
// Public queries receive synthetic rows; other external requests are blocked.
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

globalThis.fetch = async (input, init) => {
  const url = new URL(typeof input === "string" || input instanceof URL ? input : input.url);
  const method = init?.method ?? (input instanceof Request ? input.method : "GET");
  if (url.pathname === "/rest/v1/testimonials_public" && method === "GET") {
    const slug = url.searchParams.get("slug");
    return Response.json(slug && slug !== "eq.historia-qa" ? [] : [row]);
  }
  if (url.protocol === "http:" && ["127.0.0.1", "localhost", "[::1]"].includes(url.hostname)) {
    return originalFetch(input, init);
  }
  throw new Error("QA blocked external request");
};
