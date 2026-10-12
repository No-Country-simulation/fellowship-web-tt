/** Ítems del menú lateral. Mismas secciones que admin-panel-v2. */
export const NAV_ITEMS = [
  { href: "/dashboard", label: "Panel", icon: "gauge" },
  { href: "/simulations", label: "Simulaciones", icon: "layers" },
  { href: "/completion", label: "Completitud", icon: "clipboard" },
  { href: "/projects", label: "Proyectos", icon: "folder" },
  { href: "/staffing", label: "Staffing", icon: "users" },
  { href: "/testimonials", label: "Testimonios", icon: "quote" },
] as const;

export type NavIcon = (typeof NAV_ITEMS)[number]["icon"];
