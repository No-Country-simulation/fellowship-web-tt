import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { COUNTRY_OPTIONS, OTHER_COUNTRY_VALUE } from "../testimonials/countries";
import {
  AVATAR_MAX_BYTES,
  CAPTURE_MAX_BYTES,
  FIELD_MAX_CHARS,
  NAME_MAX_CHARS,
  STORY_MAX_CHARS,
  STORY_MIN_CHARS,
} from "../testimonials/parse";
import { TESTIMONIAL_TYPES, TYPE_LABELS, TYPE_OPTIONS } from "../testimonials/types";
import { FORM_COUNTRY_KEYS, getFormCountryOptions } from "./countries";
import { FORM_MESSAGE_PARAMETERS, interpolateFormMessage } from "./format";
import type { FormTranslator } from "./format";
import { FORM_LIMITS } from "./limits";
import {
  DEFAULT_FORM_LOCALE,
  FORM_LOCALES,
  buildFormHref,
  buildHeroHref,
  formHtmlLang,
  isFormLocale,
  normalizeFormLocale,
  resolveFormLocale,
  resolvePreferredFormLocale,
} from "./locales";
import {
  FORM_CONSENT_REVIEW_STATUS,
  createFormTranslator,
  getFormMessage,
  getFormMessages,
} from "./messages";
import { es } from "./messages/es";
import { en } from "./messages/en";
import { ptBR } from "./messages/pt-BR";
import type { FormMessageKey, FormMessages } from "./types";
import { getFormMetadata } from "./metadata";

function flatten(value: object, prefix = ""): Record<string, string> {
  return Object.fromEntries(Object.entries(value).flatMap(([key, item]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof item === "string"
      ? [[path, item]]
      : Object.entries(flatten(item, path));
  }));
}

function placeholders(message: string): string[] {
  return [...new Set([...message.matchAll(/\{([A-Za-z]\w*)\}/g)].map(match => match[1]))].sort();
}

describe("strict locale protocol", () => {
  for (const locale of FORM_LOCALES) {
    it(`accepts ${locale} in page and client query representations`, () => {
      assert.equal(isFormLocale(locale), true);
      assert.equal(normalizeFormLocale(locale), locale);
      assert.equal(resolveFormLocale({ lang: locale }), locale);
      assert.equal(resolveFormLocale(new URLSearchParams({ lang: locale })), locale);
      assert.equal(resolveFormLocale({ getAll: () => [locale] }), locale);
    });
  }

  for (const value of [undefined, null, "", "pt-br", "PT-BR", " es ", "EN", 1, {}, ["pt-BR"]]) {
    it(`defaults to ES for invalid value ${JSON.stringify(value)}`, () => {
      assert.equal(normalizeFormLocale(value), DEFAULT_FORM_LOCALE);
    });
  }

  it("defaults to ES for absent, invalid or repeated lang, even identical repeats", () => {
    for (const params of [
      undefined, null, {}, { country: "Brasil" }, { lang: "pt-br" },
      { lang: ["pt-BR", "pt-BR"] }, { lang: ["es", "pt-BR"] },
      { lang: ["pt-BR"] }, { lang: [] },
      new URLSearchParams(), new URLSearchParams("lang="),
      new URLSearchParams("lang=pt-BR&lang=pt-BR"),
      new URLSearchParams("lang=pt-BR&lang=es"),
      new URLSearchParams("lang=invalid&lang=pt-BR"),
      new URLSearchParams("country=Brasil&language=pt-BR"),
    ]) assert.equal(resolveFormLocale(params), "es");
  });

  it("does not accept inherited query values", () => {
    assert.equal(resolveFormLocale(Object.create({ lang: "pt-BR" })), "es");
  });

  it("accepts exact legacy pt-BR links without making them canonical", () => {
    assert.equal(isFormLocale("pt-BR"), false);
    assert.equal(normalizeFormLocale("pt-BR"), "pt");
    assert.equal(resolveFormLocale({ lang: "pt-BR" }), "pt");
    assert.equal(resolveFormLocale(new URLSearchParams("lang=pt-BR")), "pt");
    assert.equal(formHtmlLang("pt"), "pt-BR");
    assert.equal(formHtmlLang("en"), "en");
    assert.equal(formHtmlLang("es"), "es");
  });
});

describe("language preference precedence", () => {
  it("uses cookie preference when no explicit link language is present", () => {
    assert.equal(resolvePreferredFormLocale(), "es");
    assert.equal(resolvePreferredFormLocale(new URLSearchParams(), "pt"), "pt");
    assert.equal(resolvePreferredFormLocale({}, "en"), "en");
    assert.equal(resolvePreferredFormLocale(new URLSearchParams("source=qa"), "pt-BR"), "pt");
    assert.equal(resolvePreferredFormLocale(new URLSearchParams(), "INVALID"), "es");
  });

  it("respects explicit links over cookie, including legacy and malformed query", () => {
    assert.equal(resolvePreferredFormLocale(new URLSearchParams("lang=en"), "pt"), "en");
    assert.equal(resolvePreferredFormLocale(new URLSearchParams("lang=pt-BR"), "en"), "pt");
    assert.equal(resolvePreferredFormLocale(new URLSearchParams("lang=nope"), "en"), "es");
    assert.equal(resolvePreferredFormLocale(new URLSearchParams("lang=es&lang=pt"), "pt"), "es");
    assert.equal(resolvePreferredFormLocale({ lang: "pt" }, "en"), "pt");
  });
});

describe("link construction without navigation", () => {
  it("invites to the hero in each language without changing direct form URLs", () => {
    for (const locale of FORM_LOCALES) {
      assert.equal(buildHeroHref(locale), `/enviar?lang=${locale}`);
      assert.equal(buildFormHref(locale), `/enviar?lang=${locale}`);
    }
    assert.equal(buildHeroHref("invalid" as "es"), "/enviar?lang=es");
  });
  it("generates explicit canonical locale links", () => {
    assert.equal(buildFormHref("es"), "/enviar?lang=es");
    assert.equal(buildFormHref("en"), "/enviar?lang=en");
    assert.equal(buildFormHref("pt"), "/enviar?lang=pt");
  });

  it("preserves unrelated query/hash, replaces repeated lang and encodes values", () => {
    const href = buildFormHref("pt", {
      search: "source=equipo+Brasil&lang=es&lang=es&tag=a&tag=b",
      hash: "#sección 3",
    });
    const url = new URL(href, "https://example.com");
    assert.equal(url.pathname, "/enviar");
    assert.deepEqual(url.searchParams.getAll("lang"), ["pt"]);
    assert.equal(resolveFormLocale(url.searchParams), "pt");
    assert.equal(url.searchParams.get("source"), "equipo Brasil");
    assert.deepEqual(url.searchParams.getAll("tag"), ["a", "b"]);
    assert.equal(decodeURIComponent(url.hash), "#sección 3");
  });

  it("resolves ES safely even for malformed runtime locale arguments", () => {
    assert.equal(buildFormHref("invalid" as "es"), "/enviar?lang=es");
  });
});

describe("complete dictionaries and historical inventory", () => {
  const catalogs = { es, en, pt: ptBR };
  const esKeys = Object.keys(flatten(es)).sort();

  it("has identical nonempty string leaves and no unexpected placeholders", () => {
    for (const catalog of Object.values(catalogs)) {
      const entries = flatten(catalog);
      assert.deepEqual(Object.keys(entries).sort(), esKeys);
      for (const [key, value] of Object.entries(entries)) {
        assert.ok(value.trim(), key);
        const params = FORM_MESSAGE_PARAMETERS[key as keyof typeof FORM_MESSAGE_PARAMETERS];
        assert.deepEqual(placeholders(value), Object.keys(params ?? {}).sort(), key);
      }
    }
  });

  it("covers every historical proposed key without freezing future editorial corrections", () => {
    const inventory = readFileSync(join(process.cwd(), "docs/form-i18n-text-inventory.md"), "utf8");
    const expectedKeys = new Set<string>();
    for (const line of inventory.split(/\r?\n/)) {
      if (!line.startsWith("|")) continue;
      const cells = line.split("|").map(cell => cell.trim());
      const key = cells[5]?.match(/^`(form\.[\w.]+)`$/)?.[1];
      if (!key) continue;
      expectedKeys.add(key);
    }
    // The inventory retains the original proposals and records the new EN option.
    assert.deepEqual(esKeys, [...expectedKeys].sort());
  });

  it("keeps catalogs serializable and independent of React or server infrastructure", () => {
    for (const locale of FORM_LOCALES) {
      assert.deepEqual(JSON.parse(JSON.stringify(getFormMessages(locale))), catalogs[locale]);
    }
    assert.notEqual(ptBR.form.intro.title, es.form.intro.title);
    assert.notEqual(en.form.intro.title, es.form.intro.title);
  });
});

describe("typed parameter interpolation", () => {
  it("preserves accented introduction labels and localizes carousel controls", () => {
    assert.equal(es.form.navigation.backToIntro, "Volver a la introducción");
    assert.equal(ptBR.form.navigation.backToIntro, "Voltar à introdução");
    assert.equal(ptBR.form.hero.title, "Sua experiência merece");
    assert.equal(ptBR.form.hero.next, "Próximo depoimento");
    for (const locale of FORM_LOCALES) {
      const copy = getFormMessages(locale).form;
      for (const text of [...Object.values(copy.hero), copy.navigation.backToIntro, copy.errors.consent.required]) {
        assert.ok(text && !/[?\uFFFD]/u.test(text), "intro copy retains its source encoding");
      }
    }
  });
  it("names the fifth step as review and submission while preserving five localized steps", () => {
    const expected = { es: "Revisión y envío", en: "Review and submit", pt: "Revisão e envio" };
    for (const locale of FORM_LOCALES) {
      const copy = getFormMessages(locale).form;
      assert.equal(Object.keys(copy.steps).length, 5);
      assert.equal(copy.steps.consent.title, expected[locale]);
      assert.equal(copy.steps.consent.short, expected[locale]);
      assert.ok(copy.consent.action && copy.consent.submission);
      assert.equal("hint" in copy.consent, false);
    }
  });
  it("names the global summary editing toggle in every locale", () => {
    const expected = {
      es: ["Editar", "Guardar cambios", "Editar resumen", "Guardar cambios del resumen"],
      en: ["Edit", "Save changes", "Edit summary", "Save changes to the summary"],
      pt: ["Editar", "Salvar alterações", "Editar resumo", "Salvar alterações do resumo"],
    };
    for (const locale of FORM_LOCALES) {
      const t = createFormTranslator(locale);
      assert.deepEqual([t("form.review.edit"), t("form.review.done"), t("form.review.editSummary"), t("form.review.doneSummary")], expected[locale]);
    }
  });
  it("names backward step controls in ES/EN/PT, including when visual labels are hidden", () => {
    const expected = {
      es: "Volver al paso 2: Datos",
      en: "Back to step 2: Details",
      pt: "Voltar à etapa 2: Dados",
    };
    for (const locale of FORM_LOCALES) {
      const title = getFormMessages(locale).form.steps.identity.short;
      assert.equal(createFormTranslator(locale)("form.navigation.backToStep", { step: 2, title }), expected[locale]);
    }
  });

  it("uses complete progress messages in each language", () => {
    assert.equal(createFormTranslator("es")("form.progress", { step: 2, total: 5, title: "Datos" }), "Paso 2 de 5 · Datos");
    assert.equal(createFormTranslator("pt")("form.progress", { step: 2, total: 5, title: "Dados" }), "Etapa 2 de 5 · Dados");
    assert.equal(createFormTranslator("en")("form.progress", { step: 2, total: 5, title: "Details" }), "Step 2 of 5 · Details");
  });

  it("interpolates every parameterized message using the declared runtime types", () => {
    for (const locale of FORM_LOCALES) {
      for (const [key, contract] of Object.entries(FORM_MESSAGE_PARAMETERS)) {
        const params = Object.fromEntries(Object.entries(contract).map(([name, type]) => [name, type === "number" ? 25 : "Sección"]));
        const result = interpolateFormMessage(key as FormMessageKey, getFormMessage(getFormMessages(locale), key as FormMessageKey), params);
        assert.deepEqual(placeholders(result), []);
      }
    }
  });

  it("preserves literal strings without interpreting HTML, dollar replacements or nested braces", () => {
    const title = "<b>Foto</b> $& {max}";
    assert.equal(createFormTranslator("es")("form.progress", { step: 1, total: 5, title }), `Paso 1 de 5 · ${title}`);
    assert.equal(interpolateFormMessage("form.errors.text.maxLength", "{max} / {max}", { max: 120 }), "120 / 120");
  });

  it("rejects missing parameters and wrong runtime types instead of exposing tokens", () => {
    assert.throws(() => interpolateFormMessage("form.progress", es.form.progress), TypeError);
    assert.throws(() => interpolateFormMessage("form.errors.text.maxLength", es.form.errors.text.maxLength, { max: "120" }), TypeError);
    assert.throws(() => interpolateFormMessage("form.errors.text.maxLength", es.form.errors.text.maxLength, { max: NaN }), TypeError);
    assert.throws(() => interpolateFormMessage("form.errors.text.maxLength", "{unknown}", { max: 120 }), TypeError);
  });
});

describe("numeric limits come from existing rules", () => {
  it("derives limits and file-size conversion without changing validators", () => {
    assert.deepEqual(FORM_LIMITS.story, { min: STORY_MIN_CHARS, max: STORY_MAX_CHARS });
    assert.equal(FORM_LIMITS.nameMax, NAME_MAX_CHARS);
    assert.equal(FORM_LIMITS.fieldMax, FIELD_MAX_CHARS);
    assert.equal(FORM_LIMITS.avatar.maxBytes, AVATAR_MAX_BYTES);
    assert.equal(FORM_LIMITS.capture.maxBytes, CAPTURE_MAX_BYTES);
    assert.equal(FORM_LIMITS.avatar.maxMb * 1024 * 1024, AVATAR_MAX_BYTES);
    assert.equal(FORM_LIMITS.capture.maxMb * 1024 * 1024, CAPTURE_MAX_BYTES);
  });

  it("formats limits and counters from the shared values in both languages", () => {
    const esT = createFormTranslator("es");
    const ptT = createFormTranslator("pt");
    const enT = createFormTranslator("en");
    assert.equal(esT("form.story.hintWithLimits", { hint: "Tu historia.", ...FORM_LIMITS.story }), `Tu historia. Entre ${STORY_MIN_CHARS} y ${STORY_MAX_CHARS} caracteres.`);
    assert.equal(ptT("form.story.hintWithLimits", { hint: "Sua história.", ...FORM_LIMITS.story }), `Sua história. Entre ${STORY_MIN_CHARS} e ${STORY_MAX_CHARS} caracteres.`);
    assert.equal(enT("form.story.hintWithLimits", { hint: "Your story.", ...FORM_LIMITS.story }), `Your story. Between ${STORY_MIN_CHARS} and ${STORY_MAX_CHARS} characters.`);
    assert.equal(esT("form.story.counter", { current: 38, max: FORM_LIMITS.story.max }), `38/${STORY_MAX_CHARS}`);
    assert.equal(ptT("form.fields.avatar.requirements", FORM_LIMITS.avatar), `JPG, PNG ou WebP · Máximo de ${FORM_LIMITS.avatar.maxMb} MB.`);
    assert.equal(esT("form.errors.capture.maxSize", FORM_LIMITS.capture), `La foto de tu experiencia no puede superar ${FORM_LIMITS.capture.maxMb} MB.`);
  });
});

describe("categories, countries and consent remain presentation-only", () => {
  it("covers all existing category IDs without changing global display labels/options", () => {
    for (const locale of FORM_LOCALES) {
      const categories = getFormMessages(locale).form.categories;
      assert.deepEqual(Object.keys(categories).filter(key => key !== "legend").sort(), [...TESTIMONIAL_TYPES].sort());
      for (const type of TESTIMONIAL_TYPES) assert.ok(categories[type].label);
    }
    assert.equal(es.form.categories.simulation.label, "Tu experiencia en No Country");
    assert.equal(es.form.categories.career_change.label, "Reconversión Profesional");
    assert.equal(es.form.categories.first_job.label, "Conseguiste Empleo");
    assert.deepEqual(TYPE_LABELS, { simulation: "Simulación", first_job: "Primer empleo", career_change: "Reconversión" });
    assert.deepEqual(TYPE_OPTIONS.map(option => option.label), ["Simulación", "Primer empleo", "Reconversión"]);
  });

  it("translates all country labels but preserves submitted values and order", () => {
    assert.deepEqual(Object.keys(FORM_COUNTRY_KEYS), [...COUNTRY_OPTIONS]);
    for (const locale of FORM_LOCALES) {
      const options = getFormCountryOptions(locale);
      assert.deepEqual(options.map(option => option.value), [...COUNTRY_OPTIONS]);
      assert.ok(options.every(option => option.label.trim()));
      assert.equal(new Set(Object.values(FORM_COUNTRY_KEYS)).size, Object.keys(getFormMessages(locale).form.countries).length);
    }
    assert.deepEqual(getFormCountryOptions("pt").find(option => option.value === "España"), { value: "España", label: "Espanha" });
    assert.equal(OTHER_COUNTRY_VALUE, "__other_country__");
  });

  it("preserves current ES authorization verbatim and marks both versions for review", () => {
    const inventory = readFileSync(join(process.cwd(), "docs/form-i18n-text-inventory.md"), "utf8");
    const row = inventory.split(/\r?\n/).find(line => line.endsWith("`form.consent.body` |"));
    assert.equal(es.form.consent.body, row?.split("|")[2].trim());
    for (const locale of FORM_LOCALES) assert.equal(FORM_CONSENT_REVIEW_STATUS[locale], "pending-editorial-legal-review");
    assert.match(ptBR.form.consent.body, /galeria e no Discord/);
    assert.match(en.form.consent.body, /gallery and on Discord/);
    assert.doesNotMatch(ptBR.form.consent.body, /Instagram|LinkedIn/);
    assert.doesNotMatch(en.form.consent.body, /Instagram|LinkedIn/);
    for (const locale of FORM_LOCALES) {
      const copy = getFormMessages(locale).form.consent;
      assert.deepEqual(Object.keys(copy).sort(), ["action", "body", "submission"]);
      assert.match(copy.submission, /Discord/);
      assert.doesNotMatch(copy.submission, /Instagram|LinkedIn|Talent/);
      assert.ok(copy.submission.length > 100);
    }
  });
});

describe("fallback policy", () => {
  it("shares localized title/description between initial metadata and client updates", () => {
    for (const locale of FORM_LOCALES) {
      const metadata = getFormMetadata(locale);
      assert.equal(metadata.title, `${getFormMessages(locale).form.metadata.title} · No Country`);
      assert.equal(metadata.description, getFormMessages(locale).form.metadata.description);
      assert.ok(!metadata.title.includes("Testimonios"));
    }
    assert.deepEqual(getFormMetadata("invalid"), getFormMetadata("es"));
  });
  it("uses the complete ES catalog for unsupported locales", () => {
    assert.equal(getFormMessages("en"), en);
    assert.equal(getFormMessages(), es);
    assert.equal(getFormMessages("pt"), ptBR);
    assert.equal(getFormMessages("pt-BR"), ptBR);
    assert.equal(createFormTranslator("invalid")("form.intro.title"), es.form.intro.title);
  });

  it("falls back to ES for blank or missing known keys", () => {
    const blank: FormMessages = { form: { ...ptBR.form, intro: { ...ptBR.form.intro, title: " " } } };
    const missing = { form: { intro: {} } } as FormMessages;
    assert.equal(getFormMessage(blank, "form.intro.title"), es.form.intro.title);
    assert.equal(getFormMessage(missing, "form.intro.title"), es.form.intro.title);
  });

  it("uses the localized generic error for unknown or inherited keys", () => {
    const t = createFormTranslator("pt");
    for (const key of ["form.unknown", "form.toString", "__proto__.title"]) {
      assert.equal(t(key as FormMessageKey), ptBR.form.errors.submit.unexpected);
    }
  });
});

// Compile-time regression assertions. Never called: invalid examples cannot affect runtime.
function verifyTypeContract(t: FormTranslator) {
  // @ts-expect-error Unknown semantic key.
  t("Comparte tu experiencia");
  // @ts-expect-error Progress parameters are required.
  t("form.progress");
  // @ts-expect-error Numeric bounds cannot be strings.
  t("form.errors.text.maxLength", { max: "120" });
  // @ts-expect-error Misspelled parameter is rejected.
  t("form.story.counter", { count: 1, max: FORM_LIMITS.story.max });
  // @ts-expect-error Non-parameterized messages do not accept interpolation objects.
  t("form.intro.title", {});
  // @ts-expect-error Shared structure requires all sections and keys.
  const incomplete: FormMessages = { form: {} };
  void incomplete;
  // @ts-expect-error Unsupported locale cannot be used to construct a link.
  buildFormHref("pt-BR");
}
void verifyTypeContract;
