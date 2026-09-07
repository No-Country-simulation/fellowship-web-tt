import type { Metadata } from "next";

import { EnviarForm } from "@/components/enviar-form";
import { PageShell } from "@/components/page-shell";

export const metadata: Metadata = {
  title: "Enviar testimonio",
};

export default function EnviarPage() {
  return (
    <PageShell
      title="Contanos tu experiencia"
      description="Tu historia ayuda a otras personas a verse en este camino y le pone cara al trabajo que hiciste. No Country la usa para mostrar que esta simulación sirve de verdad."
    >
      <EnviarForm />
    </PageShell>
  );
}
