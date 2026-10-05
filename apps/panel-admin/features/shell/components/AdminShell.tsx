import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

/**
 * Esqueleto de todas las pantallas protegidas: menú lateral + barra superior + contenido.
 * En admin-panel-v2 vive en `features/dashboard/components/DashboardShell.tsx`.
 */
export function AdminShell({ userLabel, children }: { userLabel: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex min-w-0 flex-1 flex-col">
        <Topbar userLabel={userLabel} />
        <div className="flex-1 px-8 py-6">{children}</div>
      </main>
    </div>
  );
}
