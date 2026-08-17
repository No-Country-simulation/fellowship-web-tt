/**
 * IA del chrome (header / footer) según la HF Empresa.
 * Rutas hijas todavía no existen: `PLACEHOLDER_HREF` o `disabled`.
 * No crear páginas vacías en este lote.
 */

export const PLACEHOLDER_HREF = "#"

export type NavLink = {
  label: string
  href: string
  disabled?: boolean
}

export type NavItem =
  | { type: "link"; label: string; href: string }
  | { type: "group"; label: string; children: NavLink[] }

export const headerNav: NavItem[] = [
  { type: "link", label: "Inicio", href: "/" },
  {
    type: "link",
    label: "Simulación Laboral",
    href: PLACEHOLDER_HREF,
  },
  { type: "link", label: "Para Talento", href: PLACEHOLDER_HREF },
  {
    type: "group",
    label: "Para Empresas",
    children: [
      { label: "Contratar", href: "/" },
      { label: "Producto", href: PLACEHOLDER_HREF },
      { label: "Empleabilidad", href: PLACEHOLDER_HREF },
      { label: "Expansión de tu marca", href: PLACEHOLDER_HREF },
    ],
  },
  { type: "link", label: "Showcase", href: PLACEHOLDER_HREF },
  {
    type: "group",
    label: "Sobre Nosotros",
    children: [
      { label: "Casos", href: PLACEHOLDER_HREF },
      { label: "Manifiesto", href: PLACEHOLDER_HREF },
    ],
  },
]

export const loginNav: NavLink = {
  label: "Iniciar sesión",
  href: PLACEHOLDER_HREF,
}

export const footerNavegacion: NavLink[] = [
  { label: "Showcase", href: PLACEHOLDER_HREF },
  { label: "Para Talento", href: PLACEHOLDER_HREF },
  { label: "Para Empresas", href: "/" },
  { label: "Sobre No Country", href: PLACEHOLDER_HREF },
]

export const footerShowcase: NavLink[] = [
  { label: "Ver todos los proyectos", href: PLACEHOLDER_HREF },
]

export const footerPlataforma: NavLink[] = [
  { label: "Talento", href: PLACEHOLDER_HREF },
  { label: "Empresas", href: "/" },
]

export const footerTagline = "Evidenciemos el valor del talento digital"

export const footerCopyright = "Copyright © 2026 Todos los derechos reservados"

export const footerPrivacy: NavLink = {
  label: "Políticas de Privacidad",
  href: PLACEHOLDER_HREF,
}

/** Slots de redes: la HF no lista URLs. */
export const socialSlotCount = 3

export function isNavGroup(
  item: NavItem
): item is Extract<NavItem, { type: "group" }> {
  return item.type === "group"
}
