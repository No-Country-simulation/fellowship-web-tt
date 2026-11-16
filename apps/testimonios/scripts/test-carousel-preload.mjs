// Exercise the actual queue reducer without a browser, timers, env files or network.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import { test } from 'node:test';
const require = createRequire(import.meta.url), ts = require('typescript'), exports = {};
const source = await readFile(new URL('../components/carousel-image-queue.ts', import.meta.url), 'utf8');
runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, { exports });
const initial = available => JSON.parse(JSON.stringify(exports.initialImageQueue(available)));
const settle = (state, index, available) => JSON.parse(JSON.stringify(exports.settleImage(state, index, available)));

test('zero/one/two/three stories: first only, then one automatic request per completion', () => {
  for (const count of [0, 1, 2, 3]) {
    const available = Array(count).fill(true); let state = initial(available);
    assert.deepEqual(state.requested, count ? [0] : []);
    for (let index = 0; index < count; index++) {
      state = settle(state, index, available);
      assert.deepEqual(state.requested, Array.from({ length: Math.min(count, index + 2) }, (_, i) => i));
    }
  }
});
test('missing artwork never requests a URL or stalls available later images', () => {
  assert.deepEqual(initial([false, false, false]).requested, [0]);
  let state = initial([false, true, true]); assert.deepEqual(state.requested, [0, 1]);
  state = settle(state, 1, [false, true, true]); assert.deepEqual(state.requested, [0, 1, 2]);
  state = initial([true, false, true]); state = settle(state, 0, [true, false, true]);
  assert.deepEqual(state.requested, [0, 2]);
});
test('early navigation is not blocked; the next background request waits for current loads', () => {
  const available = [true, true, true];
  let state = { ...initial(available), requested: [0, 2], activeIndex: 2, hasNavigated: true };
  state = settle(state, 2, available); assert.deepEqual(state.requested, [0, 2]);
  state = settle(state, 0, available); assert.deepEqual(state.requested, [0, 2, 1]);
  assert.equal(state.activeIndex, 2); assert.equal(state.hasNavigated, true);
});
test('a failed background image releases the queue exactly once and preserves loaded entries', () => {
  const available = [true, true, true]; let state = initial(available);
  state = settle(state, 0, available); const before = JSON.stringify(state);
  const failed = settle(state, 1, available); // Error and load deliberately share the settlement contract.
  assert.equal(JSON.stringify(state), before, 'no input mutation');
  assert.deepEqual(failed.requested, [0, 1, 2]); assert.deepEqual(failed.settled, [0, 1]);
  assert.deepEqual(settle(failed, 1, available), failed, 'duplicate callback is inert');
  assert.deepEqual(settle(initial(available), 2, available).requested, [0], 'ignore an unrequested completion');
});
