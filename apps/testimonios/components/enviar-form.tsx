"use client";

import { useActionState, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@repo/ui/button";

import { getSiteUrl } from "@/lib/site";
import { submitTestimonial } from "@/lib/testimonials/actions";
import { initialSubmitState } from "@/lib/testimonials/submit-state";
import {
  AVATAR_MAX_BYTES,
  CAPTURE_MAX_BYTES,
  STORY_MAX_CHARS,
  STORY_MIN_CHARS,
  isValidEmail,
  normalizeInstagram,
  normalizeLinkedIn,
  normalizeYouTubeUrl,
  validateImageFile,
  type FieldErrors,
  type FormField,
} from "@/lib/testimonials/parse";
import {
  TYPE_OPTIONS,
  isTestimonialType,
  typeOption,
  type TestimonialType,
} from "@/lib/testimonials/types";
import { cn } from "@/lib/utils";

import {
  Field,
  FileField,
  fieldClassName,
  textareaClassName,
} from "./enviar-fields";

const STEPS = 5;
const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp";

const STEP_TITLES = [
  "Qué querés contar",
  "Nombre, email y foto",
  "Tu historia",
  "Captura y links",
  "Consentimiento",
] as const;

export function EnviarForm() {
  const [state, formAction, pending] = useActionState(
    submitTestimonial,
    initialSubmitState,
  );
  const [step, setStep] = useState(1);
  const [type, setType] = useState<TestimonialType | "">("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [story, setStory] = useState("");
  const [company, setCompany] = useState("");
  const [roleAchieved, setRoleAchieved] = useState("");
  const [previousProfession, setPreviousProfession] = useState("");
  const [newRole, setNewRole] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [instagram, setInstagram] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [captureFile, setCaptureFile] = useState<File | null>(null);
  const [consent, setConsent] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  if (state.status === "success") {
    return <SuccessCard />;
  }

  const selected = type ? typeOption(type) : null;

  function setError(field: FormField, message: string | undefined) {
    setFieldErrors((current) => {
      const next = { ...current };
      if (message) {
        next[field] = message;
      } else {
        delete next[field];
      }
      return next;
    });
  }

  function validateStep(current: number): boolean {
    const nextErrors: FieldErrors = {};

    if (current === 1 && !type) {
      nextErrors.type = "Elegí qué querés contar.";
    }

    if (current === 2) {
      if (!fullName.trim()) {
        nextErrors.full_name = "El nombre es obligatorio.";
      }
      if (!email.trim()) {
        nextErrors.email = "El email es obligatorio. No se muestra en público.";
      } else if (!isValidEmail(email)) {
        nextErrors.email = "Ingresá un email válido.";
      }
      const avatarError = validateImageFile(avatarFile, {
        required: true,
        maxBytes: AVATAR_MAX_BYTES,
        label: "La foto de perfil",
      });
      if (avatarError) {
        nextErrors.avatar = avatarError;
      }
    }

    if (current === 3) {
      if (type === "first_job") {
        if (!company.trim()) {
          nextErrors.company = "La empresa es obligatoria.";
        }
        if (!roleAchieved.trim()) {
          nextErrors.role_achieved = "El puesto es obligatorio.";
        }
      }
      if (type === "career_change") {
        if (!previousProfession.trim()) {
          nextErrors.previous_profession = "El oficio anterior es obligatorio.";
        }
        if (!newRole.trim()) {
          nextErrors.new_role = "El rol nuevo es obligatorio.";
        }
      }
      if (story.trim().length < STORY_MIN_CHARS) {
        nextErrors.story = `Escribí al menos ${STORY_MIN_CHARS} caracteres.`;
      }
    }

    if (current === 4) {
      const captureError = validateImageFile(captureFile, {
        required: false,
        maxBytes: CAPTURE_MAX_BYTES,
        label: "La captura del proyecto",
      });
      if (captureError) {
        nextErrors.capture = captureError;
      }
      if (videoUrl.trim() && !normalizeYouTubeUrl(videoUrl)) {
        nextErrors.video_url = "Pegá un link de YouTube (youtube.com o youtu.be).";
      }
      if (instagram.trim() && !normalizeInstagram(instagram)) {
        nextErrors.instagram = "Usá tu usuario (@nombre) o el link de Instagram.";
      }
      if (linkedin.trim() && !normalizeLinkedIn(linkedin)) {
        nextErrors.linkedin = "Pegá tu perfil (linkedin.com/in/…) o tu usuario.";
      }
    }

    if (current === 5 && !consent) {
      nextErrors.consent = "Tenés que aceptar para enviar.";
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function goNext() {
    if (validateStep(step) && step < STEPS) {
      setStep(step + 1);
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step !== STEPS) {
      goNext();
      return;
    }

    if (!validateStep(STEPS)) {
      return;
    }

    const formData = new FormData();
    if (type) {
      formData.set("type", type);
    }
    formData.set("full_name", fullName);
    formData.set("email", email);
    formData.set("story", story);
    formData.set("company", company);
    formData.set("role_achieved", roleAchieved);
    formData.set("previous_profession", previousProfession);
    formData.set("new_role", newRole);
    formData.set("video_url", videoUrl);
    formData.set("instagram", instagram);
    formData.set("linkedin", linkedin);
    if (consent) {
      formData.set("consent", "1");
    }
    if (avatarFile) {
      formData.set("avatar", avatarFile);
    }
    if (captureFile) {
      formData.set("capture", captureFile);
    }
    formAction(formData);
  }

  return (
    <form
      action={formAction}
      onSubmit={onSubmit}
      className="mt-lg flex flex-col gap-lg"
      noValidate
    >
      <StepProgress step={step} />

      <fieldset
        hidden={step !== 1}
        className={cn(step === 1 && "flex flex-col gap-sm")}
      >
        <legend className="sr-only">Qué querés contar</legend>
        <div className="grid gap-sm sm:grid-cols-3">
          {TYPE_OPTIONS.map((option) => {
            const checked = type === option.value;
            return (
              <label
                key={option.value}
                className={cn(
                  "flex cursor-pointer flex-col gap-xs rounded-md border border-border bg-card p-md",
                  "hover:border-accent-cyan/70",
                  checked && "border-accent-cyan ring-2 ring-accent-cyan/40",
                )}
              >
                <input
                  type="radio"
                  name="type"
                  value={option.value}
                  checked={checked}
                  className="sr-only"
                  onChange={() => {
                    if (isTestimonialType(option.value)) {
                      setType(option.value);
                      setError("type", undefined);
                    }
                  }}
                />
                <span className="text-body font-medium text-text-primary">
                  {option.label}
                </span>
                <span className="text-body-small text-text-secondary">
                  {option.description}
                </span>
              </label>
            );
          })}
        </div>
        {fieldErrors.type ? (
          <p className="text-body-small text-destructive" role="alert">
            {fieldErrors.type}
          </p>
        ) : null}
      </fieldset>

      <fieldset
        hidden={step !== 2}
        className={cn(step === 2 && "flex flex-col gap-md")}
      >
        <legend className="sr-only">Nombre, email y foto</legend>
        <div className="grid grid-cols-2 gap-md">
          <Field label="Nombre completo" error={fieldErrors.full_name}>
            {({ id, describedBy, invalid }) => (
              <input
                id={id}
                name="full_name"
                type="text"
                autoComplete="name"
                value={fullName}
                aria-invalid={invalid}
                aria-describedby={describedBy}
                className={fieldClassName}
                onChange={(event) => setFullName(event.target.value)}
              />
            )}
          </Field>
          <Field label="Email" error={fieldErrors.email}>
            {({ id, describedBy, invalid }) => (
              <input
                id={id}
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                aria-invalid={invalid}
                aria-describedby={describedBy}
                className={fieldClassName}
                onChange={(event) => setEmail(event.target.value)}
              />
            )}
          </Field>
        </div>
        <FileField
          name="avatar"
          label="Foto de perfil"
          hint="Una foto tuya, ayuda a darle identidad a tu testimonio."
          error={fieldErrors.avatar}
          accept={IMAGE_ACCEPT}
          preview="avatar"
          onFileChange={setAvatarFile}
        />
      </fieldset>

      <fieldset
        hidden={step !== 3}
        className={cn(step === 3 && "flex flex-col gap-md")}
      >
        <legend className="sr-only">Tu historia</legend>
        {type === "first_job" ? (
          <div className="grid grid-cols-2 gap-md">
            <Field label="Empresa" error={fieldErrors.company}>
              {({ id, describedBy, invalid }) => (
                <input
                  id={id}
                  name="company"
                  type="text"
                  value={company}
                  aria-invalid={invalid}
                  aria-describedby={describedBy}
                  className={fieldClassName}
                  onChange={(event) => setCompany(event.target.value)}
                />
              )}
            </Field>
            <Field label="Puesto" error={fieldErrors.role_achieved}>
              {({ id, describedBy, invalid }) => (
                <input
                  id={id}
                  name="role_achieved"
                  type="text"
                  value={roleAchieved}
                  aria-invalid={invalid}
                  aria-describedby={describedBy}
                  className={fieldClassName}
                  onChange={(event) => setRoleAchieved(event.target.value)}
                />
              )}
            </Field>
          </div>
        ) : null}
        {type === "career_change" ? (
          <div className="grid grid-cols-2 gap-md">
            <Field
              label="Oficio anterior"
              error={fieldErrors.previous_profession}
            >
              {({ id, describedBy, invalid }) => (
                <input
                  id={id}
                  name="previous_profession"
                  type="text"
                  value={previousProfession}
                  aria-invalid={invalid}
                  aria-describedby={describedBy}
                  className={fieldClassName}
                  onChange={(event) => setPreviousProfession(event.target.value)}
                />
              )}
            </Field>
            <Field label="Rol nuevo" error={fieldErrors.new_role}>
              {({ id, describedBy, invalid }) => (
                <input
                  id={id}
                  name="new_role"
                  type="text"
                  value={newRole}
                  aria-invalid={invalid}
                  aria-describedby={describedBy}
                  className={fieldClassName}
                  onChange={(event) => setNewRole(event.target.value)}
                />
              )}
            </Field>
          </div>
        ) : null}
        <Field
          label={selected?.storyLabel ?? "Tu historia"}
          hint={selected?.storyHint}
          error={fieldErrors.story}
        >
          {({ id, describedBy, invalid }) => (
            <>
              <textarea
                id={id}
                name="story"
                value={story}
                maxLength={STORY_MAX_CHARS}
                aria-invalid={invalid}
                aria-describedby={describedBy}
                className={textareaClassName}
                onChange={(event) => setStory(event.target.value)}
              />
              <p className="mt-xs text-body-small text-text-muted">
                {story.trim().length}/{STORY_MAX_CHARS}
              </p>
            </>
          )}
        </Field>
      </fieldset>

      <fieldset
        hidden={step !== 4}
        className={cn(step === 4 && "flex flex-col gap-md")}
      >
        <legend className="sr-only">Captura y links</legend>
        <p className="text-body-small text-text-secondary">
          Todo este paso es opcional. Si no tenés captura ni links, seguí al
          consentimiento.
        </p>
        <FileField
          name="capture"
          label="Captura del proyecto"
          hint="Subí una captura de tu proyecto o de la demo (no tu foto de perfil)."
          error={fieldErrors.capture}
          optional
          accept={IMAGE_ACCEPT}
          preview="capture"
          onFileChange={setCaptureFile}
        />
        <Field
          label="Video de YouTube"
          hint="Solo un link de YouTube. No se sube un archivo."
          error={fieldErrors.video_url}
          optional
        >
          {({ id, describedBy, invalid }) => (
            <input
              id={id}
              name="video_url"
              type="url"
              inputMode="url"
              placeholder="https://www.youtube.com/watch?v="
              value={videoUrl}
              aria-invalid={invalid}
              aria-describedby={describedBy}
              className={fieldClassName}
              onChange={(event) => setVideoUrl(event.target.value)}
            />
          )}
        </Field>
        <div className="grid grid-cols-2 gap-md">
          <Field
            label="Instagram"
            hint="Para mencionarte en el caption si publicamos."
            error={fieldErrors.instagram}
            optional
            className="min-w-0"
          >
            {({ id, describedBy, invalid }) => (
              <input
                id={id}
                name="instagram"
                type="text"
                autoComplete="off"
                placeholder="@tu.usuario"
                value={instagram}
                aria-invalid={invalid}
                aria-describedby={describedBy}
                className={fieldClassName}
                onChange={(event) => setInstagram(event.target.value)}
              />
            )}
          </Field>
          <Field
            label="LinkedIn"
            hint="Para mencionarte en el post de LinkedIn si publicamos."
            error={fieldErrors.linkedin}
            optional
            className="min-w-0"
          >
            {({ id, describedBy, invalid }) => (
              <input
                id={id}
                name="linkedin"
                type="text"
                autoComplete="off"
                placeholder="https://www.linkedin.com/in/tu-usuario"
                value={linkedin}
                aria-invalid={invalid}
                aria-describedby={describedBy}
                className={fieldClassName}
                onChange={(event) => setLinkedin(event.target.value)}
              />
            )}
          </Field>
        </div>
      </fieldset>

      <fieldset
        hidden={step !== 5}
        className={cn(step === 5 && "flex flex-col gap-md")}
      >
        <legend className="sr-only">Consentimiento</legend>
        <div className="rounded-md border border-border bg-card p-md">
          <p className="text-overline text-text-secondary">Resumen</p>
          <ul className="mt-xs space-y-1 text-body-small text-text-secondary">
            <li>
              Tipo:{" "}
              <span className="text-text-primary">
                {selected?.label ?? "—"}
              </span>
            </li>
            <li>
              Nombre:{" "}
              <span className="text-text-primary">
                {fullName.trim() || "—"}
              </span>
            </li>
            <li>
              Foto de perfil:{" "}
              <span className="text-text-primary">
                {avatarFile ? "Lista" : "Falta"}
              </span>
            </li>
            <li>
              Captura del proyecto:{" "}
              <span className="text-text-primary">
                {captureFile ? "Adjunta" : "Sin captura"}
              </span>
            </li>
            <li>
              YouTube:{" "}
              <span className="text-text-primary">
                {videoUrl.trim() ? "Link cargado" : "Sin video"}
              </span>
            </li>
          </ul>
        </div>
        <label className="flex items-start gap-sm text-body-small text-text-secondary">
          <input
            type="checkbox"
            name="consent"
            value="1"
            checked={consent}
            className="mt-1 size-4 rounded-sm border-border accent-accent-cyan"
            onChange={(event) => setConsent(event.target.checked)}
          />
          <span>
            Acepto que No Country publique mi testimonio (nombre, foto y texto)
            en la galería y en Discord. El email no se muestra en público. El
            equipo lo revisa antes de publicarlo.
          </span>
        </label>
        {fieldErrors.consent ? (
          <p className="text-body-small text-destructive" role="alert">
            {fieldErrors.consent}
          </p>
        ) : null}
        {state.status === "error" ? (
          <div className="flex flex-col gap-xs" role="alert">
            <p className="text-body-small text-destructive">{state.message}</p>
            {state.fieldErrors
              ? Object.values(state.fieldErrors).map((message) => (
                  <p key={message} className="text-body-small text-destructive">
                    {message}
                  </p>
                ))
              : null}
            {state.step ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setStep(state.step ?? 1)}
              >
                Ir a corregir
              </Button>
            ) : null}
          </div>
        ) : null}
      </fieldset>

      <div className="flex flex-wrap items-center justify-between gap-sm">
        <Button
          type="button"
          variant="outline"
          size="lg"
          disabled={step === 1 || pending}
          onClick={() => setStep((current) => Math.max(1, current - 1))}
        >
          Atrás
        </Button>
        {step < STEPS ? (
          <Button
            key="next"
            type="button"
            variant="gradient"
            size="lg"
            onClick={goNext}
          >
            Siguiente
          </Button>
        ) : (
          <Button
            key="submit"
            type="submit"
            variant="gradient"
            size="lg"
            disabled={pending}
          >
            {pending ? "Enviando…" : "Enviar testimonio"}
          </Button>
        )}
      </div>
    </form>
  );
}

function StepProgress({ step }: { step: number }) {
  return (
    <div>
      <p className="text-overline text-text-secondary">
        Paso {step} de {STEPS} · {STEP_TITLES[step - 1]}
      </p>
      <ol className="mt-xs flex gap-1" aria-hidden="true">
        {Array.from({ length: STEPS }, (_, index) => {
          const current = index + 1;
          return (
            <li
              key={current}
              className={cn(
                "h-1 flex-1 rounded-full bg-bg-surface-4",
                current <= step && "bg-brand-gradient",
              )}
            />
          );
        })}
      </ol>
    </div>
  );
}

function SuccessCard() {
  const [inviteUrl, setInviteUrl] = useState(`${getSiteUrl()}/enviar`);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setInviteUrl(`${window.location.origin}/enviar`);
  }, []);

  async function copyInviteLink() {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="mt-lg rounded-md border border-border bg-card p-md">
      <p className="text-overline text-accent-mint">Listo</p>
      <h2 className="mt-xs text-heading-3 text-text-primary">
        Gracias por tu testimonio
      </h2>
      <p className="mt-sm text-body text-text-secondary">
        Ya lo tenemos. Gracias por tomarte el tiempo de contarlo.
      </p>
      <div className="mt-md border-t border-border pt-md">
        <p className="text-body text-text-primary">
          Ahora ayudá a que otra persona se anime
        </p>
        <p className="mt-xs text-body text-text-secondary">
          Si alguien de tu equipo o de tu simulación todavía no contó su
          historia, pasale este enlace. Tu invitación puede ser el empujón
          que necesita para dejarla.
        </p>
        <p className="mt-sm break-all text-body">
          <a
            href={inviteUrl}
            className="text-accent-cyan hover:underline"
          >
            {inviteUrl}
          </a>
        </p>
        <div className="mt-sm flex flex-wrap gap-sm">
          <Button type="button" variant="outline" onClick={copyInviteLink}>
            {copied ? "Enlace copiado" : "Copiar enlace"}
          </Button>
          <Link href="/" className={buttonVariants({ variant: "outline" })}>
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
