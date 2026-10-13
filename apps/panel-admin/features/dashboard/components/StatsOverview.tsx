import { MetricCard } from "@shared/ui/patterns/MetricCard";
import { SectionCard } from "@shared/ui/patterns/SectionCard";
import type { AppStats } from "../types/appStats";

export function StatsOverview({ stats }: { stats: AppStats }) {
  const max = Math.max(...stats.byVertical.map((item) => item.talents));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Simulaciones activas" value={stats.activeSimulations} />
        <MetricCard label="Talentos inscriptos" value={stats.enrolledTalents} />
        <MetricCard label="Equipos activos" value={stats.activeTeams} />
        <MetricCard label="Proyectos" value={stats.projects} />
      </div>

      {/* En el panel real es un gráfico de ECharts; acá alcanza con barras de CSS. */}
      <SectionCard title="Talentos por vertical">
        <ul className="space-y-3">
          {stats.byVertical.map((item) => (
            <li key={item.vertical} className="grid grid-cols-[120px_1fr_48px] items-center gap-3 text-admin-body">
              <span className="text-muted-foreground">{item.vertical}</span>
              <span className="h-2 rounded-full bg-muted">
                <span
                  className="block h-2 rounded-full bg-primary"
                  style={{ width: `${(item.talents / max) * 100}%` }}
                />
              </span>
              <span className="text-right tabular-nums">{item.talents}</span>
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}
