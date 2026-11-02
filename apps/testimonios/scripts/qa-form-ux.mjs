import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Focused native-selector/scroll and modal QA. --diagnose records the old build.
// Reuses the Stage 4 public fixture; every browser POST is blocked before Next.
const phase = process.argv.includes("--diagnose") ? "before" : "after";
const appDir = fileURLToPath(new URL("../", import.meta.url));
const require = createRequire(import.meta.url);
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
const profile = await mkdtemp(join(tmpdir(), "testimonios-acceptance-"));
async function port() {
  const server = createServer();
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const result = server.address().port;
  await new Promise(resolve => server.close(resolve));
  return result;
}
async function until(check, label) {
  for (let i = 0; i < 100; i++) { if (await check()) return; await pause(100); }
  throw new Error(`Timed out: ${label}`);
}
const appPort = await port();
const debugPort = await port();
const origin = `http://127.0.0.1:${appPort}`;
const server = spawn(process.execPath, ["--import", new URL("./qa-public-fixture.mjs", import.meta.url).href, require.resolve("next/dist/bin/next"), "start", "--hostname", "127.0.0.1", "--port", String(appPort)], { cwd: appDir, windowsHide: true, stdio: "ignore" });
const chrome = spawn(process.argv.slice(2).find(arg => !arg.startsWith("--")) ?? "C:/Program Files/Google/Chrome/Application/chrome.exe", ["--headless=new", `--remote-debugging-port=${debugPort}`, `--user-data-dir=${profile}`, "--disable-background-networking", "--disable-sync", "--no-first-run", "--no-default-browser-check", "about:blank"], { windowsHide: true, stdio: "ignore" });
let socket;
let cdp;
let blockedPosts = 0;
let expectSuccess = false;
const errors = [];
try {
  await until(async () => { try { return (await fetch(origin + "/enviar")).ok; } catch { return false; } }, "local production server");
  await until(async () => { try { return (await fetch(`http://127.0.0.1:${debugPort}/json/version`)).ok; } catch { return false; } }, "Chrome");
  const target = await (await fetch(`http://127.0.0.1:${debugPort}/json/new?about:blank`, { method: "PUT" })).json();
  socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  let sequence = 0;
  const pending = new Map();
  cdp = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++sequence;
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timeout: ${method}`)); }, 15000);
    pending.set(id, { resolve, reject, timer, method });
    socket.send(JSON.stringify({ id, method, params }));
  });
  socket.onmessage = ({ data }) => {
    const event = JSON.parse(data);
    if (event.id) {
      const item = pending.get(event.id);
      if (!item) return;
      pending.delete(event.id); clearTimeout(item.timer);
      if (event.error) item.reject(new Error(`CDP failure: ${item.method} ${event.error.code} ${event.error.message}`)); else item.resolve(event.result);
    } else if (event.method === "Fetch.requestPaused") {
      if (event.params.request.method === "POST") {
        blockedPosts++;
        if (expectSuccess) {
          expectSuccess = false;
          void cdp("Fetch.fulfillRequest", { requestId: event.params.requestId, responseCode: 200, responseHeaders: [{name:"content-type",value:"text/x-component"}], body: Buffer.from('0:{"a":{"status":"success"},"f":""}\n').toString("base64") });
        } else void cdp("Fetch.failRequest", { requestId: event.params.requestId, errorReason: "BlockedByClient" });
      } else void cdp("Fetch.continueRequest", { requestId: event.params.requestId });
    } else if (event.method === "Runtime.exceptionThrown" || (event.method === "Runtime.consoleAPICalled" && event.params.type === "error")) errors.push(event.method);
  };
  socket.onclose = () => {
    for (const item of pending.values()) { clearTimeout(item.timer); item.reject(new Error("Chrome closed")); }
    pending.clear();
  };
  async function evaluate(fn, ...args) {
    const result = await cdp("Runtime.evaluate", { expression: `(${fn.toString()})(...${JSON.stringify(args)})`, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description ?? "Browser evaluation failed");
    return result.result.value;
  }
  await cdp("Page.enable"); await cdp("Runtime.enable");
  await cdp("Fetch.enable", { patterns: [{ urlPattern: "*", requestStage: "Request" }] });
  const output = join(appDir, 'docs/ui/assets/form-ux');
  await mkdir(output,{recursive:true});
  await cdp('Page.addScriptToEvaluateOnNewDocument',{source:`
    window.__qaEvents=[];
    window.qaMark=phase=>{
      const select=document.querySelector('[data-form-language-select]');
      const r=select?.getBoundingClientRect();
      const record={phase,y:scrollY,locale:document.querySelector('main')?.lang,active:document.activeElement?.tagName,selectTop:r?.top,selectBottom:r?.bottom,open:select?.matches(':open')??false};
      window.__qaEvents.push(record);return record;
    };
    for(const type of ['pointerdown','mousedown','focusin','mouseup','click','input','change'])document.addEventListener(type,event=>{
      if(event.target.matches?.('[data-form-language-select]')){const record=window.qaMark(type);record.trusted=event.isTrusted;}
    },true);
    addEventListener('scroll',()=>window.qaMark('scroll'),{passive:true});
    const original=history.replaceState;
    history.replaceState=function(...args){window.qaMark('replaceState:before');const value=original.apply(this,args);window.qaMark('replaceState:after');requestAnimationFrame(()=>window.qaMark('replaceState:frame'));return value;};
  `});
  const checks=[];
  const modalChecks=[];
  async function key(key,code,windowsVirtualKeyCode,modifiers=0){
    await cdp('Input.dispatchKeyEvent',{type:'keyDown',key,code,windowsVirtualKeyCode,modifiers});
    await cdp('Input.dispatchKeyEvent',{type:'keyUp',key,code,windowsVirtualKeyCode,modifiers});
    await pause(70);
  }
  async function clickPoint(x,y){
    await cdp('Input.dispatchMouseEvent',{type:'mouseMoved',x,y});
    await cdp('Input.dispatchMouseEvent',{type:'mousePressed',x,y,button:'left',clickCount:1});
    await pause(70);
    await cdp('Input.dispatchMouseEvent',{type:'mouseReleased',x,y,button:'left',clickCount:1});
    await pause(70);
  }
  async function input(selector,value){
    await evaluate((selector,value)=>{const el=document.querySelector(selector);const proto=el instanceof HTMLSelectElement?HTMLSelectElement.prototype:el instanceof HTMLTextAreaElement?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(proto,'value').set.call(el,value);el.dispatchEvent(new Event(el instanceof HTMLSelectElement?'change':'input',{bubbles:true}));},selector,value);
    await pause(40);
  }
  async function button(text){
    await evaluate(text=>{const el=[...document.querySelectorAll('main button')].find(el=>el.getClientRects().length&&el.textContent.trim()===text);if(!el||el.disabled)throw new Error('Button unavailable');el.click();},text);
    await pause(70);
  }
  const locale=()=>evaluate(()=>document.querySelector('main').lang);
  const next=async()=>button(await locale()==='es'?'Siguiente':'Próximo');
  async function avatar(){
    await evaluate(async()=>{const canvas=document.createElement('canvas');canvas.width=canvas.height=720;const ctx=canvas.getContext('2d');ctx.fillStyle='#19304b';ctx.fillRect(0,0,720,720);const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));const transfer=new DataTransfer();transfer.items.add(new File([blob],'qa-avatar.png',{type:'image/png'}));const el=document.querySelector('input[name="avatar"]');el.files=transfer.files;el.dispatchEvent(new Event('change',{bubbles:true}));});
    await until(()=>evaluate(()=>!!document.querySelector('dialog[open]')),'crop');
    await pause(100);
  }
  async function modalProbe(context){
    const start=await evaluate(()=>({dialogLocale:document.querySelector('dialog[open]').lang,locale:document.querySelector('main').lang,selectors:document.querySelectorAll('[data-form-language-select]').length,inside:!!document.querySelector('dialog [data-form-language-select]'),inHeader:!!document.querySelector('header [data-form-language-select]'),initialFocus:document.activeElement===document.querySelector('dialog h2')}));
    assert.equal(start.dialogLocale,start.locale);assert.equal(start.selectors,1);assert.equal(start.inside,false);assert.ok(start.inHeader&&start.initialFocus);
    await evaluate(()=>document.querySelector('header select').focus({preventScroll:true}));
    assert.equal(await evaluate(()=>!!document.activeElement.closest('dialog')),true,'native modality blocks header focus');
    for(const modifiers of [8,0,0,0,0,8,8]){
      await key('Tab','Tab',9,modifiers);
      assert.equal(await evaluate(()=>!!document.activeElement.closest('dialog')),true,'modal Tab cannot reach header');
    }
    await input('dialog input[type="range"]','1.8');
    await evaluate(()=>document.querySelector('dialog [tabindex="0"]').focus());
    await key('ArrowRight','ArrowRight',39);
    const crop=await evaluate(()=>({src:document.querySelector('dialog img').src,transform:document.querySelector('dialog img').style.transform,zoom:document.querySelector('dialog input[type="range"]').value}));
    await key('Tab','Tab',9);
    assert.deepEqual(await evaluate(()=>({src:document.querySelector('dialog img').src,transform:document.querySelector('dialog img').style.transform,zoom:document.querySelector('dialog input[type="range"]').value})),crop,'focus navigation preserves crop');
    if(context.width===375&&context.initialLocale==='pt-BR'){
      const shot=await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
      await writeFile(join(output,`crop-${start.dialogLocale}-375.png`),Buffer.from(shot.data,'base64'));
    }
    modalChecks.push({...context,...start,headerInert:true,tabContained:true,cropPreserved:true});
  }
  async function scrollProbe(context){
    await key('Escape','Escape',27);
    await evaluate(()=>{document.querySelector('[data-form-language-select]').blur();window.scrollTo({top:document.documentElement.scrollHeight-innerHeight,behavior:'instant'});});
    await pause(100);
    await evaluate(()=>{window.__qaEvents=[];window.qaMark('before pointer');});
    const point=await evaluate(()=>{const r=document.querySelector('[data-form-language-select]').getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2};});
    await clickPoint(point.x,point.y);
    await evaluate(()=>window.qaMark('native menu opened'));
    await key('Escape','Escape',27);
    await evaluate(()=>window.qaMark('native menu cancelled'));
    const pointer=await evaluate(()=>window.__qaEvents);
    await evaluate(()=>{document.querySelector('[data-form-language-select]').blur();window.scrollTo({top:document.documentElement.scrollHeight-innerHeight,behavior:'instant'});window.__qaEvents=[];window.qaMark('before focus');document.querySelector('[data-form-language-select]').focus();window.qaMark('after focus');});
    await pause(100);
    const focus=await evaluate(()=>window.__qaEvents);
    await evaluate(()=>{document.querySelector('[data-form-language-select]').blur();window.scrollTo({top:document.documentElement.scrollHeight-innerHeight,behavior:'instant'});window.__qaEvents=[];window.qaMark('before prevented focus');document.querySelector('[data-form-language-select]').focus({preventScroll:true});window.qaMark('after prevented focus');});
    await pause(100);
    const preventedFocus=await evaluate(()=>window.__qaEvents);
    const cssExperiments=[];
    if(phase==='before'&&context.step===5){
      for(const variant of ['root padding zero','negative select margin']){
        cssExperiments.push(await evaluate(variant=>{
          const select=document.querySelector('[data-form-language-select]');const root=document.documentElement;
          const oldRoot=root.style.scrollPaddingBlockStart,oldSelect=select.style.scrollMarginBlockStart;
          if(variant==='root padding zero')root.style.scrollPaddingBlockStart='0px';else select.style.scrollMarginBlockStart='calc(-1 * (var(--site-header-height, 0px) + 16px))';
          select.blur();window.scrollTo({top:document.documentElement.scrollHeight-innerHeight,behavior:'instant'});
          const before=scrollY;select.focus();const after=scrollY;
          root.style.scrollPaddingBlockStart=oldRoot;select.style.scrollMarginBlockStart=oldSelect;
          return{variant,before,after};
        },variant));
      }
      await evaluate(()=>{const select=document.querySelector('[data-form-language-select]');select.blur();window.scrollTo({top:document.documentElement.scrollHeight-innerHeight,behavior:'instant'});select.focus({preventScroll:true});});
    }
    await evaluate(()=>{document.querySelector('main a[href="/"]').focus({preventScroll:true});window.__qaEvents=[];window.qaMark('before ShiftTab');});
    await key('Tab','Tab',9,8);
    const tab=await evaluate(()=>{window.qaMark('after ShiftTab');return window.__qaEvents;});
    if(phase==='after'){
      assert.equal(await evaluate(()=>document.activeElement===document.querySelector('[data-form-language-select]')),true,'Tab reaches header selector');
      assert.ok(tab.every(event=>Math.abs(event.y-tab[0].y)<3),'keyboard focus does not scroll sticky selector');
    }
    // Native keyboard selection after focus, not a programmatic value assignment.
    await evaluate(()=>{window.__qaEvents=[];window.qaMark('before keyboard open');});
    await key(' ','Space',32);
    const open=await evaluate(()=>window.qaMark('keyboard menu opened'));
    const expected=await locale()==='es'?'pt-BR':'es';
    await key(expected==='pt-BR'?'ArrowDown':'ArrowUp',expected==='pt-BR'?'ArrowDown':'ArrowUp',expected==='pt-BR'?40:38);
    await key('Enter','Enter',13);
    await pause(200);
    const keyboard=await evaluate(()=>{window.qaMark('after keyboard locale render');return window.__qaEvents;});
    const changed=await locale()===expected;
    checks.push({...context,pointer,focus,preventedFocus,tab,keyboard,cssExperiments,keyboardNativeOpen:open.open,keyboardChanged:changed});
    if(phase==='after'){
      assert.ok(changed,'native keyboard changes language');
      assert.ok(pointer.every(event=>Math.abs(event.y-pointer[0].y)<3),'pointer focus/open does not scroll');
      assert.ok(focus.every(event=>Math.abs(event.y-focus[0].y)<3),'ordinary native focus does not scroll');
      assert.ok(keyboard.every(event=>Math.abs(event.y-keyboard[0].y)<160),'native keyboard/locale has no large scroll jump');
      assert.ok(keyboard.some(event=>event.phase==='change'&&event.trusted),'trusted native select change');
      assert.ok(await evaluate(()=>document.querySelector('form')===window.__qaForm),'same form');
      assert.equal(await evaluate(()=>new URLSearchParams(location.search).get('lang')===document.querySelector('main').lang&&document.querySelector('header').lang===document.querySelector('main').lang),true,'URL and regions stay synchronized');
      assert.equal(await evaluate(()=>document.title.startsWith(document.querySelector('main').lang==='es'?'Comparte tu testimonio':'Compartilhe seu depoimento')),true,'localized metadata');
    }
  }
  for(const width of [1440,375])for(const initialLocale of ['es','pt-BR']){
    await cdp('Emulation.setDeviceMetricsOverride',{width,height:760,deviceScaleFactor:1,mobile:false});
    await cdp('Page.navigate',{url:origin+'/enviar?lang='+initialLocale});
    await until(()=>evaluate(locale=>!!document.querySelector('main form')&&document.querySelector('main').lang===locale&&document.readyState==='complete',initialLocale),'form');
    await evaluate(()=>document.fonts.ready.then(()=>true));await pause(100);
    await evaluate(()=>{window.__qaForm=document.querySelector('form');});
    if(phase==='after'){
      await evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
      const top=await evaluate(()=>{const r=document.querySelector('header select').getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2};});
      await clickPoint(top.x,top.y);await key('Escape','Escape',27);
      assert.equal(await evaluate(()=>scrollY),0,'selector at top stays at top');
      await next();assert.equal(await evaluate(()=>document.activeElement.name),'type','legitimate first-error focus');
    }
    await scrollProbe({width,initialLocale,step:1});
    await evaluate(()=>document.querySelector('input[value="simulation"]').click());await next();
    await input('input[name="full_name"]','Persona QA');await input('input[name="email"]','persona@example.com');await input('select[name="country"]','Argentina');
    await avatar();await until(()=>evaluate(()=>!document.querySelector('dialog button:last-child').disabled),'crop ready');
    if(phase==='after')await modalProbe({width,initialLocale});
    await evaluate(()=>document.querySelector('dialog button:last-child').click());await until(()=>evaluate(()=>!document.querySelector('dialog[open]')),'crop complete');
    assert.equal(await evaluate(()=>document.activeElement.name),'avatar','crop returns focus');
    if(phase==='after'&&width===375&&initialLocale==='pt-BR'){
      const preview=await evaluate(()=>document.querySelector('input[name="avatar"]').closest('[data-field]').querySelector('img').src);
      for(const action of ['Escape','Cancel']){
        await avatar();
        if(action==='Escape')await key('Escape','Escape',27);else await evaluate(()=>document.querySelector('dialog button').click());
        await until(()=>evaluate(()=>!document.querySelector('dialog[open]')),'replacement cancelled');
        assert.equal(await evaluate(()=>document.querySelector('input[name="avatar"]').closest('[data-field]').querySelector('img').src),preview,'cancel preserves previous image');
        assert.equal(await evaluate(()=>document.activeElement.name),'avatar');
      }
    }
    await next();await input('textarea[name="story"]','Historia sintética. Aprendí a colaborar con mi equipo y resolver problemas de desarrollo.');
    await scrollProbe({width,initialLocale,step:3});
    await next();await next();
    if(phase==='after')await evaluate(()=>document.querySelector('input[name="consent"]').click());
    await scrollProbe({width,initialLocale,step:5});
    assert.equal(await evaluate(()=>document.querySelector('input[name="full_name"]').value),'Persona QA');
    if(phase==='after')assert.equal(await evaluate(()=>document.querySelector('input[name="consent"]').checked&&!document.querySelectorAll('fieldset')[4].hidden&&!!document.querySelector('input[name="avatar"]').closest('[data-field]').querySelector('img')),true,'step, consent and image preserved');
  }
  assert.equal(blockedPosts,0);assert.deepEqual(errors,[]);
  const report={phase,checks,modalChecks,nativePopupVerification:'PENDIENTE: headless native popup not observable; verify pointer option selection and open/cancel manually',blockedPosts,realSubmissions:0,browserErrors:errors};
  await writeFile(join(output,phase+'-scroll.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({phase,checks:checks.map(check=>({width:check.width,locale:check.initialLocale,step:check.step,pointer:check.pointer.map(e=>[e.phase,e.y]),cssExperiments:check.cssExperiments,keyboardChanged:check.keyboardChanged,keyboardNativeOpen:check.keyboardNativeOpen}))}));
} finally {
  if (socket?.readyState === WebSocket.OPEN) { try { await cdp('Browser.close'); } catch { /* Browser can exit before acknowledgement. */ } socket.close(); }
  server.kill(); chrome.kill(); await pause(700);
  if (dirname(resolve(profile)) !== resolve(tmpdir()) || !basename(profile).startsWith('testimonios-acceptance-')) throw new Error('Unexpected profile; cleanup refused');
  await rm(profile,{recursive:true,force:true,maxRetries:5,retryDelay:250});
}

