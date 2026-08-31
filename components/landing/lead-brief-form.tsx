"use client"

import { useState, type FormEvent } from "react"
import { CheckIcon, ChevronDownIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { isValidEmail, parseLeadBrief, urgencyLabel } from "@/lib/lead-brief"
import {
  finalCtaNote,
  leadBriefNotesLabel,
  leadBriefNotesMaxLength,
  leadBriefNotesPlaceholder,
  leadBriefRolesPlaceholder,
  leadBriefSubmitLabel,
  leadBriefUrgencies,
} from "@/lib/landing"
import { cn } from "@/lib/utils"

const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit"

const fieldClassName =
  "h-11 w-full rounded-md border border-border bg-bg-base px-md text-body text-text-primary outline-none placeholder:text-text-muted focus-visible:border-accent-cyan focus-visible:ring-2 focus-visible:ring-accent-cyan/40"

type BriefState = {
  email: string
  roles: string
  urgency: string
  notes: string
}

const emptyBrief: BriefState = {
  email: "",
  roles: "",
  urgency: "",
  notes: "",
}

function LeadBriefForm({ accessKey }: { accessKey: string }) {
  const [brief, setBrief] = useState<BriefState>(emptyBrief)
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const emailReady = isValidEmail(brief.email)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (submitting || !emailReady) {
      return
    }

    const parsed = parseLeadBrief({
      email: brief.email,
      roles: brief.roles,
      urgency: brief.urgency,
      notes: brief.notes,
    })

    if (!parsed.ok) {
      setError(parsed.error)
      return
    }

    if (!accessKey) {
      setError("El envío no está configurado.")
      return
    }

    const { email, roles, urgency, notes } = parsed.data
    const message = [
      `Email: ${email}`,
      `Roles: ${roles.join(", ") || "—"}`,
      `Urgencia: ${urgency ? urgencyLabel(urgency) : "—"}`,
      `Notas: ${notes || "—"}`,
    ].join("\n")

    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch(WEB3FORMS_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: accessKey,
          subject: `Nuevo requerimiento${roles.length ? `: ${roles.join(", ")}` : ""}`,
          from_name: "No Country",
          name: email,
          email,
          replyto: email,
          message,
        }),
      })

      const result = (await response.json().catch(() => null)) as {
        success?: boolean
        message?: string
      } | null

      if (!response.ok || !result?.success) {
        throw new Error(
          result?.message ?? "No pudimos enviar el requerimiento. Probá de nuevo."
        )
      }

      setSentTo(email)
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "No pudimos enviar el requerimiento. Probá de nuevo."
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (sentTo) {
    return (
      <div
        className="flex flex-col items-center gap-sm py-md text-center"
        role="status"
      >
        <span className="flex size-10 items-center justify-center rounded-full bg-accent-cyan/15 text-accent-cyan">
          <CheckIcon className="size-5" aria-hidden />
        </span>
        <p className="text-heading-3 text-text-primary">Recibimos tu brief</p>
        <p className="text-body text-text-secondary">
          Te escribimos a{" "}
          <span className="text-text-primary">{sentTo}</span>.
        </p>
      </div>
    )
  }

  return (
    <form
      className="flex w-full flex-col gap-lg rounded-md border border-border bg-bg-surface-1 p-md text-left shadow-card md:p-lg"
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col gap-xs">
        <label
          className="text-body-small font-medium text-text-primary"
          htmlFor="lead-email"
        >
          Email de trabajo *
        </label>
        <input
          id="lead-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="trabajo@empresa.com"
          value={brief.email}
          onChange={(event) =>
            setBrief((current) => ({ ...current, email: event.target.value }))
          }
          className={fieldClassName}
        />
      </div>

      <div className="grid min-w-0 gap-md sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] sm:items-start">
      <div className="flex flex-col gap-xs">
        <label
          className="text-body-small font-medium text-text-primary"
          htmlFor="lead-roles"
        >
          Qué rol buscás
        </label>
        <input
          id="lead-roles"
          name="roles"
          type="text"
          placeholder={leadBriefRolesPlaceholder}
          value={brief.roles}
          onChange={(event) =>
            setBrief((current) => ({ ...current, roles: event.target.value }))
          }
          className={fieldClassName}
        />
        <p className="text-xs text-text-muted">
          Separá con comas si son varios
        </p>
      </div>

      <div className="flex flex-col gap-xs">
        <label
          className="text-body-small font-medium text-text-primary"
          htmlFor="lead-urgency"
        >
          Para cuándo
        </label>
        <div className="relative">
          <select
            id="lead-urgency"
            name="urgency"
            value={brief.urgency}
            onChange={(event) =>
              setBrief((current) => ({
                ...current,
                urgency: event.target.value,
              }))
            }
            className={cn(fieldClassName, "appearance-none pr-xl")}
          >
            <option value="">Elegí una opción</option>
            {leadBriefUrgencies.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDownIcon
            aria-hidden
            className="pointer-events-none absolute top-1/2 right-sm size-4 -translate-y-1/2 text-text-muted"
          />
        </div>
      </div>
      </div>

      <div className="flex flex-col gap-xs">
        <label
          className="text-body-small font-medium text-text-primary"
          htmlFor="lead-notes"
        >
          {leadBriefNotesLabel}
        </label>
        <textarea
          id="lead-notes"
          name="notes"
          rows={4}
          maxLength={leadBriefNotesMaxLength}
          placeholder={leadBriefNotesPlaceholder}
          value={brief.notes}
          onChange={(event) =>
            setBrief((current) => ({ ...current, notes: event.target.value }))
          }
          className="min-h-24 w-full resize-y rounded-md border border-border bg-bg-base px-md py-sm text-body text-text-primary outline-none placeholder:text-text-muted focus-visible:border-accent-cyan focus-visible:ring-2 focus-visible:ring-accent-cyan/40"
        />
        <p className="text-right text-overline text-text-muted">
          {brief.notes.length}/{leadBriefNotesMaxLength}
        </p>
      </div>

      <div className="flex flex-col gap-sm">
        {error ? (
          <p className="text-center text-body-small text-accent-red" role="alert">
            {error}
          </p>
        ) : null}
        <Button
          type="submit"
          variant="gradient"
          size="lg"
          disabled={submitting || !emailReady}
          className="h-11 w-full px-lg text-body"
        >
          {submitting ? "Enviando…" : leadBriefSubmitLabel}
        </Button>
        <p className="text-center text-body-small text-text-secondary">
          {finalCtaNote}
        </p>
      </div>
    </form>
  )
}

export { LeadBriefForm }
