// Production regression for streaming, placeholder visibility and transient recovery.
// No real services: public data and original PNG bytes come from qa-public-fixture.
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { appDir, browserQA, pause, until } from './qa-carousel-browser.mjs';
import { recordCarouselTiming } from './qa-carousel-timing.mjs';

const legibility=process.argv.includes('--legibility');
const output=join(appDir,legibility?'docs/ui/assets/carousel-legibility':'docs/ui/assets/carousel-first-visit'),local=join(appDir,'.next/first-visit-qa');
await mkdir(output,{recursive:true});await mkdir(local,{recursive:true});
const results=[],layouts=[];
async function heads(file){return(await readFile(file,'utf8')).trim().split('\n').filter(Boolean).map(JSON.parse).filter(e=>e.kind==='availability').length;}
async function loaded(qa){await until(()=>qa.ev(()=>{const img=document.querySelector('[data-position="0"] img');return img?.complete&&img.naturalWidth>0&&img.dataset.loaded==='true';}),'active artwork');}
const earlyState=join(local,'early-state.json'),earlyLog=join(local,'early.jsonl');await writeFile(earlyState,JSON.stringify({available:6,delay:500}));await writeFile(earlyLog,'');
let qa=await browserQA({env:{QA_CAROUSEL_AVAILABILITY:`early-${process.pid}`,QA_CAROUSEL_PUBLIC_DELAY:'900',QA_CAROUSEL_STATE:earlyState,QA_CAROUSEL_METRICS:earlyLog}});
try{
 await qa.viewport(1440);await qa.cdp('Page.addScriptToEvaluateOnNewDocument',{source:'('+recordCarouselTiming.toString()+')()'});
 await qa.cdp('Page.navigate',{url:qa.origin+'/enviar?lang=es'});
 await until(()=>qa.ev(()=>{const e=document.querySelector('#hero-consent');return e&&Object.keys(e).some(k=>k.startsWith('__reactProps$'));}),'interactive hero before metadata');
 assert.ok(await qa.ev(()=>!!document.querySelector('[data-hero-pending]')),'only the carousel suspends');
 await qa.click('#hero-consent-checkbox');await qa.click('#hero-consent button');
 await until(()=>qa.ev(()=>document.activeElement.matches('[data-form-step-heading]')&&document.querySelector('form').getClientRects().length>0),'form starts while stories are pending');
 await qa.click('[name="type"][value="simulation"]');
 await qa.ev(()=>[...document.querySelectorAll('form button')].find(e=>e.textContent.trim()==='Siguiente').click());
 await until(()=>qa.ev(()=>document.querySelector('[name="full_name"]').getClientRects().length>0),'personal step');
 await qa.click('[name="full_name"]');await qa.cdp('Input.insertText',{text:'Persona QA pendiente'});
 await until(async()=>await heads(earlyLog)===10,'background checks complete');await pause(150);
 assert.ok(await qa.ev(()=>document.querySelector('[name="full_name"]').value==='Persona QA pendiente'&&document.activeElement.name==='full_name'&&document.querySelector('form').getClientRects().length>0),'late stream never resets the form or steals focus');
 await qa.click('form ol li:first-child button');
 await qa.click('form > div:last-child button:first-of-type');await loaded(qa);
 assert.ok(await qa.ev(()=>document.activeElement.id==='gallery-title'),'existing return focus');
 const firstRequests=[...qa.requests.values()].filter(e=>e.type==='Image'&&decodeURIComponent(e.url).includes('/share-cards/'));
 assert.equal(firstRequests.length,1,'only the first artwork loads even with a late stream');
 for(const locale of ['es','en','pt']){
  await qa.load(locale);await loaded(qa);
  const placeholder=await qa.ev(()=>{const p=document.querySelector('[data-position="0"] [data-hero-artwork] p');return{hidden:p.hidden,display:getComputedStyle(p).display,height:p.getBoundingClientRect().height};});
  assert.deepEqual(placeholder,{hidden:true,display:'none',height:0});
  for(const width of [320,375,768,1024,1440,1920])for(const scale of [1,2]){
   await qa.viewport(width,2,scale);
   const fit=await qa.ev(()=>({fits:document.documentElement.scrollWidth<=document.documentElement.clientWidth,
    image:document.querySelector('[data-position="0"] img').getBoundingClientRect().width,
    hidden:[...document.querySelectorAll('[data-position]:not([data-position="0"])')].every(e=>e.inert&&e.getAttribute('aria-hidden')==='true')}));
   assert.ok(fit.fits&&fit.hidden&&fit.image<=340,JSON.stringify({locale,width,scale,fit}));layouts.push({locale,width,fontPercent:scale*100,...fit});
  }
  await qa.viewport(375);const label={es:'Siguiente testimonio',en:'Next testimonial',pt:'Próximo depoimento'}[locale];
  await qa.ev(label=>document.querySelector('button[aria-label="'+label+'"]').focus(),label);
  await qa.key('Enter','Enter',13,'\r');await loaded(qa);await pause(500);
  assert.ok(await qa.ev(label=>document.activeElement.getAttribute('aria-label')===label,label));
  assert.equal(await qa.ev(()=>document.querySelectorAll('[data-position]:not([aria-hidden="true"])').length),1);
 }
 assert.deepEqual(qa.stats(),{blockedPosts:0,blockedExternal:0,browserExceptions:0});results.push({case:'form interactive before public query and HEAD complete; late stream, keyboard, ES/EN/PT',result:'PASS'});
}finally{await qa.close();}

for(const config of [{available:0},{available:1},{available:2},{available:3},{available:6},{available:6,failure:'network'},{available:6,failure:'http'},{available:6,delay:2000}]){
 const label=`${config.available}-${config.failure??config.delay??'ok'}`,state=join(local,label+'.json'),log=join(local,label+'.jsonl');
 await writeFile(state,JSON.stringify(config));await writeFile(log,'');
 qa=await browserQA({env:{QA_CAROUSEL_AVAILABILITY:`case-${process.pid}-${label}`,QA_CAROUSEL_STATE:state,QA_CAROUSEL_METRICS:log}});
 try{
  await qa.viewport(375);await qa.load('en');
  await until(()=>qa.ev(()=>!!document.querySelector('section[data-count]')),'settled carousel');
  const eligible=config.failure||config.delay?0:config.available;
  assert.equal(await qa.ev(()=>Number(document.querySelector('section[data-count]').dataset.count)),eligible?Math.min(3,eligible):3);
  if(eligible)await loaded(qa);else assert.equal(await qa.ev(()=>document.querySelectorAll('[data-hero-artwork] img').length),0);
  assert.ok(await qa.ev(()=>!!document.querySelector('[data-position="0"] [data-hero-transcript]')));
  await until(async()=>await heads(log)===10,'remaining HEADs');
  if(config.failure==='http'){
   await writeFile(state,JSON.stringify({available:6}));await qa.load('en');assert.equal(await heads(log),10,'transient retry backoff prevents repeated HEADs');
   await pause(15100);await qa.load('en');await loaded(qa);
   await until(async()=>await heads(log)===20,'transient retry after 15 seconds, not 5 minutes');
  }
  assert.deepEqual(qa.stats(),{blockedPosts:0,blockedExternal:0,browserExceptions:0});results.push({...config,result:'PASS'});
 }finally{await qa.close();}
}
await writeFile(join(output,legibility?'streaming-regression.json':'qa-results.json'),JSON.stringify({result:'PASS',results,layouts,scope:'Current local production build; synthetic public records/Storage bytes. Early form interaction, delayed stream, absence, transient recovery after 15s, timeout, demand loading, keyboard and 36 responsive states; zero writes or real services. Physical devices/screen readers/native zoom remain manual.'},null,2)+'\n');
console.log(JSON.stringify({result:'PASS',cases:results.length,layouts:layouts.length,realSubmissions:0}));
