import { AdminShell } from "@features/shell/components/AdminShell";

/**
 * Todo lo que cuelga de `(panel)/` se dibuja dentro del shell (sidebar + topbar).
 * El paréntesis es un route group: agrupa sin agregar segmento a la URL.
 */
export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell userLabel="Admin Demo">{children}</AdminShell>;
}
