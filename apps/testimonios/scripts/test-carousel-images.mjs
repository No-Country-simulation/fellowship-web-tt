// Tests the real server selector in an allowlisted VM; no env loader or network.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { runInNewContext } from "node:vm";
import { describe, it } from "node:test";
const require = createRequire(import.meta.url), ts = require("typescript");
const source = await readFile(new URL("../components/gallery-hero-data.ts", import.meta.url), "utf8");
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const exports = {};
let eligibleURLs = null;
runInNewContext(code, { exports, setTimeout, clearTimeout, require: name => {
  if (name === "server-only") return {};
  if (name === "@/lib/supabase/storage") return { publicStorageUrl: (bucket, path) => "https://fixture.supabase.co/storage/v1/object/public/" + bucket + "/" + path.split("/").map(encodeURIComponent).join("/") };
  if (name === "next/server") return { after: task => { void task(); } };
  if (name === "@/lib/testimonials/share-card-availability") return { availableShareCardUrls: async (urls, available) => { urls.filter(url => eligibleURLs === null || eligibleURLs.has(url)).forEach(url=>available.add(url)); return available; } };
  throw Error("Unapproved test import");
} });
const select = values => JSON.parse(JSON.stringify(exports.selectHeroStories(values)));
const base = { id: "1", slug: "persona-qa", type: "simulation", typeLabel: "Simulación", quote: "Cita", story: "Relato completo\nSegundo párrafo", fullName: "Persona QA", country: "Argentina", avatarUrl: "not needed by artwork", simulation: { primary_role: " Desarrollo " }, firstJob: null, careerChange: null };
describe("published hero image association", () => {
  it("keeps zero, one and two candidates without inventing more", () => {
    assert.deepEqual(select([]), []);
    assert.equal(select([base]).length, 1);
    assert.deepEqual(select([base, { ...base, id: "2" }]).map(e => e.id), ["1", "2"]);
  });
  it("selects at most three without replacement or mutating the input", () => {
    const rows = Array.from({ length: 12 }, (_, i) => ({ ...base, id: String(i) }));
    const before = JSON.stringify(rows), result = select(rows);
    assert.equal(result.length, 3); assert.equal(new Set(result.map(e => e.id)).size, 3); assert.equal(JSON.stringify(rows), before);
  });
  it("associates the public slug with the known Storage path and keeps the full public narrative", () => {
    const story = select([{ ...base, email: "private@example.com", rejected: "private" }])[0];
    assert.equal(story.imageUrl, "https://fixture.supabase.co/storage/v1/object/public/share-cards/persona-qa/instagram.png");
    assert.equal(story.story, base.story); assert.equal(story.role, "Desarrollo");
    assert.equal("email" in story, false); assert.equal("rejected" in story, false); assert.equal("avatarUrl" in story, false);
  });
  it("uses only the active category's public professional fields", () => {
    const input = { ...base, firstJob: { role_achieved: " QA ", company: " Empresa " }, careerChange: { previous_profession: " Docencia ", new_role: " Desarrollo " } };
    for (const [type, role, company, previousRole] of [["simulation", "Desarrollo", null, null], ["first_job", "QA", "Empresa", null], ["career_change", "Desarrollo", null, "Docencia"]]) {
      const result = select([{ ...input, type }])[0];
      assert.equal(result.role, role); assert.equal(result.company, company); assert.equal(result.previousRole, previousRole);
    }
  });
  it("treats invalid image-path segments as missing, without changing the testimonial", () => {
    for (const slug of ["", ".", "..", "../otro", "otro\\archivo", "otro?file=x", "otro#imagen"]) {
      const result = select([{ ...base, slug }])[0]; assert.equal(result.imageUrl, null); assert.equal(result.story, base.story);
    }
    assert.ok(select([{ ...base, slug: "nombre con tilde á" }])[0].imageUrl.includes("nombre%20con%20tilde%20%C3%A1"));
  });
});

describe("availability-aware hero selection", () => {
  it("selects zero, one, two or at most three eligible published stories", async () => {
    const rows = Array.from({length:10}, (_,i)=>({...base,id:String(i),slug:'story-'+i}));
    for (const count of [0,1,2,3,6,10]) {
      eligibleURLs = new Set(rows.slice(0,count).map(r=>select([r])[0].imageUrl));
      const result=JSON.parse(JSON.stringify(await exports.selectAvailableHeroStories(rows)));
      assert.equal(result.length,count?Math.min(3,count):3);
      assert.ok(result.every(r=>count?eligibleURLs.has(r.imageUrl):r.imageUrl===null));
      assert.ok(result.every(r=>r.story===base.story));
      assert.equal(rows.length,10);
    }
    assert.deepEqual(JSON.parse(JSON.stringify(await exports.selectAvailableHeroStories([]))),[]);
  });
  it('caps the wait, preserves confirmed candidates and leaves remaining checks to after()',async()=>{
    for(const warm of [false,true]){
      let onBudget,finish,complete=false;const tasks=[], scoped={};
      runInNewContext(code,{exports:scoped,setTimeout:fn=>{onBudget=fn;return 1;},clearTimeout:()=>{},require:name=>{
        if(name==='server-only')return{};
        if(name==='next/server')return{after:task=>tasks.push(task)};
        if(name==='@/lib/supabase/storage')return{publicStorageUrl:(bucket,path)=>'https://fixture/'+bucket+'/'+path};
        if(name==='@/lib/testimonials/share-card-availability')return{availableShareCardUrls:(urls,available)=>{
          if(complete){urls.forEach(url=>available.add(url));return Promise.resolve(available);}
          if(warm)available.add(urls[0]);
          return new Promise(resolve=>{finish=()=>{complete=true;urls.forEach(url=>available.add(url));resolve(available);};});
        }};throw Error('Unexpected test import');
      }});
      const rows=Array.from({length:5},(_,i)=>({...base,id:String(i),slug:'story-'+i}));
      const checking=scoped.selectAvailableHeroStories(rows);onBudget();const first=JSON.parse(JSON.stringify(await checking));
      assert.equal(first.length,warm?1:3);assert.ok(first.every(story=>warm?story.imageUrl!==null:story.imageUrl===null));assert.equal(tasks.length,1);
      finish();await tasks[0]();const next=JSON.parse(JSON.stringify(await scoped.selectAvailableHeroStories(rows)));
      assert.equal(next.length,3);assert.ok(next.every(story=>story.imageUrl));assert.ok(first.every(story=>warm||story.imageUrl===null),'response already returned is not mutated by background verification');
    }
  });
});

describe("server availability cache with isolated fetch and clock", () => {
  async function setup() {
    const caches=new Map(), inFlight=[];let clock=0, calls=0, active=0, maxActive=0;
    let response=async()=>new Response(null,{headers:{'content-type':'image/png'}});
    const cacheDouble=(fn,keys,{revalidate})=>(url)=>{
      const key=keys.join(':')+url, entry=caches.get(key);
      if(entry&&entry.expires>clock)return Promise.resolve(entry.value);
      const refresh=()=>Promise.resolve(fn(url)).then(value=>{caches.set(key,{value,expires:clock+revalidate*1000});return value;});
      if(entry){const work=refresh();inFlight.push(work);return Promise.resolve(entry.value);}
      return refresh();
    };
    const result={};
    const source=await readFile(new URL('../lib/testimonials/share-card-availability.ts',import.meta.url),'utf8');
    runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{
      exports:result,AbortSignal,
      fetch:async(url,options)=>{calls++;active++;maxActive=Math.max(active,maxActive);assert.equal(options.method,'HEAD');assert.equal(options.cache,'no-store');assert.equal(options.redirect,'error');assert.ok(options.signal);try{return await response(url);}finally{active--;}}
      ,require:name=>{if(name==='server-only')return{};if(name==='next/cache')return{unstable_cache:cacheDouble};throw Error('Unexpected test import');}
    });
    return {read:async urls=>[...await result.availableShareCardUrls(urls)],setResponse:fn=>{response=fn;},advance:()=>{clock+=301000;},flush:()=>Promise.all(inFlight.splice(0)),calls:()=>calls,maxActive:()=>maxActive};
  }
  it('reuses successful and unavailable metadata without per-visitor HEADs',async()=>{
    const qa=await setup();qa.setResponse(async url=>new Response(null,{status:url==='missing'?400:200,headers:{'content-type':'image/png'}}));
    assert.deepEqual(await qa.read(['present','missing','present']),['present']);assert.equal(qa.calls(),2);
    assert.deepEqual(await qa.read(['present','missing']),['present']);assert.equal(qa.calls(),2);
  });
  it('revalidates a missing image that is generated later, with stale-while-revalidate semantics',async()=>{
    const qa=await setup();qa.setResponse(async()=>new Response(null,{status:400}));assert.deepEqual(await qa.read(['source']),[]);
    qa.setResponse(async()=>new Response(null,{headers:{'content-type':'image/png'}}));assert.deepEqual(await qa.read(['source']),[]);assert.equal(qa.calls(),1);
    qa.advance();assert.deepEqual(await qa.read(['source']),[]);await qa.flush();assert.deepEqual(await qa.read(['source']),['source']);assert.equal(qa.calls(),2);
  });
  it('removes a disappearing image after revalidation; distinguishes temporary failures and retries them',async()=>{
    const qa=await setup();assert.deepEqual(await qa.read(['source']),['source']);
    qa.setResponse(async()=>new Response(null,{status:404}));qa.advance();await qa.read(['source']);await qa.flush();assert.deepEqual(await qa.read(['source']),[]);
    qa.setResponse(async()=>{throw Error('arbitrary upstream failure never exposed');});qa.advance();await qa.read(['source']);await qa.flush();assert.deepEqual(await qa.read(['source']),[]);
    qa.setResponse(async()=>new Response(null,{headers:{'content-type':'image/png'}}));qa.advance();await qa.read(['source']);await qa.flush();assert.deepEqual(await qa.read(['source']),['source']);
  });
  it('rejects unsuccessful and non-image responses and contains network/timeout errors',async()=>{
    for(const status of [400,404,410,401,403,429,500,503]){const qa=await setup();qa.setResponse(async()=>new Response(null,{status}));assert.deepEqual(await qa.read(['source']),[]);}
    const qa=await setup();qa.setResponse(async()=>new Response('not an image',{headers:{'content-type':'text/html'}}));assert.deepEqual(await qa.read(['source']),[]);
  });
  it('coalesces concurrent cold probes and bounds per-render concurrency at six',async()=>{
    const qa=await setup();qa.setResponse(async()=>{await new Promise(r=>setTimeout(r,5));return new Response(null,{headers:{'content-type':'image/png'}});});
    await Promise.all([qa.read(['same']),qa.read(['same'])]);assert.equal(qa.calls(),1);
    await qa.read(Array.from({length:14},(_,i)=>'unique-'+i));assert.equal(qa.maxActive(),6);
  });
});
