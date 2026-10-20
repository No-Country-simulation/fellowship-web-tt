"use client";

import {
  startTransition,
  useActionState,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import Link from "next/link";
import { BriefcaseBusiness, ChevronDown, Laptop, TrendingUp } from "lucide-react";
import { Button, buttonVariants } from "@repo/ui/button";

import { getSiteUrl } from "@/lib/site";
import { submitTestimonial } from "@/lib/testimonials/actions";
import { initialSubmitState } from "@/lib/testimonials/submit-state";
import { COUNTRY_OPTIONS, OTHER_COUNTRY_VALUE } from "@/lib/testimonials/countries";
import {
  FIELD_STEP,
  STORY_MAX_CHARS,
  firstErrorStep,
  type FieldErrors,
  type FormField,
} from "@/lib/testimonials/parse";
import {
  FORM_FIELDS,
  PROFESSIONAL_FIELDS,
  resolveFormErrors,
  updateFormErrors,
  validateField,
  validateFormStep,
  type FormValidation,
  type FormValues,
} from "@/lib/testimonials/form-validation";
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
  "Nombre, país, email y foto",
  "Tu historia",
  "Captura y links",
  "Consentimiento",
] as const;

const STEP_LABELS = ["Tipo", "Datos", "Historia", "Links", "Consentimiento"] as const;
const TYPE_ICONS = {
  simulation: Laptop,
  first_job: BriefcaseBusiness,
  career_change: TrendingUp,
} satisfies Record<TestimonialType, typeof Laptop>;

function focusAndReveal(control: HTMLElement | null) {
  if (!control) return;
  control.focus({ preventScroll: true });
  const main = control.closest("main");
  if (!main) return;
  const anchor = control.closest<HTMLElement>("[data-field], label") ?? control;
  main.scrollTo({
    top: main.scrollTop + anchor.getBoundingClientRect().top -
      main.getBoundingClientRect().top - 16,
    behavior: "instant",
  });
}

export function EnviarForm() {
  const [state, formAction, pending] = useActionState(
    submitTestimonial,
    initialSubmitState,
  );
  const [step, setStep] = useState(1);
  const [type, setType] = useState<TestimonialType | "">("");
  const [fullName, setFullName] = useState("");
  const [countrySelection, setCountrySelection] = useState("");
  const [customCountry, setCustomCountry] = useState("");
  const [email, setEmail] = useState("");
  const [story, setStory] = useState("");
  const [company, setCompany] = useState("");
  const [primaryRole, setPrimaryRole] = useState("");
  const [roleAchieved, setRoleAchieved] = useState("");
  const [previousProfession, setPreviousProfession] = useState("");
  const [newRole, setNewRole] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [instagram, setInstagram] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [captureFile, setCaptureFile] = useState<File | null>(null);
  const [consent, setConsent] = useState(false);
  const [inviteUrl, setInviteUrl] = useState(() => `${getSiteUrl()}/enviar`);
  const [validation, setValidation] = useState<FormValidation>({
    response: initialSubmitState,
    overrides: {},
  });
  const formRef = useRef<HTMLFormElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const focusRequest = useRef<{ errors?: FieldErrors } | null>(null);

  function focusFirstError(errors: FieldErrors) {
    const controls = formRef.current?.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
      "input[name], textarea[name], select[name]",
    );
    const first = Array.from(controls ?? []).find((control) =>
      errors[control.name as FormField] && !control.disabled &&
      !control.closest("fieldset")?.hidden,
    );
    focusAndReveal(first ?? null);
  }

  // El DOM ya muestra el paso y sus mensajes; no hay foco automático al cargar.
  useLayoutEffect(() => {
    const request = focusRequest.current;
    if (!request) return;
    focusRequest.current = null;
    if (request.errors) focusFirstError(request.errors);
    else focusAndReveal(headingRef.current);
  }, [step, validation]);

  if (state.status === "success") {
    return <SuccessCard inviteUrl={inviteUrl} />;
  }

  const selected = type ? typeOption(type) : null;
  const isOtherCountry = countrySelection === OTHER_COUNTRY_VALUE;
  const country = isOtherCountry ? customCountry : countrySelection;
  const values: FormValues = {
    type,
    full_name: fullName,
    country,
    email,
    story,
    company,
    primary_role: primaryRole,
    role_achieved: roleAchieved,
    previous_profession: previousProfession,
    new_role: newRole,
    video_url: videoUrl,
    instagram,
    linkedin,
    avatar: avatarFile,
    capture: captureFile,
    consent,
  };
  const { fieldErrors, serverErrors, unknownErrors, message: serverMessage } =
    resolveFormErrors(state, validation, type, pending);
  const correctionStep = Object.keys(serverErrors).length
    ? firstErrorStep(serverErrors)
    : undefined;

  function updateErrors(updates: FieldErrors) {
    setValidation((current) => updateFormErrors(current, state, updates));
  }

  function setError(field: FormField, message: string | undefined) {
    updateErrors({ [field]: message });
  }

  function revalidateField<K extends FormField>(field: K, value: FormValues[K]) {
    if (fieldErrors[field]) {
      setError(field, validateField(field, { ...values, [field]: value }));
    }
  }

  function changeType(nextType: TestimonialType) {
    setType(nextType);
    const updates: FieldErrors = { type: undefined };
    const previousOverrides =
      validation.response === state ? validation.overrides : {};
    const categoryServerErrors =
      resolveFormErrors(state, validation, nextType, pending).serverErrors;
    for (const field of FORM_FIELDS) {
      // Al volver a una categoría ya validada, revisar sus valores conservados.
      const wasValidated =
        Object.prototype.hasOwnProperty.call(previousOverrides, field) ||
        categoryServerErrors[field];
      if (PROFESSIONAL_FIELDS[field] === nextType && wasValidated) {
        updates[field] = categoryServerErrors[field] ??
          validateField(field, { ...values, type: nextType });
      }
    }
    updateErrors(updates);
  }

  function validateStep(current: number): boolean {
    const nextErrors = validateFormStep(current, values);
    // Revalidar el paso no equivale a editar los campos rechazados por el servidor.
    for (const field of FORM_FIELDS) {
      if (FIELD_STEP[field] === current && serverErrors[field]) {
        nextErrors[field] = serverErrors[field];
      }
    }
    updateErrors(nextErrors);
    const valid = !Object.values(nextErrors).some(Boolean);
    if (!valid) focusRequest.current = { errors: nextErrors };
    return valid;
  }

  function navigateTo(nextStep: number, errors?: FieldErrors) {
    if (nextStep === step) {
      if (errors) focusFirstError(errors);
      return;
    }
    focusRequest.current = { errors };
    setStep(nextStep);
  }

  function goNext() {
    if (validateStep(step) && step < STEPS) {
      navigateTo(step + 1);
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
    formData.set("country", country);
    formData.set("email", email);
    formData.set("story", story);
    if (type === "simulation") {
      formData.set("primary_role", primaryRole);
    } else if (type === "first_job") {
      formData.set("company", company);
      formData.set("role_achieved", roleAchieved);
    } else if (type === "career_change") {
      formData.set("previous_profession", previousProfession);
      formData.set("new_role", newRole);
    }
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
    setInviteUrl(`${window.location.origin}/enviar`);
    // Retirar la respuesta anterior antes de iniciar el siguiente envío.
    setValidation({ response: state, overrides: {}, retired: true });
    startTransition(() => {
      formAction(formData);
    });
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      onSubmit={onSubmit}
      className="mt-lg flex flex-col gap-lg"
      noValidate
    >
      <StepProgress step={step} headingRef={headingRef} />

      <fieldset
        hidden={step !== 1}
        aria-invalid={Boolean(fieldErrors.type)}
        className={cn(step === 1 && "flex flex-col")}
      >
        <legend className="mb-sm text-lg font-semibold text-text-primary">
          Elegí el tipo de experiencia <span aria-hidden="true" className="text-brand-pink">*</span>
          <span className="sr-only"> (obligatorio)</span>
        </legend>
        <div className="grid gap-sm md:grid-cols-3">
          {TYPE_OPTIONS.map((option) => {
            const checked = type === option.value;
            const Icon = TYPE_ICONS[option.value];
            return (
              <label
                key={option.value}
                className={cn(
                  "group relative grid min-w-0 cursor-pointer grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-card border p-sm transition-colors motion-reduce:transition-none md:flex md:flex-col md:items-start md:gap-md md:p-md",
                  "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-4 has-[:focus-visible]:outline-accent-cyan",
                  checked
                    ? "border-transparent bg-bg-surface-2"
                    : "border-border bg-card hover:border-accent-cyan/60 hover:bg-bg-surface-3",
                )}
                style={checked ? {
                  background: "linear-gradient(var(--bg-surface-2), var(--bg-surface-2)) padding-box, var(--gradient-brand) border-box",
                } : undefined}
              >
                <input
                  type="radio"
                  name="type"
                  value={option.value}
                  checked={checked}
                  aria-labelledby={`type-${option.value}-label`}
                  aria-describedby={[
                    `type-${option.value}-description`,
                    fieldErrors.type ? "type-error" : undefined,
                  ].filter(Boolean).join(" ")}
                  className="sr-only"
                  onChange={() => {
                    if (isTestimonialType(option.value)) {
                      changeType(option.value);
                    }
                  }}
                />
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-md border md:size-12",
                    checked
                      ? "border-accent-cyan/25 bg-accent-cyan/10 text-accent-cyan"
                      : "border-border bg-bg-surface-3 text-accent-indigo-light group-hover:text-accent-cyan",
                  )}
                >
                  <Icon className="size-5 md:size-6" />
                </span>
                <span className="min-w-0">
                  <span id={`type-${option.value}-label`} className="block text-body font-semibold text-text-primary md:text-lg">
                    {option.label}
                  </span>
                  <span id={`type-${option.value}-description`} className="mt-1 block text-body-small leading-relaxed text-text-secondary">
                    {option.description}
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-full md:absolute md:top-md md:right-md",
                    checked ? "bg-brand-gradient" : "border border-border",
                  )}
                />
              </label>
            );
          })}
        </div>
        <div className="mt-1 min-h-6">
          {fieldErrors.type ? (
            <p id="type-error" className="text-body-small leading-relaxed text-destructive">
              {fieldErrors.type}
            </p>
          ) : null}
        </div>
      </fieldset>

      <fieldset
        hidden={step !== 2}
        className={cn(step === 2 && "flex flex-col gap-md")}
      >
        <legend className="sr-only">Nombre, país, email y foto</legend>
        <div className="grid items-start gap-md md:grid-cols-[12rem_minmax(0,1fr)] md:gap-lg">
          <FileField
            name="avatar"
            label="Foto de perfil"
            required
            className="max-w-36 md:max-w-48"
            error={fieldErrors.avatar}
            accept={IMAGE_ACCEPT}
            preview="avatar"
            onFileChange={(file) => {
              setAvatarFile(file);
              revalidateField("avatar", file);
            }}
            onInvalid={(message) => {
              if (message) setError("avatar", message);
            }}
          />
          <div className="flex min-w-0 flex-col gap-xs">
            <Field label="Nombre completo" required error={fieldErrors.full_name}>
              {({ id, describedBy, invalid }) => (
                <input
                  id={id}
                  name="full_name"
                  type="text"
                  autoComplete="name"
                  placeholder="María López"
                  value={fullName}
                  aria-invalid={invalid}
                  aria-describedby={describedBy}
                  className={fieldClassName}
                  onChange={(event) => {
                    setFullName(event.target.value);
                    revalidateField("full_name", event.target.value);
                  }}
                />
              )}
            </Field>
            <Field label="País" required reserveErrorSpace={!isOtherCountry} error={isOtherCountry ? undefined : fieldErrors.country}>
              {({ id, describedBy, invalid }) => (
                <div className="relative">
                  <select
                    id={id}
                    name={isOtherCountry ? "country_selection" : "country"}
                    autoComplete="country-name"
                    value={countrySelection}
                    aria-invalid={invalid}
                    aria-describedby={describedBy}
                    className={cn(fieldClassName, "appearance-none pr-12")}
                    onChange={(event) => {
                      const selection = event.target.value;
                      setCountrySelection(selection);
                      revalidateField("country", selection === OTHER_COUNTRY_VALUE ? customCountry : selection);
                    }}
                  >
                    <option value="">Seleccioná un país</option>
                    {COUNTRY_OPTIONS.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                    <option value={OTHER_COUNTRY_VALUE}>Otro país</option>
                  </select>
                  <ChevronDown
                    aria-hidden="true"
                    className="pointer-events-none absolute right-sm top-1/2 size-4 -translate-y-1/2 text-text-primary"
                  />
                </div>
              )}
            </Field>
            {isOtherCountry ? (
              <Field label="Especificá tu país" required error={fieldErrors.country}>
                {({ id, describedBy, invalid }) => (
                  <input
                    id={id}
                    name="country"
                    type="text"
                    autoComplete="country-name"
                    value={customCountry}
                    aria-invalid={invalid}
                    aria-describedby={describedBy}
                    className={fieldClassName}
                    onChange={(event) => {
                      setCustomCountry(event.target.value);
                      revalidateField("country", event.target.value);
                    }}
                  />
                )}
              </Field>
            ) : null}
            <Field label="Email" required error={fieldErrors.email}>
              {({ id, describedBy, invalid }) => (
                <input
                  id={id}
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="tu@email.com"
                  value={email}
                  aria-invalid={invalid}
                  aria-describedby={describedBy}
                  className={fieldClassName}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    revalidateField("email", event.target.value);
                  }}
                />
              )}
            </Field>
          </div>
        </div>
      </fieldset>

      <fieldset
        hidden={step !== 3}
        className={cn(step === 3 && "flex flex-col gap-md")}
      >
        <legend className="sr-only">Tu historia</legend>
        {type === "simulation" ? (
          <Field
            label="Puesto principal"
            hint="El rol que tuviste en la simulación."
            error={fieldErrors.primary_role}
          >
            {({ id, describedBy, invalid }) => (
              <input
                id={id}
                name="primary_role"
                type="text"
                value={primaryRole}
                aria-invalid={invalid}
                aria-describedby={describedBy}
                className={fieldClassName}
                onChange={(event) => {
                  setPrimaryRole(event.target.value);
                  revalidateField("primary_role", event.target.value);
                }}
              />
            )}
          </Field>
        ) : null}
        {type === "first_job" ? (
          <div className="grid grid-cols-1 gap-sm sm:grid-cols-2 sm:gap-md">
            <Field label="Empresa" required error={fieldErrors.company}>
              {({ id, describedBy, invalid }) => (
                <input
                  id={id}
                  name="company"
                  type="text"
                  value={company}
                  aria-invalid={invalid}
                  aria-describedby={describedBy}
                  className={fieldClassName}
                  onChange={(event) => {
                    setCompany(event.target.value);
                    revalidateField("company", event.target.value);
                  }}
                />
              )}
            </Field>
            <Field label="Puesto" required error={fieldErrors.role_achieved}>
              {({ id, describedBy, invalid }) => (
                <input
                  id={id}
                  name="role_achieved"
                  type="text"
                  value={roleAchieved}
                  aria-invalid={invalid}
                  aria-describedby={describedBy}
                  className={fieldClassName}
                  onChange={(event) => {
                    setRoleAchieved(event.target.value);
                    revalidateField("role_achieved", event.target.value);
                  }}
                />
              )}
            </Field>
          </div>
        ) : null}
        {type === "career_change" ? (
          <div className="grid grid-cols-1 gap-sm sm:grid-cols-2 sm:gap-md">
            <Field
              label="Oficio anterior"
              required
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
                  onChange={(event) => {
                    setPreviousProfession(event.target.value);
                    revalidateField("previous_profession", event.target.value);
                  }}
                />
              )}
            </Field>
            <Field label="Rol nuevo" required error={fieldErrors.new_role}>
              {({ id, describedBy, invalid }) => (
                <input
                  id={id}
                  name="new_role"
                  type="text"
                  value={newRole}
                  aria-invalid={invalid}
                  aria-describedby={describedBy}
                  className={fieldClassName}
                  onChange={(event) => {
                    setNewRole(event.target.value);
                    revalidateField("new_role", event.target.value);
                  }}
                />
              )}
            </Field>
          </div>
        ) : null}
        <Field
          label={selected?.storyLabel ?? "Tu historia"}
          required
          reserveErrorSpace
          className="gap-xs"
          hint={selected?.storyHint}
          error={fieldErrors.story}
          trailingInfo={(
            <span className="text-xs text-text-secondary tabular-nums">
              {story.trim().length}/{STORY_MAX_CHARS}
            </span>
          )}
        >
          {({ id, describedBy, invalid }) => (
            <textarea
              id={id}
              name="story"
              value={story}
              maxLength={STORY_MAX_CHARS}
              aria-invalid={invalid}
              aria-describedby={describedBy}
              className={textareaClassName}
              onChange={(event) => {
                setStory(event.target.value);
                revalidateField("story", event.target.value);
              }}
            />
          )}
        </Field>
      </fieldset>

      <fieldset
        hidden={step !== 4}
        className={cn(step === 4 && "flex flex-col gap-md")}
      >
        <legend className="sr-only">Captura y links</legend>
        <p className="text-body-small text-text-secondary">
          Todo este paso es opcional.
        </p>
        <div className="grid items-start gap-md md:grid-cols-2 md:gap-lg">
          <FileField
            name="capture"
            label="Foto testimonial"
            hint="Una foto real de tu experiencia: trabajando, con tu equipo o en una reunión."
            error={fieldErrors.capture}
            accept={IMAGE_ACCEPT}
            preview="capture"
            onFileChange={(file) => {
              setCaptureFile(file);
              revalidateField("capture", file);
            }}
            onInvalid={(message) => {
              if (message) setError("capture", message);
            }}
          />
          <div className="flex min-w-0 flex-col gap-md">
            <Field
              label="Video de YouTube"
              hint="Solo un link de YouTube. No se sube un archivo."
              error={fieldErrors.video_url}
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
                  onChange={(event) => {
                    setVideoUrl(event.target.value);
                    revalidateField("video_url", event.target.value);
                  }}
                />
              )}
            </Field>
            <Field
              label="Instagram"
              hint="Para mencionarte en el caption si publicamos."
              error={fieldErrors.instagram}
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
                  onChange={(event) => {
                    setInstagram(event.target.value);
                    revalidateField("instagram", event.target.value);
                  }}
                />
              )}
            </Field>
            <Field
              label="LinkedIn"
              hint="Para mencionarte en el post de LinkedIn si publicamos."
              error={fieldErrors.linkedin}
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
                  onChange={(event) => {
                    setLinkedin(event.target.value);
                    revalidateField("linkedin", event.target.value);
                  }}
                />
              )}
            </Field>
          </div>
        </div>
      </fieldset>

      <fieldset
        hidden={step !== 5}
        className={cn(step === 5 && "flex flex-col gap-md")}
      >
        <legend className="sr-only">Consentimiento</legend>
        <div>
          <h3 className="text-heading-3 text-text-primary">Revisá tu testimonio</h3>
          <p className="mt-xs text-body-small leading-relaxed text-text-secondary">
            Comprobá que los datos estén correctos antes de enviarlo.
          </p>
        </div>
        <section aria-labelledby="testimonial-summary-title" className="rounded-card border border-border bg-card p-sm sm:p-md">
          <h4 id="testimonial-summary-title" className="text-body font-semibold text-text-primary">Resumen</h4>
          <dl className="mt-sm grid gap-x-md sm:grid-cols-2">
            {[
              ["Tipo", selected?.label ?? "—"],
              ["Nombre", fullName.trim() || "—"],
              ["País", country.trim() || "—"],
              ["Foto de perfil", avatarFile ? "Lista" : "Falta"],
              ["Foto testimonial", captureFile ? "Adjunta" : "Sin captura"],
              ["YouTube", videoUrl.trim() ? "Link cargado" : "Sin video"],
            ].map(([label, value]) => (
              <div key={label} className="min-w-0 border-t border-border-subtle py-xs sm:py-sm">
                <dt className="text-body-small text-text-secondary">{label}</dt>
                <dd className="mt-1 text-body font-medium wrap-anywhere text-text-primary">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
        <section aria-labelledby="testimonial-consent-title" className="rounded-card border border-border bg-bg-surface-1 p-sm sm:p-md">
          <h4 id="testimonial-consent-title" className="mb-sm text-body font-semibold text-text-primary">
            Consentimiento<span aria-hidden="true" className="ml-1 text-brand-pink">*</span>
          </h4>
          <label className="relative flex min-h-11 cursor-pointer items-start gap-sm text-body-small leading-relaxed text-text-secondary">
            <input
              type="checkbox"
              name="consent"
              value="1"
              checked={consent}
              aria-invalid={Boolean(fieldErrors.consent)}
              aria-describedby={fieldErrors.consent ? "consent-error" : undefined}
              className="mt-1 size-5 shrink-0 rounded-sm border-border accent-accent-cyan focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-cyan"
              onChange={(event) => {
                setConsent(event.target.checked);
                revalidateField("consent", event.target.checked);
              }}
            />
            <span>
              Acepto que No Country publique mi testimonio (nombre, foto y texto)
              en la galería y en Discord. El email no se muestra en público. El
              equipo lo revisa antes de publicarlo.
              <span className="sr-only"> (obligatorio)</span>
            </span>
          </label>
          <div className="mt-1 min-h-6">
            {fieldErrors.consent ? (
              <p id="consent-error" className="text-body-small leading-relaxed text-destructive">
                {fieldErrors.consent}
              </p>
            ) : null}
          </div>
        </section>
        {serverMessage || correctionStep || unknownErrors.length > 0 ? (
          <div className="flex flex-col gap-xs rounded-card border border-destructive/30 bg-destructive/5 p-sm" role="alert">
            {serverMessage ? (
              <p className="text-body-small text-destructive">{serverMessage}</p>
            ) : null}
            {Object.entries(serverErrors)
              .filter(([field]) => FIELD_STEP[field as FormField] !== STEPS)
              .map(([field, message]) => (
                <p key={field} className="text-body-small text-destructive">
                  {message}
                </p>
              ))}
            {unknownErrors.map(([field, message]) => (
              <p key={field} className="text-body-small text-destructive">
                {message}
              </p>
            ))}
            {correctionStep ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="min-h-11 self-start px-sm"
                onClick={() => navigateTo(correctionStep, serverErrors)}
              >
                Ir a corregir
              </Button>
            ) : null}
          </div>
        ) : null}
      </fieldset>

      <div className={cn("flex flex-wrap items-center gap-sm", step === 1 ? "justify-end" : "justify-between border-t border-border pt-md")}>
        {step > 1 ? (
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="min-h-11 px-sm"
            disabled={step === 1 || pending}
            onClick={() => navigateTo(Math.max(1, step - 1))}
          >
            Atrás
          </Button>
        ) : null}
        {step < STEPS ? (
          <Button
            key="next"
            type="button"
            variant="gradient"
            size="lg"
            className={step === 1 ? "min-h-11 w-full px-md sm:w-auto" : "min-h-11 px-md"}
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
            className="min-h-11 px-sm sm:px-md"
            disabled={pending}
          >
            {pending ? "Enviando…" : "Enviar testimonio"}
          </Button>
        )}
      </div>
    </form>
  );
}

function StepProgress({ step, headingRef }: {
  step: number;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
}) {
  return (
    <div>
      <h2 ref={headingRef} tabIndex={-1} className="text-overline text-text-secondary">
        Paso {step} de {STEPS} · {STEP_TITLES[step - 1]}
      </h2>
      {/* El h2 enfocado comunica el progreso; los círculos son solo visuales, sin barra duplicada. */}
      <ol aria-hidden="true" className="mt-md grid grid-cols-5">
        {STEP_LABELS.map((label, index) => {
          const current = step === index + 1;
          const completed = step > index + 1;
          return (
            <li key={label} className="relative flex min-w-0 flex-col items-center gap-xs text-center">
              {index < STEPS - 1 ? (
                <span className={cn("absolute top-5 left-1/2 h-px w-full", completed ? "bg-accent-cyan/60" : "bg-border")} />
              ) : null}
              <span className={cn(
                "relative flex size-10 items-center justify-center rounded-full text-body-small font-semibold",
                current
                  ? "bg-brand-gradient text-white ring-4 ring-brand-pink/10"
                  : completed
                    ? "border border-accent-cyan bg-bg-surface-2 text-accent-cyan"
                    : "border border-border bg-bg-base text-text-secondary",
              )}>
                {index + 1}
              </span>
              <span className={cn("hidden text-body-small md:block", current ? "font-medium text-text-primary" : "text-text-secondary")}>
                {label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function SuccessCard({ inviteUrl }: { inviteUrl: string }) {
  const [copied, setCopied] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    focusAndReveal(headingRef.current);
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
    <div className="mt-lg rounded-card border border-border bg-card p-md sm:p-lg">
      <p className="text-overline text-accent-cyan">Listo</p>
      <h2 ref={headingRef} tabIndex={-1} className="mt-xs text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
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
        <div className="mt-md flex flex-col gap-sm sm:flex-row sm:flex-wrap">
          <Button type="button" variant="gradient" className="min-h-11 px-sm" onClick={copyInviteLink}>
            {copied ? "Enlace copiado" : "Copiar enlace"}
          </Button>
          <Link href="/" className={cn(buttonVariants({ variant: "outline" }), "min-h-11 px-sm")}>
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
