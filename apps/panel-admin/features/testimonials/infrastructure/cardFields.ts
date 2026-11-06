import type {
  CareerChangePayload,
  FirstJobPayload,
  SimulationPayload,
  TestimonialType,
} from "../types/testimonial";

export type CardTextLimit = {
  /** Tope duro: por encima se marca el campo y no se guarda. */
  max: number;
  /** Desde acá el contador avisa, sin bloquear. */
  warn: number;
};

/**
 * Topes de «Datos de la card». Salen del espacio de la card, no del formulario público
 * (que acepta hasta 120): el panel adapta el dato a la imagen.
 * Única fuente: la usan la UI y `validateCardEdits`.
 */
export const CARD_LIMITS = {
  fullName: { max: 40, warn: 35 },
  country: { max: 60, warn: 48 },
  primary_role: { max: 50, warn: 40 },
  company: { max: 40, warn: 32 },
  role_achieved: { max: 50, warn: 40 },
  previous_profession: { max: 50, warn: 40 },
  new_role: { max: 50, warn: 40 },
} as const satisfies Record<CardFieldErrorKey, CardTextLimit>;

/**
 * Largo que se compara con el tope, igual en cliente y servidor: sin espacios en los
 * extremos y por caracteres (un emoji simple cuenta 1, no 2 unidades UTF-16).
 */
export function cardTextLength(value: string): number {
  return Array.from(value.trim()).length;
}

export type CardTextLevel = "ok" | "warn" | "over";

export function cardTextLevel(value: string, limit: CardTextLimit): CardTextLevel {
  const length = cardTextLength(value);
  if (length > limit.max) return "over";
  return length >= limit.warn ? "warn" : "ok";
}

/** Mensaje de un campo que pasa el tope. */
function tooLong(subject: string, feminine = false) {
  return `${subject} es muy ${feminine ? "larga" : "largo"} para la card.`;
}

export const CARD_PAYLOAD_KEYS = [
  "primary_role",
  "company",
  "role_achieved",
  "previous_profession",
  "new_role",
] as const;

export type CardPayloadKey = (typeof CARD_PAYLOAD_KEYS)[number];

export type CardFieldDefinition = {
  key: CardPayloadKey;
  label: string;
};

/** Campos del payload que dibuja la card, en el orden del formulario. */
export const CARD_FIELDS_BY_TYPE: Record<TestimonialType, readonly CardFieldDefinition[]> = {
  simulation: [{ key: "primary_role", label: "Puesto principal" }],
  first_job: [
    { key: "company", label: "Empresa" },
    { key: "role_achieved", label: "Puesto del primer empleo" },
  ],
  career_change: [
    { key: "previous_profession", label: "Oficio anterior" },
    { key: "new_role", label: "Rol nuevo" },
  ],
};

export type CardEdits = {
  fullName: string;
  country: string;
  quote: string;
  primary_role: string;
  company: string;
  role_achieved: string;
  previous_profession: string;
  new_role: string;
};

/** Lo que edita el formulario, sin la cita (esa tiene su propio tope). */
export type CardInputs = Omit<CardEdits, "quote">;

export type CardFieldErrorKey = "fullName" | "country" | CardPayloadKey;

export type CardFieldErrors = Partial<Record<CardFieldErrorKey, string>>;

export type CardValidation =
  | {
      ok: true;
      fullName: string;
      country: string;
      /** Solo las claves del tipo. Se mezclan sobre el payload guardado. */
      payload: Record<string, string>;
    }
  | {
      ok: false;
      errors: CardFieldErrors;
      messages: string[];
      message: string;
    };

type CardPayloadSource = {
  fullName: string;
  country: string | null;
  quote: string;
  simulation: SimulationPayload | null;
  firstJob: FirstJobPayload | null;
  careerChange: CareerChangePayload | null;
};

type EditableCard = CardPayloadSource & {
  type: TestimonialType;
};

const INPUT_KEYS = [
  "fullName",
  "country",
  "primary_role",
  "company",
  "role_achieved",
  "previous_profession",
  "new_role",
] as const satisfies readonly (keyof CardInputs)[];

const PAYLOAD_FIELD_COPY: Record<CardPayloadKey, { empty: string; long: string }> = {
  primary_role: {
    empty: "El puesto principal es obligatorio.",
    long: tooLong("El puesto principal"),
  },
  company: {
    empty: "La empresa es obligatoria.",
    long: tooLong("La empresa", true),
  },
  role_achieved: {
    empty: "El puesto del primer empleo es obligatorio.",
    long: tooLong("El puesto del primer empleo"),
  },
  previous_profession: {
    empty: "El oficio anterior es obligatorio.",
    long: tooLong("El oficio anterior"),
  },
  new_role: {
    empty: "El rol nuevo es obligatorio.",
    long: tooLong("El rol nuevo"),
  },
};

/** Letras y puntuación de un nombre de país. Igual que el formulario público. */
const COUNTRY_HAS_LETTER = /\p{L}/u;
const COUNTRY_CHARS = /^[\p{L}\p{M}\p{Zs}\p{Pd}'’‘.,()]+$/u;

export function sameCardInputs(left: CardInputs, right: CardInputs): boolean {
  return INPUT_KEYS.every((key) => left[key] === right[key]);
}

export function readCardEdits(source: CardPayloadSource): CardEdits {
  return {
    fullName: source.fullName,
    country: source.country ?? "",
    quote: source.quote,
    primary_role: source.simulation?.primary_role ?? "",
    company: source.firstJob?.company ?? "",
    role_achieved: source.firstJob?.role_achieved ?? "",
    previous_profession: source.careerChange?.previous_profession ?? "",
    new_role: source.careerChange?.new_role ?? "",
  };
}

export function readCardInputs(source: CardPayloadSource): CardInputs {
  const edits = readCardEdits(source);
  return {
    fullName: edits.fullName,
    country: edits.country,
    primary_role: edits.primary_role,
    company: edits.company,
    role_achieved: edits.role_achieved,
    previous_profession: edits.previous_profession,
    new_role: edits.new_role,
  };
}

/**
 * Aplica nombre, país, cita y los campos del tipo.
 * No usa los parsers estrictos: un campo vacío no borra al otro en la preview.
 * El rol se capitaliza recién al dibujar la card.
 */
export function applyCardEdits<T extends EditableCard>(source: T, edits: CardEdits): T {
  const country = edits.country.trim();
  const next: T = {
    ...source,
    fullName: edits.fullName.trim(),
    country: country ? country : null,
    quote: edits.quote,
  };

  if (source.type === "simulation") {
    const primary = edits.primary_role.trim();
    return {
      ...next,
      simulation: primary ? { primary_role: primary } : null,
    };
  }

  if (source.type === "first_job") {
    return {
      ...next,
      firstJob: {
        company: edits.company.trim(),
        role_achieved: edits.role_achieved.trim(),
      },
    };
  }

  return {
    ...next,
    careerChange: {
      previous_profession: edits.previous_profession.trim(),
      new_role: edits.new_role.trim(),
    },
  };
}

/**
 * Nombre, país y los campos visibles del tipo son obligatorios.
 * La cita no se valida acá: tiene otro tope (`QUOTE_EDIT_MAX_CHARS`).
 * Ignora las claves que no corresponden al tipo.
 */
export function validateCardEdits(type: TestimonialType, edits: CardEdits): CardValidation {
  const errors: CardFieldErrors = {};
  const fullName = edits.fullName.trim();
  const country = edits.country.trim();

  if (!fullName) {
    errors.fullName = "El nombre es obligatorio.";
  } else if (cardTextLength(fullName) > CARD_LIMITS.fullName.max) {
    errors.fullName = tooLong("El nombre");
  }

  const countryMessage = validateCountry(country);
  if (countryMessage) {
    errors.country = countryMessage;
  }

  const payload: Record<string, string> = {};
  for (const field of CARD_FIELDS_BY_TYPE[type]) {
    const value = edits[field.key].trim();
    if (!value) {
      errors[field.key] = PAYLOAD_FIELD_COPY[field.key].empty;
      continue;
    }
    if (cardTextLength(value) > CARD_LIMITS[field.key].max) {
      errors[field.key] = PAYLOAD_FIELD_COPY[field.key].long;
      continue;
    }
    payload[field.key] = value;
  }

  const messages = listedErrors(type, errors);
  if (messages.length > 0) {
    return { ok: false, errors, messages, message: messages.join(" ") };
  }

  return { ok: true, fullName, country, payload };
}

function validateCountry(country: string): string | undefined {
  if (!country) {
    return "El país es obligatorio.";
  }
  if (cardTextLength(country) > CARD_LIMITS.country.max) {
    return tooLong("El país");
  }
  if (!COUNTRY_HAS_LETTER.test(country) || !COUNTRY_CHARS.test(country)) {
    return "Ingresá un nombre de país válido, sin números.";
  }
  return undefined;
}

function listedErrors(type: TestimonialType, errors: CardFieldErrors): string[] {
  const messages: string[] = [];
  if (errors.fullName) {
    messages.push(errors.fullName);
  }
  if (errors.country) {
    messages.push(errors.country);
  }
  for (const field of CARD_FIELDS_BY_TYPE[type]) {
    const message = errors[field.key];
    if (message) {
      messages.push(message);
    }
  }
  return messages;
}
