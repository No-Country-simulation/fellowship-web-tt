import type { FormMessageKey } from "./types";

/** Single parameter contract for both TypeScript callers and runtime interpolation. */
export const FORM_MESSAGE_PARAMETERS = {
  "form.progress": { step: "number", total: "number", title: "string" },
  "form.fields.avatar.requirements": { maxMb: "number" },
  "form.fields.capture.requirements": { maxMb: "number" },
  "form.story.hintWithLimits": { hint: "string", min: "number", max: "number" },
  "form.story.counter": { current: "number", max: "number" },
  "form.errors.text.maxLength": { max: "number" },
  "form.errors.story.minLength": { min: "number" },
  "form.errors.avatar.maxSize": { maxMb: "number" },
  "form.errors.capture.maxSize": { maxMb: "number" },
} as const satisfies Partial<
  Record<FormMessageKey, Readonly<Record<string, "string" | "number">>>
>;

export type FormMessageParameters = {
  [K in keyof typeof FORM_MESSAGE_PARAMETERS]: {
    readonly [P in keyof (typeof FORM_MESSAGE_PARAMETERS)[K]]:
      (typeof FORM_MESSAGE_PARAMETERS)[K][P] extends "number" ? number : string;
  };
};

type MessageArguments<K extends FormMessageKey> =
  K extends keyof FormMessageParameters
    ? [params: FormMessageParameters[K]]
    : [];

export type FormTranslator = <K extends FormMessageKey>(
  key: K,
  ...args: MessageArguments<K>
) => string;

/** Plain text only. Replacement functions preserve literal '$' and braces in values. */
export function interpolateFormMessage(
  key: FormMessageKey,
  template: string,
  params?: Readonly<Record<string, string | number>>,
): string {
  const contract = FORM_MESSAGE_PARAMETERS[
    key as keyof typeof FORM_MESSAGE_PARAMETERS
  ] as Readonly<Record<string, "string" | "number">> | undefined;

  // Fail explicitly for malformed runtime callers instead of exposing placeholders.
  for (const [name, expectedType] of Object.entries(contract ?? {})) {
    const value = params?.[name];
    if (
      !params ||
      !Object.prototype.hasOwnProperty.call(params, name) ||
      typeof value !== expectedType ||
      (typeof value === "number" && !Number.isFinite(value))
    ) {
      throw new TypeError(`Invalid parameter "${name}" for ${key}`);
    }
  }

  return template.replace(/\{([A-Za-z]\w*)\}/g, (_, name: string) => {
    if (!params || !Object.prototype.hasOwnProperty.call(params, name)) {
      throw new TypeError(`Missing parameter "${name}" for ${key}`);
    }
    return String(params[name]);
  });
}
