import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { test } from 'node:test';
import { summarize, summarizeStage } from './qa-carousel-summarize.mjs';

test('summarizes all flow results and flags without copying coordinates or payloads', () => {
  const report = { result: 'PASS', reports: [{ locale: 'es', category: 'simulation', result: 'PASS', valuesRetained: true, payloads: [{ unused: 'diagnostic' }] }, { locale: 'pt', category: 'first_job', result: 'FAIL', valuesRetained: false }], alignmentChecks: [{ aligned: true, fits: true, header: { left: 24 } }, { aligned: false, fits: true }], blockedPosts: 45, realSubmissions: 0, manual: 'Physical devices pending' };
  const result = summarize('submission', report);
  assert.equal(result.result, 'PASS'); // Keep the source result; do not invent one from an aggregate.
  assert.equal(result.flows[1], 'pt/first_job: FAIL');
  assert.equal(result.checks.valuesRetained, false); assert.equal(result.alignment.executions, 2);
  assert.equal(result.alignment.checks.aligned, false); assert.equal(result.simulatedPosts, 45);
  assert.equal(result.realSubmissions, 0); assert.equal(result.manual, report.manual);
  assert.ok(!JSON.stringify(result).includes('payloads') && !JSON.stringify(result).includes('header'));
});

test('retains presentation coverage, resolutions and mode-specific checks', () => {
  const base = { locale: 'es', viewport: 320, dpr: 2, quality: 85, links: 1, fits: true, rawImageRequests: 0 };
  const result = summarize('presentation', { result: 'PASS', layouts: [{ ...base, textPercent: 100, textVisible: false }, { ...base, textPercent: 200, textVisible: true, textInsideFrame: true, textScrollable: true }], resolutions: [{ viewport: 320, dpr: 2, deliveredWidth: 640, cssWidth: 260 }], scenarios: [{ case: 'keyboard', result: 'PASS', elapsedFirstNavigationMs: 1234 }] });
  assert.equal(result.layout.executions, 2); assert.deepEqual(result.layout.textPercent, [100, 200]);
  assert.ok(result.quality85 && result.oneStoryLink && result.normalTextClipped && result.enlargedTextReadable);
  assert.deepEqual(result.initialResolutions, [{ viewport: 320, dpr: 2, deliveredWidth: 640 }]);
  assert.deepEqual(result.scenarios, [{ case: 'keyboard', result: 'PASS' }]);
});

test('requires every source and leaves the detailed reports intact', async () => {
  const root = await mkdtemp(join(tmpdir(), 'testimonios-summary-'));
  try {
    const stage = join(root, 'carousel-legibility'); await mkdir(stage);
    await assert.rejects(summarizeStage(stage), { code: 'ENOENT' });
    for (const file of ['qa-results.json', 'streaming-regression.json', 'form-regression/qa-results.json', 'submit-regression/qa-results.json']) {
      await mkdir(dirname(join(stage, file)), { recursive: true }); await writeFile(join(stage, file), '{"result":"PASS"}\n');
    }
    const target = await summarizeStage(stage), first = await readFile(target, 'utf8');
    await summarizeStage(stage); assert.equal(await readFile(target, 'utf8'), first, 'deterministic output');
    assert.equal(await readFile(join(stage, 'qa-results.json'), 'utf8'), '{"result":"PASS"}\n');
    assert.deepEqual(Object.keys(JSON.parse(first).suites), ['streaming', 'form', 'submission', 'presentation']);
  } finally {
    if (dirname(resolve(root)) !== resolve(tmpdir()) || !basename(root).startsWith('testimonios-summary-')) throw Error('Unsafe cleanup');
    await rm(root, { recursive: true, force: true });
  }
});
