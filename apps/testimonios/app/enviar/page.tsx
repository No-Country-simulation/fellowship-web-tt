import type { Metadata } from "next";
import { Suspense } from "react";
import { EnviarExperience } from "@/components/enviar-experience";
import { FormLocaleProvider } from "@/components/form-locale-provider";
import { FormHeader } from "@/components/form-header";
import { resolveFormLocale } from "@/lib/form-i18n/locales";
import { getFormMetadata } from "@/lib/form-i18n/metadata";

export async function generateMetadata({ searchParams }: PageProps<"/enviar">): Promise<Metadata> {
  const metadata = getFormMetadata(resolveFormLocale(await searchParams));
  return { title: { absolute: metadata.title }, description: metadata.description };
}

export default async function EnviarPage({ searchParams }: PageProps<"/enviar">) {
  const locale = resolveFormLocale(await searchParams);
  return (
    <Suspense fallback={null}>
      <FormLocaleProvider initialLocale={locale}>
        <FormHeader />
        <EnviarExperience />
      </FormLocaleProvider>
    </Suspense>
  );
}
