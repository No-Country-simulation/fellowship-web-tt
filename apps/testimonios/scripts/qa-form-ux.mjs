import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Current compact-listbox/scroll and modal QA; historical native-select evidence is in docs.
// Reuses the Stage 4 public fixture; every browser POST is blocked before Next.
const phase = 'compact';
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
      const select=document.querySelector('[data-form-language-trigger]');
      const r=select?.getBoundingClientRect();
      const record={phase,y:scrollY,locale:document.querySelector('main')?.lang,active:document.activeElement?.tagName,selectTop:r?.top,selectBottom:r?.bottom,open:!!document.querySelector('[role=listbox]')};
      window.__qaEvents.push(record);return record;
    };
    for(const type of ['pointerdown','mousedown','focusin','mouseup','click','input','change'])document.addEventListener(type,event=>{
      if(event.target.matches?.('[data-form-language-trigger], [role=option]')){const record=window.qaMark(type);record.trusted=event.isTrusted;}
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
  const locale=()=>evaluate(()=>({ES:'es',EN:'en',PT:'pt'})[document.querySelector('[data-form-language-trigger]').textContent.trim()]);
  const next=async()=>button(({es:'Siguiente',en:'Next',pt:'Próximo'})[await locale()]);
  async function avatar(){
    await evaluate(async()=>{const canvas=document.createElement('canvas');canvas.width=canvas.height=720;const ctx=canvas.getContext('2d');ctx.fillStyle='#19304b';ctx.fillRect(0,0,720,720);const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));const transfer=new DataTransfer();transfer.items.add(new File([blob],'qa-avatar.png',{type:'image/png'}));const el=document.querySelector('input[name="avatar"]');el.files=transfer.files;el.dispatchEvent(new Event('change',{bubbles:true}));});
    await until(()=>evaluate(()=>!!document.querySelector('dialog[open]')),'crop');
    await pause(100);
  }
  async function modalProbe(context){
    const start=await evaluate(()=>({dialogLocale:document.querySelector('dialog[open]').lang,locale:document.querySelector('main').lang,selectors:document.querySelectorAll('[data-form-language-select]').length,inside:!!document.querySelector('dialog [data-form-language-select]'),inHeader:!!document.querySelector('header [data-form-language-select]'),initialFocus:document.activeElement===document.querySelector('dialog h2')}));
    assert.equal(start.dialogLocale,start.locale);assert.equal(start.selectors,1);assert.equal(start.inside,false);assert.ok(start.inHeader&&start.initialFocus);
    await evaluate(()=>document.querySelector('[data-form-language-trigger]').focus({preventScroll:true}));
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
    if(context.width===375&&context.initialLocale==='pt'){
      const shot=await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
      await writeFile(join(output,`crop-${start.dialogLocale}-375.png`),Buffer.from(shot.data,'base64'));
    }
    modalChecks.push({...context,...start,headerInert:true,tabContained:true,cropPreserved:true});
  }
  async function scrollProbe(context) {
    context.initialUrl=await evaluate(()=>location.href);
    await key('Escape','Escape',27);
    await evaluate(() => {
      document.querySelector('[data-form-language-trigger]').blur();
      window.scrollTo({top:document.documentElement.scrollHeight-innerHeight,behavior:'instant'});
      window.__qaEvents=[];
      window.qaMark('before pointer');
    });
    await pause(100);
    const before=await evaluate(()=>scrollY);
    const point=await evaluate(()=>{const r=document.querySelector('[data-form-language-trigger]').getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2};});
    await clickPoint(point.x,point.y);
    await until(()=>evaluate(()=>!!document.querySelector('[role=listbox]')),'pointer opens listbox');
    const pointerOpen=await evaluate(()=>({scroll:scrollY,count:document.querySelectorAll('[role=option]').length,expanded:document.querySelector('[data-form-language-trigger]').getAttribute('aria-expanded')}));
    assert.equal(pointerOpen.count,3,'three EN/ES/PT options');
    assert.equal(pointerOpen.expanded,'true','trigger expanded');
    assert.ok(Math.abs(pointerOpen.scroll-before)<4,'pointer open keeps scroll');
    await key('Escape','Escape',27);
    assert.equal(await evaluate(()=>!!document.querySelector('[role=listbox]')),false,'Escape closes listbox');
    assert.ok(Math.abs((await evaluate(()=>scrollY))-before)<4,'Escape keeps scroll');

    await evaluate(()=>{const trigger=document.querySelector('[data-form-language-trigger]');trigger.blur();trigger.focus();});
    assert.ok(Math.abs((await evaluate(()=>scrollY))-before)<4,'ordinary focus keeps scroll');
    const previous=await locale();
    await key('Enter','Enter',13);
    await until(()=>evaluate(()=>!!document.querySelector('[role=listbox]')),'keyboard opens listbox');
    assert.equal(await evaluate(()=>document.activeElement.getAttribute('role')),'option');
    await key('ArrowDown','ArrowDown',40);
    await key('Enter','Enter',13);
    // ArrowDown from the selected item follows the visible EN → ES → PT order.
    const nextCode=({es:'pt',en:'es',pt:'en'})[previous];
    await until(async()=>await locale()===nextCode,'keyboard selects language');
    await pause(80);
    assert.equal(await evaluate(()=>document.activeElement.hasAttribute('data-form-language-trigger')),true,'selection returns focus');
    assert.ok(Math.abs((await evaluate(()=>scrollY))-before)<70,'keyboard locale switch has no large scroll jump');

    // Pointer selection also works; select a different option with a real CDP click.
    await clickPoint(point.x,point.y);
    await until(()=>evaluate(()=>!!document.querySelector('[role=listbox]')),'second pointer opening');
    const target=await evaluate(()=>{
      const options=[...document.querySelectorAll('[role=option]')];
      const active=options.findIndex(item=>item.getAttribute('aria-selected')==='true');
      const el=options[(active+1)%options.length];const r=el.getBoundingClientRect();
      return{x:r.left+r.width/2,y:r.top+r.height/2,short:el.textContent.trim()};
    });
    await clickPoint(target.x,target.y);
    await until(()=>evaluate(short=>document.querySelector('[data-form-language-trigger]').textContent.trim()===short,target.short),'pointer selects option');
    assert.equal(await evaluate(()=>!!document.querySelector('[role=listbox]')),false,'selection closes menu');
    assert.ok(Math.abs((await evaluate(()=>scrollY))-before)<70,'pointer locale switch has no large scroll jump');
    assert.ok(await evaluate(()=>document.querySelector('form')===window.__qaForm),'same form survives locale changes');
    assert.equal(await evaluate(initial=>location.href===initial,context.initialUrl),true,'language selection leaves URL untouched');
    assert.equal(await evaluate(()=>document.cookie.includes('testimonios_locale='+({ES:'es',EN:'en',PT:'pt'})[document.querySelector('[data-form-language-trigger]').textContent.trim()])),true,'language preference saved in cookie');
    assert.equal(await evaluate(()=>document.querySelector('header').lang===document.querySelector('main').lang&&document.documentElement.lang===document.querySelector('main').lang),true,'all regions reflect active language');
    const result={...context,before,pointerOpen,keyboardChanged:previous!==nextCode,pointerChanged:true,finalLocale:await locale(),events:await evaluate(()=>window.__qaEvents)};
    checks.push(result);
  }
  for(const width of [1440,375])for(const initialLocale of ['es','en','pt']){
    await cdp('Emulation.setDeviceMetricsOverride',{width,height:760,deviceScaleFactor:1,mobile:false});
    await cdp('Page.navigate',{url:origin+'/enviar?lang='+initialLocale});
    await until(()=>evaluate(locale=>!!document.querySelector('main form')&&document.querySelector('main').lang===(locale==='pt'?'pt-BR':locale)&&document.readyState==='complete',initialLocale),'form');
    await evaluate(()=>document.fonts.ready.then(()=>true));await pause(100);
    await evaluate(()=>{window.__qaForm=document.querySelector('form');});
    if(phase==='compact'){
      await evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
      const top=await evaluate(()=>{const r=document.querySelector('[data-form-language-trigger]').getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2};});
      await clickPoint(top.x,top.y);await key('Escape','Escape',27);
      assert.equal(await evaluate(()=>scrollY),0,'selector at top stays at top');
      await next();assert.equal(await evaluate(()=>document.activeElement.name),'type','legitimate first-error focus');
    }
    await scrollProbe({width,initialLocale,step:1});
    await evaluate(()=>document.querySelector('input[value="simulation"]').click());await next();
    await input('input[name="full_name"]','Persona QA');await input('input[name="email"]','persona@example.com');await input('select[name="country"]','Argentina');
    await avatar();await until(()=>evaluate(()=>!document.querySelector('dialog button:last-child').disabled),'crop ready');
    if(phase==='compact')await modalProbe({width,initialLocale});
    await evaluate(()=>document.querySelector('dialog button:last-child').click());await until(()=>evaluate(()=>!document.querySelector('dialog[open]')),'crop complete');
    assert.equal(await evaluate(()=>document.activeElement.name),'avatar','crop returns focus');
    if(phase==='compact'&&width===375&&initialLocale==='pt'){
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
    if(phase==='compact')await evaluate(()=>document.querySelector('input[name="consent"]').click());
    await scrollProbe({width,initialLocale,step:5});
    assert.equal(await evaluate(()=>document.querySelector('input[name="full_name"]').value),'Persona QA');
    if(phase==='compact')assert.equal(await evaluate(()=>document.querySelector('input[name="consent"]').checked&&!document.querySelectorAll('fieldset')[4].hidden&&!!document.querySelector('input[name="avatar"]').closest('[data-field]').querySelector('img')),true,'step, consent and image preserved');
  }
  assert.equal(blockedPosts,0);assert.deepEqual(errors,[]);
  const report={phase,checks,modalChecks,popupVerification:'Native listbox opened, dismissed and selected with CDP pointer/keyboard',blockedPosts,realSubmissions:0,browserErrors:errors};
  await writeFile(join(output,phase+'-scroll.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({phase,checks:checks.map(check=>({width:check.width,locale:check.initialLocale,step:check.step,pointerOpen:check.pointerOpen,keyboardChanged:check.keyboardChanged,finalLocale:check.finalLocale}))}));
} finally {
  if (socket?.readyState === WebSocket.OPEN) { try { await cdp('Browser.close'); } catch { /* Browser can exit before acknowledgement. */ } socket.close(); }
  server.kill(); chrome.kill(); await pause(700);
  if (dirname(resolve(profile)) !== resolve(tmpdir()) || !basename(profile).startsWith('testimonios-acceptance-')) throw new Error('Unexpected profile; cleanup refused');
  await rm(profile,{recursive:true,force:true,maxRetries:5,retryDelay:250});
}

