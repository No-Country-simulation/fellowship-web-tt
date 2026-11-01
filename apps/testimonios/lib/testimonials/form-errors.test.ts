import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  FORM_FIELDS, isFieldActive, resolveFormErrors, updateFormErrors,
  validateField, validateFormStep, type FormValidation, type FormValues,
} from "./form-validation";
import {
  AVATAR_MAX_BYTES, CAPTURE_MAX_BYTES, FIELD_MAX_CHARS, FIELD_STEP,
  NAME_MAX_CHARS, STORY_MAX_CHARS, STORY_MIN_CHARS, firstErrorStep,
  normalizeInstagram, normalizeLinkedIn, normalizeYouTubeUrl,
  parseTestimonialForm, validateCountry, type FieldErrors,
} from "./parse";
import { initialSubmitState, type SubmitState } from "./submit-state";
import { TESTIMONIAL_TYPES } from "./types";
import { formIssue, type FormIssue } from "./issues";
import { formatFormIssue, presentFormErrors } from "../form-i18n/issues";
import { getFormMessages } from "../form-i18n/messages";
import { FORM_LOCALES } from "../form-i18n/locales";

import { validValues, formDataFor } from "./form-errors.fixtures";

function activeErrors(errors: FieldErrors) {
  return Object.fromEntries(Object.entries(errors).filter(([, error]) => Boolean(error)));
}

function serverResponse(fieldErrors: Record<string, FormIssue> = {}): Extract<SubmitState, { status: "error" }> {
  return { status: "error", issue: formIssue("validation.summary"), fieldErrors, step: 2 };
}

describe("validation rules characterized before migration", () => {
  it("validates all five steps of all three categories and keeps explicit undefined overrides", () => {
    for (const type of TESTIMONIAL_TYPES) {
      const values = validValues({ type });
      for (let step = 1; step <= 5; step++) {
        const errors = validateFormStep(step, values);
        assert.deepEqual(activeErrors(errors), {});
        assert.deepEqual(Object.keys(errors), FORM_FIELDS.filter(field => FIELD_STEP[field] === step && isFieldActive(field, type)));
      }
      assert.equal(parseTestimonialForm(formDataFor(values)).ok, true);
    }
  });

  it("keeps required errors, active professional fields and minimum correction step", () => {
    const values = validValues({ type: "", full_name: "", country: "", email: "", avatar: null, story: "", consent: false });
    const expected = [["type"], ["full_name", "country", "email", "avatar"], ["story"], [], ["consent"]];
    for (let step = 1; step <= 5; step++) {
      assert.deepEqual(Object.keys(activeErrors(validateFormStep(step, values))), expected[step - 1]);
    }
    const result = parseTestimonialForm(formDataFor(values));
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.equal(firstErrorStep(result.fieldErrors), 1);
    assert.equal(firstErrorStep({ story: formIssue("story.required"), email: formIssue("email.invalid") }), 2);
    assert.equal(firstErrorStep({}), 1);
    for (const type of TESTIMONIAL_TYPES) {
      const emptyRoles = validValues({ type, company: "", primary_role: "", role_achieved: "", previous_profession: "", new_role: "" });
      const professional = Object.keys(activeErrors(validateFormStep(3, emptyRoles)));
      assert.deepEqual(professional, type === "simulation" ? [] : type === "first_job" ? ["company", "role_achieved"] : ["previous_profession", "new_role"]);
    }
  });

  it("preserves inclusive story/name/professional limits and trims before measuring", () => {
    for (const length of [STORY_MIN_CHARS, STORY_MAX_CHARS]) {
      assert.equal(validateField("story", validValues({ story: "x".repeat(length) })), undefined);
      assert.equal(parseTestimonialForm(formDataFor(validValues({ story: "x".repeat(length) }))).ok, true);
    }
    assert.deepEqual(validateField("story", validValues({ story: "x".repeat(STORY_MIN_CHARS - 1) })), formIssue("story.minLength", { min: STORY_MIN_CHARS }));
    assert.deepEqual(validateField("story", validValues({ story: "x".repeat(STORY_MAX_CHARS + 1) })), formIssue("text.maxLength", { max: STORY_MAX_CHARS }));
    assert.equal(validateField("full_name", validValues({ full_name: `  ${"x".repeat(NAME_MAX_CHARS)}  ` })), undefined);
    assert.ok(validateField("full_name", validValues({ full_name: "x".repeat(NAME_MAX_CHARS + 1) })));
    for (const type of TESTIMONIAL_TYPES) {
      for (const field of ["primary_role", "company", "role_achieved", "previous_profession", "new_role"] as const) {
        const values = validValues({ type, [field]: "x".repeat(FIELD_MAX_CHARS + 1) });
        assert.equal(Boolean(validateField(field, values)), isFieldActive(field, type));
      }
    }
  });

  it("preserves Unicode country rules and optional link normalization", () => {
    for (const country of ["México", "Côte d’Ivoire", "Timor-Leste", "España (UE)", " 日本 "]) assert.equal(validateCountry(country), undefined);
    for (const country of ["", "123", "Brasil2", "🙂", "A".repeat(FIELD_MAX_CHARS + 1)]) assert.ok(validateCountry(country));
    assert.equal(normalizeInstagram("https://www.instagram.com/persona/"), "@persona");
    assert.equal(normalizeLinkedIn("@persona"), "https://www.linkedin.com/in/persona");
    assert.equal(normalizeYouTubeUrl(" https://youtu.be/abcdefghijk?t=4 "), "https://youtu.be/abcdefghijk?t=4");
    for (const field of ["video_url", "instagram", "linkedin"] as const) {
      assert.equal(validateField(field, validValues({ [field]: " " })), undefined);
      assert.ok(validateField(field, validValues({ [field]: "https://invalid.example/no/profile" })));
    }
    assert.ok(validateField("email", validValues({ email: "invalid" })));
    assert.equal(validateField("email", validValues({ email: " person@example.com " })), undefined);
  });

  it("preserves image MIME OR extension, exact size boundaries and server zero-byte filtering", () => {
    for (const [field, maxBytes] of [["avatar", AVATAR_MAX_BYTES], ["capture", CAPTURE_MAX_BYTES]] as const) {
      for (const [name, type] of [["photo.bin", "image/png"], ["photo.JPG", "application/octet-stream"]]) {
        const file = new File([new Uint8Array(maxBytes)], name, { type });
        assert.equal(validateField(field, validValues({ [field]: file })), undefined);
        assert.equal(parseTestimonialForm(formDataFor(validValues({ [field]: file }))).ok, true);
      }
      assert.ok(validateField(field, validValues({ [field]: new File([new Uint8Array(maxBytes + 1)], "image.png", { type: "image/png" }) })));
      assert.ok(validateField(field, validValues({ [field]: new File(["x"], "image.gif", { type: "image/gif" }) })));
    }
    assert.equal(validateField("capture", validValues({ capture: null })), undefined);
    assert.ok(validateField("avatar", validValues({ avatar: null })));
    const zero = validValues({ avatar: new File([], "empty.png", { type: "image/png" }) });
    assert.equal(validateField("avatar", zero), undefined);
    const result = parseTestimonialForm(formDataFor(zero));
    assert.equal(result.ok, false);
    if (!result.ok) assert.deepEqual(result.fieldErrors.avatar, formIssue("avatar.required"));
  });

  it("keeps parsed data, active payload, normalization and server consent timestamp", () => {
    const before = Date.now();
    for (const type of TESTIMONIAL_TYPES) {
      const result = parseTestimonialForm(formDataFor(validValues({ type, country: " Brasil ", full_name: " Persona ", instagram: "persona", linkedin: "persona" })));
      assert.equal(result.ok, true);
      if (!result.ok) continue;
      assert.equal(result.data.country, "Brasil");
      assert.equal(result.data.fullName, "Persona");
      assert.equal(result.data.instagram, "@persona");
      assert.equal(result.data.linkedin, "https://www.linkedin.com/in/persona");
      assert.deepEqual(result.data.payload, type === "simulation" ? { primary_role: "Desarrollo" } : type === "first_job" ? { company: "Empresa de prueba", role_achieved: "Desarrollo web" } : { previous_profession: "Docencia", new_role: "Desarrollo" });
      assert.ok(Date.parse(result.data.consentAt) >= before && Date.parse(result.data.consentAt) <= Date.now());
    }
  });
});

describe("response identity and reconciliation characterization", () => {
  const fields = { email: formIssue("email.invalid"), story: formIssue("story.required"), company: formIssue("company.required") };

  it("retains unedited server errors and clears only explicitly corrected fields", () => {
    const response = serverResponse(fields);
    const validation = updateFormErrors({ response, overrides: {} }, response, { email: undefined });
    const result = resolveFormErrors(response, validation, "first_job", false);
    assert.equal(validation.response, response);
    assert.equal(Object.prototype.hasOwnProperty.call(validation.overrides, "email"), true);
    assert.equal(result.fieldErrors.email, undefined);
    assert.equal(result.serverErrors.story, fields.story);
    assert.equal(result.serverErrors.company, fields.company);
    assert.equal(result.issue?.code, "validation.summary");
  });

  it("uses reference equality and resets overrides for a new equal-valued response", () => {
    const response = serverResponse(fields);
    const validation: FormValidation = { response, overrides: { email: undefined }, retired: true };
    const newer = { ...response };
    assert.equal(resolveFormErrors(newer, validation, "first_job", false).fieldErrors.email, fields.email);
    const updated = updateFormErrors(validation, newer, { story: undefined });
    assert.equal(updated.response, newer);
    assert.deepEqual(Object.keys(updated.overrides), ["story"]);
    assert.equal(updated.retired, false);
  });

  it("suppresses pending/retired server responses while keeping local overrides", () => {
    const response = serverResponse(fields);
    for (const [pending, retired] of [[true, false], [false, true]]) {
      const localIssue = formIssue("country.invalid");
      const result = resolveFormErrors(response, { response, overrides: { country: localIssue }, retired }, "first_job", pending);
      assert.deepEqual(result.serverErrors, {});
      assert.equal(result.issue, undefined);
      assert.equal(result.fieldErrors.country, localIssue);
    }
    assert.equal(updateFormErrors({ response, overrides: {}, retired: true }, response, { country: undefined }).retired, true);
  });

  it("filters conditional errors without mutating retained category values or the response", () => {
    const response = serverResponse({ company: formIssue("company.required"), previous_profession: formIssue("previous_profession.required"), primary_role: formIssue("text.maxLength", { max: FIELD_MAX_CHARS }) });
    const snapshot = structuredClone(response);
    const validation = { response, overrides: {} };
    assert.deepEqual(Object.keys(resolveFormErrors(response, validation, "simulation", false).fieldErrors), ["primary_role"]);
    assert.deepEqual(Object.keys(resolveFormErrors(response, validation, "first_job", false).fieldErrors), ["company"]);
    assert.deepEqual(Object.keys(resolveFormErrors(response, validation, "career_change", false).fieldErrors), ["previous_profession"]);
    assert.deepEqual(response, snapshot);
    assert.equal(validation.response, response);
  });

  it("removes the validation summary only when all active server errors are resolved", () => {
    const response = serverResponse({ email: formIssue("email.invalid"), company: formIssue("company.required") });
    const validation = { response, overrides: { email: undefined } };
    assert.equal(resolveFormErrors(response, validation, "simulation", false).issue, undefined);
    assert.equal(resolveFormErrors(response, validation, "first_job", false).issue?.code, "validation.summary");
  });

  it("preserves unknown-field errors and general non-validation failures", () => {
    const unknownIssue = formIssue("submit.unexpected");
    const response = serverResponse({ future_field: unknownIssue });
    assert.deepEqual(resolveFormErrors(response, { response, overrides: {} }, "simulation", false).unknownErrors, [["future_field", unknownIssue]]);
    const general: SubmitState = { status: "error", issue: formIssue("submit.saveFailed") };
    assert.equal(resolveFormErrors(general, { response: general, overrides: {} }, "simulation", false).issue, general.issue);
    assert.deepEqual(resolveFormErrors(initialSubmitState, { response: initialSubmitState, overrides: {} }, "", false).fieldErrors, {});
  });
});

describe("semantic issues and locale-independent presentation", () => {
  const cases: Partial<FormValues>[] = [
    { type: "" }, { full_name: "" }, { full_name: "x".repeat(NAME_MAX_CHARS + 1) },
    { country: "" }, { country: "123" }, { country: "x".repeat(FIELD_MAX_CHARS + 1) },
    { email: "" }, { email: "invalid" }, { story: "" },
    { story: "x".repeat(STORY_MIN_CHARS - 1) }, { story: "x".repeat(STORY_MAX_CHARS + 1) },
    { primary_role: "x".repeat(FIELD_MAX_CHARS + 1) },
    { type: "first_job", company: "" }, { type: "first_job", role_achieved: "" },
    { type: "first_job", company: "x".repeat(FIELD_MAX_CHARS + 1) },
    { type: "first_job", role_achieved: "x".repeat(FIELD_MAX_CHARS + 1) },
    { type: "career_change", previous_profession: "" }, { type: "career_change", new_role: "" },
    { type: "career_change", previous_profession: "x".repeat(FIELD_MAX_CHARS + 1) },
    { type: "career_change", new_role: "x".repeat(FIELD_MAX_CHARS + 1) },
    { avatar: null },
    { avatar: new File(["x"], "avatar.gif", { type: "image/gif" }) },
    { capture: new File(["x"], "capture.gif", { type: "image/gif" }) },
    { avatar: new File([new Uint8Array(AVATAR_MAX_BYTES + 1)], "avatar.png", { type: "image/png" }) },
    { capture: new File([new Uint8Array(CAPTURE_MAX_BYTES + 1)], "capture.png", { type: "image/png" }) },
    { video_url: "https://example.com/not-youtube" }, { instagram: "https://example.com/no/user" },
    { linkedin: "https://example.com/no/profile" }, { consent: false },
  ];

  it("produces identical client/server incidences across all failure cases and steps", () => {
    for (const updates of cases) {
      const values = validValues(updates);
      const client = Object.assign({}, ...[1, 2, 3, 4, 5].map(step => activeErrors(validateFormStep(step, values))));
      const parsed = parseTestimonialForm(formDataFor(values));
      assert.equal(parsed.ok, false);
      if (parsed.ok) continue;
      assert.deepEqual(parsed.fieldErrors, client);
      assert.deepEqual(parsed.issue, formIssue("validation.summary"));
    }
  });

  it("localizes every emitted field issue in both catalogs after JSON transport", () => {
    for (const updates of cases) {
      const parsed = parseTestimonialForm(formDataFor(validValues(updates)));
      if (parsed.ok) assert.fail("Expected invalid fixture");
      for (const issue of Object.values(parsed.fieldErrors)) {
        for (const locale of FORM_LOCALES) {
          const text = formatFormIssue(JSON.parse(JSON.stringify(issue)), locale);
          assert.ok(text.trim());
          assert.notEqual(text, getFormMessages(locale).form.errors.submit.unexpected);
          assert.doesNotMatch(text, /\{(?:min|max|maxMb)\}|undefined|form\.errors\./);
        }
      }
    }
  });

  it("uses a semantic summary discriminant regardless of incidental message properties", () => {
    const response = serverResponse();
    if (response.status !== "error") assert.fail();
    Object.assign(response.issue, { message: "arbitrary synthetic diagnostic" });
    assert.equal(resolveFormErrors(response, { response, overrides: {} }, "simulation", false).issue, undefined);
  });

  it("localizes crop and general server issues through the same presentation boundary", () => {
    for (const code of ["image.cropFailed", "submit.excerptFailed", "submit.uploadFailed", "submit.unavailable", "submit.saveFailed", "submit.unexpected"] as const) {
      for (const locale of FORM_LOCALES) {
        const text = formatFormIssue(formIssue(code), locale);
        assert.ok(text.trim());
        assert.doesNotMatch(text, /undefined|form\.errors\.|\{\w+\}/);
        if (code !== "submit.unexpected") assert.notEqual(text, getFormMessages(locale).form.errors.submit.unexpected);
      }
    }
  });

  it("re-localizes the same active response without revalidation, retirement or mutations", () => {
    const response = serverResponse({ story: formIssue("story.minLength", { min: STORY_MIN_CHARS }), email: formIssue("email.invalid") });
    const validation: FormValidation = { response, overrides: { email: undefined } };
    const resolved = resolveFormErrors(response, validation, "simulation", false);
    const before = structuredClone(response);
    const es = presentFormErrors(resolved, "es");
    const pt = presentFormErrors(resolved, "pt-BR");
    assert.equal(es.fieldErrors.story, `Escribe al menos ${STORY_MIN_CHARS} caracteres.`);
    assert.equal(pt.fieldErrors.story, `Escreva pelo menos ${STORY_MIN_CHARS} caracteres.`);
    assert.equal(es.fieldErrors.email, undefined);
    assert.equal(pt.fieldErrors.email, undefined);
    assert.equal(validation.response, response);
    assert.equal(resolved.serverErrors.story, response.fieldErrors?.story);
    assert.deepEqual(response, before);
    assert.equal(validation.retired, undefined);
  });

  it("localizes a response received after a language change using the presentation locale", async () => {
    let deliver!: (response: SubmitState) => void;
    const pending = new Promise<SubmitState>(resolve => { deliver = resolve; });
    let locale = "es";
    locale = "pt-BR";
    deliver(JSON.parse(JSON.stringify(serverResponse({ email: formIssue("email.invalid") }))));
    const response = await pending;
    const resolved = resolveFormErrors(response, { response: initialSubmitState, overrides: {}, retired: true }, "simulation", false);
    assert.equal(presentFormErrors(resolved, locale).fieldErrors.email, "Informe um e-mail válido.");
    assert.equal("locale" in response, false);
  });

  it("keeps new local failures associated with the original server field until actually corrected", () => {
    const response = serverResponse({ email: formIssue("email.invalid") });
    const replacement = formIssue("email.required");
    const validation = updateFormErrors({ response, overrides: {} }, response, { email: replacement });
    const resolved = resolveFormErrors(response, validation, "simulation", false);
    assert.equal(resolved.fieldErrors.email, replacement);
    assert.equal(resolved.serverErrors.email, replacement);
    assert.equal(resolved.issue?.code, "validation.summary");
    assert.equal(firstErrorStep(resolved.serverErrors), 2);
  });

  it("uses a localized safe fallback for unknown/legacy errors and malformed parameters", () => {
    for (const issue of [
      null, undefined, "synthetic legacy backend detail", new Error("synthetic internal detail"),
      { code: "unknown", message: "synthetic internal detail" },
      { code: "text.maxLength" }, { code: "text.maxLength", params: { max: "internal detail" } },
      { code: "story.minLength", params: { min: NaN } }, { code: "__proto__" },
    ]) {
      for (const locale of FORM_LOCALES) assert.equal(formatFormIssue(issue, locale), getFormMessages(locale).form.errors.submit.unexpected);
    }
    const response = { status: "error", message: "synthetic legacy backend detail", fieldErrors: { future_field: { code: "unknown" } } } as unknown as SubmitState;
    const presented = presentFormErrors(resolveFormErrors(response, { response, overrides: {} }, "simulation", false), "pt-BR");
    assert.equal(presented.message, getFormMessages("pt-BR").form.errors.submit.unexpected);
    assert.equal(presented.unknownErrors[0][1], getFormMessages("pt-BR").form.errors.submit.unexpected);
  });

  it("does not broaden country/email rules or active payload while migrating error representation", () => {
    assert.equal(validateField("email", validValues({ email: `${"a".repeat(300)}@example.com` })), undefined);
    for (const type of TESTIMONIAL_TYPES) {
      const values = validValues({ type });
      for (const field of ["company", "primary_role", "role_achieved", "previous_profession", "new_role"] as const) {
        if (!isFieldActive(field, type)) values[field] = "x".repeat(FIELD_MAX_CHARS + 1);
      }
      assert.equal(parseTestimonialForm(formDataFor(values)).ok, true);
    }
    const data = formDataFor(validValues());
    data.set("consent", "true");
    const parsed = parseTestimonialForm(data);
    if (parsed.ok) assert.fail();
    assert.equal(parsed.fieldErrors.consent?.code, "consent.required");
  });
});

function verifyIssueTypes() {
  // @ts-expect-error Semantic codes never use the Spanish text as identifier.
  formIssue("Revisá los campos marcados.");
  // @ts-expect-error Required parameters cannot be omitted.
  formIssue("story.minLength");
  // @ts-expect-error Size is numeric and uses the catalog's exact parameter name.
  formIssue("avatar.maxSize", { maxMb: "5" });
  // @ts-expect-error No params for a simple required-field issue.
  formIssue("email.required", { max: 120 });
}
void verifyIssueTypes;
