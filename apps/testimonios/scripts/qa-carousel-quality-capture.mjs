// Explicit public GET/HEAD capture for visual comparison; original PNGs stay ignored.
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { appDir, browserQA, until } from './qa-carousel-browser.mjs';
const directory = join(appDir, 'docs/ui/assets/carousel-legibility/local');
const verify = process.argv.includes('--verify');
const qa = await browserQA({ fixture: 'qa-carousel-quality-fixture.mjs', env: { QA_QUALITY_CAPTURE: '1', QA_QUALITY_SOURCES: directory, QA_QUALITY_SKIP_CAPTURE: verify ? '1' : '' } });
try {
  await qa.viewport(1440);
  await qa.load('es');
  if (verify) {
    const images = [];
    for (let index = 0; index < 3; index++) {
      await until(() => qa.ev(() => { const img = document.querySelector('[data-position="0"] img'); return img?.complete && img.naturalWidth > 0 && img.dataset.loaded === 'true'; }), 'real public optimized image');
      const selected = await qa.ev(() => { const s = new URL(document.querySelector('[data-position="0"] img').currentSrc); return { quality: Number(s.searchParams.get('q')), width: Number(s.searchParams.get('w')) }; });
      assert.equal(selected.quality, 85); images.push(selected);
      if (index < 2) {
        await qa.click('button[aria-label="Siguiente testimonio"]');
        await qa.ev(() => Promise.allSettled(document.querySelector('[data-position="0"]').getAnimations({ subtree: true }).map(a => a.finished)).then(() => true));
      }
    }
    const requests = [...qa.requests.values()].filter(r => r.type === 'Image' && decodeURIComponent(r.url).includes('/share-cards/')).map(r => ({ status: r.status, mime: r.mime, networkBytes: r.bytes }));
    assert.equal(requests.length, 3); assert.ok(requests.every(r => r.status === 200 && r.mime === 'image/webp'));
    await mkdir(join(directory, '..'), { recursive: true });
    await writeFile(join(directory, '../public-verification.json'), JSON.stringify({ result: 'PASS', images, requests, scope: 'Final production build, existing public query and only public HEAD/GET. Three selected images, no 400; navigation demand loading. No URLs, participant data, credentials or writes recorded.' }, null, 2) + '\n');
    console.log(JSON.stringify({ result: 'PASS', publicOptimizedImages: images.length, known400s: 0 }));
  } else {
    const manifest = JSON.parse(await readFile(join(directory, 'sources.json'), 'utf8'));
    assert.ok(manifest.samples.length >= 3, 'at least three confirmed public artworks');
    console.log(JSON.stringify({ publicSamples: manifest.samples.length, originalKiB: manifest.samples.map(s => +(s.bytes / 1024).toFixed(1)), checks: manifest.checks }));
  }
  assert.deepEqual(qa.stats(), { blockedPosts: 0, blockedExternal: 0, browserExceptions: 0 });
} finally { await qa.close(); }
