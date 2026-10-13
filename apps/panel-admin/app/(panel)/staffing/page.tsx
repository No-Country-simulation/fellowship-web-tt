import type { Metadata } from "next";
import { TalentsTable } from "@features/staffing/components/TalentsTable";
import { listTalents } from "@features/staffing/infrastructure/repositories/talentRepository";
import { PageHeader, PageHeaderDescription, PageHeaderTitle } from "@shared/ui/patterns/PageHeader";

export const metadata: Metadata = { title: "Staffing" };

export default async function StaffingPage() {
  const talents = await listTalents();

  return (
    <section className="space-y-6">
      <PageHeader>
        <PageHeaderTitle>Staffing</PageHeaderTitle>
        <PageHeaderDescription>Talentos con simulaciones completadas, listos para proponer a empresas.</PageHeaderDescription>
      </PageHeader>
      <TalentsTable talents={talents} />
    </section>
  );
}
