// Selection/availability regression and short before/after performance comparison.
// Only synthetic public records; browser writes/external calls are blocked by the harness.
import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { appDir, browserQA, until } from "./qa-carousel-browser.mjs";

const baseline = process.argv.includes("--before"), output = join(appDir, "docs/ui/assets/carousel-availability");
const local = join(appDir, ".next/carousel-availability");
await mkdir(output, { recursive: true }); await mkdir(local, { recursive: true });
const samples = [], scenarios = [];
for (let trial = 1; trial <= 3; trial++) {
  const metricsFile = join(local, `metrics-${baseline ? 'before' : 'after'}-${trial}.jsonl`);
  await writeFile(metricsFile, '');
  const qa = await browserQA({ env: { QA_CAROUSEL_AVAILABILITY: `${baseline ? 'before' : 'after'}-${process.pid}-${trial}`, QA_CAROUSEL_METRICS: metricsFile } });
  try {
    await qa.viewport(375, 2);
    await qa.cdp('Page.addScriptToEvaluateOnNewDocument', { source: "window.__firstArt=0;document.addEventListener('load',e=>{if(e.target.matches?.('[data-hero-artwork] img'))window.__firstArt ||= performance.now();},true);" });
    for (const cache of ['cold', 'warm']) {
      const prior = (await readFile(metricsFile, 'utf8')).trim().split('\n').filter(Boolean).length;
      await qa.load('es');
      await until(() => qa.ev(() => { const img = document.querySelector('[data-position="0"] img'); return img?.complete && img.naturalWidth > 0; }), 'first optimized card');
      const navigation = await qa.ev(() => ({ responseMs: performance.getEntriesByType('navigation')[0].responseStart, firstArtMs: window.__firstArt,
        imageBytes: performance.getEntriesByType('resource').filter(e=>e.name.includes('/_next/image?')&&decodeURIComponent(e.name).includes('/share-cards/')).reduce((n,e)=>n+e.transferSize,0),
        artworkCount: document.querySelectorAll('[data-hero-artwork] img').length }));
      assert.equal(navigation.artworkCount, 1);
      const lines = (await readFile(metricsFile, 'utf8')).trim().split('\n').filter(Boolean).slice(prior).map(JSON.parse);
      const counts = Object.fromEntries(['published-query', 'availability', 'optimizer-source'].map(kind=>[kind,lines.filter(e=>e.kind===kind).length]));
      assert.equal(counts['published-query'], 1);
      assert.equal(counts.availability, baseline || cache === 'warm' ? 0 : 10);
      const checks=lines.filter(e=>e.kind==='availability');
      const artwork=[...qa.requests.values()].find(e=>e.type==='Image'&&decodeURIComponent(e.url).includes('/share-cards/'));
      samples.push({ trial, cache, ...navigation, counts, availabilityWallMs:checks.length?Math.max(...checks.map(e=>e.startedMs+e.ms))-Math.min(...checks.map(e=>e.startedMs)):0,
        optimizerRequestMs:artwork?.duration??null,optimizerCache:artwork?.headers?.['x-nextjs-cache']??artwork?.headers?.['X-Nextjs-Cache']??null,phases: lines });
    }
    if (!baseline) {
      const selected = new Set();
      for (let i=0;i<12;i++) {
        await qa.load('es');
        const names = await qa.ev(() => [...new Set([...document.querySelectorAll('[data-hero-artwork] img')].map(img=>new URL(new URL(img.src).searchParams.get('url')).pathname.split('/').at(-2)))]);
        names.forEach(name=>selected.add(name));
      }
      assert.ok(selected.size > 1, 'random selection still varies between requests');
      scenarios.push({ trial, randomFirstCards: selected.size, result: 'PASS' });
    }
    assert.deepEqual(qa.stats(), {blockedPosts:0,blockedExternal:0,browserExceptions:0});
  } finally { await qa.close(); }
}
if (!baseline) for (const config of [{available:0},{available:1},{available:2},{available:3},{available:6},{available:6,failure:'network'},{available:6,failure:'http'},{available:6,delay:2000}]) {
  const {available}=config, label=`${available}-${config.failure??config.delay??'ok'}`;
  const expected = config.failure || config.delay ? 0 : available;
  const stateFile=join(local,`state-${label}.json`), metricsFile=join(local,`scenario-${label}.jsonl`);
  await writeFile(stateFile,JSON.stringify(config));await writeFile(metricsFile,'');
  const qa=await browserQA({env:{QA_CAROUSEL_AVAILABILITY:`count-${process.pid}-${label}`,QA_CAROUSEL_STATE:stateFile,QA_CAROUSEL_METRICS:metricsFile}});
  try {
    await qa.viewport(375);await qa.load('en');
    const count=await qa.ev(()=>Number(document.querySelector('section[data-count]').dataset.count));
    assert.equal(count, expected ? Math.min(3,expected) : 3);
    assert.ok(await qa.ev(()=>!!document.querySelector('[data-position="0"] [data-hero-transcript]')));
    if (!expected) assert.equal(await qa.ev(()=>document.querySelectorAll('[data-hero-artwork] img').length),0,'no broken image URLs when no confirmed artwork');
    else {
      await until(()=>qa.ev(()=>{const img=document.querySelector('[data-position="0"] img');return img?.complete&&img.naturalWidth>0;}),'eligible artwork');
      const index=await qa.ev(()=>Number(new URL(new URL(document.querySelector('[data-position="0"] img').src).searchParams.get('url')).pathname.split('/').at(-2).split('-').at(-1)));
      assert.ok(index < available,'only eligible source selected');
    }
    if(available===0){
      const prefix=`availability-count-${process.pid}-${label}-`;
      const gallery=await(await fetch(qa.origin+'/?lang=en')).text();
      assert.ok(Array.from({length:10},(_,i)=>prefix+i).every(slug=>gallery.includes(slug)),'gallery retains published stories without artwork');
      const detail=await(await fetch(qa.origin+'/t/'+prefix+'9')).text();
      assert.ok(detail.includes('Persona QA'),'detail of a published story without artwork remains accessible');
    }
    if(available===3 && !config.failure){
      await writeFile(stateFile,JSON.stringify({available:0}));
      await qa.setImageFailure(true);await qa.cdp('Network.setCacheDisabled',{cacheDisabled:true});
      await qa.load('en');await until(()=>qa.ev(()=>!document.querySelector('[data-position="0"] img')),'runtime disappearance fallback');
      assert.ok(await qa.ev(()=>document.querySelector('[data-position="0"] [data-hero-transcript]').textContent.includes('QA')));
    }
    await until(async()=> (await readFile(metricsFile,'utf8')).trim().split('\n').filter(Boolean).map(JSON.parse).filter(e=>e.kind==='availability').length===10,'background metadata checks complete');
    const phases=(await readFile(metricsFile,'utf8')).trim().split('\n').filter(Boolean).map(JSON.parse);
    assert.equal(phases.filter(e=>e.kind==='availability').length,10);
    const checks=phases.filter(e=>e.kind==='availability');
    const responseMs=await qa.ev(()=>performance.getEntriesByType('navigation')[0].responseStart);
    const verificationWallMs=Math.max(...checks.map(e=>e.startedMs+e.ms))-Math.min(...checks.map(e=>e.startedMs));
    if(config.delay)assert.ok(responseMs<verificationWallMs,'slow verification completes after response, not before it');
    assert.deepEqual(qa.stats(),{blockedPosts:0,blockedExternal:0,browserExceptions:0});scenarios.push({...config,rendered:count,result:'PASS',responseMs,verificationWallMs,phases});
  }finally{await qa.close();}
}
await writeFile(join(output, baseline?'before.json':'after.json'),JSON.stringify({result:'PASS',samples,scenarios,
  scope:'Local production build, 10 synthetic published records; public query 50ms, HEAD 50ms; actual optimizer and demand loading retained. Three trials, cold/new URLs and warm/same server cache. Browser GET image bytes, no real services or submissions. These are lab measurements, not production latency.'},null,2)+'\n');
console.log(JSON.stringify({result:'PASS',baseline,samples:samples.length,scenarios:scenarios.length}));
