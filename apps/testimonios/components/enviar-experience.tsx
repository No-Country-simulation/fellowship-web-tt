"use client";

import { EnviarForm } from "./enviar-form";
import { EnviarIntro } from "./enviar-intro";
import { FormLanguageSelect } from "./form-language-select";
import { useFormLocale } from "./form-locale-provider";

/** Reuses the existing page region; selector remains mounted when the form shows success. */
export function EnviarExperience() {
  const { locale } = useFormLocale();
  return (
    <main lang={locale} className="flex min-w-0 flex-1 flex-col wrap-anywhere px-md py-md md:py-lg">
      <div className="container-content max-w-3xl">
        <FormLanguageSelect />
        <EnviarForm><EnviarIntro /></EnviarForm>
      </div>
    </main>
  );
}
