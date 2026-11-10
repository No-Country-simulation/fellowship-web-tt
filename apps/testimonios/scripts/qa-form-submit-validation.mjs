import { enterForm } from "./qa-enter-form.mjs";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve, dirname, basename } from "node:path";
import { createServer } from "node:net";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

// Run after build. Every POST is intercepted before Next and receives a mock result.
// Hidden-field edits deliberately exercise the final guard without bypassing Next validation.
// No real action, uploads, persistence or notifications run.
const appDir = fileURLToPath(new URL("../", import.meta.url));
const require = createRequire(import.meta.url);
const summaryEdit = process.argv.includes('--summary-edit');
const integration = process.argv.includes('--hero-form');
const heroConsent = integration || process.argv.includes('--hero-consent');
const output = join(appDir, integration ? "docs/ui/assets/hero-form-integration/submit-regression" : heroConsent ? "docs/ui/assets/hero-consent/submit-regression" : summaryEdit ? "docs/ui/assets/form-summary-inline/submit-regression" : "docs/ui/assets/form-submit-validation");
const pause = ms => new Promise(r => setTimeout(r, ms));
let expectAction = false, pendingAction = null;
async function port(){const s=createServer();await new Promise(r=>s.listen(0,'127.0.0.1',r));const n=s.address().port;await new Promise(r=>s.close(r));return n;}
let server,chrome,socket,profile,cdp;const pending=new Map();const errors=[];const reports=[];let blockedPosts=0,blockedExternal=0,seq=0;
async function until(fn,label){for(let n=0;n<100;n++){if(await fn())return;await pause(80);}throw Error('Timeout '+label);}
try{
 profile=await mkdtemp(join(tmpdir(),'testimonios-submit-'));
 const appPort=await port(),debugPort=await port(),origin='http://127.0.0.1:'+appPort;
 server=spawn(process.execPath,['--import',new URL('./qa-public-fixture.mjs',import.meta.url).href,require.resolve('next/dist/bin/next'),'start','--hostname','127.0.0.1','--port',String(appPort)],{cwd:appDir,windowsHide:true,stdio:'ignore'});
 chrome=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--remote-debugging-port='+debugPort,'--user-data-dir='+profile,'--disable-background-networking','--disable-sync','--no-first-run','--no-default-browser-check','about:blank'],{windowsHide:true,stdio:'ignore'});
 await until(async()=>{try{return (await fetch(origin+'/enviar')).ok;}catch{return false;}},'local server');
 await until(async()=>{try{return (await fetch('http://127.0.0.1:'+debugPort+'/json/version')).ok;}catch{return false;}},'Chrome');
 const version=await (await fetch('http://127.0.0.1:'+debugPort+'/json/version')).json();
 console.log(JSON.stringify({browser:version.Browser,mode:'integral pre-submit validation against current production build'}));
 const target=await (await fetch('http://127.0.0.1:'+debugPort+'/json/new?about:blank',{method:'PUT'})).json();
 socket=new WebSocket(target.webSocketDebuggerUrl);await new Promise((r,j)=>{socket.onopen=r;socket.onerror=j;});
 cdp=(method,params={})=>new Promise((r,j)=>{const id=++seq;const timer=setTimeout(()=>{pending.delete(id);j(Error('CDP timeout '+method));},15000);pending.set(id,{r,j,timer});socket.send(JSON.stringify({id,method,params}));});
 // Navigation may cancel a paused image before CDP receives its continuation.
 function intercept(method,params){void cdp(method,params).catch(error=>{if(!/Invalid InterceptionId/i.test(error.message))errors.push('request interception failed');});}
 socket.onmessage=({data})=>{
  const e=JSON.parse(data);
  if(e.id){const p=pending.get(e.id);if(!p)return;pending.delete(e.id);clearTimeout(p.timer);if(e.error)p.j(Error(e.error.message));else p.r(e.result);}
  else if(e.method==='Runtime.exceptionThrown')errors.push('browser exception');
  else if(e.method==='Fetch.requestPaused'){
   const {requestId,request}=e.params;const u=new URL(request.url);
   if(request.method!=='GET'&&request.method!=='HEAD'){blockedPosts++;if(expectAction&&request.method==='POST'){pendingAction=requestId;}else intercept('Fetch.failRequest',{requestId,errorReason:'BlockedByClient'});}
   else if(u.origin!==origin){blockedExternal++;intercept('Fetch.failRequest',{requestId,errorReason:'BlockedByClient'});}
   else intercept('Fetch.continueRequest',{requestId});
  }
 };
 async function ev(fn,...args){const v=await cdp('Runtime.evaluate',{expression:'('+fn.toString()+')(...'+JSON.stringify(args)+')',awaitPromise:true,returnByValue:true});if(v.exceptionDetails)throw Error(v.exceptionDetails.text);return v.result?.value;}
 await cdp('Page.enable');await cdp('Runtime.enable');await cdp('Fetch.enable',{patterns:[{urlPattern:'*',requestStage:'Request'}]});
 async function click(selector){
  const p=await ev(sel=>{const e=document.querySelector(sel);if(!e)throw Error('missing '+sel);e.scrollIntoView({block:'center'});const r=[...e.getClientRects()].find(r=>r.width>0&&r.height>0)??e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};},selector);
  await cdp('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...p});await cdp('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...p});
 }
 async function button(kind){const sel=await ev(kind=>{const texts={next:['Siguiente','Next','Pr\u00f3ximo'],back:['Atr\u00e1s','Back','Voltar']};const e=[...document.querySelectorAll('form button')].find(e=>texts[kind].includes(e.textContent.trim()));if(!e)throw Error('missing button '+kind);e.setAttribute('data-investigation',kind);return '[data-investigation="'+kind+'"]';},kind);await click(sel);}
 const step=()=>ev(()=>[...document.querySelectorAll('form > fieldset')].findIndex(e=>!e.hidden)+1);
 async function next(){const s=await step();await button('next');await until(async()=>await step()===s+1,'next step');}
 async function back(){const s=await step();await button('back');await until(async()=>await step()===s-1,'back step');}
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
  await pause(150);
  await enterForm(ev,until);
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
 const snap=()=>ev(()=>({fields:Object.fromEntries([...document.querySelectorAll('fieldset:nth-of-type(3) input,fieldset:nth-of-type(3) textarea')].map(e=>[e.name,e.value]))}));


 const emailMessages={es:'Ingresa un correo electr\u00f3nico v\u00e1lido.',en:'Enter a valid email address.',pt:'Informe um e-mail v\u00e1lido.'};
 const story='Relato sintetico suficientemente largo para validar el formulario sin cambiar sus reglas.';
 const profileIssue=field=>field==='primary_role'?{code:'text.maxLength',params:{max:120}}:{code:field+'.required'};
 const responseWith=fieldErrors=>({status:'error',issue:{code:'validation.summary'},fieldErrors});
 const recordPayloads=()=>{
  window.__qaPayloads=[];const records=new WeakMap(),original=FormData.prototype.set;
  FormData.prototype.set=function(name,value,...rest){
   if((name==='consent'||name==='type')&&!records.has(this)){const record={};records.set(this,record);window.__qaPayloads.push(record);}
   const record=records.get(this);if(record)record[name]=value instanceof File?{name:value.name,type:value.type,size:value.size}:value;
   return original.call(this,name,value,...rest);
  };
 };
 await cdp('Page.addScriptToEvaluateOnNewDocument',{source:'('+recordPayloads.toString()+')()'});
 const draft=()=>ev(()=>({fields:Object.fromEntries([...document.querySelectorAll('form input:not([type="file"]):not([type="radio"]),form textarea,form select')].map(e=>[e.name,e.type==='checkbox'?e.checked:e.value])),images:[...document.querySelectorAll('form [data-field] > div img')].map(e=>e.src),sameForm:document.querySelector('form')===window.__qaStepsForm}));
 async function focusedError(name){
  await until(()=>ev(name=>document.activeElement?.name===name,name),'focused invalid '+name);
  assert.ok(await ev(name=>{
   const e=document.querySelector('[name="'+name+'"]'),ids=(e.getAttribute('aria-describedby')||'').split(' ');
   const r=(e.closest('[data-field],label')||e).getBoundingClientRect(),h=document.querySelector('[data-form-header]').getBoundingClientRect();
   return e.getAttribute('aria-invalid')==='true'&&ids.some(id=>id.endsWith('-error')&&document.getElementById(id)?.textContent.trim())&&r.top>=h.bottom+14&&r.top<innerHeight;
  },name),'invalid field has message and is revealed below sticky header');
 }
 // Controls stay mounted while hidden. Trigger their real onChange via native setters;
 // no React hooks, navigation state or validators are replaced.
 async function mutateFields(updates){
  await ev(updates=>{for(const [name,value]of Object.entries(updates)){const e=document.querySelector('[name="'+name+'"]'),proto=e instanceof HTMLTextAreaElement?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(proto,'value').set.call(e,value);e.dispatchEvent(new Event('input',{bubbles:true}));}},updates);
 }
 async function localBlock(expectedStep,field){
  const posts=blockedPosts,payloads=await ev(()=>window.__qaPayloads.length),before=await draft();
  await click('button[type="submit"]');await until(async()=>await step()===expectedStep,'local correction step');await focusedError(field);
  assert.equal(blockedPosts,posts,'invalid submit never reaches the action');
  assert.equal(await ev(()=>window.__qaPayloads.length),payloads,'invalid submit never builds a payload');
  assert.deepEqual(await draft(),before,'validation changes no fields, files or form instance');
 }
 async function checkPayload(category){
  const payload=await ev(()=>window.__qaPayloads.at(-1));
  const expected=['consent','type','full_name','country','email','story',...roleNames(category),'video_url','instagram','linkedin','avatar'];
  assert.deepEqual(Object.keys(payload).sort(),expected.sort(),'only active professional fields are sent');
  assert.equal(payload.type,category);assert.equal(payload.country,'Argentina');assert.equal(payload.consent,'on');assert.equal(payload.avatar.type,'image/jpeg');
  return {type:payload.type,keys:Object.keys(payload).sort()};
 }
 async function mockAction(response,category){
  expectAction=true;const posts=blockedPosts;await click('button[type="submit"]');
  await until(()=>pendingAction!==null,'intercepted action');
  assert.equal(blockedPosts,posts+1);
  assert.ok(await ev(()=>[...document.querySelectorAll('form ol button,form > div:last-child button')].every(e=>e.disabled)),'pending navigation stays disabled');
  await ev(()=>document.querySelector('form').requestSubmit());await pause(40);
  assert.equal(blockedPosts,posts+1,'pending submit cannot duplicate an action');
  const payload=await checkPayload(category);
  await cdp('Fetch.fulfillRequest',{requestId:pendingAction,responseCode:200,responseHeaders:[{name:'content-type',value:'text/x-component'}],body:Buffer.from('0:'+JSON.stringify({a:response,f:''})+'\n').toString('base64')});
  pendingAction=null;expectAction=false;
  await until(()=>ev(()=>!document.querySelector('form')||!document.querySelector('button[type="submit"]').disabled),'mock action result');
  return payload;
 }
 async function earlier(n){await click('form ol li:nth-child('+n+') button');await until(async()=>await step()===n,'backward step');}
 await mkdir(output,{recursive:true});
 for(const locale of ['es','en','pt'])for(const category of ['simulation','first_job','career_change']){
  const width=locale==='en'?1440:375;
  await setup(locale,width,category);
  for(const name of roleNames(category))await type(name,'Original '+name);
  await type('story',story);await next();await next();
  assert.equal(await ev(()=>document.querySelector('main').lang),locale==='pt'?'pt-BR':locale);
  assert.equal(await ev(()=>!!document.querySelector('[name="consent"]')),false);
  // Multiple invalid steps, with a valid type: filtering undefined must pick step 2, not 1.
  await mutateFields({full_name:'',email:'invalid',story:'x',video_url:'invalid'});
  await localBlock(2,'full_name');
  const emailText=await ev(()=>{const e=document.querySelector('[name="email"]');return document.getElementById(e.getAttribute('aria-describedby').split(' ').find(id=>id.endsWith('-error'))).textContent;});
  assert.equal(emailText,emailMessages[locale]);
  await replace('full_name','Persona Corregida');await replace('email','persona@example.com');await next();
  await button('next');assert.equal(await step(),3,'Next still validates current step');await focusedError('story');
  await replace('story',story);await next();await replace('video_url','');await next();
  // Individually exercise the earliest invalid step, including the current step 5.
  await mutateFields({story:'x'});await localBlock(3,'story');await replace('story',story);await next();await next();
  await mutateFields({video_url:'invalid'});await localBlock(4,'video_url');await replace('video_url','');await next();
  // Review contains authorization text, with no checkbox or prior-cookie requirement.

  const professional=roleNames(category)[0],rejection=profileIssue(professional);
  const firstPayload=await mockAction(responseWith({email:{code:'email.invalid'},[professional]:rejection}),category);
  // Server rejection of locally valid values must survive resubmission and Next.
  await localBlock(2,'email');await button('next');assert.equal(await step(),2);await focusedError('email');
  await replace('email','corregida@example.com');await next();
  await button('next');assert.equal(await step(),3);await focusedError(professional);
  await replace(professional,'Corregido '+professional);await next();await next();
  await mockAction(responseWith({email:{code:'email.invalid'}}),category);
  await localBlock(2,'email'); // New response must not inherit the previous correction override.
  await replace('email','nueva@example.com');await next();await next();await next();
  await back();await next(); // Existing sequential back remains available.
  const originals=(await snap()).fields,other=category==='first_job'?'career_change':'first_job';
  await earlier(1);await click('[name="type"][value="'+other+'"]');await next();await next();
  await button('next');assert.equal(await step(),3,'new category cannot inherit validation');
  for(const name of roleNames(other))await type(name,'Otra '+name);
  await next();await next();
  const switchedPayload=await mockAction(responseWith({[professional]:rejection}),other);
  assert.equal(await ev(()=>!!document.querySelector('form [role="alert"]')),false,'inactive rejection is filtered in the current category');
  await earlier(1);await click('[name="type"][value="'+category+'"]');await next();await next();
  for(const name of roleNames(category))assert.equal((await snap()).fields[name],originals[name],'inactive values survived');
  await button('next');assert.equal(await step(),3,'returning category retains its pending server rejection');await focusedError(professional);
  await replace(professional,'Revisado '+professional);await next();await next();
  await mockAction({status:'error',issue:{code:'consent.required'},fieldErrors:{},step:1},category);
  await until(()=>ev(()=>document.activeElement.id==='hero-consent-checkbox'&&!document.querySelector('#hero-consent-checkbox').checked),'server consent rejection returns to visible checkbox');
  assert.ok(await ev(()=>!document.querySelector('form').getClientRects().length&&!!document.querySelector('#hero-consent-error')),'consent rejection keeps data hidden and identifies the affirmation');
  await enterForm(ev,until);assert.equal(await step(),5,'renewed affirmation resumes the unchanged review');
  assert.equal(await ev(()=>!!document.querySelector('form [role="alert"]')),false,'renewing affirmation clears only its own error');
  const finalPayload=await mockAction({status:'success'},category);
  await until(()=>ev(()=>!!document.querySelector('main h1')&&!document.querySelector('form')),'mock success');
  assert.ok(await ev(()=>document.activeElement===document.querySelector('main h1')),'success focus retained');
  assert.ok(await ev((origin,locale)=>[...document.querySelectorAll('main a')].some(a=>a.href===origin+'/enviar?lang='+locale),origin,locale),'invitation starts at the hero in the current language');
  reports.push({locale,category,width,result:'PASS',localStepsBlocked:[2,3,4],noPayloadBeforeValidation:true,accessibleFocus:true,valuesRetained:true,serverErrorsRetained:true,newResponseIdentity:true,categoryRoundtrip:true,consentRejectionRecoverable:true,payloads:[firstPayload,switchedPayload,finalPayload]});
  console.log(JSON.stringify({progress:reports.length,locale,category,result:'PASS'}));
  await click('main a[href*="/enviar?lang="]');
  await until(()=>ev(()=>!!document.querySelector('#hero-consent-checkbox')&&document.readyState==='complete'),'invitation opens a fresh introduction');
  assert.ok(await ev(()=>!document.querySelector('#hero-consent-checkbox').checked&&document.querySelector('#hero-consent button').disabled&&!document.querySelector('form').getClientRects().length&&document.querySelector('[name="full_name"]').value===''),'invitation resets acceptance and the completed draft');
 }
 assert.equal(blockedPosts,45);assert.equal(blockedExternal,0);assert.equal(errors.length,0);
 const report={result:'PASS',reports,blockedPosts,realSubmissions:0,blockedExternal,browserExceptionCount:errors.length,scope:'Current production build, existing rules. Hidden-control changes deliberately test the final guard; normal forward navigation remains validated.',manual:heroConsent?'Integrated introduction, consent rejection and inline editing regression. Physical devices, native zoom and screen readers remain manual.':summaryEdit?'Stage 2 validation regression against Stage 4 global inline summary editing. Real screen reader and mobile hardware remain manual.':'Real screen reader and mobile hardware remain manual. No visual summary changes.'};
 await writeFile(join(output,'qa-results.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
} catch(e){console.log(JSON.stringify({result:'FAILED',error:e.message,reports,blockedPosts,blockedExternal,browserExceptionCount:errors.length}));process.exitCode=1;}
finally{
 if(cdp&&socket?.readyState===WebSocket.OPEN){try{await cdp('Browser.close');}catch{}}
 socket?.close();for(const p of pending.values()){clearTimeout(p.timer);p.r({});}pending.clear();
 if(chrome&&!chrome.killed)chrome.kill();if(server&&!server.killed)server.kill();
 if(profile){if(dirname(resolve(profile))!==resolve(tmpdir())||!basename(profile).startsWith('testimonios-submit-'))throw Error('Unexpected temp path');await rm(profile,{recursive:true,force:true,maxRetries:15,retryDelay:200});}
 console.log(JSON.stringify({cleanup:'own server/browser closed; temporary profile removed'}));
}
