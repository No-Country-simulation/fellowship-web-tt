import type { Metadata } from "next";
import { MessageSquareQuote } from "lucide-react";

import { EnviarForm } from "@/components/enviar-form";

export const metadata: Metadata = {
  title: "Enviar testimonio",
};

export default function EnviarPage() {
  return (
    <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto px-md py-md md:py-lg">
      <div className="container-content max-w-3xl">
        <header className="flex items-center gap-lg">
          <div className="min-w-0 flex-1">
            <span aria-hidden="true" className="mb-sm hidden h-1 w-12 rounded-full bg-brand-gradient md:block" />
            <h1 className="type-section text-text-primary">Contanos tu experiencia</h1>
            <p className="mt-xs max-w-[44rem] text-body leading-normal text-text-secondary md:mt-sm md:text-body-large md:leading-relaxed">
              Tu historia ayuda a otras personas a verse en este camino y le pone cara al trabajo que hiciste. No Country la usa para mostrar que esta simulación sirve de verdad.
            </p>
            <p className="mt-xs text-body-small text-text-secondary md:mt-sm">
              Los campos con <span aria-hidden="true">*</span><span className="sr-only">asterisco</span> son obligatorios.
            </p>
          </div>
          <div aria-hidden="true" className="hidden size-20 shrink-0 items-center justify-center rounded-card border border-brand-pink/25 bg-brand-pink/10 text-brand-pink md:flex">
            <MessageSquareQuote className="size-9" />
          </div>
        </header>
        <EnviarForm />
      </div>
    </main>
  );
}
