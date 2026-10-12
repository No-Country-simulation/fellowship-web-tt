import type { Metadata } from "next";
import { CompletionTable } from "@features/completion/components/CompletionTable";
import { listCompletion } from "@features/completion/infrastructure/repositories/completionRepository";
import { PageHeader, PageHeaderDescription, PageHeaderTitle } from "@shared/ui/patterns/PageHeader";

export const metadata: Metadata = { title: "Completitud" };

export default async function CompletionPage() {
  const rows = await listCompletion();

  return (
    <section className="space-y-6">
      <PageHeader>
        <PageHeaderTitle>Completitud</PageHeaderTitle>
        <PageHeaderDescription>Quién completó la simulación según asistencia y entregables.</PageHeaderDescription>
      </PageHeader>
      <CompletionTable rows={rows} />
    </section>
  );
}
