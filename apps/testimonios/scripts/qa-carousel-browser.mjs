// Local CDP harness shared by the carousel regression and performance checks.
// Testimonial writes and browser requests outside the local origin are blocked.
import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { createServer } from "node:net";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

export const appDir = fileURLToPath(new URL("../", import.meta.url));
export const require = createRequire(import.meta.url);
export const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
export async function until(fn, label, attempts = 200) {
  for (let i = 0; i < attempts; i++) { if (await fn()) return; await pause(50); }
  throw Error("Timeout: " + label);
}
async function port() {
  const server = createServer();
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const value = server.address().port;
  await new Promise(resolve => server.close(resolve));
  return value;
}

export async function browserQA({ fixture = "qa-public-fixture.mjs", env = {} } = {}) {
  const profile = await mkdtemp(join(tmpdir(), "testimonios-carousel-"));
  const appPort = await port(), debugPort = await port(), origin = "http://127.0.0.1:" + appPort;
  let server, chrome, socket, cdp;
  let seq = 0, blockedPosts = 0, blockedExternal = 0;
  const pending = new Map(), exceptions = [], requests = new Map();
  let failImage = false;
  async function close() {
    if (socket?.readyState === WebSocket.OPEN) { try { await cdp("Browser.close"); } catch { /* Already closed. */ } }
    socket?.close();
    for (const item of pending.values()) { clearTimeout(item.timer); item.resolve({}); }
    pending.clear();
    chrome?.kill(); server?.kill();
    if (dirname(resolve(profile)) !== resolve(tmpdir()) || !basename(profile).startsWith("testimonios-carousel-")) throw Error("Unsafe cleanup target");
    await rm(profile, { recursive: true, force: true, maxRetries: 15, retryDelay: 200 });
  }
  try {
    server = spawn(process.execPath, [
      "--import", new URL("./" + fixture, import.meta.url).href,
      require.resolve("next/dist/bin/next"), "start", "--hostname", "127.0.0.1", "--port", String(appPort),
    ], { cwd: appDir, env: { ...process.env, ...env }, windowsHide: true, stdio: "ignore" });
    chrome = spawn("C:/Program Files/Google/Chrome/Application/chrome.exe", [
      "--headless=new", "--remote-debugging-port=" + debugPort, "--user-data-dir=" + profile,
      "--disable-background-networking", "--disable-sync", "--no-first-run", "--no-default-browser-check", "about:blank",
    ], { windowsHide: true, stdio: "ignore" });
    // No public data query during readiness probing.
    await until(async () => { try { return (await fetch(origin + "/icon.ico")).ok; } catch { return false; } }, "local server");
    await until(async () => { try { return (await fetch("http://127.0.0.1:" + debugPort + "/json/version")).ok; } catch { return false; } }, "Chrome");
    const version = await (await fetch("http://127.0.0.1:" + debugPort + "/json/version")).json();
    const target = await (await fetch("http://127.0.0.1:" + debugPort + "/json/new?about:blank", { method: "PUT" })).json();
    socket = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
    cdp = (method, params = {}) => new Promise((resolve, reject) => {
      const id = ++seq;
      const timer = setTimeout(() => { pending.delete(id); reject(Error("CDP timeout " + method)); }, 30000);
      pending.set(id, { resolve, reject, timer }); socket.send(JSON.stringify({ id, method, params }));
    });
    const intercept = (method, params) => { void cdp(method, params).catch(error => { if (!/Invalid InterceptionId/i.test(error.message)) exceptions.push("interception failed"); }); };
    socket.onmessage = ({ data }) => {
      const event = JSON.parse(data), p = event.params;
      if (event.id) {
        const item = pending.get(event.id); if (!item) return;
        pending.delete(event.id); clearTimeout(item.timer);
        if (event.error) item.reject(Error(event.error.message)); else item.resolve(event.result);
      } else if (event.method === "Runtime.exceptionThrown") exceptions.push("browser exception");
      else if (event.method === "Network.requestWillBeSent") requests.set(p.requestId, { url: p.request.url, type: p.type, start: p.timestamp, initiator: p.initiator });
      else if (event.method === "Network.responseReceived") {
        const item = requests.get(p.requestId);
        if (item) Object.assign(item, { mime: p.response.mimeType, status: p.response.status, cache: p.response.fromDiskCache, headers: p.response.headers });
      } else if (event.method === "Network.loadingFinished") {
        const item = requests.get(p.requestId); if (item) Object.assign(item, { bytes: p.encodedDataLength, duration: (p.timestamp - item.start) * 1000 });
      } else if (event.method === "Fetch.requestPaused") {
        const { requestId, request } = p, url = new URL(request.url);
        if (!["GET", "HEAD"].includes(request.method)) { blockedPosts++; intercept("Fetch.failRequest", { requestId, errorReason: "BlockedByClient" }); }
        else if (url.origin !== origin) { blockedExternal++; intercept("Fetch.failRequest", { requestId, errorReason: "BlockedByClient" }); }
        else if (failImage && url.pathname === "/_next/image" && url.searchParams.get("url")?.includes("/share-cards/")) {
          intercept("Fetch.fulfillRequest", { requestId, responseCode: 503, body: "" });
        } else intercept("Fetch.continueRequest", { requestId });
      }
    };
    await cdp("Page.enable"); await cdp("Runtime.enable"); await cdp("Network.enable");
    await cdp("Fetch.enable", { patterns: [{ urlPattern: "*", requestStage: "Request" }] });
    async function ev(fn, ...args) {
      const result = await cdp("Runtime.evaluate", { expression: "(" + fn.toString() + ")(..." + JSON.stringify(args) + ")", awaitPromise: true, returnByValue: true });
      if (result.exceptionDetails) throw Error(result.exceptionDetails.text);
      return result.result?.value;
    }
    async function click(selector) {
      const position = await ev(selector => { const e = document.querySelector(selector); e.scrollIntoView({ block: "center" }); const r = e.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }, selector);
      for (const type of ["mousePressed", "mouseReleased"]) await cdp("Input.dispatchMouseEvent", { type, button: "left", clickCount: 1, ...position });
    }
    async function key(key, code, windowsVirtualKeyCode, text) {
      for (const type of ["keyDown", "keyUp"]) await cdp("Input.dispatchKeyEvent", { type, key, code, windowsVirtualKeyCode, ...(type === "keyDown" && text ? { text } : {}) });
    }
    async function load(locale = "es") {
      requests.clear();
      await cdp("Page.navigate", { url: origin + "/enviar?lang=" + locale });
      await until(() => ev(() => { const e = document.querySelector("#hero-consent"); return document.readyState === "complete" && e && Object.keys(e).some(key => key.startsWith("__reactProps$")); }), "hydrated hero");
      await ev(() => document.fonts.ready.then(() => true));
    }
    async function viewport(width, dpr = 1, scale = 1) {
      await cdp("Emulation.setDeviceMetricsOverride", { width, height: 1000, deviceScaleFactor: dpr, mobile: false });
      await ev(scale => document.documentElement.style.fontSize = 16 * scale + "px", scale);
      await ev(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    }
    return { origin, cdp, ev, click, key, load, viewport, requests, exceptions, browser: version.Browser,
      setImageFailure: value => { failImage = value; }, stats: () => ({ blockedPosts, blockedExternal, browserExceptions: exceptions.length }), close };
  } catch (error) { await close(); throw error; }
}
