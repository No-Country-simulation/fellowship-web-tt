"use server";

import { firstErrorStep, parseTestimonialForm } from "./parse";
import { saveTestimonial } from "./store";
import type { SubmitState } from "./submit-state";

export async function submitTestimonial(
  _prev: SubmitState,
  formData: FormData,
): Promise<SubmitState> {
  const parsed = parseTestimonialForm(formData);

  if (!parsed.ok) {
    return {
      status: "error",
      message: parsed.message,
      fieldErrors: parsed.fieldErrors,
      step: firstErrorStep(parsed.fieldErrors),
    };
  }

  const { quote, igCaption } = parsed.data;
  if (!quote || !igCaption) {
    return {
      status: "error",
      message: "No pudimos armar el recorte del testimonio. Revisá el texto.",
    };
  }

  const saved = await saveTestimonial(parsed.data);
  if (!saved.ok) {
    return {
      status: "error",
      message: saved.message,
    };
  }

  return { status: "success" };
}
