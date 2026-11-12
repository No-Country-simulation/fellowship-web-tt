// Compare builds with identical captured public bytes; no remote query/Storage latency.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { appDir, browserQA, pause, until } from './qa-carousel-browser.mjs';
import { recordCarouselTiming } from './qa-carousel-timing.mjs';
const baseline = process.argv.includes('--before'), samples = [];
const output = join(appDir, 'docs/ui/assets/carousel-legibility'), local = join(output, 'local');
await mkdir(output, { recursive: true });
for (const mode of ['desktop', 'slow-mobile']) for (let trial = 1; trial <= 3; trial++) {
  // New source identities avoid deleting caches or altering the availability implementation.
  const qa = await browserQA({ fixture: 'qa-carousel-quality-fixture.mjs', env: { QA_QUALITY_SOURCES: local, QA_CAROUSEL_DESIGN: `legibility-${baseline ? 'before' : 'after'}-${process.pid}-${mode}-${trial}` } });
  try {
    await qa.viewport(mode === 'desktop' ? 1440 : 375, mode === 'desktop' ? 1 : 2);
    // Stabilize random selection only inside QA: first PNG is identical across all trials/builds.
    await qa.cdp('Page.addScriptToEvaluateOnNewDocument', { source: '(' + recordCarouselTiming.toString() + ')()' });
    if (mode === 'slow-mobile') {
      await qa.cdp('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1.6 * 1024 * 1024 / 8, uploadThroughput: 750 * 1024 / 8 });
      await qa.cdp('Emulation.setCPUThrottlingRate', { rate: 4 });
    }
    for (const cache of ['cold', 'warm']) {
      await qa.load('es');
      await until(() => qa.ev(() => { const img = document.querySelector('[data-position="0"] img'); return img?.complete && img.naturalWidth > 0 && img.dataset.loaded === 'true'; }), 'painted image');
      // Mobile art starts below the viewport. Keep it visible for comparable Element Timing.
      await qa.ev(() => document.querySelector('[data-position="0"] img').scrollIntoView({ block: 'center' }));
      await until(() => qa.ev(() => window.__carouselTiming.painted > 0), 'Element Timing'); await pause(600);
      const measured = await qa.ev(() => ({ ...window.__carouselTiming, ttfb: performance.getEntriesByType('navigation')[0].responseStart, quality: new URL(document.querySelector('[data-position="0"] img').currentSrc).searchParams.get('q'), width: new URL(document.querySelector('[data-position="0"] img').currentSrc).searchParams.get('w') }));
      const requests = [...qa.requests.values()].filter(r => r.type === 'Image' && decodeURIComponent(r.url).includes('/share-cards/'));
      assert.equal(requests.length, 1, 'only active image requested initially');
      const old = await qa.ev(() => document.querySelector('[data-position="0"]').getAttribute('aria-label'));
      const started = performance.now(); await qa.click('button[aria-label="Siguiente testimonio"]');
      await until(() => qa.ev(old => { const e = document.querySelector('[data-position="0"]'), img = e.querySelector('img'); return e.getAttribute('aria-label') !== old && img?.complete && img.naturalWidth > 0 && img.dataset.loaded === 'true'; }, old), 'next image');
      await qa.ev(() => Promise.allSettled(document.querySelector('[data-position="0"]').getAnimations({ subtree: true }).map(a => a.finished)).then(() => true));
      const nextMs = performance.now() - started;
      samples.push({ mode, trial, cache, ...measured, imageNetworkBytes: requests[0].bytes ?? 0, optimizerCache: requests[0].headers?.['x-nextjs-cache'], nextMs });
      assert.deepEqual(qa.stats(), { blockedPosts: 0, blockedExternal: 0, browserExceptions: 0 });
    }
  } finally { await qa.close(); }
}
await writeFile(join(output, baseline ? 'performance-before.json' : 'performance-after.json'), JSON.stringify({ samples, scope: 'Production builds, three cold/warm pairs per mode; original PNG bytes replayed locally. Cold=new source URLs, server, browser; warm=reload. No external latency or submissions. Slow mobile=375/DPR2, 1.6Mbps/150ms/CPU4. Image scrolled into view for paint; LCP is independent and may be text. Not production CWV.' }, null, 2) + '\n');
console.log(JSON.stringify({ result: 'PASS', samples: samples.length, baseline }));
