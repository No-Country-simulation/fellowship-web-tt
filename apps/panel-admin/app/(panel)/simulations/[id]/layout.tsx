import { notFound } from "next/navigation";
import { SimulationStatusBadge } from "@features/simulations/components/SimulationStatusBadge";
import { SimulationTabs } from "@features/simulations/components/SimulationTabs";
import { getSimulationById } from "@features/simulations/infrastructure/repositories/simulationRepository";
import { PageBackLink, PageHeader, PageHeaderTitle } from "@shared/ui/patterns/PageHeader";

/** Layout anidado: encabezado + pestañas compartidos por todas las sub-rutas de una simulación. */
export default async function SimulationLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const simulation = await getSimulationById(id);
  if (!simulation) notFound();

  return (
    <section className="space-y-6">
      <PageHeader>
        <PageBackLink href="/simulations">Simulaciones</PageBackLink>
        <div className="flex items-center gap-3">
          <PageHeaderTitle>{simulation.name}</PageHeaderTitle>
          <SimulationStatusBadge status={simulation.status} />
        </div>
      </PageHeader>
      <SimulationTabs simulationId={simulation.id} />
      {children}
    </section>
  );
}
