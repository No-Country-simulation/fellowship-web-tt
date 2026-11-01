"use server";

import { notifyInboxNewTestimonial } from "@/lib/discord";

import { firstErrorStep, parseTestimonialForm } from "./parse";
import { saveTestimonial } from "./store";
import type { SubmitState } from "./submit-state";
import { typeOption } from "./types";
import { formIssue } from "./issues";

export async function submitTestimonial(
  _prev: SubmitState,
  formData: FormData,
): Promise<SubmitState> {
  try {
    const parsed = parseTestimonialForm(formData);

    if (!parsed.ok) {
      return {
        status: "error",
        issue: parsed.issue,
        fieldErrors: parsed.fieldErrors,
        step: firstErrorStep(parsed.fieldErrors),
      };
    }

    const { quote, igCaption } = parsed.data;
    if (!quote || !igCaption) {
      return { status: "error", issue: formIssue("submit.excerptFailed") };
    }

    const saved = await saveTestimonial(parsed.data);
    if (!saved.ok) {
      return { status: "error", issue: saved.issue };
    }

    // Persistence has succeeded: a secondary notification must not invite resubmission.
    try {
      await notifyInboxNewTestimonial({
        id: saved.testimonial.id,
        fullName: parsed.data.fullName,
        typeLabel: typeOption(parsed.data.type).label,
      });
    } catch {
      console.error("Testimonial inbox notification failed unexpectedly");
    }

    return { status: "success" };
  } catch {
    // Only a fixed server-side diagnostic: never log/serialize error objects or participant data.
    console.error("Testimonial submission failed unexpectedly");
    return { status: "error", issue: formIssue("submit.unexpected") };
  }
}
