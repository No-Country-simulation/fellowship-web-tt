// Network lifecycle/priority regression, existing public PNG bytes replayed locally; never calls real services.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { appDir, browserQA, pause, until } from './qa-carousel-browser.mjs';
const output = join(appDir, 'docs/ui/assets/carousel-preload/local'), cases = [];
await mkdir(output, { recursive: true });
const art = qa => [...qa.requests.values()].filter(r => r.type === 'Image' && decodeURIComponent(r.url).includes('/share-cards/'));
async function allReady(qa, count) {
  await until(() => qa.ev(count => [...document.querySelectorAll('[data-hero-artwork] img')].filter(e => e.complete && e.naturalWidth > 0 && e.dataset.loaded === 'true').length === count, count), 'all selected images ready');
}
let scenario = 0;
function replay(extra) { return browserQA({ fixture: 'qa-carousel-quality-fixture.mjs', env: { QA_QUALITY_SOURCES: join(appDir, 'docs/ui/assets/carousel-legibility/local'), QA_CAROUSEL_DESIGN: `preload-qa-${process.pid}-${scenario++}`, ...extra } }); }
// Keep the first image pending long enough to inspect its exclusive high-priority initial request.
let qa = await replay({ QA_QUALITY_ARTWORK_DELAY: '1200' });
try {
  await qa.viewport(1440);
  await qa.cdp('Page.navigate', { url: qa.origin + '/enviar?lang=en' });
  await until(() => qa.ev(() => { const e = document.querySelector('#hero-consent'); return Boolean(e && Object.keys(e).some(k => k.startsWith('__reactProps$')) && document.querySelector('[data-position="0"] img')); }), 'hydrated pending first image');
  assert.equal(await qa.ev(() => document.querySelectorAll('[data-hero-artwork] img').length), 1, 'no background request competes with the first image');
  assert.equal(await qa.ev(() => document.querySelector('[data-position="0"] img').fetchPriority), 'high');
  await until(async () => await qa.ev(() => document.querySelector('[data-position="1"] img')?.dataset.loaded === 'false') && art(qa).length >= 2, 'second automatically requested, still pending');
  assert.equal(await qa.ev(() => document.querySelector('[data-position="1"] img').fetchPriority), 'low');
  assert.equal(await qa.ev(() => document.querySelectorAll('[data-hero-artwork] img').length), 2, 'third waits for the second');
  const secondSource = art(qa)[1].url;
  // Activate the same in-flight element, not another preload URL/Image object.
  await qa.ev(() => document.querySelector('button[aria-label="Next testimonial"]').focus());
  await qa.key('Enter', 'Enter', 13, '\r');
  await until(() => qa.ev(expected => document.querySelector('[data-position="0"] img').currentSrc === expected, secondSource), 'promoted resource uses the existing optimized URL');
  assert.equal(await qa.ev(() => document.querySelector('[data-position="0"] img').fetchPriority), 'high');
  assert.ok(await qa.ev(() => document.activeElement.getAttribute('aria-label') === 'Next testimonial'));
  await allReady(qa, 3);
  const requests = art(qa);
  assert.equal(requests.length, 3); assert.equal(new Set(requests.map(r => r.url)).size, 3, 'no duplicate optimized URL');
  assert.ok(requests.every(r => r.status === 200 && r.mime === 'image/webp'));
  assert.ok(await qa.ev(() => [...document.querySelectorAll('[data-position]:not([data-position="0"])')].every(e => e.inert && e.getAttribute('aria-hidden') === 'true')));
  await pause(450); await qa.key(' ', 'Space', 32, ' '); await pause(450);
  await qa.click('button[aria-label="Previous testimonial"]'); await pause(450);
  assert.equal(art(qa).length, 3, 'visited images reused');
  cases.push({ case: 'first exclusive; second low; third sequential; early keyboard promotion; reuse', result: 'PASS', priorities: requests.map(r => ({ initial: r.initialPriority, changes: r.priorityChanges })) });
  assert.deepEqual(qa.stats(), { blockedPosts: 0, blockedExternal: 0, browserExceptions: 0 });
} finally { await qa.close(); }

// Jump directly to the still-unrequested third slide while the second remains in flight.
qa = await replay({ QA_QUALITY_ARTWORK_DELAY: '1200' });
try {
  await qa.viewport(1440);
  await qa.cdp('Page.navigate', { url: qa.origin + '/enviar?lang=en' });
  await until(async () => await qa.ev(() => document.querySelector('[data-position="1"] img')?.dataset.loaded === 'false') && art(qa).length === 2, 'second in flight before direct navigation to third');
  await qa.ev(() => document.querySelector('button[aria-label="Previous testimonial"]').focus());
  await qa.key('Enter', 'Enter', 13, '\r');
  await until(() => art(qa).length === 3, 'active third request starts immediately');
  assert.equal(art(qa)[1].initialPriority, 'Low');
  assert.equal(art(qa)[2].initialPriority, 'High', 'new active request takes priority over the existing background one');
  await allReady(qa, 3);
  assert.ok(await qa.ev(() => document.activeElement.getAttribute('aria-label') === 'Previous testimonial'));
  assert.equal(new Set(art(qa).map(r => r.url)).size, 3);
  cases.push({ case: 'early direct third navigation: native High while second remains Low', result: 'PASS' });
  assert.deepEqual(qa.stats(), { blockedPosts: 0, blockedExternal: 0, browserExceptions: 0 });
} finally { await qa.close(); }

// A failed background image must not stall the third or lose its textual equivalent.
qa = await replay({ QA_QUALITY_FAILED_SOURCE: 'simulacion-qa' });
try {
  await qa.viewport(375, 2); await qa.load('en');
  await until(() => qa.ev(() => { const frames = [...document.querySelectorAll('[data-hero-artwork]')]; return frames.length === 3 && frames.filter(e => e.dataset.textFallback === 'true').length === 1 && frames.filter(e => e.querySelector('img')?.dataset.loaded === 'true').length === 2; }), 'error releases queue and preserves fallback');
  assert.equal(art(qa).length, 3);
  await qa.cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await qa.click('button[aria-label="Next testimonial"]');
  assert.ok(await qa.ev(() => { const t = document.querySelector('[data-position="0"] [data-hero-transcript]'); return t.textContent.includes('Historia sintética de QA.') && getComputedStyle(t).clipPath === 'none'; }));
  cases.push({ case: 'failed background GET: text remains usable and third loads', result: 'PASS' });
  assert.deepEqual(qa.stats(), { blockedPosts: 0, blockedExternal: 0, browserExceptions: 0 });
} finally { await qa.close(); }

for (const count of [0, 1, 2, 3]) {
  qa = await browserQA({ env: { QA_CAROUSEL_COUNT: String(count), QA_CAROUSEL_DESIGN: `preload-count-${process.pid}-${count}` } });
  try {
    await qa.viewport(320); await qa.load('es');
    await until(() => qa.ev(() => !document.querySelector('[data-hero-pending]')), 'stream resolved');
    if (count) await allReady(qa, count);
    assert.equal(art(qa).length, count);
    assert.equal(await qa.ev(() => document.querySelectorAll('section[data-count] button').length), count > 1 ? 2 : 0);
    cases.push({ case: `${count} selected stories`, result: 'PASS', artworkRequests: count });
    assert.deepEqual(qa.stats(), { blockedPosts: 0, blockedExternal: 0, browserExceptions: 0 });
  } finally { await qa.close(); }
}
qa = await browserQA({ env: { QA_CAROUSEL_IMAGE_ERROR: 'missing' } });
try {
  await qa.load('pt'); await until(() => qa.ev(() => !!document.querySelector('[data-position="0"] [data-hero-transcript]')), 'confirmed absence');
  assert.equal(art(qa).length, 0); assert.equal(await qa.ev(() => document.querySelectorAll('[data-hero-artwork] img').length), 0);
  cases.push({ case: 'confirmed missing images: text only, no optimizer request', result: 'PASS' });
  assert.deepEqual(qa.stats(), { blockedPosts: 0, blockedExternal: 0, browserExceptions: 0 });
} finally { await qa.close(); }
await writeFile(join(output, 'qa.json'), JSON.stringify({ result: 'PASS', cases, scope: 'Local production and replay/synthetic fixtures. No external requests or real submissions. Native network priorities are browser hints; accessible focus/hidden slides preserved.' }, null, 2) + '\n');
console.log(JSON.stringify({ result: 'PASS', cases: cases.length }));
