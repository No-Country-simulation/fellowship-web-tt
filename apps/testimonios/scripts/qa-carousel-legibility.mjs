// Final production QA: real captured PNG bytes, synthetic public records, no external writes/reads.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { appDir, browserQA, pause, until } from './qa-carousel-browser.mjs';
const output = join(appDir, 'docs/ui/assets/carousel-legibility'), layouts = [], scenarios = [], resolutions = [];
await mkdir(output, { recursive: true });
const labels = { es: 'Siguiente testimonio', en: 'Next testimonial', pt: 'Próximo depoimento' };
const textLabels = { es: 'Leer testimonio en texto', en: 'Read testimonial as text', pt: 'Ler depoimento em texto' };
const active = '[data-position="0"]', transcript = active + ' [data-hero-transcript]';
async function ready(qa) { await until(() => qa.ev(() => { const img = document.querySelector('[data-position="0"] img'); return img?.complete && img.naturalWidth > 0 && img.dataset.loaded === 'true'; }), 'active image'); }
async function capture(qa, name) {
  await qa.ev(() => scrollTo(0, 0)); await pause(100);
  const clip = await qa.ev(() => { const r = document.querySelector('[aria-labelledby="gallery-title"]').getBoundingClientRect(); return { x: 0, y: 0, width: innerWidth, height: r.bottom + scrollY, scale: 1 }; });
  const image = await qa.cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip });
  await writeFile(join(output, name), Buffer.from(image.data, 'base64'));
}
let qa = await browserQA({ fixture: 'qa-carousel-quality-fixture.mjs', env: { QA_QUALITY_SOURCES: join(output, 'local'), QA_CAROUSEL_DESIGN: 'legibility-final' } });
try {
  await qa.viewport(1440); await qa.load('en'); await ready(qa);
  assert.equal(await qa.ev(() => document.querySelectorAll('[data-hero-artwork] img').length), 1);
  assert.ok([...qa.requests.values()].filter(r => r.type === 'Image' && decodeURIComponent(r.url).includes('/share-cards/')).every(r => r.status === 200 && r.mime === 'image/webp'));
  // Keep actual animation and keyboard focus checks before the responsive/reduced-motion matrix.
  await qa.ev(label => document.querySelector('button[aria-label="' + label + '"]').focus(), labels.en);
  const started = performance.now(); await qa.key('Enter', 'Enter', 13, '\r'); await ready(qa);
  await qa.ev(() => Promise.allSettled(document.querySelector('[data-position="0"]').getAnimations({ subtree: true }).map(a => a.finished)).then(() => true));
  assert.ok(await qa.ev(label => document.activeElement.getAttribute('aria-label') === label, labels.en));
  await qa.key(' ', 'Space', 32, ' '); await ready(qa); await pause(500);
  await qa.key('Enter', 'Enter', 13, '\r'); await ready(qa); await pause(500);
  assert.equal(await qa.ev(() => document.querySelectorAll('[data-hero-artwork] img').length), 3, 'visited images retained, no new source on wrap');
  scenarios.push({ case: 'normal motion, Enter/Space, retained images and focus', elapsedFirstNavigationMs: performance.now() - started, result: 'PASS' });
  await capture(qa, 'en-1440.png');
  await qa.cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  for (const locale of ['es', 'en', 'pt']) {
    await qa.viewport(1440); await qa.load(locale); await ready(qa);
    const ax = await qa.cdp('Accessibility.getFullAXTree');
    assert.equal(ax.nodes.filter(n => !n.ignored && n.role?.value === 'StaticText' && n.name?.value.includes('Historia sintética de QA.')).length, 1, 'one active complete narrative, no duplicate quote/story');
    assert.equal(ax.nodes.filter(n => !n.ignored && n.role?.value === 'region' && n.name?.value === textLabels[locale]).length, 1, 'one localized transcript region');
    const artNode = await qa.cdp('Runtime.evaluate', { expression: 'document.querySelector(\'[data-position="0"] img\')' });
    const artAX = await qa.cdp('Accessibility.getPartialAXTree', { objectId: artNode.result.objectId, fetchRelatives: false });
    assert.ok(artAX.nodes.every(n => n.ignored), 'art is decorative; the header brand keeps its own image semantics');
    // One existing link; the text region itself is keyboard-readable, not another button/link.
    await qa.ev(selector => document.querySelector(selector).focus(), transcript);
    await qa.key('Tab', 'Tab', 9, undefined); await qa.key('Tab', 'Tab', 9, undefined);
    await qa.key('Tab', 'Tab', 9, undefined);
    assert.ok(await qa.ev(label => document.activeElement.getAttribute('aria-label') === label, labels[locale]), 'tab order: text region, story link, previous, next');
    await qa.key('Tab', 'Tab', 9, undefined);
    await qa.ev(selector => document.querySelector(selector).focus(), transcript);
    assert.ok(await qa.ev(selector => { const e = document.querySelector(selector); return e.matches(':focus-visible') && getComputedStyle(e).clipPath === 'none' && getComputedStyle(e).outlineStyle !== 'none'; }, transcript), 'keyboard reveals text inside frame with visible focus');
    await qa.key('End', 'End', 35, undefined);
    await qa.click('button[aria-label="' + labels[locale] + '"]'); await ready(qa);
    for (const width of [320, 375, 768, 1440, 1920]) for (const dpr of [1, 2, 3]) for (const scale of [1, 2]) {
      // A fresh document lets Chrome renegotiate srcset for each DPR, rather than retaining
      // a source picked before CDP changed the screen metrics.
      await qa.viewport(width, dpr); await qa.load(locale);
      await qa.viewport(width, dpr, scale); await ready(qa);
      for (let index = 0; index < 3; index++) {
        const layout = await qa.ev(() => {
          const root = document.querySelector('section[data-count]'), active = root.querySelector('[data-position="0"]'), frame = active.querySelector('[data-hero-artwork]'), text = active.querySelector('[data-hero-transcript]'), img = active.querySelector('img');
          const r = frame.getBoundingClientRect(), t = text.getBoundingClientRect(), source = new URL(img.currentSrc);
          const links = root.querySelectorAll('a[href^="/t/"]');
          return { fits: document.documentElement.scrollWidth <= document.documentElement.clientWidth && root.scrollWidth <= root.clientWidth + 1,
            width: r.width, height: r.height, textVisible: getComputedStyle(text).clipPath === 'none', textScrollable: text.scrollHeight > text.clientHeight, textFits: getComputedStyle(text).clipPath !== 'none' || text.scrollWidth <= text.clientWidth + 1,
            textInsideFrame: t.left >= r.left && t.right <= r.right + 1 && t.top >= r.top && t.bottom <= r.bottom + 1,
            quality: Number(source.searchParams.get('q')), deliveredWidth: Number(source.searchParams.get('w')), actualDpr: devicePixelRatio, ratio: Math.abs(r.width / r.height - .8) < .005,
            links: links.length, noBelowTranscript: !root.querySelector(':scope > [data-hero-transcript]') && !root.querySelector('details, summary'),
            oneActive: root.querySelectorAll('[data-position]:not([aria-hidden="true"])').length === 1,
            inactiveSafe: [...root.querySelectorAll('[data-position]:not([data-position="0"])')].every(e => e.inert && e.getAttribute('aria-hidden') === 'true'),
            touch: [...root.querySelectorAll('button,a')].every(e => e.getBoundingClientRect().height >= 43),
            gate: !document.querySelector('#hero-consent-checkbox').checked && document.querySelector('#hero-consent button').disabled,
            rawImageRequests: performance.getEntriesByType('resource').filter(e => e.name.includes('/storage/v1/') && !e.name.includes('/_next/image?')).length };
        });
        assert.ok(layout.fits && layout.textFits && layout.ratio && layout.links === 1 && layout.noBelowTranscript && layout.oneActive && layout.inactiveSafe && layout.touch && layout.gate && !layout.rawImageRequests && layout.quality === 85, JSON.stringify({ locale, width, dpr, scale, index, layout }));
        assert.equal(layout.textVisible, scale === 2, '200% root text uses the same reflowing equivalent in-place');
        assert.equal(layout.actualDpr, dpr);
        assert.ok(layout.deliveredWidth >= layout.width * dpr, 'delivered pixels cover the rendered width at this DPR');
        if (scale === 2) assert.ok(layout.textInsideFrame && layout.textScrollable);
        layouts.push({ locale, viewport: width, dpr, textPercent: scale * 100, index, ...layout });
        await qa.click('button[aria-label="' + labels[locale] + '"]'); await ready(qa);
      }
      if (locale === 'es' && width === 320 && dpr === 1 && scale === 1) await capture(qa, 'es-320.png');
      if (locale === 'pt' && width === 375 && dpr === 1 && scale === 2) await capture(qa, 'pt-375-200.png');
    }
  }
  // Runtime failure AFTER a positive HEAD: no broken bitmap, full local text and only one link.
  qa.setImageFailure(true); await qa.cdp('Network.setCacheDisabled', { cacheDisabled: true });
  await qa.viewport(375); await qa.load('es');
  await until(() => qa.ev(() => document.querySelector('[data-position="0"] [data-hero-artwork]')?.dataset.textFallback === 'true'), 'runtime text fallback');
  assert.ok(await qa.ev(() => { const e = document.querySelector('[data-position="0"] [data-hero-transcript]'); return e.textContent.includes('Historia sintética de QA.') && getComputedStyle(e).clipPath === 'none' && !document.querySelector('[data-position="0"] img'); }));
  await capture(qa, 'es-375-fallback.png');
  scenarios.push({ case: 'GET/optimizer failure after positive HEAD: complete text inside reserved frame', result: 'PASS' });
  assert.deepEqual(qa.stats(), { blockedPosts: 0, blockedExternal: 0, browserExceptions: 0 });
} finally { await qa.close(); }
// A new source identity for EACH viewport/DPR prevents Chrome from reusing a larger cached
// candidate when measuring the resolution selected on a true first visit.
const variantFile = join(output, 'local/resolution-variant.txt'); await writeFile(variantFile, 'initial');
qa = await browserQA({ fixture: 'qa-carousel-quality-fixture.mjs', env: { QA_QUALITY_SOURCES: join(output, 'local'), QA_QUALITY_VARIANT_FILE: variantFile } });
try {
  for (const width of [320, 375, 768, 1440, 1920]) for (const dpr of [1, 2, 3]) {
    await writeFile(variantFile, `resolution-${process.pid}-${width}-${dpr}`);
    await qa.viewport(width, dpr); await qa.load('en'); await ready(qa);
    const selected = await qa.ev(() => { const img = document.querySelector('[data-position="0"] img'), url = new URL(img.currentSrc); return { cssWidth: img.getBoundingClientRect().width, deliveredWidth: Number(url.searchParams.get('w')), quality: Number(url.searchParams.get('q')), dpr: devicePixelRatio }; });
    assert.equal(selected.dpr, dpr); assert.equal(selected.quality, 85);
    assert.ok(selected.deliveredWidth >= selected.cssWidth * dpr && selected.deliveredWidth <= 1080, JSON.stringify({ width, dpr, selected }));
    resolutions.push({ viewport: width, ...selected });
  }
  assert.deepEqual(qa.stats(), { blockedPosts: 0, blockedExternal: 0, browserExceptions: 0 });
} finally { await qa.close(); }
// HEAD-confirmed absence: prevents known 400s rather than downloading a broken source.
qa = await browserQA({ env: { QA_CAROUSEL_IMAGE_ERROR: 'missing' } });
try {
  await qa.viewport(320); await qa.load('en');
  await until(() => qa.ev(() => !!document.querySelector('[data-position="0"] [data-hero-transcript]')), 'missing artwork fallback');
  assert.equal(await qa.ev(() => document.querySelectorAll('[data-hero-artwork] img').length), 0);
  assert.ok(await qa.ev(() => { const t = document.querySelector('[data-position="0"] [data-hero-transcript]'); return t.textContent.includes('Historia sintética de QA.') && getComputedStyle(t).clipPath === 'none'; }));
  assert.equal([...qa.requests.values()].filter(r => decodeURIComponent(r.url).includes('/share-cards/')).length, 0);
  scenarios.push({ case: 'HEAD missing: no optimizer 400, complete local text, no detail request', result: 'PASS' });
  assert.deepEqual(qa.stats(), { blockedPosts: 0, blockedExternal: 0, browserExceptions: 0 });
} finally { await qa.close(); }
await writeFile(join(output, 'qa-results.json'), JSON.stringify({ result: 'PASS', layouts, resolutions, scenarios, scope: 'Final production build; public PNGs replayed locally, synthetic public records. Five widths, DPR1/2/3, root text100/200, ES/EN/PT. Layout matrix may retain larger cached candidates; separate 15-case resolution matrix uses new source identities. CDP accessibility and keyboard; no real services/submissions. Not a physical-device/screen-reader certification; native zoom remains manual.' }, null, 2) + '\n');
console.log(JSON.stringify({ result: 'PASS', layouts: layouts.length, scenarios: scenarios.length }));
