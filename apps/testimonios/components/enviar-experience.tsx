"use client";

import { EnviarForm } from "./enviar-form";
import { EnviarIntro } from "./enviar-intro";
import { useFormLocale } from "./form-locale-provider";

/** Form content keeps its own language and state beneath the independent FormHeader. */
export function EnviarExperience() {
  const { locale } = useFormLocale();
  return (
    <main lang={locale} className="flex min-w-0 flex-1 flex-col wrap-anywhere px-md py-md md:py-lg">
      <div className="container-content max-w-3xl">
        <EnviarForm><EnviarIntro /></EnviarForm>
      </div>
    </main>
  );
}
