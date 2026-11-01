import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { createServer } from "node:net";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Run after `pnpm run build`. Uses installed Chrome + native CDP, no project dependency.
// EVERY browser POST is intercepted before it can reach Next/the action/services.
const appDir = fileURLToPath(new URL("../", import.meta.url));
const require = createRequire(import.meta.url);
const chromePath = process.argv[2] ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
const output = join(appDir, "docs/ui/assets/form-i18n");
const profile = await mkdtemp(join(tmpdir(), "testimonios-i18n-browser-"));
async function freePort() {
  const server = createServer();
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const port = server.address().port;
  await new Promise(resolve => server.close(resolve));
  return port;
}
async function until(predicate, label) {
  for (let attempt = 0; attempt < 100; attempt++) {
    if (await predicate()) return;
    await pause(100);
  }
  throw new Error(`Timed out: ${label}`);
}
const appPort = await freePort();
const debugPort = await freePort();
const origin = `http://127.0.0.1:${appPort}`;
const server = spawn(process.execPath, [require.resolve("next/dist/bin/next"), "start", "--hostname", "127.0.0.1", "--port", String(appPort)], { cwd: appDir, windowsHide: true, stdio: "ignore" });
const chrome = spawn(chromePath, ["--headless=new", `--remote-debugging-port=${debugPort}`, `--user-data-dir=${profile}`, "--disable-background-networking", "--disable-sync", "--no-first-run", "--no-default-browser-check", "about:blank"], { windowsHide: true, stdio: "ignore" });
const errors = [];
const checks = [];
let socket;
let target;
let response = null;
const pausedPosts = [];
let interceptedPosts = 0;
let cdp;
try {
  await mkdir(output, { recursive: true });
  await until(async () => { try { return (await fetch(`${origin}/enviar`)).ok; } catch { return false; } }, "production server");
  await until(async () => { try { return (await fetch(`http://127.0.0.1:${debugPort}/json/version`)).ok; } catch { return false; } }, "Chrome CDP");
  target = await (await fetch(`http://127.0.0.1:${debugPort}/json/new?about:blank`, { method: "PUT" })).json();
  socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  let sequence = 0;
  const pending = new Map();
  cdp = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++sequence;
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timeout: ${method}`)); }, 15000);
    pending.set(id, { resolve, reject, timer });
    socket.send(JSON.stringify({ id, method, params }));
  });
  async function fulfill(requestId, state) {
    // Minimal Flight action result, no route patch/revalidation. The real action never runs.
    await cdp("Fetch.fulfillRequest", { requestId, responseCode: 200, responseHeaders: [{ name: "content-type", value: "text/x-component" }], body: Buffer.from(`0:${JSON.stringify({ a: state, f: "" })}\n`).toString("base64") });
  }
  socket.onmessage = ({ data }) => {
    const event = JSON.parse(data);
    if (event.id) {
      const item = pending.get(event.id);
      if (!item) return;
      pending.delete(event.id); clearTimeout(item.timer);
      if (event.error) item.reject(new Error(JSON.stringify(event.error))); else item.resolve(event.result);
    } else if (event.method === "Runtime.exceptionThrown") {
      errors.push(event.params.exceptionDetails.exception?.description ?? event.params.exceptionDetails.text);
    } else if (event.method === "Runtime.consoleAPICalled" && event.params.type === "error") {
      errors.push(event.params.args.map(arg => arg.value ?? arg.description ?? "").join(" "));
    } else if (event.method === "Fetch.requestPaused") {
      const { requestId, request } = event.params;
      if (request.method === "POST") {
        interceptedPosts++;
        if (!Object.keys(request.headers).some(key => key.toLowerCase() === "next-action")) errors.push("Unexpected POST blocked");
        if (response) void fulfill(requestId, response).catch(error => errors.push(error.message));
        else pausedPosts.push(requestId);
      } else {
        void cdp("Fetch.continueRequest", { requestId }).catch(error => errors.push(error.message));
      }
    }
  };
  socket.onclose = () => {
    for (const item of pending.values()) { clearTimeout(item.timer); item.reject(new Error("Chrome connection closed")); }
    pending.clear();
  };
  await cdp("Page.enable"); await cdp("Runtime.enable");
  await cdp("Fetch.enable", { patterns: [{ urlPattern: "*", requestStage: "Request" }] });
  await cdp("Browser.grantPermissions", { origin, permissions: ["clipboardReadWrite", "clipboardSanitizedWrite"] });
  await cdp("Page.addScriptToEvaluateOnNewDocument", { source: `
    window.__qaPayloads = [];
    const records = new WeakMap();
    const originalSet = FormData.prototype.set;
    FormData.prototype.set = function(name, value, ...rest) {
      if (name === 'type') { const record = {}; records.set(this, record); window.__qaPayloads.push(record); }
      const record = records.get(this);
      if (record) record[name] = value instanceof File ? {name:value.name,type:value.type,size:value.size} : value;
      return originalSet.call(this, name, value, ...rest);
    };
  ` });
  async function evaluate(fn, ...args) {
    const expression = typeof fn === "string" ? fn : `(${fn.toString()})(...${JSON.stringify(args)})`;
    const value = await cdp("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    if (value.exceptionDetails) throw new Error(value.exceptionDetails.exception?.description ?? value.exceptionDetails.text);
    return value.result?.value;
  }
  async function viewport(width) { await cdp("Emulation.setDeviceMetricsOverride", { width, height: 1000, deviceScaleFactor: 1, mobile: false }); }
  async function navigate(path) {
    await cdp("Page.navigate", { url: origin + path });
    await until(() => evaluate(expected => location.href === expected && document.readyState === "complete" && !!document.querySelector("main form"), origin + path), path);
    await evaluate(() => document.fonts.ready.then(() => true));
    await pause(150);
  }
  async function input(selector, value) {
    await evaluate((selector, value) => {
      const element = document.querySelector(selector);
      if (!element) throw new Error(`Missing ${selector}`);
      const proto = element instanceof HTMLSelectElement ? HTMLSelectElement.prototype : element instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
      Object.getOwnPropertyDescriptor(proto, "value").set.call(element, value);
      element.dispatchEvent(new Event(element instanceof HTMLSelectElement ? "change" : "input", { bubbles: true }));
    }, selector, value);
    await pause(35);
  }
  async function language(locale) {
    await input("[data-form-language-select]", locale);
    await until(() => evaluate(locale => document.querySelector("main").lang === locale && document.querySelector("[data-form-language-select]").value === locale, locale), `language ${locale}`);
    await until(() => evaluate(locale => document.title === (locale === "es" ? "Comparte tu testimonio · No Country" : "Compartilhe seu depoimento · No Country") && document.querySelector('meta[name="description"]').content === (locale === "es" ? "Comparte tu experiencia con No Country. Completa cinco pasos para enviar tu testimonio a revisión." : "Compartilhe sua experiência com a No Country. Preencha cinco etapas para enviar seu depoimento para análise."), locale), `reactive metadata ${locale}`);
  }
  async function button(text) {
    await evaluate(text => {
      const element = [...document.querySelectorAll("main button")].find(button => button.getClientRects().length && button.textContent.trim() === text);
      if (!element || element.disabled) throw new Error(`Unavailable button ${text}`);
      element.focus({ preventScroll: true }); element.click();
    }, text);
    await pause(50);
  }
  const locale = () => evaluate(() => document.querySelector("main").lang);
  const next = async () => button(await locale() === "es" ? "Siguiente" : "Próximo");
  const back = async () => button(await locale() === "es" ? "Atrás" : "Voltar");
  const step = () => evaluate(() => Number(document.querySelector("form h2").textContent.match(/\d+/)[0]));
  async function layout() {
    for (const width of [375, 1440]) {
      await viewport(width);
      assert.equal(await evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), true, `overflow at ${width}`);
      assert.equal(await evaluate(() => [...document.querySelectorAll('main input,main select,main textarea,main button')].filter(el => el.getClientRects().length).every(el => { const r = el.getBoundingClientRect(); return r.left >= -1 && r.right <= document.documentElement.clientWidth + 1; })), true, `control overflow at ${width}`);
    }
  }
  async function screenshot(name, width, modal = false) {
    await viewport(width); await pause(100);
    if (!modal) await evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    const clip = modal ? undefined : await evaluate(() => { const r = document.querySelector("main").getBoundingClientRect(); return { x: 0, y: 0, width: innerWidth, height: Math.ceil(r.bottom + scrollY), scale: 1 }; });
    const capture = await cdp("Page.captureScreenshot", { format: "png", captureBeyondViewport: !modal, ...(clip ? { clip } : {}) });
    await writeFile(join(output, name), Buffer.from(capture.data, "base64"));
  }
  async function file(name) {
    await evaluate(async name => {
      const canvas = document.createElement("canvas"); canvas.width = 960; canvas.height = 720;
      const ctx = canvas.getContext("2d"); ctx.fillStyle = "#19304b"; ctx.fillRect(0, 0, 960, 720);
      ctx.fillStyle = "#02beef"; ctx.fillRect(80, 80, 800, 560);
      ctx.fillStyle = "#ff0094"; ctx.fillRect(250, 150, 460, 420);
      ctx.fillStyle = "#ffffff"; ctx.font = "bold 100px sans-serif"; ctx.fillText("QA", 390, 400);
      const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/png"));
      const transfer = new DataTransfer(); transfer.items.add(new File([blob], `qa-${name}.png`, { type: "image/png" }));
      const field = document.querySelector(`input[name="${name}"]`); field.files = transfer.files; field.dispatchEvent(new Event("change", { bubbles: true }));
    }, name);
    await until(() => evaluate(() => !!document.querySelector("main dialog[open]")), "crop dialog");
    await pause(100);
  }
  async function confirmCrop() {
    await until(() => evaluate(() => [...document.querySelectorAll("main dialog button")].some(el => el.textContent.trim() === "Usar recorte" && !el.disabled)), "crop ready");
    await button("Usar recorte");
    await until(() => evaluate(() => !document.querySelector("main dialog[open]")), "crop confirmed");
  }

  await viewport(1440);
  for (const [query, expected] of [["", "es"], ["?lang=es", "es"], ["?lang=pt-BR", "pt-BR"], ["?lang=pt", "es"], ["?lang=pt-BR&lang=pt-BR", "es"], ["?lang=es&lang=pt-BR", "es"]]) {
    const html = await (await fetch(origin + "/enviar" + query)).text();
    const title = expected === "es" ? "Comparte tu testimonio · No Country" : "Compartilhe seu depoimento · No Country";
    assert.ok(html.includes(`<title>${title}</title>`), "initial SSR title");
    await navigate("/enviar" + query);
    assert.equal(await locale(), expected);
    assert.equal(await evaluate(() => document.title), title);
    assert.equal(await evaluate(() => document.querySelectorAll('meta[name="description"]').length), 1);
    assert.equal(await evaluate(() => document.querySelector('meta[name="description"]').content), expected === "es" ? "Comparte tu experiencia con No Country. Completa cinco pasos para enviar tu testimonio a revisión." : "Compartilhe sua experiência com a No Country. Preencha cinco etapas para enviar seu depoimento para análise.");
  }
  checks.push("SSR/query/metadata: valid, absent, invalid and repeated locales; hydration");

  await navigate("/enviar?source=qa&tag=a&tag=b#formulario");
  await layout();
  await evaluate(() => { window.__qaOriginalForm = document.querySelector("form"); window.__qaHistoryLength = history.length; });
  await next();
  assert.equal(await evaluate(() => document.getElementById("type-error").textContent.trim()), "Elige el tipo de experiencia que quieres compartir.");
  await language("pt-BR");
  assert.equal(await evaluate(() => document.getElementById("type-error").textContent.trim()), "Escolha o tipo de experiência que deseja compartilhar.");
  await layout();
  assert.equal(await evaluate(() => history.length === window.__qaHistoryLength && document.querySelector("form") === window.__qaOriginalForm), true);
  assert.deepEqual(await evaluate(() => ({ source: new URLSearchParams(location.search).get("source"), tags: new URLSearchParams(location.search).getAll("tag"), hash: location.hash })), { source: "qa", tags: ["a", "b"], hash: "#formulario" });
  await evaluate(() => document.querySelector('input[name="type"][value="first_job"]').click());
  await next(); assert.equal(await step(), 2);
  await input('input[name="full_name"]', "Persona QA");
  await input('select[name="country"]', "España");
  await next();
  assert.equal(await evaluate(() => document.querySelector('input[name="email"]').getAttribute("aria-invalid")), "true");
  await input('input[name="email"]', "persona@example.com");
  await language("es");
  assert.equal(await evaluate(() => document.querySelector('input[name="email"]').getAttribute("aria-invalid")), "false");
  assert.equal(await evaluate(() => document.querySelector('input[name="avatar"]').getAttribute("aria-invalid")), "true");
  await screenshot("form-es-375.png", 375);
  await input('select[name="country"]', "__other_country__");
  await input('input[name="country"]', "País libre QA");
  await language("pt-BR");
  assert.equal(await evaluate(() => document.querySelector('input[name="country"]').value), "País libre QA");
  await input('select[name="country_selection"]', "España");
  await input('select[name="country"]', "__other_country__");
  assert.equal(await evaluate(() => document.querySelector('input[name="country"]').value), "País libre QA");
  await input('select[name="country_selection"]', "España");
  await evaluate(() => history.pushState(null, "", "?lang=es&source=qa#formulario"));
  await until(async () => await locale() === "es", "history push ES");
  await evaluate(() => history.pushState(null, "", "?lang=pt-BR&source=qa#formulario"));
  await until(async () => await locale() === "pt-BR", "history push PT");
  await evaluate(() => history.back()); await until(async () => await locale() === "es", "history back");
  await evaluate(() => history.forward()); await until(async () => await locale() === "pt-BR", "history forward");
  assert.equal(await evaluate(() => document.querySelector('input[name="full_name"]').value), "Persona QA");
  assert.equal(await evaluate(() => document.querySelector("form") === window.__qaOriginalForm), true);
  checks.push("same form identity, local errors/partial corrections, country values/free text, URL/hash/history");

  await layout();
  await viewport(375); await file("avatar");
  assert.equal(await evaluate(() => document.querySelectorAll("[data-form-language-select]").length), 1);
  assert.equal(await evaluate(() => !!document.querySelector("main dialog [data-form-language-select]")), true);
  assert.equal(await evaluate(() => document.activeElement === document.querySelector("main dialog h2")), true, JSON.stringify(await evaluate(() => ({ active: document.activeElement.outerHTML.slice(0, 220), title: document.querySelector("main dialog h2").outerHTML, open: document.querySelector("main dialog").open }))));
  const accessible = await cdp("Accessibility.getFullAXTree");
  assert.ok(accessible.nodes.some(node => !node.ignored && node.role?.value === "combobox" && node.name?.value === "Idioma do formulário"));
  await cdp("Input.dispatchKeyEvent", { type: "keyDown", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9, modifiers: 8 });
  await cdp("Input.dispatchKeyEvent", { type: "keyUp", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9, modifiers: 8 });
  assert.equal(await evaluate(() => document.activeElement.textContent.trim()), "Usar recorte");
  await cdp("Input.dispatchKeyEvent", { type: "keyDown", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
  await cdp("Input.dispatchKeyEvent", { type: "keyUp", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
  assert.equal(await evaluate(() => document.activeElement.hasAttribute("data-form-language-select")), true);
  await input('main dialog input[type="range"]', "1.8");
  await evaluate(() => document.querySelector('main dialog [tabindex="0"]').focus());
  await cdp("Input.dispatchKeyEvent", { type: "keyDown", key: "ArrowRight", code: "ArrowRight", windowsVirtualKeyCode: 39 });
  await cdp("Input.dispatchKeyEvent", { type: "keyUp", key: "ArrowRight", code: "ArrowRight", windowsVirtualKeyCode: 39 });
  await evaluate(() => { window.__qaDialog = document.querySelector("main dialog"); window.__qaCropTransform = document.querySelector("main dialog img").style.transform; window.__qaOriginalImage = document.querySelector("main dialog img").src; });
  await language("es");
  assert.equal(await evaluate(() => document.querySelector("main dialog") === window.__qaDialog && document.querySelector("main dialog img").style.transform === window.__qaCropTransform && document.querySelector("main dialog img").src === window.__qaOriginalImage), true);
  assert.equal(await evaluate(() => document.querySelector('main dialog input[type="range"]').value), "1.8");
  await language("pt-BR"); await screenshot("crop-pt-375.png", 375, true);
  await confirmCrop();
  assert.equal(await evaluate(() => document.activeElement.name), "avatar");
  await evaluate(() => { window.__qaAvatarPreview = document.querySelector('input[name="avatar"]').closest("[data-field]").querySelector("img").src; });
  await language("es");
  assert.equal(await evaluate(() => document.querySelector('input[name="avatar"]').closest("[data-field]").querySelector("img").src === window.__qaAvatarPreview), true);
  checks.push("single selector operable in modal, crop/zoom/object URL identity, confirm and focus return");
  await next(); assert.equal(await step(), 3);
  await input('input[name="company"]', "Empresa QA");
  await input('input[name="role_achieved"]', "Desarrollo QA");
  const story = "Relato QA sin traducir.\nAprendí a trabajar con un equipo y resolver desafíos de desarrollo.";
  await input('textarea[name="story"]', story);
  for (const category of ["career_change", "simulation", "first_job"]) {
    await back(); await back();
    await evaluate(value => document.querySelector(`input[name="type"][value="${value}"]`).click(), category);
    await next(); await next();
    assert.equal(await evaluate(() => document.querySelector('textarea[name="story"]').value), story);
    if (category === "career_change") { await input('input[name="previous_profession"]', "Docencia QA"); await input('input[name="new_role"]', "Tecnología QA"); }
    if (category === "simulation") await input('input[name="primary_role"]', "Rol sim QA");
    await language("pt-BR"); await layout(); await language("es"); await layout();
  }
  assert.equal(await evaluate(() => document.querySelector('input[name="company"]').value), "Empresa QA");
  assert.equal(await evaluate(() => document.querySelector('input[name="role_achieved"]').value), "Desarrollo QA");
  for (const category of ["career_change", "simulation", "first_job"]) {
    await back(); await back();
    await evaluate(value => document.querySelector(`input[name="type"][value="${value}"]`).click(), category);
    await next(); await next();
    if (category === "career_change") {
      assert.equal(await evaluate(() => document.querySelector('input[name="previous_profession"]').value), "Docencia QA");
      assert.equal(await evaluate(() => document.querySelector('input[name="new_role"]').value), "Tecnología QA");
    }
    if (category === "simulation") assert.equal(await evaluate(() => document.querySelector('input[name="primary_role"]').value), "Rol sim QA");
  }
  await next(); assert.equal(await step(), 4);
  await input('input[name="video_url"]', "https://youtu.be/abcdefghijk");
  await input('input[name="instagram"]', "@persona.qa");
  await input('input[name="linkedin"]', "https://www.linkedin.com/in/persona-qa");
  await file("capture"); await confirmCrop(); await language("pt-BR");
  await layout(); await language("es"); await layout(); await language("pt-BR");
  await next(); assert.equal(await step(), 5); await layout();
  assert.ok(await evaluate(() => [...document.querySelectorAll("form dd")].some(el => el.textContent === "Espanha")));
  await evaluate(() => document.querySelector('input[name="consent"]').click());
  await screenshot("form-pt-1440.png", 1440);
  await language("es");
  await layout();
  assert.equal(await evaluate(() => document.querySelector('input[name="consent"]').checked), true);
  assert.equal(await evaluate(() => document.querySelector('input[name="consent"]').parentElement.querySelector("span").firstChild.textContent.trim()), "Acepto que No Country publique mi testimonio (nombre, foto y texto) en la galería y en Discord. El email no se muestra en público. El equipo lo revisa antes de publicarlo.");
  checks.push("all five steps/three categories, retained professional data/story/links, translated country label, exact ES consent, responsive 375/1440");

  response = null; await button("Enviar testimonio");
  await until(() => pausedPosts.length === 1, "intercepted pending action");
  assert.equal(await evaluate(() => document.querySelector('button[type="submit"]').disabled), true);
  await language("pt-BR");
  assert.equal(await evaluate(() => document.querySelector('button[type="submit"]').textContent.trim()), "Enviando…");
  await fulfill(pausedPosts.shift(), { status: "error", issue: { code: "validation.summary" }, fieldErrors: { company: { code: "company.required" }, story: { code: "story.minLength", params: { min: 20 } } }, step: 3 });
  await until(() => evaluate(() => !!document.querySelector('[role="alert"]')), "localized server response");
  assert.ok(await evaluate(() => document.querySelector('[role="alert"]').textContent.includes("Escreva pelo menos 20 caracteres.")));
  await button("Corrigir os dados"); assert.equal(await step(), 3);
  assert.equal(await evaluate(() => document.activeElement.name), "company");
  await input('input[name="company"]', "Empresa QA editada"); await language("es");
  assert.equal(await evaluate(() => document.querySelector('input[name="company"]').getAttribute("aria-invalid")), "false");
  assert.equal(await evaluate(() => document.querySelector('textarea[name="story"]').getAttribute("aria-invalid")), "true");
  await input('textarea[name="story"]', story + " Corrección QA.");
  await next(); await next();
  response = null; await button("Enviar testimonio");
  await until(() => pausedPosts.length === 1, "second intercepted action");
  await language("pt-BR"); await language("es");
  await fulfill(pausedPosts.shift(), { status: "success" });
  await until(() => evaluate(() => !document.querySelector("main form") && document.querySelector("main h1")?.textContent.trim() === "Gracias por tu testimonio"), "fixture success");
  assert.equal(await evaluate(() => document.querySelectorAll("main h1").length), 1);
  assert.equal(await evaluate(() => document.activeElement === document.querySelector("main h1")), true);
  assert.equal(await evaluate(() => document.querySelectorAll("[data-form-language-select]").length), 1);
  await layout();
  await screenshot("success-es-1440.png", 1440);
  await language("pt-BR");
  await layout();
  const invite = await evaluate(() => document.querySelector('main a[href*="/enviar?lang="]').href);
  assert.equal(invite, origin + "/enviar?lang=pt-BR");
  await button("Copiar link");
  assert.equal(await evaluate(() => navigator.clipboard.readText()), invite);
  assert.ok(await evaluate(() => [...document.querySelectorAll("main button")].some(el => el.textContent.trim() === "Link copiado")));
  const payloads = await evaluate(() => window.__qaPayloads);
  assert.equal(payloads.length, 2); assert.equal(interceptedPosts, 2);
  for (const payload of payloads) {
    assert.deepEqual(Object.keys(payload).sort(), ["type", "full_name", "country", "email", "story", "company", "role_achieved", "video_url", "instagram", "linkedin", "consent", "avatar", "capture"].sort());
    assert.equal(payload.type, "first_job"); assert.equal(payload.country, "España"); assert.equal(payload.consent, "1");
    assert.equal(payload.full_name, "Persona QA"); assert.equal(payload.avatar.type, "image/jpeg"); assert.equal(payload.capture.type, "image/jpeg");
  }
  assert.equal(payloads[0].story, story); assert.equal(payloads[1].story, story + " Corrección QA.");
  checks.push("pending locale changes with intercepted error/success, partial server corrections and focus, unchanged actual FormData, one POST per attempt, localized success/invite/clipboard");
  await navigate("/enviar?lang=pt-BR");
  assert.equal(await step(), 1);
  assert.equal(await evaluate(() => document.querySelector('input[name="full_name"]').value), "");
  assert.equal(await evaluate(() => localStorage.length), 0);
  assert.deepEqual(errors, []);
  checks.push("reload preserves only locale, no draft storage, no browser/hydration errors");
  const report = { result: "PASS", checks, interceptedPosts, realSubmissions: 0, screenshots: ["form-es-375.png", "crop-pt-375.png", "form-pt-1440.png", "success-es-1440.png"], browserErrors: errors };
  await writeFile(join(output, "qa-results.json"), JSON.stringify(report, null, 2) + "\n");
  console.log(JSON.stringify(report));
} finally {
  if (socket?.readyState === WebSocket.OPEN) {
    try { await cdp("Browser.close"); } catch { /* Chrome can close before sending the acknowledgment. */ }
    socket.close();
  }
  server.kill(); chrome.kill();
  await pause(700);
  if (dirname(resolve(profile)) !== resolve(tmpdir()) || !basename(profile).startsWith("testimonios-i18n-browser-")) throw new Error("Unexpected profile directory; cleanup refused");
  await rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 250 });
}
