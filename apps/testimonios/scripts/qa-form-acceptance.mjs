import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Focused Stage 5 QA, after build. No submissions, screenshots or application changes.
// Reuses the Stage 4 public fixture; every browser POST is blocked before Next.
const appDir = fileURLToPath(new URL("../", import.meta.url));
const require = createRequire(import.meta.url);
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
const profile = await mkdtemp(join(tmpdir(), "testimonios-acceptance-"));
async function port() {
  const server = createServer();
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const result = server.address().port;
  await new Promise(resolve => server.close(resolve));
  return result;
}
async function until(check, label) {
  for (let i = 0; i < 100; i++) { if (await check()) return; await pause(100); }
  throw new Error(`Timed out: ${label}`);
}
const appPort = await port();
const debugPort = await port();
const origin = `http://127.0.0.1:${appPort}`;
const server = spawn(process.execPath, ["--import", new URL("./qa-public-fixture.mjs", import.meta.url).href, require.resolve("next/dist/bin/next"), "start", "--hostname", "127.0.0.1", "--port", String(appPort)], { cwd: appDir, windowsHide: true, stdio: "ignore" });
const chrome = spawn(process.argv[2] ?? "C:/Program Files/Google/Chrome/Application/chrome.exe", ["--headless=new", `--remote-debugging-port=${debugPort}`, `--user-data-dir=${profile}`, "--disable-background-networking", "--disable-sync", "--no-first-run", "--no-default-browser-check", "about:blank"], { windowsHide: true, stdio: "ignore" });
let socket;
let cdp;
let blockedPosts = 0;
const errors = [];
try {
  await until(async () => { try { return (await fetch(origin + "/enviar")).ok; } catch { return false; } }, "local production server");
  await until(async () => { try { return (await fetch(`http://127.0.0.1:${debugPort}/json/version`)).ok; } catch { return false; } }, "Chrome");
  const target = await (await fetch(`http://127.0.0.1:${debugPort}/json/new?about:blank`, { method: "PUT" })).json();
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
  socket.onmessage = ({ data }) => {
    const event = JSON.parse(data);
    if (event.id) {
      const item = pending.get(event.id);
      if (!item) return;
      pending.delete(event.id); clearTimeout(item.timer);
      if (event.error) item.reject(new Error(`CDP failure: ${event.error.code}`)); else item.resolve(event.result);
    } else if (event.method === "Fetch.requestPaused") {
      if (event.params.request.method === "POST") {
        blockedPosts++;
        void cdp("Fetch.failRequest", { requestId: event.params.requestId, errorReason: "BlockedByClient" });
      } else void cdp("Fetch.continueRequest", { requestId: event.params.requestId });
    } else if (event.method === "Runtime.exceptionThrown" || (event.method === "Runtime.consoleAPICalled" && event.params.type === "error")) errors.push(event.method);
  };
  socket.onclose = () => {
    for (const item of pending.values()) { clearTimeout(item.timer); item.reject(new Error("Chrome closed")); }
    pending.clear();
  };
  async function evaluate(fn, ...args) {
    const result = await cdp("Runtime.evaluate", { expression: `(${fn.toString()})(...${JSON.stringify(args)})`, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) throw new Error("Browser evaluation failed");
    return result.result.value;
  }
  await cdp("Page.enable"); await cdp("Runtime.enable");
  await cdp("Fetch.enable", { patterns: [{ urlPattern: "*", requestStage: "Request" }] });
  const samples = [];
  for (const locale of ["es", "pt-BR"]) {
    await cdp("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
    await cdp("Page.navigate", { url: origin + "/enviar?lang=" + locale });
    await until(() => evaluate(locale => !!document.querySelector("main form") && document.querySelector("main").lang === locale && document.readyState === "complete", locale), locale);
    await evaluate(() => document.fonts.ready.then(() => true));
    await pause(100);
    // Check all currently mounted references, including inactive fieldsets, for every category.
    for (const category of ["simulation", "first_job", "career_change"]) {
      await evaluate(category => document.querySelector(`input[value="${category}"]`).click(), category);
      await pause(40);
      const associations = await evaluate(() => {
        const ids = [...document.querySelectorAll("[id]")].map(el => el.id);
        const broken = [...document.querySelectorAll("[aria-labelledby],[aria-describedby],label[for]")].flatMap(el =>
          ["aria-labelledby", "aria-describedby", "for"].flatMap(attr =>
            (el.getAttribute(attr) ?? "").split(/\s+/).filter(Boolean)
              .filter(id => !document.getElementById(id)).map(id => ({ attr, id })),
          ),
        );
        return { duplicates: ids.filter((id, i) => ids.indexOf(id) !== i), broken };
      });
      assert.deepEqual(associations, { duplicates: [], broken: [] });
    }
    await evaluate(() => [...document.querySelectorAll("main button")].find(el => el.getClientRects().length).click());
    await pause(60);
    await evaluate(() => [...document.querySelectorAll("main button")].find(el => el.getClientRects().length && el.textContent.trim() === (document.querySelector("main").lang === "es" ? "Siguiente" : "Próximo")).click());
    await pause(60);
    const validation = await evaluate(() => [...document.querySelectorAll('input[aria-invalid="true"],select[aria-invalid="true"]')].map(el => ({ name: el.name, labelled: !!(el.labels?.length || el.getAttribute("aria-labelledby")), described: (el.getAttribute("aria-describedby") ?? "").split(/\s+/).some(id => document.getElementById(id)?.textContent.trim()) })));
    assert.deepEqual(validation.map(el => el.name).sort(), ["avatar", "country", "email", "full_name"]);
    assert.ok(validation.every(el => el.labelled && el.described));
    await evaluate(() => {
      const input = document.querySelector('input[name="full_name"]');
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(input, "Persona QA");
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.blur();
    });
    await pause(60);
    const ax = await cdp("Accessibility.getFullAXTree");
    const selectName = locale === "es" ? "Idioma del formulario" : "Idioma do formulário";
    assert.ok(ax.nodes.some(node => !node.ignored && node.role?.value === "combobox" && node.name?.value === selectName));
    assert.equal(await evaluate(() => document.querySelector("header").lang === document.querySelector("main").lang), true);
    for (const width of [1440, 320]) {
      await cdp("Emulation.setDeviceMetricsOverride", { width, height: 1000, deviceScaleFactor: 1, mobile: false });
      await pause(60);
      samples.push(await evaluate((locale, width) => {
        const input = document.querySelector('input[name="full_name"]');
        const next = [...document.querySelectorAll("main button")].find(el => el.textContent.trim() === (locale === "es" ? "Siguiente" : "Próximo"));
        const inputStyle = getComputedStyle(input);
        const buttonStyle = getComputedStyle(next);
        const rgb = text => text.match(/[\d.]+/g).slice(0, 3).map(Number);
        const lum = color => color.map(c => { c /= 255; return c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4; }).reduce((a, c, i) => a + c * [.2126, .7152, .0722][i], 0);
        const ratio = (a, b) => (Math.max(lum(a), lum(b)) + .05) / (Math.min(lum(a), lum(b)) + .05);
        const rect = next.getBoundingClientRect();
        const colors = [...buttonStyle.backgroundImage.matchAll(/rgb\([^)]+\)/g)].map(match => rgb(match[0]));
        const textPoints = [];
        const walker = document.createTreeWalker(next, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) {
          const node = walker.currentNode;
          for (let i = 0; i < node.length; i++) {
            if (!node.textContent[i].trim()) continue;
            const range = document.createRange(); range.setStart(node, i); range.setEnd(node, i + 1);
            const r = range.getBoundingClientRect();
            // CSS gradient is 135deg: project each character box centre onto its line.
            const t = Math.max(0, Math.min(1, .5 + ((r.left + r.width / 2 - rect.left - rect.width / 2) + (r.top + r.height / 2 - rect.top - rect.height / 2)) / (rect.width + rect.height)));
            const bg = colors[0].map((c, index) => c + (colors[1][index] - c) * t);
            textPoints.push(ratio(rgb(buttonStyle.color), bg));
          }
        }
        const description = getComputedStyle(document.querySelector('main p[class*="text-text-secondary"]'));
        const result = { locale, width, associations: "PASS", errors: "PASS", placeholder: { color: getComputedStyle(input, "::placeholder").color, opacity: getComputedStyle(input, "::placeholder").opacity, background: inputStyle.backgroundColor, contrast: ratio(rgb(getComputedStyle(input, "::placeholder").color), rgb(inputStyle.backgroundColor)) }, border: { color: inputStyle.borderColor, contrast: ratio(rgb(inputStyle.borderColor), rgb(inputStyle.backgroundColor)) }, secondary: { color: description.color }, button: { color: buttonStyle.color, gradient: buttonStyle.backgroundImage, fontSize: buttonStyle.fontSize, fontWeight: buttonStyle.fontWeight, estimatedMinContrastAtCharacterCentres: Math.min(...textPoints) } };
        return result;
      }, locale, width));
    }
  }
  // Attempt browser shortcut, without using CSS font-size or a page-scale emulation.
  const zoomMetrics = () => evaluate(() => ({ width: innerWidth, dpr: devicePixelRatio, scale: visualViewport.scale }));
  const before = await zoomMetrics();
  await cdp("Input.dispatchKeyEvent", { type: "keyDown", key: "+", code: "Equal", modifiers: 2, windowsVirtualKeyCode: 187 });
  await cdp("Input.dispatchKeyEvent", { type: "keyUp", key: "+", code: "Equal", modifiers: 2, windowsVirtualKeyCode: 187 });
  await pause(150);
  const after = await zoomMetrics();
  assert.equal(blockedPosts, 0); assert.deepEqual(errors, []);
  const report = { associations: "PASS", contrast: samples.some(sample => sample.placeholder.contrast < 4.5) ? "FAIL" : "PASS", screenReader: "PENDIENTE: no operable manual screen-reader session", browserZoom: { status: "PENDIENTE", shortcutChangedMetrics: JSON.stringify(before) !== JSON.stringify(after), before, after, note: "Headless/CDP shortcut does not certify real browser zoom; manual desktop/mobile QA required." }, samples, blockedPosts, realSubmissions: 0, browserErrors: errors };
  const output = join(appDir, "docs/ui/assets/form-acceptance");
  await mkdir(output, { recursive: true });
  await writeFile(join(output, "qa-results.json"), JSON.stringify(report, null, 2) + "\n");
  console.log(JSON.stringify({ associations: report.associations, contrast: report.contrast, browserZoom: report.browserZoom, blockedPosts, browserErrors: errors }));
} finally {
  if (socket?.readyState === WebSocket.OPEN) { try { await cdp("Browser.close"); } catch { /* Chrome can close before its acknowledgement. */ } socket.close(); }
  server.kill(); chrome.kill(); await pause(700);
  if (dirname(resolve(profile)) !== resolve(tmpdir()) || !basename(profile).startsWith("testimonios-acceptance-")) throw new Error("Unexpected profile; cleanup refused");
  await rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 250 });
}
