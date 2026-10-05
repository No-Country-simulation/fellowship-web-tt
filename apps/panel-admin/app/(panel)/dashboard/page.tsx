import type { Metadata } from "next";
import { StatsOverview } from "@features/dashboard/components/StatsOverview";
import { getCurrentAppStats } from "@features/dashboard/infrastructure/repositories/appStatsRepository";
import { PageHeader, PageHeaderDescription, PageHeaderTitle } from "@shared/ui/patterns/PageHeader";

export const metadata: Metadata = { title: "Panel" };

/**
 * Patrón de cada página: Server Component que pide al repositorio y compone
 * componentes de la feature. La página no define presentación reutilizable.
 */
export default async function DashboardPage() {
  const stats = await getCurrentAppStats();

  return (
    <section className="space-y-6">
      <PageHeader>
        <PageHeaderTitle>Panel</PageHeaderTitle>
        <PageHeaderDescription>Vista general del entorno de simulación.</PageHeaderDescription>
      </PageHeader>
      <StatsOverview stats={stats} />
    </section>
  );
}
