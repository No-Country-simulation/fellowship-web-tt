import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve, dirname, basename } from "node:path";
import { createServer } from "node:net";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

// Run after build. Every POST is blocked; hero navigation is client-only.
// All testimonial POSTs and external services remain blocked.
// No testimonial action, uploads, persistence or notifications run.
const appDir = fileURLToPath(new URL("../", import.meta.url));
const require = createRequire(import.meta.url);
const sharp = createRequire(require.resolve('next/package.json'))('sharp');
const avatarPng = await sharp(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="104" height="104"><rect width="104" height="104" fill="#12132a"/><circle cx="52" cy="35" r="20" fill="#02beef"/><ellipse cx="52" cy="104" rx="42" ry="44" fill="#7983f5"/></svg>')).png().toBuffer();
const output = join(appDir,"docs/ui/assets/hero-consent");
const refreshHeroOnly = process.argv.includes('--refresh-hero-only');
const pause = ms => new Promise(r => setTimeout(r, ms));
async function port(){const s=createServer();await new Promise(r=>s.listen(0,'127.0.0.1',r));const n=s.address().port;await new Promise(r=>s.close(r));return n;}
let server,chrome,socket,profile,cdp;const pending=new Map();const errors=[];const reports=[];let blockedPosts=0,blockedExternal=0,seq=0;
async function until(fn,label){for(let n=0;n<100;n++){if(await fn())return;await pause(80);}throw Error('Timeout '+label);}
try{
 profile=await mkdtemp(join(tmpdir(),'testimonios-hero-consent-'));
 const appPort=await port(),debugPort=await port(),origin='http://127.0.0.1:'+appPort;
 server=spawn(process.execPath,['--import',new URL('./qa-public-fixture.mjs',import.meta.url).href,require.resolve('next/dist/bin/next'),'start','--hostname','127.0.0.1','--port',String(appPort)],{cwd:appDir,windowsHide:true,stdio:'ignore'});
 chrome=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--remote-debugging-port='+debugPort,'--user-data-dir='+profile,'--disable-background-networking','--disable-sync','--no-first-run','--no-default-browser-check','about:blank'],{windowsHide:true,stdio:'ignore'});
 await until(async()=>{try{return (await fetch(origin+'/enviar')).ok;}catch{return false;}},'local server');
 await until(async()=>{try{return (await fetch('http://127.0.0.1:'+debugPort+'/json/version')).ok;}catch{return false;}},'Chrome');
 const version=await (await fetch('http://127.0.0.1:'+debugPort+'/json/version')).json();
 console.log(JSON.stringify({browser:version.Browser,mode:'same-application hero acceptance and direct access against current production build'}));
 const target=await (await fetch('http://127.0.0.1:'+debugPort+'/json/new?about:blank',{method:'PUT'})).json();
 socket=new WebSocket(target.webSocketDebuggerUrl);await new Promise((r,j)=>{socket.onopen=r;socket.onerror=j;});
 cdp=(method,params={})=>new Promise((r,j)=>{const id=++seq;const timer=setTimeout(()=>{pending.delete(id);j(Error('CDP timeout '+method));},15000);pending.set(id,{r,j,timer});socket.send(JSON.stringify({id,method,params}));});
 socket.onmessage=({data})=>{
  const e=JSON.parse(data);
  if(e.id){const p=pending.get(e.id);if(!p)return;pending.delete(e.id);clearTimeout(p.timer);if(e.error)p.j(Error(e.error.message));else p.r(e.result);}
  else if(e.method==='Runtime.exceptionThrown')errors.push('browser exception');
  else if(e.method==='Fetch.requestPaused'){
   const {requestId,request}=e.params;const u=new URL(request.url);
   if(request.method!=='GET'&&request.method!=='HEAD'){blockedPosts++;void cdp('Fetch.failRequest',{requestId,errorReason:'BlockedByClient'});}
   else if(u.origin===origin&&u.pathname==='/_next/image'&&u.searchParams.get('url')?.endsWith('/qa-avatar.png'))void cdp('Fetch.fulfillRequest',{requestId,responseCode:200,responseHeaders:[{name:'content-type',value:'image/png'}],body:avatarPng.toString('base64')});
   else if(u.origin!==origin){blockedExternal++;void cdp('Fetch.failRequest',{requestId,errorReason:'BlockedByClient'});}
   else void cdp('Fetch.continueRequest',{requestId});
  }
 };
 async function ev(fn,...args){const v=await cdp('Runtime.evaluate',{expression:'('+fn.toString()+')(...'+JSON.stringify(args)+')',awaitPromise:true,returnByValue:true});if(v.exceptionDetails)throw Error(v.exceptionDetails.text);return v.result?.value;}
 await cdp('Page.enable');await cdp('Runtime.enable');await cdp('Fetch.enable',{patterns:[{urlPattern:'*',requestStage:'Request'}]});
 async function click(selector){
  const p=await ev(sel=>{const e=document.querySelector(sel);if(!e)throw Error('missing '+sel);e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};},selector);
  await cdp('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...p});await cdp('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...p});
 }
 async function button(kind){const sel=await ev(kind=>{const texts={next:['Siguiente','Next','Pr\u00f3ximo'],back:['Atr\u00e1s','Back','Voltar']};const e=[...document.querySelectorAll('form button')].find(e=>texts[kind].includes(e.textContent.trim()));if(!e)throw Error('missing button '+kind);e.setAttribute('data-investigation',kind);return '[data-investigation="'+kind+'"]';},kind);await click(sel);}
 const step=()=>ev(()=>[...document.querySelectorAll('form > fieldset')].findIndex(e=>!e.hidden)+1);
 async function next(){const s=await step();await button('next');await until(async()=>await step()===s+1,'next step');}
 async function type(name,text){await click('[name="'+name+'"]');await cdp('Input.insertText',{text});}
 async function replace(name,text){
  await click('[name="'+name+'"]');await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'a',code:'KeyA',modifiers:2,windowsVirtualKeyCode:65});await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:'a',code:'KeyA',modifiers:2,windowsVirtualKeyCode:65});
  // Email controls do not expose selectionStart/selectionEnd; verify their final value below.
  assert.ok(await ev(()=>document.activeElement.selectionStart===null||(document.activeElement.selectionStart===0&&document.activeElement.selectionEnd===document.activeElement.value.length)),'replacement selects the entire value when selection is exposed');
  if(text)await cdp('Input.insertText',{text});else {await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'Backspace',code:'Backspace',windowsVirtualKeyCode:8});await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:'Backspace',code:'Backspace',windowsVirtualKeyCode:8});}
  assert.equal(await ev(()=>document.activeElement.value),text,'replacement applied');
 }
 function roleNames(category){return category==='simulation'?['primary_role']:category==='first_job'?['company','role_achieved']:['previous_profession','new_role'];}
 async function setup(locale,width,category){
  await cdp('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});
  await cdp('Page.navigate',{url:origin+'/enviar?lang='+locale});
  await until(()=>ev(()=>!!document.querySelector('form input[name="full_name"]')&&document.readyState==='complete'),'form');
  await until(()=>ev(()=>Object.keys(document.querySelector('form')).some(k=>k.startsWith('__reactProps$'))),'hydration');await ev(()=>document.fonts.ready.then(()=>true));await pause(150);
  await click('form ol li:last-child > span');assert.equal(await step(),1,'future step cannot advance from step 1');
  await click('[name="type"][value="'+category+'"]');await next();
  await type('full_name','Persona Sintetica');await type('email','persona@example.com');
  await ev(()=>{const el=document.querySelector('select[name="country"]');Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set.call(el,'Argentina');el.dispatchEvent(new Event('change',{bubbles:true}));});
  await ev(async()=>{const canvas=document.createElement('canvas');canvas.width=canvas.height=720;canvas.getContext('2d').fillRect(0,0,720,720);const blob=await new Promise(r=>canvas.toBlob(r,'image/png'));const d=new DataTransfer();d.items.add(new File([blob],'synthetic.png',{type:'image/png'}));const e=document.querySelector('input[name="avatar"]');e.files=d.files;e.dispatchEvent(new Event('change',{bubbles:true}));});
  await until(()=>ev(()=>!!document.querySelector('dialog[open] button:last-child:not(:disabled)')),'crop ready');
  await click('dialog[open] button:last-child');await until(()=>ev(()=>!document.querySelector('dialog[open]')),'crop closed');
  await next();
  await ev(()=>{
   window.__qaStepsForm=document.querySelector('form');
  });
 }

 const reviewTitles={es:'Revisión y envío',en:'Review and submit',pt:'Revisão e envio'};
 const actionNames={es:'Compartir mi testimonio',en:'Share my testimonial',pt:'Compartilhar meu depoimento'};
 const authorizationStarts={es:'Al enviar tu testimonio, autorizas a No Country',en:'By submitting your testimonial, you authorize No Country',pt:'Ao enviar seu depoimento, você autoriza a No Country'};
 async function key(key,code,virtual,text){for(const type of ['keyDown','keyUp'])await cdp('Input.dispatchKeyEvent',{type,key,code,windowsVirtualKeyCode:virtual,...(type==='keyDown'&&text?{text}:{})});}
 async function load(path){
  await cdp('Page.navigate',{url:origin+path});
  await until(()=>ev(()=>{const root=document.querySelector('#hero-consent,form');return document.readyState==='complete'&&root&&Object.keys(root).some(k=>k.startsWith('__reactProps$'));}),'hydrated page');
  await ev(()=>document.fonts.ready.then(()=>true));await pause(100);
  await until(()=>ev(()=>[...document.querySelectorAll('[aria-labelledby="gallery-title"] img')].every(img=>img.complete&&img.naturalWidth>0)),'synthetic public avatar');
 }
 async function capture(name,selector){
  await ev(async selector=>{const e=document.querySelector(selector),r=e.getBoundingClientRect(),start=r.top+scrollY,end=r.bottom+scrollY;for(let y=start;y<end;y+=500){scrollTo(0,y);await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));}scrollTo(0,0);},selector);
  const clip=await ev(selector=>{const r=document.querySelector(selector).getBoundingClientRect(),pad=selector==='#hero-consent'?8:0;return{x:0,y:Math.max(0,r.top+scrollY-pad),width:innerWidth,height:r.height+pad*2,scale:1};},selector);
  const shot=await cdp('Page.captureScreenshot',{format:'png',fromSurface:true,captureBeyondViewport:true,clip});const png=Buffer.from(shot.data,'base64');assert.equal(png.readUInt32BE(16),clip.width);assert.ok(Math.abs(png.readUInt32BE(20)-clip.height)<=1);
  if(!refreshHeroOnly||name.startsWith('hero-')){await writeFile(join(output,name),png);writtenCaptures.push(name);}captures.push({name,clip});
 }
 async function authorization(expected,locale){
  const info=await ev(()=>{const p=document.querySelector('#submission-authorization'),b=document.querySelector('button[type="submit"]');return{exists:!!p,text:p?.textContent.trim(),described:b?.getAttribute('aria-describedby'),notice:!!document.querySelector('[data-consent-notice],[data-consent-return]'),checkbox:!!document.querySelector('form input[type="checkbox"]'),validDescriptions:[...document.querySelectorAll('form [aria-describedby]')].every(e=>e.getAttribute('aria-describedby').split(' ').every(id=>document.getElementById(id)))};});
  assert.equal(info.exists,expected,'authorization text appears only on review');assert.equal(info.notice,false);assert.equal(info.checkbox,false);assert.ok(info.validDescriptions,'no dangling form descriptions');
  if(expected){assert.ok(info.text.startsWith(authorizationStarts[locale]));assert.equal(info.described,'submission-authorization');}
 }
 const captures=[],heroChecks=[],authorizationChecks=[],writtenCaptures=[];
 await mkdir(output,{recursive:true});
 for(const locale of ['es','en','pt'])for(const category of ['simulation','first_job','career_change']){
  await cdp('Network.clearBrowserCookies');await setup(locale,375,category);
  assert.ok(await ev(()=>location.pathname==='/enviar'),'direct access stays on the form without cookies');await authorization(false,locale);
  for(const name of roleNames(category))await type(name,'Dato QA '+name);
  await type('story','Experiencia sintética de trabajo en equipo y aprendizaje, suficientemente larga para validar el formulario.');
  await next();await authorization(false,locale);await next();await authorization(true,locale);
  assert.ok(await ev(title=>document.querySelector('form > fieldset:nth-of-type(5) legend').textContent===title,reviewTitles[locale]),'localized fifth step');
  await ev(()=>{window.__qaFormDataCount=0;const Original=FormData;window.FormData=new Proxy(Original,{construct(target,args){window.__qaFormDataCount++;return Reflect.construct(target,args);}});});
  const edit='[aria-controls="testimonial-summary"]';await click(edit);await until(()=>ev(()=>document.querySelector('[data-summary-editor]')!==null),'editing');
  await replace('full_name','');await click(edit);
  assert.ok(await ev(()=>document.activeElement.name==='full_name'&&document.activeElement.getAttribute('aria-invalid')==='true'),'Save changes retains edit mode and focuses invalid data');
  await replace('full_name','Persona editada QA');await click(edit);await until(()=>ev(()=>!document.querySelector('[data-summary-editor]')),'Save changes');
  assert.ok(await ev(()=>document.activeElement===document.querySelector('[aria-controls="testimonial-summary"]')),'visible Edit receives focus');
  assert.equal(await ev(()=>window.__qaFormDataCount),0,'local Save changes creates no FormData');
  await ev(()=>{const e=document.querySelector('[name="full_name"]');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(e,'');e.dispatchEvent(new Event('input',{bubbles:true}));});
  await click('button[type="submit"]');await until(async()=>await step()===2,'integral validation returns to invalid personal data');assert.ok(await ev(()=>document.activeElement.name==='full_name'),'first invalid field receives focus');
  assert.equal(blockedPosts,0,'invalid data never submits');await authorization(false,locale);
  await replace('full_name','Persona validada QA');await next();await next();await next();await authorization(true,locale);
  if(category==='career_change')for(const width of [320,375,768,1440])for(const scale of [1,2]){
   await cdp('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});await ev(scale=>document.documentElement.style.fontSize=16*scale+'px',scale);await pause(60);
   const fit=await ev(()=>{const w=document.documentElement.clientWidth,p=document.querySelector('#submission-authorization'),b=document.querySelector('button[type="submit"]'),summary=document.querySelector('#testimonial-summary'),r=p.getBoundingClientRect(),button=b.getBoundingClientRect(),range=document.createRange();range.selectNodeContents(p);return{documentFits:document.documentElement.scrollWidth<=w,afterSummary:r.top>=summary.getBoundingClientRect().bottom,beforeSubmit:r.bottom<button.top,allTextFits:[...range.getClientRects()].every(r=>r.left>=0&&r.right<=w+1),secondary:!p.closest('[role="alert"]')&&!p.hasAttribute('tabindex')};});
   assert.ok(Object.values(fit).every(Boolean),'final authorization reflow '+locale+' '+width+' '+scale+': '+JSON.stringify(fit));authorizationChecks.push({locale,width,fontPercent:scale*100,...fit,result:'PASS'});
  }
  await ev(()=>document.documentElement.style.removeProperty('font-size'));await cdp('Emulation.setDeviceMetricsOverride',{width:375,height:1000,deviceScaleFactor:1,mobile:false});
  if(locale==='es'&&category==='career_change')await capture('es-375-review-submit.png','form > div:last-child');
  reports.push({locale,category,result:'PASS',directAccessWithoutCookies:true,noConsentWarnings:true,authorizationOnlyOnReview:true,globalEditing:true,invalidFieldFocus:true,integralValidation:true,noPayloadFromSaveChanges:true});
 }
 for(const locale of ['es','en','pt']){
  await cdp('Network.clearBrowserCookies');await load('/?lang='+locale);
  assert.ok(await ev(()=>!document.querySelector('#hero-consent-checkbox').checked&&document.querySelector('#hero-consent button').disabled),'hero starts unchecked and disabled');
  assert.ok(await ev(()=>{const checkbox=document.querySelector('#hero-consent-checkbox'),button=document.querySelector('#hero-consent button'),label=document.querySelector('label[for="hero-consent-checkbox"]');return label.control===checkbox&&label.textContent.includes('Discord')&&!document.querySelector('#hero-consent-hint')&&!checkbox.hasAttribute('aria-describedby')&&!button.hasAttribute('aria-describedby')&&button.type==='button'&&!button.closest('form');}),'full authorization labels a local navigation gate');
  const ax=await cdp('Accessibility.getFullAXTree');assert.ok(ax.nodes.some(n=>n.role?.value==='checkbox'&&n.name?.value.includes('Discord')));assert.ok(ax.nodes.some(n=>n.role?.value==='button'&&n.name?.value===actionNames[locale]));
  await ev(()=>document.querySelector('#hero-consent button').click());assert.ok(await ev(()=>location.pathname==='/'),'disabled CTA cannot navigate');
  for(let i=0;i<40&&!await ev(()=>document.activeElement.id==='hero-consent-checkbox');i++)await key('Tab','Tab',9);
  assert.ok(await ev(()=>document.activeElement.id==='hero-consent-checkbox'&&document.activeElement.matches(':focus-visible')&&getComputedStyle(document.activeElement).outlineStyle!=='none'),'native Tab reaches the checkbox with visible focus');
  await key(' ','Space',32,' ');assert.ok(await ev(()=>document.querySelector('#hero-consent-checkbox').checked&&!document.querySelector('#hero-consent button').disabled));
  await key(' ','Space',32,' ');assert.ok(await ev(()=>!document.querySelector('#hero-consent-checkbox').checked&&document.querySelector('#hero-consent button').disabled));
  assert.equal((await cdp('Network.getAllCookies')).cookies.length,0,'toggling the checkbox does not create cookies');
  for(const width of [320,375,768,1440])for(const scale of [1,2]){
   await cdp('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});await ev(scale=>document.documentElement.style.fontSize=16*scale+'px',scale);await pause(80);
   const layout=await ev(()=>{const root=document.querySelector('#hero-consent'),b=root.querySelector('button'),label=root.querySelector('label'),f=root.getBoundingClientRect(),r=b.getBoundingClientRect(),l=label.getBoundingClientRect(),gap=parseFloat(getComputedStyle(root).rowGap);return{fits:document.documentElement.scrollWidth<=innerWidth&&root.scrollWidth<=root.clientWidth+1&&f.left>=0&&f.right<=innerWidth&&r.right<=f.right+1,area:r.height>=48&&l.height>=44,spacing:gap>0&&r.top-l.bottom>=gap-1,disabled:b.disabled};});
   assert.ok(layout.fits&&layout.area&&layout.spacing&&layout.disabled,'hero reflows without clipping and keeps spacing and touch areas');heroChecks.push({locale,width,fontPercent:scale*100,...layout});
   if(locale==='es'&&width===320&&scale===1)await capture('hero-es-320.png','#hero-consent');
   if(locale==='en'&&width===1440&&scale===1)await capture('hero-en-1440.png','[aria-labelledby="gallery-title"]');
   if(locale==='pt'&&width===375&&scale===2)await capture('hero-pt-375-200.png','#hero-consent');
  }
  await ev(()=>document.documentElement.style.removeProperty('font-size'));await cdp('Emulation.setDeviceMetricsOverride',{width:375,height:1000,deviceScaleFactor:1,mobile:false});
  await cdp('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});const touch=await ev(()=>{const e=document.querySelector('label[for="hero-consent-checkbox"]');e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};});
  await cdp('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[touch]});await cdp('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cdp('Emulation.setTouchEmulationEnabled',{enabled:false});
  assert.ok(await ev(()=>document.querySelector('#hero-consent-checkbox').checked&&!document.querySelector('#hero-consent button').disabled),'tapping the associated label enables the CTA');
  await ev(()=>document.querySelector('#hero-consent-checkbox').focus());await key('Tab','Tab',9);assert.ok(await ev(()=>document.activeElement===document.querySelector('#hero-consent button')&&document.activeElement.matches(':focus-visible')));
  await key('Enter','Enter',13,'\r');await until(()=>ev(locale=>location.pathname==='/enviar'&&new URL(location.href).searchParams.get('lang')===locale&&!!document.querySelector('form'),locale),'direct hero navigation preserves language');await authorization(false,locale);
  assert.equal(blockedPosts,0,'hero navigation never calls a registration action');
  await load('/?lang='+locale);assert.ok(await ev(()=>!document.querySelector('#hero-consent-checkbox').checked&&document.querySelector('#hero-consent button').disabled),'hero visit resets local checkbox state');
 }
 assert.equal(blockedPosts,0);assert.equal(blockedExternal,0);assert.equal(errors.length,0);
 const report={result:'PASS',reports,heroChecks,authorizationChecks,captures,writtenCaptures,registrationRequests:0,realTestimonialSubmissions:0,blockedPosts,blockedExternal,browserExceptionCount:errors.length,coverage:'Client-only hero checkbox and GET navigation; nine direct-access forms with no cookies or consent warnings. Final localized authorization appears only on review, describes submit, and is associated with the submit button. All testimonial submissions are blocked; no external services. Public avatar receives synthetic PNG bytes.',manual:'Physical devices, screen readers and native zoom remain manual; 200% uses root font scaling. Authorization sufficiency remains pending team/editorial/legal review.'};
 await writeFile(join(output,'qa-results.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({...report,reports:reports.length,heroChecks:heroChecks.length,authorizationChecks:authorizationChecks.length}));
} catch(e){console.log(JSON.stringify({result:'FAILED',error:e.message,completed:reports,blockedPosts,blockedExternal,browserExceptionCount:errors.length}));process.exitCode=1;}
finally{
 if(cdp&&socket?.readyState===WebSocket.OPEN){try{await cdp('Browser.close');}catch{}}
 socket?.close();for(const p of pending.values()){clearTimeout(p.timer);p.r({});}pending.clear();
 if(chrome&&!chrome.killed)chrome.kill();if(server&&!server.killed)server.kill();
 if(profile){if(dirname(resolve(profile))!==resolve(tmpdir())||!basename(profile).startsWith('testimonios-hero-consent-'))throw Error('Unexpected temp path');await rm(profile,{recursive:true,force:true,maxRetries:15,retryDelay:200});}
 console.log(JSON.stringify({cleanup:'own server/browser closed; temporary profile removed'}));
}
