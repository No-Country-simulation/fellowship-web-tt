// Production-build regression: actual Next optimizer + synthetic public Storage bytes.
// Run qa-carousel-generate.mjs first for all seven unmodified panel designs.
import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createRequire } from "node:module";
import { appDir, browserQA, pause, require, until } from "./qa-carousel-browser.mjs";

const sharp = createRequire(require.resolve("next/package.json"))("sharp");
const output = join(appDir, "docs/ui/assets/carousel-optimized");
const layouts = [], scenarios = [], optimized = [], navigation = [], negotiation = [];
const nextLabels = { es: "Siguiente testimonio", en: "Next testimonial", pt: "Próximo depoimento" };
const textLabels = { es: "Leer testimonio en texto", en: "Read testimonial as text", pt: "Ler depoimento em texto" };
const carousel = '[aria-labelledby="gallery-title"] section[data-count]';
const activeImage = carousel + ' [data-position="0"] img';

function artRequests(qa) { return [...qa.requests.values()].filter(r => r.url.includes("/_next/image?") && new URL(r.url).searchParams.get("url")?.includes("/share-cards/")); }
async function ready(qa) {
  await until(() => qa.ev(selector => { const e = document.querySelector(selector); return e?.complete && e.naturalWidth > 0 && e.dataset.loaded === "true"; }, activeImage), "active optimized artwork");
}
async function capture(qa, name) {
  await qa.ev(() => scrollTo(0, 0));
  const clip = await qa.ev(() => { const r = document.querySelector('[aria-labelledby="gallery-title"]').getBoundingClientRect(); return { x: 0, y: 0, width: innerWidth, height: r.bottom + scrollY, scale: 1 }; });
  const png = await qa.cdp("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip });
  await writeFile(join(output, name), Buffer.from(png.data, "base64"));
}
await mkdir(output, { recursive: true });
let qa = await browserQA();
try {
  await qa.viewport(1440); await qa.load("en"); await ready(qa); await pause(400);
  assert.equal(artRequests(qa).length, 1, "only the active artwork downloads initially");
  assert.equal(await qa.ev(selector => document.querySelectorAll(selector + ' img').length, carousel), 1, "inactive cards have no image sources");
  assert.ok(artRequests(qa).every(r => r.mime === "image/webp"), "browser really receives WebP");

  // No resource interception: inspect the optimizer's actual response bytes and cache.
  const source = await qa.ev(selector => document.querySelector(selector).getAttribute("src"), activeImage);
  assert.ok(new URL(new URL(source, qa.origin).searchParams.get("url")).pathname.includes("/share-cards/"));
  for (const design of ["photo", "quote", "portrait", "offer", "journey", "shift", "profile"]) {
    // The fixture selects a design by a known synthetic slug; no Storage catalogue is queried.
    const image = await readFile(join(output, "generated", design + ".png"));
    const metadata = await sharp(image).metadata(); assert.equal(metadata.width, 1080); assert.equal(metadata.height, 1350);
  }

  const before = await qa.ev(selector => document.querySelector(selector + ' [data-position="0"]').getBoundingClientRect().height, carousel);
  await qa.ev(label => document.querySelector('button[aria-label="' + label + '"]').focus(), nextLabels.en);
  await qa.key("Enter", "Enter", 13, "\r"); await ready(qa); await pause(500);
  assert.equal(artRequests(qa).length, 2, JSON.stringify(artRequests(qa).map(r => ({ source: new URL(r.url).searchParams.get('url')?.split('/share-cards/')[1], width: new URL(r.url).searchParams.get('w'), mime: r.mime }))));
  assert.ok(await qa.ev(label => document.activeElement.getAttribute("aria-label") === label, nextLabels.en), "navigation preserves focus");
  await qa.key(" ", "Space", 32, " "); await ready(qa); await pause(500); assert.equal(artRequests(qa).length, 3);
  await qa.key("Enter", "Enter", 13, "\r"); await ready(qa); await pause(500); assert.equal(artRequests(qa).length, 3, "return does not fetch a fourth card");
  await qa.click('button[aria-label="Previous testimonial"]'); await ready(qa); await pause(500);
  assert.equal(await qa.ev(selector => document.querySelector(selector + ' [data-position="0"]').getAttribute('aria-label'), carousel), '3 of 3', "previous wraps to the final story");
  assert.ok(await qa.ev(() => document.activeElement.getAttribute('aria-label') === 'Previous testimonial'), "previous keeps its focus");
  await qa.click('button[aria-label="Next testimonial"]'); await ready(qa); await pause(500);
  assert.equal(artRequests(qa).length, 3, "reverse navigation reuses the already loaded images");
  assert.equal(await qa.ev(selector => document.querySelector(selector + ' [data-position="0"]').getBoundingClientRect().height, carousel), before, "art dimensions remain stable");
  navigation.push({ keyboard: "Enter and Space; wrap to first", initialArtworkRequests: 1, afterThreeCards: 3, repeatRequests: 0, preservedFocus: true, motion: "normal" });
  // Capture after the network assertions: headless capture can request extra srcset variants.
  await capture(qa, "en-1440.png");
  await qa.viewport(375, 3); await ready(qa);
  await until(() => qa.ev(selector => new URL(document.querySelector(selector).currentSrc).searchParams.get("w") === "1080", activeImage), "DPR3 source selection");
  assert.ok(artRequests(qa).some(r => new URL(r.url).searchParams.get("w") === "1080" && r.mime === "image/webp"));
  scenarios.push({ case: "375px DPR3", requestedWidth: 1080, format: "image/webp", result: "PASS" });

  await qa.cdp("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  for (const locale of ["es", "en", "pt"]) {
    await qa.load(locale); await ready(qa);
    assert.equal(await qa.ev(() => document.querySelector('[data-hero-transcript] summary').textContent), textLabels[locale]);
    await qa.ev(() => document.querySelector('[data-hero-transcript] summary').focus());
    await qa.key("Enter", "Enter", 13, "\r");
    assert.ok(await qa.ev(() => document.querySelector('[data-hero-transcript] details').open), "native keyboard expands the semantic text");
    assert.ok(await qa.ev(() => document.activeElement.matches('summary:focus-visible') && getComputedStyle(document.activeElement).outlineStyle !== 'none'), "text control keeps visible keyboard focus");
    await qa.key('Tab', 'Tab', 9);
    assert.ok(await qa.ev(() => document.activeElement.matches('a[href^="/t/"]')), "Tab reaches the existing detail link");
    await qa.key('Tab', 'Tab', 9); await qa.key('Tab', 'Tab', 9);
    assert.ok(await qa.ev(label => document.activeElement.getAttribute('aria-label') === label, nextLabels[locale]), "Tab traverses previous and next controls without entering inactive slides");
    const ax = await qa.cdp("Accessibility.getFullAXTree");
    assert.equal(ax.nodes.filter(n => n.role?.value === "image" && n.name?.value === "").length, 0, "artwork is decorative");
    for (const width of [320, 375, 768, 1024, 1440, 1920]) for (const dpr of [1, 2]) for (const scale of [1, 2]) {
      await qa.viewport(width, dpr, scale); await pause(40);
      for (let index = 0; index < 3; index++) {
        await ready(qa);
        const layout = await qa.ev(selector => {
          const root = document.querySelector(selector), frame = root.querySelector('[data-position="0"] [data-hero-artwork]'), img = frame.querySelector("img");
          const r = frame.getBoundingClientRect(), text = root.querySelector("[data-hero-transcript]");
          const controls = [...root.querySelectorAll("button, a, summary")].filter(e => !e.closest('[inert]'));
          return { fits: document.documentElement.scrollWidth <= document.documentElement.clientWidth && root.scrollWidth <= root.clientWidth + 1,
            ratio: Math.abs(r.width / r.height - 0.8) < 0.005, width: r.width, height: r.height,
            imageContained: getComputedStyle(img).objectFit === "contain", intrinsicWidth: img.naturalWidth,
            oneActive: root.querySelectorAll('[data-position]:not([aria-hidden="true"])').length === 1,
            inactiveSafe: [...root.querySelectorAll('[data-position]:not([data-position="0"])')].every(e => e.inert && e.getAttribute("aria-hidden") === "true"),
            touchAreas: controls.every(e => e.getBoundingClientRect().height >= 43),
            textFits: [...text.querySelectorAll("p,dd,dt,blockquote,summary")].every(e => e.scrollWidth <= e.clientWidth + 1),
            textOpen: text.querySelector("details").open,
            imageAlt: img.alt, heroGateIntact: !document.querySelector('#hero-consent-checkbox').checked && document.querySelector('#hero-consent button').disabled,
            rawOriginalRequests: performance.getEntriesByType("resource").filter(e => e.name.includes('/storage/v1/') && !e.name.includes('/_next/image?')).length };
        }, carousel);
        assert.ok(layout.fits && layout.ratio && layout.imageContained && layout.oneActive && layout.inactiveSafe && layout.touchAreas && layout.textFits && layout.heroGateIntact && layout.rawOriginalRequests === 0, JSON.stringify({ locale, width, dpr, scale, index, layout }));
        layouts.push({ locale, viewport: width, dpr, textPercent: scale * 100, index, ...layout });
        await qa.click('button[aria-label="' + nextLabels[locale] + '"]');
        // Each active story has one text equivalent; expanded state intentionally resets.
        await qa.click('[data-hero-transcript] summary');
      }
      if (locale === "es" && width === 320 && dpr === 1 && scale === 1) await capture(qa, "es-320-text.png");
      if (locale === "pt" && width === 375 && dpr === 1 && scale === 2) await capture(qa, "pt-375-200.png");
    }
    const axes = await qa.cdp("Accessibility.getFullAXTree");
    assert.ok(axes.nodes.some(n => n.role?.value === "StaticText" && n.name?.value.includes("Historia sintética de QA")), "full narrative is accessible locally");
    // Server-supplied labels follow the active locale, without translating authored testimony.
    assert.ok(axes.nodes.some(n => n.role?.value === "button" && n.name?.value === nextLabels[locale]));
    assert.equal(qa.stats().blockedPosts, 0); assert.equal(qa.stats().blockedExternal, 0); assert.equal(qa.stats().browserExceptions, 0);
  }
  await qa.cdp("Emulation.setScriptExecutionDisabled", { value: true });
  await qa.cdp("Page.navigate", { url: qa.origin + '/enviar?lang=es' });
  await until(() => qa.ev(selector => { const img = document.querySelector(selector); return document.readyState === 'complete' && img?.complete && img.naturalWidth > 0; }, activeImage), 'server-rendered artwork without hydration');
  assert.equal(await qa.ev(selector => getComputedStyle(document.querySelector(selector)).opacity, activeImage), '1', 'initial artwork can paint before client JavaScript');
  scenarios.push({ case: 'JavaScript disabled', serverArtworkVisible: true, result: 'PASS' });
  await qa.cdp("Emulation.setScriptExecutionDisabled", { value: false });
  qa.setImageFailure(true); await qa.cdp("Network.setCacheDisabled", { cacheDisabled: true }); await qa.viewport(375); await qa.load("es");
  await until(() => qa.ev(selector => !document.querySelector(selector) && document.querySelector('[data-position="0"] [data-hero-artwork]').textContent.includes("no disponible"), activeImage), "failed optimizer fallback");
  await qa.click('[data-hero-transcript] summary'); await capture(qa, "es-375-error.png");
  scenarios.push({ case: "optimizer 503 or browser network error", fallback: true, textAvailable: true });
} finally { await qa.close(); }

// Counts and distinct Storage failure modes exercise real server/optimizer errors.
for (const config of [{ count: 0 }, { count: 1 }, { count: 2 }, { count: 3, error: "missing" }, { count: 3, error: "invalid" }, { count: 3, error: "network" }]) {
  qa = await browserQA({ env: { QA_CAROUSEL_COUNT: String(config.count), QA_CAROUSEL_IMAGE_ERROR: config.error ?? "" } });
  try {
    await qa.viewport(375); await qa.load("en");
    if (!config.count) assert.equal(await qa.ev(selector => document.querySelector(selector), carousel), null);
    else {
      assert.equal(await qa.ev(selector => Number(document.querySelector(selector).dataset.count), carousel), config.count);
      if (!config.error) await ready(qa);
      else await until(() => qa.ev(selector => !document.querySelector(selector), activeImage), "server image failure fallback");
      assert.equal(await qa.ev(selector => document.querySelectorAll(selector + ' button').length, carousel), config.count === 1 ? 0 : 2);
      assert.ok(await qa.ev(() => !!document.querySelector('[data-hero-transcript] summary')));
    }
    assert.deepEqual(qa.stats(), { blockedPosts: 0, blockedExternal: 0, browserExceptions: 0 });
    scenarios.push({ ...config, responses: artRequests(qa).map(r => ({ status: r.status, mime: r.mime })), result: "PASS" });
  } finally { await qa.close(); }
}

for (const design of ["photo", "quote", "portrait", "offer", "journey", "shift", "profile"]) {
  qa = await browserQA({ env: { QA_CAROUSEL_DESIGN: design } });
  try {
    await qa.viewport(375, 2); await qa.load("en"); await ready(qa);
    const request = artRequests(qa)[0], url = new URL(request.url);
    const started = performance.now();
    const response = await fetch(qa.origin + url.pathname + url.search, { headers: { Accept: "image/webp" } });
    const body = Buffer.from(await response.arrayBuffer()), metadata = await sharp(body).metadata();
    assert.equal(response.status, 200); assert.equal(metadata.format, "webp"); assert.ok(metadata.width < 1080);
    assert.ok(Math.abs(metadata.height - metadata.width * 1.25) <= 1, "resizing preserves 4:5 within one pixel rounding");
    const raw = await readFile(join(output, "generated", design + ".png"));
    assert.ok(body.length < raw.length);
    optimized.push({ design, originalBytes: raw.length, browserWidth: url.searchParams.get("w"), contentType: response.headers.get("content-type"), width: metadata.width, height: metadata.height, bytes: body.length, optimizerCache: response.headers.get("x-nextjs-cache"), durationMs: performance.now() - started });
    if (design === "photo") {
      const legacy = await fetch(qa.origin + url.pathname + url.search, { headers: { Accept: "image/png" } });
      const png = Buffer.from(await legacy.arrayBuffer()), dimensions = await sharp(png).metadata();
      assert.equal(legacy.status, 200); assert.equal(dimensions.format, "png"); assert.equal(dimensions.width, 750); assert.ok(png.length < raw.length);
      negotiation.push({ accept: "image/png", contentType: legacy.headers.get("content-type"), width: dimensions.width, height: dimensions.height, bytes: png.length, originalBytes: raw.length });
    }
    assert.deepEqual(qa.stats(), { blockedPosts: 0, blockedExternal: 0, browserExceptions: 0 });
  } finally { await qa.close(); }
}
const report = { result: "PASS", layouts, navigation, scenarios, optimized, negotiation,
  scope: "Local production build, actual Next/Sharp optimizer and unmodified Canvas renderer from local panel, synthetic records only. No POSTs, uploads or real external calls. 200% is root text, not native browser zoom. Physical devices and screen readers remain manual. Design matching of deployed admin is not established." };
await writeFile(join(output, "qa-results.json"), JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify({ result: report.result, responsiveStates: layouts.length, designs: optimized.length, scenarios: scenarios.length, realSubmissions: 0 }));
