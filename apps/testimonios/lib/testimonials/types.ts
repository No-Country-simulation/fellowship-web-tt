export const TESTIMONIAL_TYPES = [
  "simulation",
  "first_job",
  "career_change",
] as const;

export type TestimonialType = (typeof TESTIMONIAL_TYPES)[number];

export const TESTIMONIAL_STATUSES = [
  "in_review",
  "published",
  "rejected",
] as const;

export type TestimonialStatus = (typeof TESTIMONIAL_STATUSES)[number];

export type SimulationPayload = {
  primary_role?: string;
};

export type FirstJobPayload = {
  company: string;
  role_achieved: string;
};

export type CareerChangePayload = {
  previous_profession: string;
  new_role: string;
};

export type TestimonialPayload =
  | SimulationPayload
  | FirstJobPayload
  | CareerChangePayload;

export type TypeOption = {
  value: TestimonialType;
  label: string;
  description: string;
  storyLabel: string;
  storyHint: string;
};

export const TYPE_OPTIONS: TypeOption[] = [
  {
    value: "simulation",
    label: "Simulación",
    description: "Tu experiencia en una simulación laboral.",
    storyLabel: "Contanos tu experiencia en la simulación",
    storyHint: "En tus palabras. No hace falta que quede perfecto.",
  },
  {
    value: "first_job",
    label: "Primer empleo",
    description: "Cómo la simulación te ayudó a entrar a IT.",
    storyLabel: "Cómo te ayudó la simulación",
    storyHint: "Contá el puente entre la simulación y este trabajo.",
  },
  {
    value: "career_change",
    label: "Reconversión",
    description: "Por qué cambiaste de oficio y cómo te está ayudando No Country.",
    storyLabel: "Por qué cambiaste y cómo te está ayudando No Country",
    storyHint: "El oficio de antes, el rol de ahora y qué cambió.",
  },
];

export function isTestimonialType(value: string): value is TestimonialType {
  return (TESTIMONIAL_TYPES as readonly string[]).includes(value);
}

export function typeOption(type: TestimonialType): TypeOption {
  const option = TYPE_OPTIONS.find((item) => item.value === type);
  if (!option) {
    throw new Error(`Unknown testimonial type: ${type}`);
  }
  return option;
}

export const TYPE_LABELS: Record<TestimonialType, string> = {
  simulation: "Simulación",
  first_job: "Primer empleo",
  career_change: "Reconversión",
};

export const STATUS_LABELS: Record<TestimonialStatus, string> = {
  in_review: "En revisión",
  published: "Publicado",
  rejected: "Rechazado",
};

export function isTestimonialStatus(value: string): value is TestimonialStatus {
  return (TESTIMONIAL_STATUSES as readonly string[]).includes(value);
}

export function simulationFields(payload: unknown): SimulationPayload | null {
  if (!isRecord(payload)) {
    return null;
  }
  const primaryRole = readPayloadString(payload, "primary_role");
  if (!primaryRole) {
    return null;
  }
  return { primary_role: primaryRole };
}

export function firstJobFields(payload: unknown): FirstJobPayload | null {
  if (!isRecord(payload)) {
    return null;
  }
  const company = readPayloadString(payload, "company");
  const roleAchieved = readPayloadString(payload, "role_achieved");
  if (!company || !roleAchieved) {
    return null;
  }
  return { company, role_achieved: roleAchieved };
}

export function careerChangeFields(payload: unknown): CareerChangePayload | null {
  if (!isRecord(payload)) {
    return null;
  }
  const previousProfession = readPayloadString(payload, "previous_profession");
  const newRole = readPayloadString(payload, "new_role");
  if (!previousProfession || !newRole) {
    return null;
  }
  return {
    previous_profession: previousProfession,
    new_role: newRole,
  };
}

/** Línea corta para galería, Discord e Instagram. */
export function storyContextLine(input: {
  simulation: SimulationPayload | null;
  firstJob: FirstJobPayload | null;
  careerChange: CareerChangePayload | null;
}): string | null {
  if (input.simulation?.primary_role) {
    return input.simulation.primary_role;
  }
  if (input.firstJob) {
    return `${input.firstJob.role_achieved} en ${input.firstJob.company}`;
  }
  if (input.careerChange) {
    return `De ${input.careerChange.previous_profession} a ${input.careerChange.new_role}`;
  }
  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readPayloadString(
  payload: Record<string, unknown>,
  key: string,
): string | null {
  const value = payload[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}
