import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Suspense } from "react";
import { EnviarExperience } from "@/components/enviar-experience";
import { FormLocaleProvider } from "@/components/form-locale-provider";
import { FormHeader } from "@/components/form-header";
import { FORM_LOCALE_COOKIE, resolvePreferredFormLocale } from "@/lib/form-i18n/locales";
import { getFormMetadata } from "@/lib/form-i18n/metadata";

async function getInitialLocale(searchParams: PageProps<"/enviar">["searchParams"]) {
  const [params, cookieStore] = await Promise.all([searchParams, cookies()]);
  return resolvePreferredFormLocale(params, cookieStore.get(FORM_LOCALE_COOKIE)?.value);
}

export async function generateMetadata({ searchParams }: PageProps<"/enviar">): Promise<Metadata> {
  const metadata = getFormMetadata(await getInitialLocale(searchParams));
  return { title: { absolute: metadata.title }, description: metadata.description };
}

export default async function EnviarPage({ searchParams }: PageProps<"/enviar">) {
  const locale = await getInitialLocale(searchParams);
  return (
    <Suspense fallback={null}>
      <FormLocaleProvider initialLocale={locale}>
        <FormHeader />
        <EnviarExperience />
      </FormLocaleProvider>
    </Suspense>
  );
}
