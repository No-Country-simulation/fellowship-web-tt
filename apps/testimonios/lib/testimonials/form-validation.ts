import { formIssue, type FormIssue } from "./issues";
import {
  AVATAR_MAX_BYTES,
  CAPTURE_MAX_BYTES,
  FIELD_MAX_CHARS,
  FIELD_STEP,
  NAME_MAX_CHARS,
  STORY_MAX_CHARS,
  STORY_MIN_CHARS,
  isValidEmail,
  normalizeInstagram,
  normalizeLinkedIn,
  normalizeYouTubeUrl,
  validateCountry,
  validateImageFile,
  type FieldErrors,
  type FormField,
} from "./parse";
import type { SubmitState } from "./submit-state";
import { isTestimonialType, type TestimonialType } from "./types";

export type FormValues = Record<
  Exclude<FormField, "type" | "avatar" | "capture" | "consent">,
  string
> & {
  type: TestimonialType | "";
  avatar: File | null;
  capture: File | null;
  consent: boolean;
};

export const FORM_FIELDS = Object.keys(FIELD_STEP) as FormField[];

export const PROFESSIONAL_FIELDS: Partial<Record<FormField, TestimonialType>> = {
  primary_role: "simulation",
  company: "first_job",
  role_achieved: "first_job",
  previous_profession: "career_change",
  new_role: "career_change",
};

function isFormField(field: string): field is FormField {
  return Object.prototype.hasOwnProperty.call(FIELD_STEP, field);
}

export function isFieldActive(field: FormField, type: FormValues["type"]) {
  const category = PROFESSIONAL_FIELDS[field];
  return !category || category === type;
}

function validateText(value: string, max: number, required?: FormIssue) {
  const trimmed = value.trim();
  if (!trimmed && required) return required;
  if (trimmed.length > max) return formIssue("text.maxLength", { max });
}

/** Valida un campo con el mismo trim, límites y normalizadores que el parser. */
export function validateField(
  field: FormField,
  values: FormValues,
): FormIssue | undefined {
  if (!isFieldActive(field, values.type)) return undefined;

  switch (field) {
    case "type":
      return isTestimonialType(values.type)
        ? undefined
        : formIssue("type.required");
    case "full_name":
      return validateText(
        values.full_name,
        NAME_MAX_CHARS,
        formIssue("full_name.required"),
      );
    case "country":
      return validateCountry(values.country);
    case "email":
      if (!values.email.trim()) {
        return formIssue("email.required");
      }
      return isValidEmail(values.email) ? undefined : formIssue("email.invalid");
    case "primary_role":
      return validateText(values.primary_role, FIELD_MAX_CHARS);
    case "company":
      return validateText(
        values.company,
        FIELD_MAX_CHARS,
        formIssue("company.required"),
      );
    case "role_achieved":
      return validateText(
        values.role_achieved,
        FIELD_MAX_CHARS,
        formIssue("role_achieved.required"),
      );
    case "previous_profession":
      return validateText(
        values.previous_profession,
        FIELD_MAX_CHARS,
        formIssue("previous_profession.required"),
      );
    case "new_role":
      return validateText(
        values.new_role,
        FIELD_MAX_CHARS,
        formIssue("new_role.required"),
      );
    case "story": {
      const story = values.story.trim();
      if (!story) return formIssue("story.required");
      if (story.length < STORY_MIN_CHARS) {
        return formIssue("story.minLength", { min: STORY_MIN_CHARS });
      }
      return validateText(story, STORY_MAX_CHARS);
    }
    case "avatar":
      return validateImageFile(values.avatar, {
        required: true,
        maxBytes: AVATAR_MAX_BYTES,
        kind: "avatar",
      });
    case "capture":
      return validateImageFile(values.capture, {
        required: false,
        maxBytes: CAPTURE_MAX_BYTES,
        kind: "capture",
      });
    case "video_url":
      if (values.video_url.trim() && !normalizeYouTubeUrl(values.video_url)) {
        return formIssue("video_url.invalid");
      }
      return undefined;
    case "instagram":
      if (values.instagram.trim() && !normalizeInstagram(values.instagram)) {
        return formIssue("instagram.invalid");
      }
      return undefined;
    case "linkedin":
      if (values.linkedin.trim() && !normalizeLinkedIn(values.linkedin)) {
        return formIssue("linkedin.invalid");
      }
      return undefined;
    case "consent":
      return values.consent ? undefined : formIssue("consent.required");
  }
}

/** Incluye undefined para registrar también los campos que ya fueron corregidos. */
export function validateFormStep(step: number, values: FormValues): FieldErrors {
  const errors: FieldErrors = {};
  for (const field of FORM_FIELDS) {
    if (FIELD_STEP[field] === step && isFieldActive(field, values.type)) {
      errors[field] = validateField(field, values);
    }
  }
  return errors;
}

export type FormValidation = {
  response: SubmitState;
  // Una clave presente con undefined descarta el error de esa respuesta.
  overrides: FieldErrors;
  retired?: boolean;
};

/** Cada resultado de useActionState tiene sus propias correcciones locales. */
export function updateFormErrors(
  current: FormValidation,
  response: SubmitState,
  updates: FieldErrors,
): FormValidation {
  return {
    response,
    overrides: {
      ...(current.response === response ? current.overrides : {}),
      ...updates,
    },
    retired: current.response === response && current.retired,
  };
}

/** Deriva errores vigentes sin sincronizar el resultado del servidor con un efecto. */
export function resolveFormErrors(
  response: SubmitState,
  validation: FormValidation,
  type: FormValues["type"],
  pending: boolean,
) {
  const sameResponse = validation.response === response;
  const overrides = sameResponse ? validation.overrides : {};
  const server =
    response.status === "error" && !pending && !(sameResponse && validation.retired)
      ? response
      : undefined;
  const fieldErrors: FieldErrors = {};
  const serverErrors: FieldErrors = {};
  const unknownErrors: [string, FormIssue][] = [];

  for (const field of FORM_FIELDS) {
    if (!isFieldActive(field, type)) continue;
    const issue = Object.prototype.hasOwnProperty.call(overrides, field)
      ? overrides[field]
      : server?.fieldErrors?.[field];
    if (issue) {
      fieldErrors[field] = issue;
      if (server?.fieldErrors?.[field]) serverErrors[field] = issue;
    }
  }

  for (const [field, issue] of Object.entries(server?.fieldErrors ?? {})) {
    if (!isFormField(field) && issue) unknownErrors.push([field, issue]);
  }

  const hasServerErrors =
    Object.keys(serverErrors).length > 0 || unknownErrors.length > 0;
  const isFieldSummary =
    server?.issue?.code === "validation.summary";
  const issue = isFieldSummary && !hasServerErrors
    ? undefined
    : server ? (server.issue ?? formIssue("submit.unexpected")) : undefined;

  return { fieldErrors, serverErrors, unknownErrors, issue };
}

export type ResolvedFormErrors = ReturnType<typeof resolveFormErrors>;
