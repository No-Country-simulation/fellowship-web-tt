// Run --baseline before replacing the HTML cards, then without it after build.
// Synthetic public records only; the real Next optimizer is never intercepted.
import assert from "node:assert/strict";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { appDir, browserQA, pause, until } from "./qa-carousel-browser.mjs";

const baseline = process.argv.includes("--baseline");
const output = join(appDir, "docs/ui/assets/carousel-optimized");
const samples = [];
for (const mode of ["desktop", "slow-mobile"]) {
  for (let trial = 0; trial < 3; trial++) {
    // A new server/profile and only the known optimizer cache are reset per cold run.
    const cache = resolve(appDir, ".next/cache/images");
    assert.equal(cache, resolve(appDir, ".next", "cache", "images"));
    assert.ok(cache.startsWith(resolve(appDir, ".next") + "/") || cache.startsWith(resolve(appDir, ".next") + "\\"));
    await rm(cache, { recursive: true, force: true });
    const qa = await browserQA();
    try {
      const { cdp, ev, load, viewport, requests } = qa;
      await viewport(mode === "desktop" ? 1440 : 375, mode === "desktop" ? 1 : 2);
      await cdp("Page.addScriptToEvaluateOnNewDocument", { source: `
        window.__carouselMetrics={lcp:0,cls:0,firstImage:0};
        new PerformanceObserver(list=>{for(const e of list.getEntries())window.__carouselMetrics.lcp=e.startTime;}).observe({type:'largest-contentful-paint',buffered:true});
        new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput)window.__carouselMetrics.cls+=e.value;}).observe({type:'layout-shift',buffered:true});
        document.addEventListener('load',event=>{if(event.target.matches?.('[aria-labelledby="gallery-title"] img'))window.__carouselMetrics.firstImage ||= performance.now();},true);
      ` });
      if (mode === "slow-mobile") {
        await cdp("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: 1.6 * 1024 * 1024 / 8, uploadThroughput: 750 * 1024 / 8 });
        await cdp("Emulation.setCPUThrottlingRate", { rate: 4 });
      }
      for (const cacheState of ["cold", "warm"]) {
        await load("es"); await pause(1200);
        const metrics = await ev(() => ({ ...window.__carouselMetrics,
          resources: performance.getEntriesByType("resource").map(e => ({ name: e.name, bytes: e.transferSize, encoded: e.encodedBodySize })),
          htmlBytes: performance.getEntriesByType("navigation")[0].transferSize,
          images: [...document.querySelectorAll('[aria-labelledby="gallery-title"] img')].map(e => ({ width: e.naturalWidth, loaded: e.complete && e.naturalWidth > 0, src: new URL(e.currentSrc, location.href).pathname + new URL(e.currentSrc, location.href).search })),
        }));
        assert.ok(metrics.images.every(image => image.loaded), "every mounted hero image loaded");
        const images = [...requests.values()].filter(e => e.type === "Image").map(e => {
          const url = new URL(e.url); return { path: url.pathname, source: url.searchParams.get("url")?.split("/public/")[1], requestedWidth: url.searchParams.get("w"), mime: e.mime, bytes: e.bytes ?? 0, cache: !!e.cache, optimizerCache: e.headers?.["x-nextjs-cache"] ?? e.headers?.["X-Nextjs-Cache"] };
        });
        samples.push({ mode, trial: trial + 1, cacheState, lcpMs: metrics.lcp, cls: metrics.cls, firstImageMs: metrics.firstImage,
          initialKiB: (metrics.htmlBytes + metrics.resources.reduce((n, e) => n + e.bytes, 0)) / 1024,
          imageKiB: images.reduce((n, e) => n + e.bytes, 0) / 1024, requests: metrics.resources.length + 1, images });
        const started = performance.now();
        const oldSlide = await ev(() => document.querySelector('[data-position="0"]').getAttribute("aria-label"));
        await qa.click('button[aria-label="Siguiente testimonio"]');
        await until(() => ev(old => {
          const slide = document.querySelector('[data-position="0"]'), img = slide?.querySelector('img');
          return slide?.getAttribute('aria-label') !== old && img?.complete && img.naturalWidth > 0 && (!img.hasAttribute('data-loaded') || img.dataset.loaded === 'true');
        }, oldSlide), "second card ready");
        await ev(() => Promise.allSettled(document.querySelector('[data-position="0"]').getAnimations({subtree:true}).map(animation=>animation.finished)).then(()=>true));
        samples.at(-1).nextCardReadyMs = performance.now() - started;
        if (!baseline) assert.equal(images.filter(image => image.source?.startsWith("share-cards/")).length, 1, "only active artwork initially");
        assert.equal(qa.stats().blockedPosts, 0); assert.equal(qa.stats().blockedExternal, 0); assert.equal(qa.stats().browserExceptions, 0);
        console.log(JSON.stringify({ mode, trial: trial + 1, cacheState, lcpMs: metrics.lcp, firstImageMs: metrics.firstImage, images: images.length }));
      }
    } finally { await qa.close(); }
  }
}
await mkdir(output, { recursive: true });
await writeFile(join(output, baseline ? "performance-before.json" : "performance-after.json"), JSON.stringify({
  implementation: baseline ? "HTML replica" : "Next optimized image, active only initially", result: "PASS", samples,
  environment: "Local production build; synthetic public records; Chrome headless. Cold=new browser/server + empty optimizer cache. Warm=reload, same browser/server. Slow mobile=375px DPR2, 1.6Mbps/150ms latency/4x CPU. Desktop=1440px DPR1, unthrottled. Three samples per condition. No real services or testimonial writes. Not production CWV.",
}, null, 2) + "\n");
