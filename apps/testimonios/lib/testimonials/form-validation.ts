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

function validateText(value: string, max: number, required?: string) {
  const trimmed = value.trim();
  if (!trimmed && required) return required;
  if (trimmed.length > max) return `Máximo ${max} caracteres.`;
}

/** Valida un campo con el mismo trim, límites y normalizadores que el parser. */
export function validateField(
  field: FormField,
  values: FormValues,
): string | undefined {
  if (!isFieldActive(field, values.type)) return undefined;

  switch (field) {
    case "type":
      return isTestimonialType(values.type)
        ? undefined
        : "Elegí qué querés contar.";
    case "full_name":
      return validateText(
        values.full_name,
        NAME_MAX_CHARS,
        "El nombre es obligatorio.",
      );
    case "country":
      return validateText(
        values.country,
        FIELD_MAX_CHARS,
        "El país es obligatorio.",
      );
    case "email":
      if (!values.email.trim()) {
        return "El email es obligatorio. No se muestra en público.";
      }
      return isValidEmail(values.email) ? undefined : "Ingresá un email válido.";
    case "primary_role":
      return validateText(values.primary_role, FIELD_MAX_CHARS);
    case "company":
      return validateText(
        values.company,
        FIELD_MAX_CHARS,
        "La empresa es obligatoria.",
      );
    case "role_achieved":
      return validateText(
        values.role_achieved,
        FIELD_MAX_CHARS,
        "El puesto es obligatorio.",
      );
    case "previous_profession":
      return validateText(
        values.previous_profession,
        FIELD_MAX_CHARS,
        "El oficio anterior es obligatorio.",
      );
    case "new_role":
      return validateText(
        values.new_role,
        FIELD_MAX_CHARS,
        "El rol nuevo es obligatorio.",
      );
    case "story": {
      const story = values.story.trim();
      if (!story) return "Contanos tu historia.";
      if (story.length < STORY_MIN_CHARS) {
        return `Escribí al menos ${STORY_MIN_CHARS} caracteres.`;
      }
      return validateText(story, STORY_MAX_CHARS);
    }
    case "avatar":
      return validateImageFile(values.avatar, {
        required: true,
        maxBytes: AVATAR_MAX_BYTES,
        label: "La foto de perfil",
      });
    case "capture":
      return validateImageFile(values.capture, {
        required: false,
        maxBytes: CAPTURE_MAX_BYTES,
        label: "La captura del proyecto",
      });
    case "video_url":
      if (values.video_url.trim() && !normalizeYouTubeUrl(values.video_url)) {
        return "Pegá un link de YouTube (youtube.com o youtu.be).";
      }
      return undefined;
    case "instagram":
      if (values.instagram.trim() && !normalizeInstagram(values.instagram)) {
        return "Usá tu usuario (@nombre) o el link de Instagram.";
      }
      return undefined;
    case "linkedin":
      if (values.linkedin.trim() && !normalizeLinkedIn(values.linkedin)) {
        return "Pegá tu perfil (linkedin.com/in/…) o tu usuario.";
      }
      return undefined;
    case "consent":
      return values.consent ? undefined : "Tenés que aceptar para enviar.";
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
  const unknownErrors: [string, string][] = [];

  for (const field of FORM_FIELDS) {
    if (!isFieldActive(field, type)) continue;
    const message = Object.prototype.hasOwnProperty.call(overrides, field)
      ? overrides[field]
      : server?.fieldErrors?.[field];
    if (message) {
      fieldErrors[field] = message;
      if (server?.fieldErrors?.[field]) serverErrors[field] = message;
    }
  }

  for (const [field, message] of Object.entries(server?.fieldErrors ?? {})) {
    if (!isFormField(field)) unknownErrors.push([field, message]);
  }

  const hasServerErrors =
    Object.keys(serverErrors).length > 0 || unknownErrors.length > 0;
  const isFieldSummary =
    server?.message.trim().replace(/\.$/, "") === "Revisá los campos marcados";
  const message = isFieldSummary && !hasServerErrors ? undefined : server?.message;

  return { fieldErrors, serverErrors, unknownErrors, message };
}
