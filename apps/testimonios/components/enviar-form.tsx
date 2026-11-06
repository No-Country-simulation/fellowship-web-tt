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
import { BriefcaseBusiness, ChevronDown, Laptop, Pencil, TrendingUp } from "lucide-react";
import { Button, buttonVariants } from "@repo/ui/button";

import { getSiteUrl } from "@/lib/site";
import { useFormLocale } from "./form-locale-provider";
import { getFormMessages } from "@/lib/form-i18n/messages";
import { getFormCountryOptions } from "@/lib/form-i18n/countries";
import { buildHeroHref } from "@/lib/form-i18n/locales";
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
  validateForm,
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
import controls from "./form-controls.module.css";

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

/**
 * Recibe la introducción traducible y la retira al mostrar el éxito.
 */
export function EnviarForm({ children }: { children: ReactNode }) {
  const { locale, t } = useFormLocale();
  const formMessages = getFormMessages(locale).form;
  const countryOptions = getFormCountryOptions(locale);
  const [state, formAction, pending] = useActionState(
    submitTestimonial,
    initialSubmitState,
  );
  const [step, setStep] = useState(1);
  const [summaryEditing, setSummaryEditing] = useState(false);
  const summaryEditRef = useRef<HTMLButtonElement>(null);
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
  const [inviteUrl, setInviteUrl] = useState(() => `${getSiteUrl()}/`);
  const [validation, setValidation] = useState<FormValidation>({
    response: initialSubmitState,
    overrides: {},
  });
  const formRef = useRef<HTMLFormElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const focusRequest = useRef<{ errors?: FieldErrors; summary?: "edit" | "read" } | null>(null);

  function focusFirstError(errors: FieldErrors) {
    const controls = formRef.current?.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
      "input[name], textarea[name], select[name]",
    );
    const first = Array.from(controls ?? []).find((control) =>
      errors[control.name as FormField] && !control.disabled &&
      !control.closest("[hidden], [inert]"),
    );
    focusAndReveal(first ?? (formRef.current?.querySelector("[data-summary-editor]")
      ? formRef.current.querySelector<HTMLButtonElement>('[aria-controls="testimonial-summary"]') : null));
  }

  // El DOM ya muestra el paso y sus mensajes; no hay foco automático al cargar.
  useLayoutEffect(() => {
    const request = focusRequest.current;
    if (!request) return;
    focusRequest.current = null;
    if (request.errors) focusFirstError(request.errors);
    else if (request.summary === "edit") focusAndReveal(formRef.current?.querySelector('[data-summary-editor] [name="full_name"]') ?? null);
    else if (request.summary === "read") focusAndReveal(summaryEditRef.current);
    else focusAndReveal(headingRef.current);
  }, [step, validation, summaryEditing]);

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
    // Revalidar el paso no equivale a editar los campos rechazados por el servidor.
    const nextErrors = validateFormStep(current, values, serverErrors);
    updateErrors(nextErrors);
    const valid = !Object.values(nextErrors).some(Boolean);
    if (!valid) focusRequest.current = { errors: nextErrors };
    return valid;
  }

  function navigateTo(nextStep: number, errors?: FieldErrors) {
    if (pending || nextStep < 1 || nextStep > STEPS) return;
    if (nextStep === step) {
      if (errors) focusFirstError(errors);
      return;
    }
    focusRequest.current = { errors };
    setSummaryEditing(false);
    setStep(nextStep);
  }

  function navigateBackTo(previousStep: number) {
    if (previousStep >= 1 && previousStep < step) {
      navigateTo(previousStep);
    }
  }

  function goNext() {
    if (pending) return;
    if (validateStep(step) && step < STEPS) {
      navigateTo(step + 1);
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || summaryEditing) return;
    if (step !== STEPS) {
      goNext();
      return;
    }

    const nextErrors = validateForm(values, serverErrors);
    updateErrors(nextErrors);
    // firstErrorStep recibe solo errores: las claves undefined también son overrides.
    const invalidFields = Object.fromEntries(
      Object.entries(nextErrors).filter(([, issue]) => Boolean(issue)),
    );
    if (Object.keys(invalidFields).length > 0) {
      const correctionStep = firstErrorStep(invalidFields);
      // En el paso actual esperar al render de los mensajes antes de enfocar.
      focusRequest.current = { errors: invalidFields };
      if (correctionStep !== step) navigateTo(correctionStep, invalidFields);
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
    if (avatarFile) {
      formData.set("avatar", avatarFile);
    }
    if (captureFile) {
      formData.set("capture", captureFile);
    }
    setInviteUrl(`${window.location.origin}/`);
    // Retirar la respuesta anterior antes de iniciar el siguiente envío.
    setValidation({ response: state, overrides: {}, retired: true });
    startTransition(() => {
      formAction(formData);
    });
  }

  function toggleSummaryEditing() {
    if (pending) return;
    if (!summaryEditing) {
      focusRequest.current = { summary: "edit" };
      setSummaryEditing(true);
      return;
    }
    const errors = validateForm(values, serverErrors);
    updateErrors(errors);
    if (Object.values(errors).some(Boolean)) {
      focusRequest.current = { errors };
      return;
    }
    focusRequest.current = { summary: "read" };
    setSummaryEditing(false);
  }

  // One mounted set of controls: the normal step OR its summary card.
  const identityFields = (
    <>
      <div className={cn("grid items-start gap-md", summaryEditing ? "lg:grid-cols-[12rem_minmax(0,1fr)] lg:gap-lg" : "md:grid-cols-[12rem_minmax(0,1fr)] md:gap-lg")}>
        <FileField
          name="avatar"
          file={avatarFile}
          compact={summaryEditing}
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
                  className={cn("pointer-events-none absolute top-1/2 size-4 -translate-y-1/2 text-text-primary", summaryEditing ? "right-[min(var(--spacing-sm),16px)]" : "right-sm")}
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
    </>
  );

  // One mounted set of controls: the normal step OR its summary card.
  const storyFields = (
    <>
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
        <div className={cn("grid grid-cols-1 gap-sm sm:gap-md", summaryEditing ? "lg:grid-cols-2" : "sm:grid-cols-2")}>
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
        <div className={cn("grid grid-cols-1 gap-sm sm:gap-md", summaryEditing ? "lg:grid-cols-2" : "sm:grid-cols-2")}>
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
          stackTrailingInfo={summaryEditing}
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
    </>
  );

  // One mounted set of controls: the normal step OR its summary card.
  const mediaFields = (
    <>
      <div className={cn("grid items-start gap-md", summaryEditing ? "lg:grid-cols-2 lg:gap-lg" : "md:grid-cols-2 md:gap-lg")}>
        <FileField
          name="capture"
          file={captureFile}
          compact={summaryEditing}
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
    </>
  );

  const form = (
    <form
      ref={formRef}
      action={formAction}
      onSubmit={onSubmit}
      className="mt-lg flex flex-col gap-lg"
      noValidate
    >
      <StepProgress step={step} pending={pending} onNavigateBack={navigateBackTo} headingRef={headingRef} />

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
        {!summaryEditing ? identityFields : null}
      </fieldset>

      <fieldset
        hidden={step !== 3}
        className={cn(step === 3 && "flex flex-col gap-md")}
      >
        <legend className="sr-only">{t("form.steps.story.title")}</legend>
        {!summaryEditing ? storyFields : null}
      </fieldset>

      <fieldset
        hidden={step !== 4}
        className={cn(step === 4 && "flex flex-col gap-md")}
      >
        <legend className="sr-only">{t("form.steps.media.title")}</legend>
        {!summaryEditing ? mediaFields : null}
      </fieldset>

      <fieldset
        hidden={step !== 5}
        className={cn(step === 5 && "flex flex-col gap-md")}
      >
        <legend className="sr-only">{t("form.steps.consent.title")}</legend>
        <div data-summary-heading="" className={cn("min-w-0", controls.summaryHeading)}>
          <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-sm gap-y-xs">
            <h3 className="min-w-0 max-w-full flex-initial text-heading-3 text-text-primary">{t("form.review.title")}</h3>
            {!summaryEditing ? <Button
              ref={summaryEditRef}
              type="button"
              variant="ghost"
              size="sm"
              disabled={pending}
              aria-pressed={false}
              aria-controls="testimonial-summary"
              aria-label={t("form.review.editSummary")}
              onClick={toggleSummaryEditing}
              className="ml-auto h-auto min-h-11 max-w-full px-xs py-xs text-body-small whitespace-normal"
            >
              <Pencil aria-hidden="true" className="size-3.5" />
              {t("form.review.edit")}
            </Button> : null}
          </div>
          <p className="mt-xs text-body-small leading-relaxed text-text-secondary">
            {t("form.review.description")}
          </p>
        </div>
        {/* Cap only mobile summary gutters at their 16px-root token sizes. Enlarged
            text keeps room to reflow without changing other steps or desktop. */}
        <section id="testimonial-summary" aria-labelledby="testimonial-summary-title" className="min-w-0 space-y-md max-sm:mx-[min(0px,calc(24px_-_var(--spacing-md)))]">
          <h4 id="testimonial-summary-title" className="sr-only">{t("form.review.summaryTitle")}</h4>
          <section aria-labelledby="summary-personal-title" className="rounded-card border border-border bg-card p-sm max-sm:px-[min(var(--spacing-sm),16px)] sm:p-md">
            <h5 id="summary-personal-title" className="text-lg font-semibold text-text-primary">{t("form.review.personalTitle")}</h5>
            {summaryEditing ? (
              <div data-summary-editor="" className={cn("mt-md flex min-w-0 flex-col gap-md", controls.summaryEditor)}>
                {identityFields}
                <p className="text-body-small leading-relaxed text-text-secondary">{t("form.review.emailPrivacy")}</p>
              </div>
            ) : (

            <div className="mt-md flex min-w-0 flex-col gap-md sm:flex-row sm:items-start">
              {avatarFile ? (
                step === 5 ? <SummaryImage file={avatarFile} alt={t("form.fields.avatar.label")} className="block h-auto w-24 max-w-full shrink-0 rounded-md border border-border" /> : null
              ) : (
                <p className="text-body-small text-text-secondary">{t("form.review.avatarMissing")}</p>
              )}
              <div className="min-w-0 flex-1">
                <dl className="grid min-w-0 gap-x-md gap-y-sm sm:grid-cols-2">
                  <div className="min-w-0 sm:col-span-2">
                    <dt className="text-body-small text-text-secondary">{t("form.review.nameLabel")}</dt>
                    <dd className="mt-1 text-lg font-semibold wrap-anywhere text-text-primary">{fullName.trim() || t("form.review.missing")}</dd>
                  </div>
                  {[
                    ["country", t("form.fields.country.label"), (isOtherCountry ? country.trim() : countryOptions.find(option => option.value === country)?.label ?? country.trim()) || t("form.review.missing")],
                    ["email", t("form.fields.email.label"), email.trim() || t("form.review.missing")],
                  ].map(([key, label, value]) => (
                    <div key={key} className="min-w-0">
                      <dt className="text-body-small text-text-secondary">{label}</dt>
                      <dd className="mt-1 text-body wrap-anywhere text-text-primary">{value}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-sm text-body-small leading-relaxed text-text-secondary">{t("form.review.emailPrivacy")}</p>
              </div>
            </div>
            )}
          </section>
          <section aria-labelledby="summary-experience-title" className="rounded-card border border-border bg-card p-sm max-sm:px-[min(var(--spacing-sm),16px)] sm:p-md">
            <h5 id="summary-experience-title" className="text-lg font-semibold text-text-primary">{t("form.review.experienceTitle")}</h5>
            <div className="mt-sm">
              <p className="text-body-small text-text-secondary">{t("form.review.typeLabel")}</p>
              <p className="mt-xs inline-block max-w-full rounded-md border border-border bg-bg-surface-1 px-xs py-1 text-body-small font-medium wrap-anywhere text-text-primary">
                {selected?.label ?? t("form.review.notSelected")}
              </p>
            </div>
            {summaryEditing ? <div data-summary-editor="" className={cn("mt-md flex min-w-0 flex-col gap-md", controls.summaryEditor)}>{storyFields}</div> : (
            <dl className="mt-md grid gap-x-md gap-y-md sm:grid-cols-2">
              {professionalSummary.map(([label, value]) => (
                <div key={label} className="min-w-0">
                  <dt className="text-body-small text-text-secondary">{label}</dt>
                  <dd className="mt-1 text-body wrap-anywhere text-text-primary">{value}</dd>
                </div>
              ))}
              <div className="min-w-0 border-t border-border-subtle pt-sm sm:col-span-2">
                <dt className="text-body-small text-text-secondary">{selected?.storyLabel ?? t("form.steps.story.title")}</dt>
                <dd className="mt-xs text-body leading-relaxed whitespace-pre-wrap wrap-anywhere text-text-primary">{story.trim() ? story : t("form.review.missing")}</dd>
              </div>
            </dl>
            )}
          </section>
          <section aria-labelledby="summary-media-title" className="rounded-card border border-border bg-card p-sm max-sm:px-[min(var(--spacing-sm),16px)] sm:p-md">
            <h5 id="summary-media-title" className="text-lg font-semibold text-text-primary">{t("form.review.mediaTitle")}</h5>
            {summaryEditing ? (
              <div data-summary-editor="" className={cn("mt-md flex min-w-0 flex-col gap-md", controls.summaryEditor)}>
                {mediaFields}
              </div>
            ) : (

            <div className="mt-md min-w-0">
              {captureFile ? (
                <figure className="min-w-0">
                  <figcaption className="mb-xs text-body-small text-text-secondary">{t("form.fields.capture.label")}</figcaption>
                  {step === 5 ? <SummaryImage file={captureFile} alt={t("form.fields.capture.label")} className="block h-auto w-full max-w-[36rem] rounded-md border border-border" /> : null}
                </figure>
              ) : (
                <p className="text-body-small text-text-secondary">{t("form.review.captureMissing")}</p>
              )}
              {videoUrl.trim() || instagram.trim() || linkedin.trim() ? (
                <dl className="mt-xs grid gap-x-md sm:grid-cols-2">
                  {[
                    ...(videoUrl.trim() ? [[t("form.fields.video_url.summaryLabel"), videoUrl.trim()]] : []),
                    ...(instagram.trim() ? [[t("form.fields.instagram.label"), instagram.trim()]] : []),
                    ...(linkedin.trim() ? [[t("form.fields.linkedin.label"), linkedin.trim()]] : []),
                  ].map(([label, value]) => (
                    <div key={label} className="min-w-0 border-t border-border-subtle py-sm">
                      <dt className="text-body-small text-text-secondary">{label}</dt>
                      <dd className="mt-1 text-body wrap-anywhere text-text-primary">{value}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </div>
            )}
          </section>
          <p className="mt-sm text-body-small leading-relaxed text-text-secondary">{t("form.review.moderationHint")}</p>
          {summaryEditing ? (
            <div className="flex min-w-0 justify-end">
              <Button
                data-summary-done=""
                type="button"
                variant="outline"
                size="sm"
                disabled={pending}
                aria-pressed={true}
                aria-controls="testimonial-summary"
                aria-label={t("form.review.doneSummary")}
                onClick={toggleSummaryEditing}
                className="h-auto min-h-11 max-w-full border-accent-indigo-light px-sm py-xs text-body-small whitespace-normal enabled:hover:border-accent-cyan dark:border-accent-indigo-light"
              >
                {t("form.review.done")}
              </Button>
            </div>
          ) : null}
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
        {step === STEPS ? (
          <p id="submission-authorization" className="w-full min-w-0 text-body-small leading-relaxed text-text-secondary">
            {t("form.consent.submission")}
          </p>
        ) : null}
        {step > 1 ? (
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="h-auto min-h-11 max-w-full px-sm whitespace-normal"
            disabled={step === 1 || pending}
            onClick={() => navigateBackTo(step - 1)}
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
            disabled={pending}
            className={step === 1 ? "h-auto min-h-11 w-full max-w-full px-md whitespace-normal sm:w-auto" : "h-auto min-h-11 max-w-full px-md whitespace-normal"}
            onClick={goNext}
          >
            {t("form.navigation.next")}
          </Button>
        ) : (
          <Button
            key="submit"
            type="submit"
            aria-describedby="submission-authorization"
            variant="gradient"
            size="lg"
            className="h-auto min-h-11 max-w-full px-sm whitespace-normal sm:px-md"
            disabled={pending || summaryEditing}
          >
            {pending ? t("form.submit.pending") : t("form.submit.label")}
          </Button>
        )}
      </div>
    </form>
  );

  return <>{children}{form}</>;
}

/** Owns one URL for the confirmed file, only while its summary image is mounted. */
function SummaryImage({ file, alt, className }: { file: File; alt: string; className: string }) {
  const imageRef = useRef<HTMLImageElement>(null);
  useLayoutEffect(() => {
    const image = imageRef.current;
    if (!image) return;
    const url = URL.createObjectURL(file);
    image.src = url;
    return () => {
      image.removeAttribute("src");
      URL.revokeObjectURL(url);
    };
  }, [file]);
  // Local blob owned by this component; no remote loader or second visual crop.
  // eslint-disable-next-line @next/next/no-img-element
  return <img ref={imageRef} alt={alt} className={className} />;
}

/** Backward-only navigation; relative position never represents validation status. */
function StepProgress({ step, pending, onNavigateBack, headingRef }: {
  step: number;
  pending: boolean;
  onNavigateBack: (step: number) => void;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
}) {
  const { locale, t } = useFormLocale();
  const steps = getFormMessages(locale).form.steps;
  return (
    <div>
      <h2 ref={headingRef} tabIndex={-1} className="text-overline text-text-secondary focus:outline-none">
        {t("form.progress", { step, total: STEPS, title: steps[STEP_KEYS[step - 1]].title })}
      </h2>
      <ol className="mt-md grid grid-cols-5">
        {STEP_KEYS.map((key, index) => {
          const label = steps[key].short;
          const targetStep = index + 1;
          const current = step === targetStep;
          const previous = targetStep < step;
          const content = (
            <>
              <span aria-hidden="true" className="relative flex w-full justify-center">
                {index < STEPS - 1 ? (
                  <span className="pointer-events-none absolute top-1/2 left-1/2 h-px w-full bg-border" />
                ) : null}
                <span className={cn(
                  "relative flex aspect-square w-10 max-w-[calc(100%-0.25rem)] shrink-0 items-center justify-center rounded-full text-body-small leading-none font-semibold",
                  current
                    ? "bg-brand-gradient text-white ring-4 ring-brand-pink/10"
                    : previous
                      ? "border border-accent-cyan/40 bg-bg-base text-text-secondary"
                      : "border border-border bg-bg-base text-text-secondary",
                  previous && "transition-colors duration-150 group-enabled/step:group-hover/step:border-accent-cyan motion-reduce:transition-none",
                )}>
                  {targetStep}
                </span>
              </span>
              <span aria-hidden="true" className={cn("hidden text-body-small md:block", current ? "font-medium text-text-primary" : "text-text-secondary")}>
                {label}
              </span>
            </>
          );
          return (
            <li key={key} aria-current={current ? "step" : undefined} className="relative flex min-w-0 flex-col items-center text-center">
              {previous ? (
                <button
                  type="button"
                  disabled={pending}
                  aria-label={t("form.navigation.backToStep", { step: targetStep, title: label })}
                  onClick={() => onNavigateBack(targetStep)}
                  className="group/step relative flex w-full min-w-0 cursor-pointer flex-col items-center gap-xs rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-cyan disabled:cursor-default"
                >
                  {content}
                </button>
              ) : (
                <span className="relative flex w-full min-w-0 flex-col items-center gap-xs">
                  {content}
                  <span className="sr-only">{t("form.progress", { step: targetStep, total: STEPS, title: steps[key].title })}</span>
                </span>
              )}
            </li>
          );
        })}
      </ol>
      {step > 1 ? (
        <p className="mt-sm text-center text-body-small leading-relaxed text-text-secondary md:hidden">
          {t("form.navigation.previousStepsHint")}
        </p>
      ) : null}
    </div>
  );
}

function SuccessCard({ inviteUrl: baseInviteUrl }: { inviteUrl: string }) {
  const { locale, t } = useFormLocale();
  const inviteUrl = new URL(buildHeroHref(locale), baseInviteUrl).toString();
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
          <Link href={buildHeroHref(locale)} className={cn(buttonVariants({ variant: "outline" }), "min-h-11 px-sm")}>
            {t("form.navigation.home")}
          </Link>
        </div>
      </div>
    </div>
  );
}
