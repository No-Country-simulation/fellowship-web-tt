import type { Metadata } from "next";
import { SimulationStatusFilter } from "@features/simulations/components/SimulationStatusFilter";
import { SimulationsTable } from "@features/simulations/components/SimulationsTable";
import { listSimulations } from "@features/simulations/infrastructure/repositories/simulationRepository";
import type { SimulationStatus } from "@features/simulations/types/simulation";
import { PageHeader, PageHeaderDescription, PageHeaderTitle } from "@shared/ui/patterns/PageHeader";

export const metadata: Metadata = { title: "Simulaciones" };

const STATUSES: SimulationStatus[] = ["ACTIVE", "INSCRIPTION", "INCOMING", "CLOSED"];

interface Props {
  searchParams: Promise<{ status?: string }>;
}

export default async function SimulationsPage({ searchParams }: Props) {
  const { status: rawStatus } = await searchParams;
  // Parseo de searchParams en la página: nunca se confía en lo que viene en la URL.
  const status = STATUSES.find((value) => value === rawStatus);
  const simulations = await listSimulations({ status });

  return (
    <section className="space-y-6">
      <PageHeader>
        <PageHeaderTitle>Simulaciones</PageHeaderTitle>
        <PageHeaderDescription>Cohortes en curso, en inscripción y cerradas.</PageHeaderDescription>
      </PageHeader>
      <SimulationStatusFilter current={status} />
      <SimulationsTable simulations={simulations} />
    </section>
  );
}
