import {
  leadBriefNotesMaxLength,
  leadBriefUrgencies,
} from "@/lib/landing"

export type LeadBriefPayload = {
  email: string
  roles: string[]
  urgency: string
  notes: string
}

const urgencyValues = new Set<string>(
  leadBriefUrgencies.map((item) => item.value)
)

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(value: string): boolean {
  return emailPattern.test(value.trim())
}

function parseRoles(value: unknown): string[] {
  if (typeof value === "string") {
    return splitRoles(value)
  }

  if (Array.isArray(value)) {
    return value.flatMap((role) =>
      typeof role === "string" ? splitRoles(role) : []
    )
  }

  return []
}

function splitRoles(value: string): string[] {
  return value
    .split(",")
    .map((role) => role.trim())
    .filter(Boolean)
}

export function parseLeadBrief(body: unknown):
  | { ok: true; data: LeadBriefPayload }
  | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Pedido inválido." }
  }

  const record = body as Record<string, unknown>

  const email =
    typeof record.email === "string" ? record.email.trim() : ""
  const notes =
    typeof record.notes === "string"
      ? record.notes.trim().slice(0, leadBriefNotesMaxLength)
      : ""
  const urgency = typeof record.urgency === "string" ? record.urgency : ""
  const roles = parseRoles(record.roles)

  if (!isValidEmail(email)) {
    return { ok: false, error: "Ingresá un email de trabajo válido." }
  }

  if (urgency && !urgencyValues.has(urgency)) {
    return { ok: false, error: "Elegí para cuándo lo necesitás." }
  }

  return {
    ok: true,
    data: { email, roles, urgency, notes },
  }
}

export function urgencyLabel(value: string): string {
  return (
    leadBriefUrgencies.find((item) => item.value === value)?.label ?? value
  )
}
