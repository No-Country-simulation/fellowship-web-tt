// Production-build before/after, same captured PNG bytes, no real services or submissions.
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { appDir, browserQA, pause, until } from './qa-carousel-browser.mjs';
import { recordCarouselTiming } from './qa-carousel-timing.mjs';

const before = process.argv.includes('--before'), samples = [];
const output = join(appDir, 'docs/ui/assets/carousel-preload/local');
await mkdir(output, { recursive: true });
if (process.argv.includes('--summarize')) {
  const median = values => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
  const round = value => Math.round(value * 10) / 10;
  const read = name => readFile(join(output, name + '.json'), 'utf8').then(JSON.parse);
  const previous = await read('before'), current = await read('after'), qa = await read('qa');
  const rows = data => ['desktop', 'slow-mobile'].flatMap(mode => ['cold', 'warm'].map(cache => {
    const selected = data.samples.filter(s => s.mode === mode && s.cache === cache);
    assert.equal(selected.length, 3);
    const med = fn => round(median(selected.map(fn)));
    return { mode, cache, trials: 3, firstPaintMs: med(s => s.initial.painted), firstNativeLoadMs: med(s => s.initial.imageLoad),
      lcpMs: med(s => s.initial.lcp), clsMax: Math.max(...selected.map(s => s.initial.cls)),
      initialKiB: med(s => s.initial.totalTransfer / 1024), initialImageKiB: med(s => s.initial.artworkResources.reduce((n, r) => n + r.bytes, 0) / 1024),
      initialRequests: med(s => s.initial.resourceRequests), artworkRequests: med(s => s.initialArtworkRequests),
      wait2Ms: med(s => s.navigation[0].imageWaitMs), wait3Ms: med(s => s.navigation[1].imageWaitMs),
      transition2Ms: med(s => s.navigation[0].transitionReadyMs), transition3Ms: med(s => s.navigation[1].transitionReadyMs) };
  }));
  assert.equal(qa.result, 'PASS');
  await writeFile(join(output, '../results-summary.json'), JSON.stringify({ scope: current.scope, before: rows(previous), after: rows(current),
    automaticPriorities: current.samples[0].requests.map(r => r.initialPriority), duplicateRequests: 0,
    qaCases: qa.cases.map(c => `${c.case}: ${c.result}`), manual: 'Physical devices, native zoom, screen readers and production CDN/server performance remain manual. Full per-run logs are local/ignored.' }, null, 2) + '\n');
  console.log('Compact preload summary generated.');
  process.exit(0);
}
function recordLoads() {
  window.__cardLoads = [];
  document.addEventListener('load', event => {
    if (!event.target.matches?.('[data-hero-artwork] img')) return;
    const card = event.target.closest('[data-position]');
    const index = [...card.parentNode.children].indexOf(card);
    window.__cardLoads[index] ??= performance.now();
  }, true);
}
const artworks = qa => [...qa.requests.values()].filter(r => r.type === 'Image' && decodeURIComponent(r.url).includes('/share-cards/'));
async function activeReady(qa) {
  await until(() => qa.ev(() => { const img = document.querySelector('[data-position="0"] img'); return img?.complete && img.naturalWidth > 0 && img.dataset.loaded === 'true'; }), 'active artwork');
}
for (const mode of ['desktop', 'slow-mobile']) for (let trial = 1; trial <= 3; trial++) {
  const qa = await browserQA({ fixture: 'qa-carousel-quality-fixture.mjs', env: {
    QA_QUALITY_SOURCES: join(appDir, 'docs/ui/assets/carousel-legibility/local'),
    QA_CAROUSEL_DESIGN: `preload-${before ? 'before' : 'after'}-${process.pid}-${mode}-${trial}`,
  } });
  try {
    await qa.viewport(mode === 'desktop' ? 1440 : 375, mode === 'desktop' ? 1 : 2);
    await qa.cdp('Page.addScriptToEvaluateOnNewDocument', { source: `(${recordCarouselTiming})();// QA only\n(${recordLoads})();` });
    if (mode === 'slow-mobile') {
      await qa.cdp('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1.6 * 1024 * 1024 / 8, uploadThroughput: 750 * 1024 / 8 });
      await qa.cdp('Emulation.setCPUThrottlingRate', { rate: 4 });
    }
    for (const cache of ['cold', 'warm']) {
      qa.requests.clear();
      // Do not wait for window.load: dynamically inserted eager images can extend it.
      await qa.cdp('Page.navigate', { url: qa.origin + '/enviar?lang=es' });
      await activeReady(qa);
      await qa.ev(() => document.querySelector('[data-position="0"] img').scrollIntoView({ block: 'center' }));
      await until(() => qa.ev(() => window.__carouselTiming.painted > 0), 'actual first image paint');
      // Controlled QA reading interval, identical before/after; no timer is added to the application.
      await pause(3000);
      const initial = await qa.ev(() => ({ ...window.__carouselTiming, loads: [...window.__cardLoads],
        ttfb: performance.getEntriesByType('navigation')[0].responseStart,
        totalTransfer: performance.getEntriesByType('navigation')[0].transferSize + performance.getEntriesByType('resource').reduce((n, r) => n + r.transferSize, 0),
        resourceRequests: performance.getEntriesByType('resource').length + 1,
        artworkResources: performance.getEntriesByType('resource').filter(r => decodeURIComponent(r.name).includes('/share-cards/')).map(r => ({ start: r.startTime, end: r.responseEnd, bytes: r.transferSize })),
      }));
      const initialRequests = artworks(qa).length, navigation = [];
      assert.equal(initialRequests, before ? 1 : 3, 'following images start automatically only in new version');
      if (!before) {
        assert.ok(initial.artworkResources[1].start >= initial.loads[0], 'second starts after first load');
        assert.ok(initial.artworkResources[2].start >= initial.loads[1], 'third starts after second load');
      }
      for (let target = 1; target <= 2; target++) {
        await qa.ev(() => document.querySelector('button[aria-label="Siguiente testimonio"]').focus());
        const clicked = await qa.ev(() => performance.now()), started = performance.now();
        await qa.key('Enter', 'Enter', 13, '\r'); await activeReady(qa);
        await qa.ev(() => Promise.allSettled([...document.querySelectorAll('[data-position]')].flatMap(e => e.getAnimations({ subtree: true })).map(a => a.finished)).then(() => true));
        navigation.push({ target: target + 1, imageWaitMs: await qa.ev((target, clicked) => Math.max(0, window.__cardLoads[target] - clicked), target, clicked), transitionReadyMs: performance.now() - started });
        assert.ok(await qa.ev(() => document.activeElement.getAttribute('aria-label') === 'Siguiente testimonio'));
      }
      // Return through visited images without re-requesting optimized bytes.
      for (let i = 0; i < 2; i++) { await qa.click('button[aria-label="Testimonio anterior"]'); await activeReady(qa); await pause(450); }
      const requests = artworks(qa);
      assert.equal(requests.length, 3); assert.equal(new Set(requests.map(r => r.url)).size, 3);
      assert.ok(requests.every(r => r.status === 200 && r.mime === 'image/webp' && new URL(r.url).searchParams.get('q') === '85'));
      samples.push({ mode, trial, cache, initial, initialArtworkRequests: initialRequests, navigation,
        requests: requests.map(r => ({ width: Number(new URL(r.url).searchParams.get('w')), bytes: r.bytes ?? 0, initialPriority: r.initialPriority, priorityChanges: r.priorityChanges })) });
      assert.deepEqual(qa.stats(), { blockedPosts: 0, blockedExternal: 0, browserExceptions: 0 });
    }
  } finally { await qa.close(); }
}
await writeFile(join(output, before ? 'before.json' : 'after.json'), JSON.stringify({ samples, scope: 'Local production, same public PNG bytes replayed without external latency; three cold/warm pairs per mode, new source URL/server/browser for cold. Desktop1440/DPR1; mobile375/DPR2 at1.6Mbps/150ms/CPU4. 3s QA reading interval after first paint; image scrolled into view. Navigation reports network wait separately from unchanged420ms animation. Not CWV.' }, null, 2) + '\n');
console.log(JSON.stringify({ result: 'PASS', before, samples: samples.length }));
