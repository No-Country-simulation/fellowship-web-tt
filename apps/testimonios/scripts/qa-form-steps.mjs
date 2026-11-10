import { enterForm } from "./qa-enter-form.mjs";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve, dirname, basename } from "node:path";
import { createServer } from "node:net";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

// Run after build. Every non-GET request is held or blocked before Next;
// the pending action gets a synthetic error response. No real action/services run.
const appDir = fileURLToPath(new URL("../", import.meta.url));
const require = createRequire(import.meta.url);
const output = join(appDir, "docs/ui/assets/form-steps");
const pause = ms => new Promise(r => setTimeout(r, ms));
let expectAction = false, pendingAction = null;
async function port(){const s=createServer();await new Promise(r=>s.listen(0,'127.0.0.1',r));const n=s.address().port;await new Promise(r=>s.close(r));return n;}
let server,chrome,socket,profile,cdp;const pending=new Map();const errors=[];const reports=[];let blockedPosts=0,blockedExternal=0,seq=0;
async function until(fn,label){for(let n=0;n<100;n++){if(await fn())return;await pause(80);}throw Error('Timeout '+label);}
try{
 profile=await mkdtemp(join(tmpdir(),'testimonios-steps-'));
 const appPort=await port(),debugPort=await port(),origin='http://127.0.0.1:'+appPort;
 server=spawn(process.execPath,['--import',new URL('./qa-public-fixture.mjs',import.meta.url).href,require.resolve('next/dist/bin/next'),'start','--hostname','127.0.0.1','--port',String(appPort)],{cwd:appDir,windowsHide:true,stdio:'ignore'});
 chrome=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--remote-debugging-port='+debugPort,'--user-data-dir='+profile,'--disable-background-networking','--disable-sync','--no-first-run','--no-default-browser-check','about:blank'],{windowsHide:true,stdio:'ignore'});
 await until(async()=>{try{return (await fetch(origin+'/enviar')).ok;}catch{return false;}},'local server');
 await until(async()=>{try{return (await fetch('http://127.0.0.1:'+debugPort+'/json/version')).ok;}catch{return false;}},'Chrome');
 const version=await (await fetch('http://127.0.0.1:'+debugPort+'/json/version')).json();
 console.log(JSON.stringify({browser:version.Browser,mode:'backward step navigation against current production build'}));
 const target=await (await fetch('http://127.0.0.1:'+debugPort+'/json/new?about:blank',{method:'PUT'})).json();
 socket=new WebSocket(target.webSocketDebuggerUrl);await new Promise((r,j)=>{socket.onopen=r;socket.onerror=j;});
 cdp=(method,params={})=>new Promise((r,j)=>{const id=++seq;const timer=setTimeout(()=>{pending.delete(id);j(Error('CDP timeout '+method));},15000);pending.set(id,{r,j,timer});socket.send(JSON.stringify({id,method,params}));});
 socket.onmessage=({data})=>{
  const e=JSON.parse(data);
  if(e.id){const p=pending.get(e.id);if(!p)return;pending.delete(e.id);clearTimeout(p.timer);if(e.error)p.j(Error(e.error.message));else p.r(e.result);}
  else if(e.method==='Runtime.exceptionThrown')errors.push('browser exception');
  else if(e.method==='Fetch.requestPaused'){
   const {requestId,request}=e.params;const u=new URL(request.url);
   if(request.method!=='GET'&&request.method!=='HEAD'){blockedPosts++;if(expectAction&&request.method==='POST'){pendingAction=requestId;}else void cdp('Fetch.failRequest',{requestId,errorReason:'BlockedByClient'});}
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
 async function back(){const s=await step();await button('back');await until(async()=>await step()===s-1,'back step');}
 async function type(name,text){await click('[name="'+name+'"]');await cdp('Input.insertText',{text});}
 async function replace(name,text){
  await click('[name="'+name+'"]');await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'a',code:'KeyA',modifiers:2,windowsVirtualKeyCode:65});await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:'a',code:'KeyA',modifiers:2,windowsVirtualKeyCode:65});
  assert.ok(await ev(()=>document.activeElement.selectionStart===0&&document.activeElement.selectionEnd===document.activeElement.value.length),'replacement selects the entire value');
  if(text)await cdp('Input.insertText',{text});else {await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'Backspace',code:'Backspace',windowsVirtualKeyCode:8});await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:'Backspace',code:'Backspace',windowsVirtualKeyCode:8});}
  assert.equal(await ev(()=>document.activeElement.value),text,'replacement applied');
 }
 function roleNames(category){return category==='simulation'?['primary_role']:category==='first_job'?['company','role_achieved']:['previous_profession','new_role'];}
 async function setup(locale,width,category){
  await cdp('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});
  await cdp('Page.navigate',{url:origin+'/enviar?lang='+locale});
  await until(()=>ev(()=>!!document.querySelector('form input[name="full_name"]')&&document.readyState==='complete'),'form');
  await pause(150);
  await enterForm(ev,until);
  await progressProbe(1,locale);await click('form ol li:last-child > span');assert.equal(await step(),1,'future step cannot advance from step 1');
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
 const snap=()=>ev(()=>({fields:Object.fromEntries([...document.querySelectorAll('fieldset:nth-of-type(3) input,fieldset:nth-of-type(3) textarea')].map(e=>[e.name,e.value]))}));

 const labels={
  es:['Experiencia','Datos','Historia','Enlaces','Revisi\u00f3n y env\u00edo'],
  en:['Experience','Details','Story','Links','Review and submit'],
  pt:['Experi\u00eancia','Dados','Hist\u00f3ria','Links','Revis\u00e3o e envio'],
 };
 const backName=(locale,n)=>({es:'Volver al paso ',en:'Back to step ',pt:'Voltar \u00e0 etapa '})[locale]+n+': '+labels[locale][n-1];
 const hints={es:'Toca un paso anterior para volver',en:'Tap an earlier step to go back',pt:'Toque em uma etapa anterior para voltar'};
 async function progressProbe(current,locale){
  const actual=await ev(()=>({current:[...document.querySelectorAll('form ol li')].map(e=>e.getAttribute('aria-current')),buttons:[...document.querySelectorAll('form ol button')].map(e=>({name:e.getAttribute('aria-label'),type:e.type,disabled:e.disabled})),staticSteps:[...document.querySelectorAll('form ol li')].map(e=>!e.querySelector('button,a,[tabindex]')),hidden:document.querySelector('form ol').closest('[aria-hidden="true"]')!==null}));
  assert.equal(actual.hidden,false);assert.equal(actual.current.length,5);
  assert.deepEqual(actual.current,Array.from({length:5},(_,i)=>i+1===current?'step':null));
  assert.deepEqual(actual.buttons,Array.from({length:current-1},(_,i)=>({name:backName(locale,i+1),type:'button',disabled:false})));
  assert.ok(actual.staticSteps.slice(current-1).every(Boolean),'current/future steps have no navigation controls');
  const hint=await ev(()=>{const p=document.querySelector('form ol + p');return p?{text:p.textContent,visible:getComputedStyle(p).display!=='none'}:null;});
  assert.deepEqual(hint,current>1?{text:hints[locale],visible:await ev(()=>innerWidth<768)}:null,'localized mobile hint starts at step 2');
 }
 async function focusProbe(){
  assert.ok(await ev(()=>{const h=document.querySelector('form h2'),r=h.getBoundingClientRect(),header=document.querySelector('[data-form-header]').getBoundingClientRect();return document.activeElement===h&&r.top>=header.bottom+14&&r.top<innerHeight;}),'step heading receives focus below sticky header');
 }
 async function earlier(n){await click('form ol li:nth-child('+n+') button');await until(async()=>await step()===n,'earlier step');await focusProbe();}
 const draft=()=>ev(()=>({fields:Object.fromEntries([...document.querySelectorAll('form input:not([type="file"]):not([type="radio"]),form textarea,form select')].map(e=>[e.name,e.type==='checkbox'?e.checked:e.value])),images:[...document.querySelectorAll('form [data-field] > div img')].map(e=>e.src),sameForm:document.querySelector('form')===window.__qaStepsForm}));
 const invalid=()=>ev(()=>[...document.querySelectorAll('form [aria-invalid="true"]')].map(e=>e.name||e.tagName));
 async function key(key,code=key){const params={key,code,windowsVirtualKeyCode:({Tab:9,Enter:13,' ':32})[key]};await cdp('Input.dispatchKeyEvent',{type:'keyDown',...params,...(key==='Enter'?{text:'\r'}:key===' '?{text:' '}:{})});await cdp('Input.dispatchKeyEvent',{type:'keyUp',...params});}
 async function capture(){
  await ev(async()=>{const c=document.createElement('canvas');c.width=960;c.height=720;c.getContext('2d').fillRect(0,0,960,720);const blob=await new Promise(r=>c.toBlob(r,'image/png')),d=new DataTransfer();d.items.add(new File([blob],'synthetic-capture.png',{type:'image/png'}));const e=document.querySelector('[name="capture"]');e.files=d.files;e.dispatchEvent(new Event('change',{bubbles:true}));});
  await until(()=>ev(()=>!!document.querySelector('dialog[open] button:last-child:not(:disabled)')),'capture ready');await click('dialog[open] button:last-child');await until(()=>ev(()=>!document.querySelector('dialog[open]')),'capture closed');
 }
 async function responsiveProbe(locale){
  const checks=[];
  for(const width of [320,375,768,1024,1440])for(const scale of [1,2]){
   await cdp('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});
   await ev(scale=>{document.documentElement.style.fontSize=16*scale+'px';},scale);await pause(60);
   const fit=await ev(()=>{const w=document.documentElement.clientWidth,circles=[...document.querySelectorAll('form ol .rounded-full')].map(e=>e.getBoundingClientRect()),hint=document.querySelector('form ol + p');let hintFits=true;if(hint&&getComputedStyle(hint).display!=='none'){const r=hint.getBoundingClientRect(),range=document.createRange();range.selectNodeContents(hint);hintFits=r.top>document.querySelector('form ol').getBoundingClientRect().bottom&&[...range.getClientRects()].every(r=>r.left>=0&&r.right<=w+1);}return hintFits&&document.documentElement.scrollWidth<=w&&[...document.querySelectorAll('form ol li')].every(e=>{const r=e.getBoundingClientRect();return r.left>=0&&r.right<=w+1;})&&circles.length===5&&circles.every((r,i)=>r.left>=0&&r.right<=w+1&&Math.abs(r.width-r.height)<1&&(!circles[i+1]||r.right<=circles[i+1].left));});
   assert.ok(fit,'progress fits '+locale+' '+width+' '+scale);
   checks.push({width,fontPercent:scale*100});
   if((locale==='es'&&width===375&&scale===1)||(locale==='en'&&width===1440&&scale===1)||(locale==='pt'&&width===320&&scale===2)){
    await ev(scale=>{if(scale===2)document.querySelector('form h2').scrollIntoView({block:'start'});else window.scrollTo({top:0,behavior:'instant'});},scale);
    const shot=await cdp('Page.captureScreenshot',{format:'png'});
    await writeFile(join(output,locale+'-'+width+'-'+scale+'x.png'),Buffer.from(shot.data,'base64'));
   }
  }
  await ev(()=>document.documentElement.style.removeProperty('font-size'));
  return checks;
 }
 await mkdir(output,{recursive:true});
 for(const width of [1440,375])for(const locale of ['es','en','pt'])for(const category of ['simulation','first_job','career_change']){
  await setup(locale,width,category);
  const names=roleNames(category);
  for(const name of names)await type(name,'Original '+name);
  await type('story','Relato original sin traducir.\nAprendi a trabajar en equipo y resolver desafios.');
  const originalRoles=(await snap()).fields;
  await next();await progressProbe(4,locale);
  await type('video_url','https://youtu.be/abcdefghijk');
  await type('instagram','@persona_qa');await type('linkedin','persona-qa');
  await capture();await next();
  await progressProbe(5,locale);
  const before=await draft();assert.equal(before.images.length,2);
  const ax=await cdp('Accessibility.getFullAXTree');
  for(let n=1;n<5;n++)assert.ok(ax.nodes.some(e=>!e.ignored&&e.role?.value==='button'&&e.name?.value===backName(locale,n)),'localized AX button '+n);
  await earlier(2);assert.deepEqual(await draft(),before,'direct back preserves all fields/images');
  await progressProbe(2,locale);await click('form ol li:last-child > span');assert.equal(await step(),2,'previously visited future remains non-navigable');
  await next();await back();assert.deepEqual(await draft(),before,'existing Back also preserves the draft');await next();await progressProbe(3,locale);
  await replace('story','x');const edited=await draft(),errorsBefore=await invalid();
  // Real Tab reaches the first progress button from the focused heading.
  await ev(()=>document.querySelector('form h2').focus({preventScroll:true}));
  await key('Tab');assert.ok(await ev(()=>document.activeElement===document.querySelector('form ol button')&&getComputedStyle(document.activeElement).outlineStyle!=='none'),'Tab reaches visible focus');
  if(width===1440)await key('Enter');else await key(' ','Space');
  await until(async()=>await step()===1,'keyboard direct back');await focusProbe();
  assert.deepEqual(await draft(),edited,'keyboard back preserves invalid/unvalidated values');
  assert.deepEqual(await invalid(),errorsBefore,'going back never validates');
  await progressProbe(1,locale);await next();await next();
  await button('next');assert.equal(await step(),3,'Next still rejects short story');
  assert.equal(await ev(()=>document.activeElement.name),'story');
  await replace('story','Relato corregido suficientemente largo para pasar las validaciones.');
  await next();await next();
  const other=category==='first_job'?'career_change':'first_job';
  await earlier(1);await click('[name="type"][value="'+other+'"]');
  await click('form ol li:nth-child(3) > span');assert.equal(await step(),1,'changing category never unlocks future steps');
  await next();await next();
  await button('next');assert.equal(await step(),3,'new active professional fields must validate');
  for(const name of roleNames(other))await type(name,'Otra categoria '+name);
  await next();await next();await earlier(1);await click('[name="type"][value="'+category+'"]');await next();await next();
  for(const name of names)assert.equal((await snap()).fields[name],originalRoles[name],'original category retained');
  await next();await next();
  if(width===1440&&category==='first_job'){
   expectAction=true;await click('button[type="submit"]');
   await until(()=>pendingAction!==null,'intercepted pending action');
   assert.ok(await ev(()=>[...document.querySelectorAll('form ol button,form > div:last-child button')].every(e=>e.disabled)),'all navigation and submit disabled pending');
   await click('form ol li:nth-child(2) button');assert.equal(await step(),5);
   await ev(()=>{document.querySelector('form ol button').focus();});
   assert.equal(await step(),5,'pending navigation remains blocked');
   assert.ok(await ev(()=>document.activeElement!==document.querySelector('form ol button')),'disabled steps cannot receive focus');
   await cdp('Fetch.fulfillRequest',{requestId:pendingAction,responseCode:200,responseHeaders:[{name:'content-type',value:'text/x-component'}],body:Buffer.from('0:{"a":{"status":"error","issue":{"code":"submit.saveFailed"}},"f":""}\n').toString('base64')});
   pendingAction=null;expectAction=false;
   await until(()=>ev(()=>!document.querySelector('button[type="submit"]').disabled),'mock action completed');
   await progressProbe(5,locale);
  }
  const responsive=width===1440&&category==='career_change'?await responsiveProbe(locale):null;
  reports.push({width,locale,category,result:'PASS',directBack:true,keyboard:width===1440?'Enter':'Space',retainedFieldsAndImages:true,noBackwardValidation:true,forwardValidation:true,categoryRoundtrip:true,pending:width===1440&&category==='first_job',responsive});
  console.log(JSON.stringify({progress:reports.length,width,locale,category}));
 }
 assert.equal(blockedPosts,3);assert.equal(blockedExternal,0);assert.equal(errors.length,0);
 const report={result:'PASS',reports,blockedPosts,realSubmissions:0,blockedExternal,browserExceptionCount:errors.length,manual:'Real screen reader, Safari/Firefox, touch keyboard and browser zoom remain manual; font scaling and mobile widths are simulated.'};
 await writeFile(join(output,'qa-results.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
} catch(e){console.log(JSON.stringify({result:'FAILED',error:e.message,reports,blockedPosts,blockedExternal,browserExceptionCount:errors.length}));process.exitCode=1;}
finally{
 if(cdp&&socket?.readyState===WebSocket.OPEN){try{await cdp('Browser.close');}catch{}}
 socket?.close();for(const p of pending.values()){clearTimeout(p.timer);p.r({});}pending.clear();
 if(chrome&&!chrome.killed)chrome.kill();if(server&&!server.killed)server.kill();
 if(profile){if(dirname(resolve(profile))!==resolve(tmpdir())||!basename(profile).startsWith('testimonios-steps-'))throw Error('Unexpected temp path');await rm(profile,{recursive:true,force:true,maxRetries:15,retryDelay:200});}
 console.log(JSON.stringify({cleanup:'own server/browser closed; temporary profile removed'}));
}
