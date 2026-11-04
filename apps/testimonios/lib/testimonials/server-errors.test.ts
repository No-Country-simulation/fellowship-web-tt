import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { describe, it } from "node:test";
import { runInNewContext } from "node:vm";
import { formatFormIssue } from "../form-i18n/issues";
import { getFormMessages } from "../form-i18n/messages";
import { validValues, formDataFor } from "./form-errors.fixtures";
import { formIssue } from "./issues";
import { firstErrorStep, parseTestimonialForm, type ParsedTestimonial } from "./parse";
import { initialSubmitState } from "./submit-state";
import { typeOption } from "./types";

type ActionModule = typeof import("./actions");
type StoreModule = typeof import("./store");
type Diagnostic = unknown[][];
const PRIVATE_DETAIL = "SYNTHETIC_PRIVATE_BACKEND_DETAIL";
const appRequire = createRequire(join(process.cwd(), "package.json"));
const ts = appRequire("typescript") as typeof import("typescript");

/** Actual source in an isolated VM: every import must be explicitly supplied; no real services. */
function isolated<T>(filename: "actions.ts" | "store.ts", imports: Record<string, unknown>, diagnostics: Diagnostic): T {
  const source = readFileSync(join(process.cwd(), "lib/testimonials", filename), "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS },
  }).outputText;
  const sandboxModule = { exports: {} };
  let uuid = 0;
  runInNewContext(compiled, {
    module: sandboxModule, exports: sandboxModule.exports,
    require: (specifier: string) => {
      if (!Object.prototype.hasOwnProperty.call(imports, specifier)) throw new Error(`Unmocked test import: ${specifier}`);
      return imports[specifier];
    },
    console: { error: (...args: unknown[]) => diagnostics.push(args) },
    crypto: { randomUUID: () => `${(++uuid).toString(16).padStart(8, "0")}-0000-4000-8000-000000000000` },
  }, { filename });
  return sandboxModule.exports as T;
}

function wire<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function parsedFixture(): ParsedTestimonial {
  const parsed = parseTestimonialForm(formDataFor(validValues()));
  if (!parsed.ok) assert.fail("Invalid fixture");
  return parsed.data;
}

function assertSafeDiagnostics(diagnostics: Diagnostic) {
  assert.ok(diagnostics.length > 0);
  assert.ok(diagnostics.every(args => args.every(arg => typeof arg === "string" && !arg.includes(PRIVATE_DETAIL))));
}

function actionHarness(options: {
  parse?: typeof parseTestimonialForm;
  save?: StoreModule["saveTestimonial"];
  notify?: () => Promise<"posted" | "skipped" | "failed">;
} = {}) {
  const diagnostics: Diagnostic = [];
  const savedData: ParsedTestimonial[] = [];
  const notifications: unknown[] = [];
  const testedModule = isolated<ActionModule>("actions.ts", {
    "./parse": { parseTestimonialForm: options.parse ?? parseTestimonialForm, firstErrorStep },
    "./store": {
      saveTestimonial: async (data: ParsedTestimonial) => {
        savedData.push(data);
        return options.save ? options.save(data) : { ok: true, testimonial: { id: "fixture-id", slug: "fixture-slug" } };
      },
    },
    "@/lib/discord": {
      notifyInboxNewTestimonial: async (input: unknown) => {
        notifications.push(wire(input));
        return options.notify ? options.notify() : "skipped";
      },
    },
    "./types": { typeOption },
    "./issues": { formIssue },
  }, diagnostics);
  return { ...testedModule, diagnostics, savedData, notifications };
}

type BackendError = { code: string; message: string };
type StoreEvent = { operation: "upload" | "remove" | "insert"; bucket?: string; path?: string; row?: Record<string, unknown>; file?: File; options?: unknown };

function storeHarness(options: {
  available?: boolean;
  uploadFailures?: boolean[];
  insertErrors?: (BackendError | null)[];
} = {}) {
  const events: StoreEvent[] = [];
  const diagnostics: Diagnostic = [];
  let clients = 0;
  let uploads = 0;
  let inserts = 0;
  const backend = {
    storage: {
      from(bucket: string) {
        return {
          async upload(path: string, file: File, uploadOptions: unknown) {
            events.push({ operation: "upload", bucket, path, file, options: wire(uploadOptions) });
            const failed = options.uploadFailures?.[uploads++] ?? false;
            return { error: failed ? { message: PRIVATE_DETAIL } : null };
          },
          async remove(paths: string[]) {
            for (const path of paths) events.push({ operation: "remove", bucket, path });
            return { error: null };
          },
        };
      },
    },
    from(table: string) {
      assert.equal(table, "testimonials");
      return {
        async insert(row: Record<string, unknown>) {
          events.push({ operation: "insert", row: wire(row) });
          return { error: options.insertErrors?.[inserts++] ?? null };
        },
      };
    },
  };
  const testedModule = isolated<StoreModule>("store.ts", {
    "@/lib/supabase/env": { hasSupabaseServiceRoleEnv: () => options.available ?? true },
    "@/lib/supabase/service-role": { createServiceRoleClient: () => { clients++; return backend; } },
    "@/lib/supabase/storage": { AVATARS_BUCKET: "fixture-avatars", CAPTURES_BUCKET: "fixture-captures" },
    "./issues": { formIssue },
  }, diagnostics);
  return { ...testedModule, events, diagnostics, clientCount: () => clients };
}

describe("Server Action errors with fully isolated doubles", () => {
  it("returns serializable semantic validation errors without saving or notifying", async () => {
    const action = actionHarness();
    const result = wire(await action.submitTestimonial(initialSubmitState, new FormData()));
    assert.equal(result.status, "error");
    if (result.status !== "error") assert.fail();
    assert.equal(result.issue.code, "validation.summary");
    assert.equal(result.fieldErrors?.avatar?.code, "avatar.required");
    assert.equal(result.step, 1);
    assert.equal("message" in result, false);
    assert.equal(action.savedData.length, 0);
    assert.equal(action.notifications.length, 0);
  });

  it("keeps integral server validation and the earliest correction step", async () => {
    const action = actionHarness();
    const result = await action.submitTestimonial(initialSubmitState, formDataFor(validValues({ full_name: "", story: "", consent: true })));
    if (result.status !== "error") assert.fail();
    assert.equal(result.step, 2);
    assert.equal(result.fieldErrors?.story?.code, "story.required");
    assert.equal(result.fieldErrors?.full_name?.code, "full_name.required");
    assert.equal(action.savedData.length, 0);
  });

  it("reports empty excerpt/caption without invoking persistence", async () => {
    for (const missing of ["quote", "igCaption"] as const) {
      const action = actionHarness({ parse: () => ({ ok: true, data: { ...parsedFixture(), [missing]: "" } }) });
      const result = await action.submitTestimonial(initialSubmitState, new FormData());
      if (result.status !== "error") assert.fail();
      assert.equal(result.issue.code, "submit.excerptFailed");
      assert.equal(action.savedData.length, 0);
    }
  });

  for (const code of ["submit.unavailable", "submit.uploadFailed", "submit.saveFailed"] as const) {
    it(`returns controlled ${code} without private repository details`, async () => {
      const action = actionHarness({ save: async () => ({ ok: false, issue: formIssue(code), message: PRIVATE_DETAIL }) });
      const result = wire(await action.submitTestimonial(initialSubmitState, formDataFor(validValues())));
      assert.deepEqual(result, { status: "error", issue: { code } });
      assert.equal(action.notifications.length, 0);
      assert.ok(!JSON.stringify(result).includes(PRIVATE_DETAIL));
    });
  }

  for (const stage of ["parse", "save"] as const) {
    it(`converts unexpected ${stage} exceptions into a safe public issue`, async () => {
      const fail = () => { throw new Error(PRIVATE_DETAIL); };
      const action = actionHarness(stage === "parse" ? { parse: fail } : { save: fail });
      const result = wire(await action.submitTestimonial(initialSubmitState, formDataFor(validValues())));
      assert.deepEqual(result, { status: "error", issue: { code: "submit.unexpected" } });
      assertSafeDiagnostics(action.diagnostics);
      assert.equal(action.savedData.length, stage === "parse" ? 0 : 1);
      assert.equal(action.notifications.length, 0);
    });
  }

  for (const status of ["posted", "skipped", "failed"] as const) {
    it(`preserves successful storage, active payload and inbox result ${status}`, async () => {
      const action = actionHarness({ notify: async () => status });
      const result = await action.submitTestimonial(initialSubmitState, formDataFor(validValues()));
      assert.deepEqual(wire(result), { status: "success" });
      assert.equal(action.savedData.length, 1);
      assert.deepEqual(action.savedData[0].payload, { primary_role: "Desarrollo" });
      assert.deepEqual(action.notifications, [{ id: "fixture-id", fullName: "Participante de prueba", typeLabel: "Simulación" }]);
      assert.deepEqual(action.diagnostics, []);
    });
  }

  for (const failure of ["throw", "reject"] as const) {
    it(`keeps saved testimony successful after notification ${failure}, without repeating either operation`, async () => {
      const data = parsedFixture();
      const before = wire(data);
      const sequence: string[] = [];
      const action = actionHarness({
        parse: () => ({ ok: true, data }),
        save: async () => {
          sequence.push("save");
          return { ok: true, testimonial: { id: "fixture-id", slug: "fixture-slug" } };
        },
        notify: () => {
          sequence.push("notify");
          if (failure === "throw") throw new Error(PRIVATE_DETAIL);
          return Promise.reject(new Error(PRIVATE_DETAIL));
        },
      });
      const result = wire(await action.submitTestimonial(initialSubmitState, formDataFor(validValues())));
      assert.deepEqual(result, { status: "success" });
      assert.deepEqual(sequence, ["save", "notify"]);
      assert.equal(action.savedData.length, 1);
      assert.equal(action.savedData[0], data);
      assert.deepEqual(wire(data), before);
      assert.deepEqual(action.notifications, [{ id: "fixture-id", fullName: data.fullName, typeLabel: typeOption(data.type).label }]);
      assert.deepEqual(action.diagnostics, [["Testimonial inbox notification failed unexpectedly"]]);
      assertSafeDiagnostics(action.diagnostics);
    });
  }

  it("renders delayed repository failure using the locale current at presentation", async () => {
    let complete!: (value: Awaited<ReturnType<StoreModule["saveTestimonial"]>>) => void;
    const deferred = new Promise<Awaited<ReturnType<StoreModule["saveTestimonial"]>>>(resolve => { complete = resolve; });
    const action = actionHarness({ save: () => deferred });
    const resultPromise = action.submitTestimonial(initialSubmitState, formDataFor(validValues()));
    complete({ ok: false, issue: formIssue("submit.uploadFailed") });
    const result = wire(await resultPromise);
    if (result.status !== "error") assert.fail();
    assert.equal(formatFormIssue(result.issue, "pt-BR"), getFormMessages("pt-BR").form.errors.submit.uploadFailed);
    assert.equal("locale" in result, false);
  });
});

describe("repository failure representation preserves I/O sequencing (all operations are doubles)", () => {
  it("reports unavailable service without constructing a client or performing operations", async () => {
    const store = storeHarness({ available: false });
    assert.deepEqual(wire(await store.saveTestimonial(parsedFixture())), { ok: false, issue: { code: "submit.unavailable" } });
    assert.equal(store.clientCount(), 0);
    assert.deepEqual(store.events, []);
    assertSafeDiagnostics(store.diagnostics);
  });

  it("returns upload failure before insert when avatar upload fails", async () => {
    const store = storeHarness({ uploadFailures: [true] });
    assert.deepEqual(wire(await store.saveTestimonial(parsedFixture())), { ok: false, issue: { code: "submit.uploadFailed" } });
    assert.deepEqual(store.events.map(event => event.operation), ["upload"]);
    assertSafeDiagnostics(store.diagnostics);
  });

  it("keeps avatar rollback after failed optional capture upload", async () => {
    const store = storeHarness({ uploadFailures: [false, true] });
    const data = { ...parsedFixture(), capture: new File(["fixture"], "capture.webp", { type: "image/webp" }) };
    assert.deepEqual(wire(await store.saveTestimonial(data)), { ok: false, issue: { code: "submit.uploadFailed" } });
    assert.deepEqual(store.events.map(event => [event.operation, event.bucket]), [["upload", "fixture-avatars"], ["upload", "fixture-captures"], ["remove", "fixture-avatars"]]);
    assert.equal(store.events[0].path, store.events[2].path);
    assertSafeDiagnostics(store.diagnostics);
  });

  it("keeps three collision attempts and rolls back both uploads without leaking the DB message", async () => {
    const error = { code: "23505", message: PRIVATE_DETAIL };
    const store = storeHarness({ insertErrors: [error, error, error] });
    const data = { ...parsedFixture(), capture: new File(["fixture"], "capture.png", { type: "image/png" }) };
    assert.deepEqual(wire(await store.saveTestimonial(data)), { ok: false, issue: { code: "submit.saveFailed" } });
    assert.deepEqual(store.events.map(event => event.operation), ["upload", "upload", "insert", "insert", "insert", "remove", "remove"]);
    assertSafeDiagnostics(store.diagnostics);
  });

  it("stops on a non-collision error and keeps rollback", async () => {
    const store = storeHarness({ insertErrors: [{ code: "XX000", message: PRIVATE_DETAIL }] });
    assert.deepEqual(wire(await store.saveTestimonial(parsedFixture())), { ok: false, issue: { code: "submit.saveFailed" } });
    assert.deepEqual(store.events.map(event => event.operation), ["upload", "insert", "remove"]);
    assertSafeDiagnostics(store.diagnostics);
  });

  it("keeps collision retry followed by success without rollback or payload changes", async () => {
    const store = storeHarness({ insertErrors: [{ code: "23505", message: PRIVATE_DETAIL }, null] });
    const data = parsedFixture();
    const result = await store.saveTestimonial(data);
    assert.equal(result.ok, true);
    assert.deepEqual(store.events.map(event => event.operation), ["upload", "insert", "insert"]);
    const row = store.events[2].row!;
    assert.equal(row.status, "in_review");
    assert.equal(row.type, data.type);
    assert.equal(row.consent_at, data.consentAt);
    assert.deepEqual(row.payload, data.payload);
    assert.equal(row.story, data.story);
    assert.equal(row.quote, data.quote);
    assert.equal(row.email, data.email);
    assert.equal(row.ig_caption, data.igCaption);
    assert.equal(row.li_caption, data.liCaption);
    assert.equal(row.capture_path, null);
    assert.equal(store.events[0].file, data.avatar);
    assert.deepEqual(store.events[0].options, { contentType: "image/png", upsert: false });
    assert.deepEqual(store.diagnostics, []);
  });
});
