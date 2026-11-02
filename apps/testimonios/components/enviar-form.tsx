"use client";

import {
  startTransition,
  useActionState,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import { BriefcaseBusiness, ChevronDown, Laptop, TrendingUp } from "lucide-react";
import { Button, buttonVariants } from "@repo/ui/button";

import { getSiteUrl } from "@/lib/site";
import { useFormLocale } from "./form-locale-provider";
import { getFormMessages } from "@/lib/form-i18n/messages";
import { getFormCountryOptions } from "@/lib/form-i18n/countries";
import { buildFormHref } from "@/lib/form-i18n/locales";
import { FORM_LIMITS } from "@/lib/form-i18n/limits";
import { presentFormErrors } from "@/lib/form-i18n/issues";
import type { FormIssue } from "@/lib/testimonials/issues";
import { submitTestimonial } from "@/lib/testimonials/actions";
import { initialSubmitState } from "@/lib/testimonials/submit-state";
import { OTHER_COUNTRY_VALUE } from "@/lib/testimonials/countries";
import {
  FIELD_STEP,
  STORY_MAX_CHARS,
  STORY_MIN_CHARS,
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
  TESTIMONIAL_TYPES,
  isTestimonialType,
  type TestimonialType,
} from "@/lib/testimonials/types";
import { cn } from "@/lib/utils";

import {
  Field,
  FileField,
  fieldClassName,
  textareaClassName,
} from "./enviar-fields";

const STEP_KEYS = ["type", "identity", "story", "media", "consent"] as const;
const STEPS = STEP_KEYS.length;
const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp";

const TYPE_ICONS = {
  simulation: Laptop,
  first_job: BriefcaseBusiness,
  career_change: TrendingUp,
} satisfies Record<TestimonialType, typeof Laptop>;

function focusAndReveal(control: HTMLElement | null) {
  if (!control) return;
  control.focus({ preventScroll: true });
  const header = document.querySelector<HTMLElement>("[data-form-header]");
  const headerHeight = header?.getBoundingClientRect().height ?? 0;
  const anchor = control.closest<HTMLElement>("[data-field], label") ?? control;
  window.scrollTo({
    top: Math.max(0, window.scrollY + anchor.getBoundingClientRect().top - headerHeight - 16),
    behavior: "instant",
  });
}

/** Recibe la introducción traducible como children y la retira al mostrar el éxito. */
export function EnviarForm({ children }: { children: ReactNode }) {
  const { locale, t } = useFormLocale();
  const formMessages = getFormMessages(locale).form;
  const countryOptions = getFormCountryOptions(locale);
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
  const [storyNeedsReview, setStoryNeedsReview] = useState(false);
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

  const selected = type ? formMessages.categories[type] : null;
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
  const resolvedErrors = resolveFormErrors(state, validation, type, pending);
  const { fieldErrors, serverErrors } = resolvedErrors;
  const { fieldErrors: fieldMessages, serverErrors: serverMessages, unknownErrors, message: serverMessage } =
    presentFormErrors(resolvedErrors, locale);
  const correctionStep = Object.keys(serverErrors).length
    ? firstErrorStep(serverErrors)
    : undefined;
  const professionalSummary = type === "simulation"
    ? (primaryRole.trim() ? [[t("form.fields.primary_role.label"), primaryRole.trim()]] : [])
    : type === "first_job"
      ? [[t("form.fields.company.label"), company.trim() || t("form.review.missing")], [t("form.fields.role_achieved.label"), roleAchieved.trim() || t("form.review.missing")]]
      : type === "career_change"
        ? [[t("form.fields.previous_profession.label"), previousProfession.trim() || t("form.review.missing")], [t("form.fields.new_role.label"), newRole.trim() || t("form.review.missing")]]
        : [];

  function updateErrors(updates: FieldErrors) {
    setValidation((current) => updateFormErrors(current, state, updates));
  }

  function setError(field: FormField, issue: FormIssue | undefined) {
    updateErrors({ [field]: issue });
  }

  function revalidateField<K extends FormField>(field: K, value: FormValues[K]) {
    if (fieldErrors[field]) {
      setError(field, validateField(field, { ...values, [field]: value }));
    }
  }

  function changeType(nextType: TestimonialType) {
    if (type && nextType !== type && story.trim()) {
      setStoryNeedsReview(true);
    }
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

  const form = (
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
          {t("form.categories.legend")} <span aria-hidden="true" className="text-brand-pink">*</span>
          <span className="sr-only"> {t("form.common.required")}</span>
        </legend>
        <div className="grid gap-sm md:grid-cols-3">
          {TESTIMONIAL_TYPES.map((value) => {
            const option = { value, ...formMessages.categories[value] };
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
              {fieldMessages.type}
            </p>
          ) : null}
        </div>
      </fieldset>

      <fieldset
        hidden={step !== 2}
        className={cn(step === 2 && "flex flex-col gap-md")}
      >
        <legend className="sr-only">{t("form.steps.identity.title")}</legend>
        <div className="grid items-start gap-md md:grid-cols-[12rem_minmax(0,1fr)] md:gap-lg">
          <FileField
            name="avatar"
            label={t("form.fields.avatar.label")}
            requirements={t("form.fields.avatar.requirements", FORM_LIMITS.avatar)}
            required
            className="max-w-36 md:max-w-48"
            error={fieldMessages.avatar}
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
            <Field label={t("form.fields.full_name.label")} required error={fieldMessages.full_name}>
              {({ id, describedBy, invalid }) => (
                <input
                  id={id}
                  name="full_name"
                  type="text"
                  autoComplete="name"
                  placeholder={t("form.fields.full_name.placeholder")}
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
            <Field label={t("form.fields.country.label")} required reserveErrorSpace={!isOtherCountry} error={isOtherCountry ? undefined : fieldMessages.country}>
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
                    <option value="">{t("form.fields.country.placeholder")}</option>
                    {countryOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                    <option value={OTHER_COUNTRY_VALUE}>{t("form.fields.country.other")}</option>
                  </select>
                  <ChevronDown
                    aria-hidden="true"
                    className="pointer-events-none absolute right-sm top-1/2 size-4 -translate-y-1/2 text-text-primary"
                  />
                </div>
              )}
            </Field>
            {isOtherCountry ? (
              <Field label={t("form.fields.country.customLabel")} required error={fieldMessages.country}>
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
            <Field label={t("form.fields.email.label")} required error={fieldMessages.email}>
              {({ id, describedBy, invalid }) => (
                <input
                  id={id}
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder={t("form.fields.email.placeholder")}
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
        <legend className="sr-only">{t("form.steps.story.title")}</legend>
        {type === "simulation" ? (
          <Field
            label={t("form.fields.primary_role.label")}
            hint={t("form.fields.primary_role.hint")}
            error={fieldMessages.primary_role}
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
            <Field label={t("form.fields.company.label")} required error={fieldMessages.company}>
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
            <Field label={t("form.fields.role_achieved.label")} required error={fieldMessages.role_achieved}>
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
              label={t("form.fields.previous_profession.label")}
              required
              error={fieldMessages.previous_profession}
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
            <Field label={t("form.fields.new_role.label")} required error={fieldMessages.new_role}>
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
        <div className="flex min-w-0 flex-col gap-xs">
          {storyNeedsReview ? (
            <p id="story-review-notice" className="text-body-small leading-relaxed text-accent-cyan">
              {t("form.story.reviewNotice")}
            </p>
          ) : null}
          <Field
            label={selected?.storyLabel ?? t("form.steps.story.title")}
            required
            reserveErrorSpace
            className="gap-xs"
            hint={t("form.story.hintWithLimits", { hint: selected?.storyHint ?? t("form.story.defaultHint"), min: STORY_MIN_CHARS, max: STORY_MAX_CHARS })}
            error={fieldMessages.story}
            trailingInfo={(
              <span className="text-xs text-text-secondary tabular-nums">
                {t("form.story.counter", { current: story.trim().length, max: STORY_MAX_CHARS })}
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
                aria-describedby={[describedBy, storyNeedsReview ? "story-review-notice" : undefined].filter(Boolean).join(" ")}
                className={cn(textareaClassName, "min-h-40 sm:min-h-44")}
                onChange={(event) => {
                  setStory(event.target.value);
                  setStoryNeedsReview(false);
                  revalidateField("story", event.target.value);
                }}
              />
            )}
          </Field>
        </div>
      </fieldset>

      <fieldset
        hidden={step !== 4}
        className={cn(step === 4 && "flex flex-col gap-md")}
      >
        <legend className="sr-only">{t("form.steps.media.title")}</legend>
        <p className="text-body-small text-text-secondary">
          {t("form.media.optionalStep")}
        </p>
        <div className="grid items-start gap-md md:grid-cols-2 md:gap-lg">
          <FileField
            name="capture"
            label={t("form.fields.capture.label")}
            hint={t("form.fields.capture.hint")}
            requirements={t("form.fields.capture.requirements", FORM_LIMITS.capture)}
            error={fieldMessages.capture}
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
              label={t("form.fields.video_url.label")}
              hint={t("form.fields.video_url.hint")}
              error={fieldMessages.video_url}
            >
              {({ id, describedBy, invalid }) => (
                <input
                  id={id}
                  name="video_url"
                  type="url"
                  inputMode="url"
                  placeholder={t("form.fields.video_url.placeholder")}
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
              label={t("form.fields.instagram.label")}
              hint={t("form.fields.instagram.hint")}
              error={fieldMessages.instagram}
            >
              {({ id, describedBy, invalid }) => (
                <input
                  id={id}
                  name="instagram"
                  type="text"
                  autoComplete="off"
                  placeholder={t("form.fields.instagram.placeholder")}
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
              label={t("form.fields.linkedin.label")}
              hint={t("form.fields.linkedin.hint")}
              error={fieldMessages.linkedin}
            >
              {({ id, describedBy, invalid }) => (
                <input
                  id={id}
                  name="linkedin"
                  type="text"
                  autoComplete="off"
                  placeholder={t("form.fields.linkedin.placeholder")}
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
        <legend className="sr-only">{t("form.steps.consent.title")}</legend>
        <div>
          <h3 className="text-heading-3 text-text-primary">{t("form.review.title")}</h3>
          <p className="mt-xs text-body-small leading-relaxed text-text-secondary">
            {t("form.review.description")}
          </p>
        </div>
        <section aria-labelledby="testimonial-summary-title" className="rounded-card border border-border bg-card p-sm sm:p-md">
          <h4 id="testimonial-summary-title" className="text-body font-semibold text-text-primary">{t("form.review.summaryTitle")}</h4>
          <div className="mt-sm flex flex-col gap-md">
            <section aria-labelledby="summary-testimonial-title">
              <h5 id="summary-testimonial-title" className="text-body-small font-semibold text-text-primary">{t("form.review.testimonialTitle")}</h5>
              <dl className="mt-xs grid gap-x-md sm:grid-cols-2">
                {[
                  [t("form.review.typeLabel"), selected?.label ?? t("form.review.notSelected")],
                  [t("form.review.nameLabel"), fullName.trim() || t("form.review.missing")],
                  [t("form.fields.country.label"), (isOtherCountry ? country.trim() : countryOptions.find(option => option.value === country)?.label ?? country.trim()) || t("form.review.missing")],
                  ...professionalSummary,
                ].map(([label, value]) => (
                  <div key={label} className="min-w-0 border-t border-border-subtle py-xs sm:py-sm">
                    <dt className="text-body-small text-text-secondary">{label}</dt>
                    <dd className="mt-1 text-body font-medium wrap-anywhere text-text-primary">{value}</dd>
                  </div>
                ))}
                <div className="min-w-0 border-t border-border-subtle py-xs sm:col-span-2 sm:py-sm">
                  <dt className="text-body-small text-text-secondary">{selected?.storyLabel ?? t("form.steps.story.title")}</dt>
                  <dd className="mt-1 text-body leading-relaxed whitespace-pre-wrap wrap-anywhere text-text-primary">{story.trim() ? story : t("form.review.missing")}</dd>
                </div>
              </dl>
            </section>
            <section aria-labelledby="summary-contact-title">
              <h5 id="summary-contact-title" className="text-body-small font-semibold text-text-primary">{t("form.review.contactTitle")}</h5>
              <dl className="mt-xs">
                <div className="min-w-0 border-t border-border-subtle py-xs sm:py-sm">
                  <dt className="text-body-small text-text-secondary">{t("form.fields.email.label")}</dt>
                  <dd className="mt-1 text-body font-medium wrap-anywhere text-text-primary">{email.trim() || t("form.review.missing")}</dd>
                </div>
              </dl>
              <p className="text-body-small leading-relaxed text-text-secondary">{t("form.review.emailPrivacy")}</p>
            </section>
            <section aria-labelledby="summary-media-title">
              <h5 id="summary-media-title" className="text-body-small font-semibold text-text-primary">{t("form.review.mediaTitle")}</h5>
              <dl className="mt-xs grid gap-x-md sm:grid-cols-2">
                {[
                  [t("form.fields.avatar.label"), avatarFile ? t("form.review.avatarReady") : t("form.review.avatarMissing")],
                  [t("form.fields.capture.label"), captureFile ? t("form.review.captureAttached") : t("form.review.captureMissing")],
                  ...(videoUrl.trim() ? [[t("form.fields.video_url.summaryLabel"), videoUrl.trim()]] : []),
                  ...(instagram.trim() ? [[t("form.fields.instagram.label"), instagram.trim()]] : []),
                  ...(linkedin.trim() ? [[t("form.fields.linkedin.label"), linkedin.trim()]] : []),
                ].map(([label, value]) => (
                  <div key={label} className="min-w-0 border-t border-border-subtle py-xs sm:py-sm">
                    <dt className="text-body-small text-text-secondary">{label}</dt>
                    <dd className="mt-1 text-body font-medium wrap-anywhere text-text-primary">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          </div>
          <p className="mt-sm text-body-small leading-relaxed text-text-secondary">{t("form.review.moderationHint")}</p>
        </section>
        <section aria-labelledby="testimonial-consent-title" className="rounded-card border border-border bg-bg-surface-1 p-sm sm:p-md">
          <h4 id="testimonial-consent-title" className="mb-sm text-body font-semibold text-text-primary">
            {t("form.consent.title")}<span aria-hidden="true" className="ml-1 text-brand-pink">*</span>
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
              {t("form.consent.body")}
              <span className="sr-only"> {t("form.common.required")}</span>
            </span>
          </label>
          <div className="mt-1 min-h-6">
            {fieldErrors.consent ? (
              <p id="consent-error" className="text-body-small leading-relaxed text-destructive">
                {fieldMessages.consent}
              </p>
            ) : null}
          </div>
        </section>
        {serverMessage || correctionStep || unknownErrors.length > 0 ? (
          <div className="flex flex-col gap-xs rounded-card border border-destructive/30 bg-destructive/5 p-sm" role="alert">
            {serverMessage ? (
              <p className="text-body-small text-destructive">{serverMessage}</p>
            ) : null}
            {Object.entries(serverMessages)
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
                {t("form.navigation.correct")}
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
            className="h-auto min-h-11 max-w-full px-sm whitespace-normal"
            disabled={step === 1 || pending}
            onClick={() => navigateTo(Math.max(1, step - 1))}
          >
            {t("form.navigation.back")}
          </Button>
        ) : null}
        {step < STEPS ? (
          <Button
            key="next"
            type="button"
            variant="gradient"
            size="lg"
            className={step === 1 ? "h-auto min-h-11 w-full max-w-full px-md whitespace-normal sm:w-auto" : "h-auto min-h-11 max-w-full px-md whitespace-normal"}
            onClick={goNext}
          >
            {t("form.navigation.next")}
          </Button>
        ) : (
          <Button
            key="submit"
            type="submit"
            variant="gradient"
            size="lg"
            className="h-auto min-h-11 max-w-full px-sm whitespace-normal sm:px-md"
            disabled={pending}
          >
            {pending ? t("form.submit.pending") : t("form.submit.label")}
          </Button>
        )}
      </div>
    </form>
  );

  return <>{children}{form}</>;
}

function StepProgress({ step, headingRef }: {
  step: number;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
}) {
  const { locale, t } = useFormLocale();
  const steps = getFormMessages(locale).form.steps;
  return (
    <div>
      <h2 ref={headingRef} tabIndex={-1} className="text-overline text-text-secondary focus:outline-none">
        {t("form.progress", { step, total: STEPS, title: steps[STEP_KEYS[step - 1]].title })}
      </h2>
      {/* El h2 enfocado comunica el progreso; los círculos son solo visuales, sin barra duplicada. */}
      <ol aria-hidden="true" className="mt-md grid grid-cols-5">
        {STEP_KEYS.map((key, index) => {
          const label = steps[key].short;
          const current = step === index + 1;
          const completed = step > index + 1;
          return (
            <li key={key} className="relative flex min-w-0 flex-col items-center gap-xs text-center">
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

function SuccessCard({ inviteUrl: baseInviteUrl }: { inviteUrl: string }) {
  const { locale, t } = useFormLocale();
  const inviteUrl = new URL(buildFormHref(locale), baseInviteUrl).toString();
  const [copyState, setCopyState] = useState({ url: inviteUrl, copied: false });
  const copyTimer = useRef<number | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Reset on URL changes during render, including ES → PT → ES before the timeout.
  if (copyState.url !== inviteUrl) setCopyState({ url: inviteUrl, copied: false });

  useEffect(() => () => {
    if (copyTimer.current !== null) window.clearTimeout(copyTimer.current);
  }, [inviteUrl]);

  useEffect(() => {
    focusAndReveal(headingRef.current);
  }, []);

  async function copyInviteLink() {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopyState(current => current.url === inviteUrl ? { url: inviteUrl, copied: true } : current);
      if (copyTimer.current !== null) window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => {
        setCopyState(current => current.url === inviteUrl ? { url: inviteUrl, copied: false } : current);
      }, 2000);
    } catch {
      setCopyState(current => current.url === inviteUrl ? { url: inviteUrl, copied: false } : current);
    }
  }

  return (
    <div className="mt-lg rounded-card border border-border bg-card p-md sm:p-lg">
      <p className="text-overline text-accent-cyan">{t("form.success.eyebrow")}</p>
      <h1 ref={headingRef} tabIndex={-1} className="mt-xs text-2xl font-bold tracking-tight text-text-primary focus:outline-none sm:text-3xl">
        {t("form.success.title")}
      </h1>
      <p className="mt-sm text-body text-text-secondary">
        {t("form.success.description")}
      </p>
      <div className="mt-md border-t border-border pt-md">
        <p className="text-body text-text-primary">
          {t("form.success.inviteTitle")}
        </p>
        <p className="mt-xs text-body text-text-secondary">
          {t("form.success.inviteDescription")}
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
            {copyState.copied ? t("form.success.copied") : t("form.success.copy")}
          </Button>
          <Link href="/" className={cn(buttonVariants({ variant: "outline" }), "min-h-11 px-sm")}>
            {t("form.navigation.home")}
          </Link>
        </div>
      </div>
    </div>
  );
}
