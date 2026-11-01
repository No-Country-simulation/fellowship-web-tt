import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Focused contrast QA, after build. --before records the unmodified production build.
// Reuses the Stage 4 public fixture; every browser POST is blocked before Next.
const phase = process.argv.includes("--before") ? "before" : "after";
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
    pending.set(id, { resolve, reject, timer });
    socket.send(JSON.stringify({ id, method, params }));
  });
  socket.onmessage = ({ data }) => {
    const event = JSON.parse(data);
    if (event.id) {
      const item = pending.get(event.id);
      if (!item) return;
      pending.delete(event.id); clearTimeout(item.timer);
      if (event.error) item.reject(new Error(`CDP failure: ${event.error.code}`)); else item.resolve(event.result);
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
  const output = join(appDir, "docs/ui/assets/form-contrast");
  await mkdir(output, { recursive: true });
  const screenshots = [];
  const ctaSamples = [];
  const disabledSamples = [];
  // Browser-side helpers use authored colors (not antialiasing) and composite alpha.
  await cdp("Page.addScriptToEvaluateOnNewDocument", { source: `
    window.qaColor = value => {
      const canvas = document.createElement('canvas'); canvas.width = canvas.height = 1;
      const ctx = canvas.getContext('2d', {willReadFrequently:true});
      ctx.fillStyle = value; ctx.fillRect(0,0,1,1);
      return [...ctx.getImageData(0,0,1,1).data];
    };
    window.qaBlend = (fg,bg,opacity=1) => {
      const alpha = (fg[3] ?? 255)/255 * opacity;
      return fg.slice(0,3).map((v,i) => v*alpha+bg[i]*(1-alpha));
    };
    window.qaRatio = (a,b) => {
      const lum = c => Array.from(c).slice(0,3).map(v => v/255).map(v => v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
      return (Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
    };
    window.qaBackground = element => {
      const chain=[]; for(let el=element;el;el=el.parentElement) chain.unshift(el);
      return chain.reduce((bg,el)=>window.qaBlend(window.qaColor(getComputedStyle(el).backgroundColor),bg),[255,255,255]);
    };
    window.qaFields = state => [...document.querySelectorAll('input:not([type=hidden]):not([type=radio]):not([type=checkbox]):not([type=range]),textarea,select')].map(control => {
      const element=control.type==='file'?control.closest('label'):control;
      const style=getComputedStyle(element);
      const background=window.qaBackground(element);
      const outside=window.qaBackground(element.parentElement);
      const color=window.qaColor(style.borderColor);
      const borders=[window.qaRatio(window.qaBlend(color,background),background),window.qaRatio(window.qaBlend(color,outside),outside)];
      const placeholderStyle=getComputedStyle(control,'::placeholder');
      const hasPlaceholder=!!control.getAttribute('placeholder');
      const placeholderContrast=hasPlaceholder?window.qaRatio(window.qaBlend(window.qaColor(placeholderStyle.color),background,Number(placeholderStyle.opacity)),background):null;
      return {name:control.name||'language',tag:control.tagName,type:control.type,state,invalid:control.getAttribute('aria-invalid')==='true',disabled:control.disabled,focused:control.matches(':focus-visible'),outline:{style:style.outlineStyle,color:style.outlineColor},placeholder:hasPlaceholder?{color:placeholderStyle.color,contrast:placeholderContrast,status:control.disabled?'EXEMPT_DISABLED':placeholderContrast>=4.5?'PASS':'FAIL'}:null,border:{color:style.borderColor,inner:background,outer:outside,contrast:Math.min(...borders),status:control.disabled?'EXEMPT_DISABLED':Math.min(...borders)>=3?'PASS':'FAIL'}};
    }).concat([...document.querySelectorAll('input[type=radio]')].filter(control=>!control.checked).map(control=>{
      const circle=control.closest('label').lastElementChild;
      const style=getComputedStyle(circle);const background=window.qaBackground(circle);
      const ratio=window.qaRatio(window.qaColor(style.borderColor),background);
      return {name:'type:'+control.value,type:'unselected radio indicator',state,disabled:false,border:{color:style.borderColor,contrast:ratio,status:ratio>=3?'PASS':'FAIL'}};
    }));
  ` });
  async function input(selector, value) {
    await evaluate((selector,value) => {
      const element=document.querySelector(selector);
      const proto=element instanceof HTMLSelectElement?HTMLSelectElement.prototype:element instanceof HTMLTextAreaElement?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;
      Object.getOwnPropertyDescriptor(proto,'value').set.call(element,value);
      element.dispatchEvent(new Event(element instanceof HTMLSelectElement?'change':'input',{bubbles:true}));
    }, selector, value);
    await pause(40);
  }
  async function next() {
    await evaluate(() => [...document.querySelectorAll('main button')].find(el=>el.getClientRects().length&&['Siguiente','Próximo'].includes(el.textContent.trim())).click());
    await pause(70);
  }
  async function measureCTA(selector, context) {
    const enabled=await evaluate(selector=>!document.querySelector(selector).disabled,selector);
    if(!enabled) await until(()=>evaluate(selector=>!document.querySelector(selector).disabled,selector),'CTA ready');
    await cdp('Input.dispatchMouseEvent',{type:'mouseMoved',x:0,y:0});
    await evaluate(()=>document.activeElement?.blur());
    await rasterCTA(selector,{...context,state:'normal'});
    const point=await evaluate(()=>{const r=window.__qaButton.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2};});
    await cdp('Input.dispatchMouseEvent',{type:'mouseMoved',...point});
    await pause(250);
    await rasterCTA(selector,{...context,state:'hover'});
    await cdp('Input.dispatchMouseEvent',{type:'mouseMoved',x:0,y:0});
    await evaluate(()=>window.__qaButton.focus({preventScroll:true}));
    await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'ArrowLeft',code:'ArrowLeft',windowsVirtualKeyCode:37});
    await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:'ArrowLeft',code:'ArrowLeft',windowsVirtualKeyCode:37});
    await evaluate(()=>{window.__qaButton.blur();window.__qaButton.focus({preventScroll:true});});
    await rasterCTA(selector,{...context,state:'focus'});
    const focus=await evaluate(()=>{const style=getComputedStyle(window.__qaButton);return{outline:style.outlineStyle,width:style.outlineWidth,boxShadow:style.boxShadow};});
    assert.ok(focus.outline!=='none'||focus.boxShadow!=='none','visible CTA focus');
    await evaluate(()=>window.__qaButton.disabled=true);await pause(200);
    disabledSamples.push({...context,...await evaluate(()=>({disabled:window.__qaButton.disabled,opacity:Number(getComputedStyle(window.__qaButton).opacity),pointerEvents:getComputedStyle(window.__qaButton).pointerEvents,status:'EXEMPT_DISABLED'}))});
    await evaluate(()=>window.__qaButton.disabled=false);await pause(200);
  }
  async function rasterCTA(selector, context) {
    await evaluate(selector => {
      const button = document.querySelector(selector);
      button.scrollIntoView({block:"center",behavior:"instant"});
      window.__qaButton = button;
    }, selector);
    await pause(200);
    const info = await evaluate(() => {
      const button = window.__qaButton;
      const style = getComputedStyle(button);
      const rect = button.getBoundingClientRect();
      const boxes=[]; const walker=document.createTreeWalker(button,NodeFilter.SHOW_TEXT);
      while(walker.nextNode()) {
        const node=walker.currentNode;
        for(let i=0;i<node.length;i++) {
          if(!node.textContent[i].trim())continue;
          const range=document.createRange();range.setStart(node,i);range.setEnd(node,i+1);
          const r=range.getBoundingClientRect();
          boxes.push({x:r.left-rect.left,y:r.top-rect.top,w:r.width,h:r.height});
        }
      }
      const result={label:button.textContent.trim(),fontSize:style.fontSize,fontWeight:style.fontWeight,disabled:button.disabled,opacity:Number(style.opacity),foreground:window.qaBlend(window.qaColor(style.color),window.qaBackground(button.parentElement),Number(style.opacity)),gradient:style.backgroundImage,boxes,clip:{x:rect.left+scrollX,y:rect.top+scrollY,width:rect.width,height:rect.height,scale:1},originalStyle:button.getAttribute('style')};
      // Hide only the ink, keeping the actual gradient, layout, opacity and text boxes.
      button.style.setProperty('transition','none','important');
      button.style.setProperty('color','transparent','important');
      return result;
    });
    await evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    let capture;
    try { capture = await cdp("Page.captureScreenshot", { format: "png", clip: info.clip, captureBeyondViewport: true }); }
    finally { await evaluate(original => { if(original===null)window.__qaButton.removeAttribute('style');else window.__qaButton.setAttribute('style',original); }, info.originalStyle); }
    const raster = await evaluate(async (data, info) => {
      const bytes=Uint8Array.from(atob(data),c=>c.charCodeAt(0));
      const bitmap=await createImageBitmap(new Blob([bytes],{type:'image/png'}));
      const canvas=document.createElement('canvas');canvas.width=bitmap.width;canvas.height=bitmap.height;
      const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(bitmap,0,0);bitmap.close();
      const pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data;
      let min=Infinity,max=0,count=0;
      for(const box of info.boxes) for(let y=Math.max(0,Math.floor(box.y));y<Math.min(canvas.height,Math.ceil(box.y+box.h));y++) for(let x=Math.max(0,Math.floor(box.x));x<Math.min(canvas.width,Math.ceil(box.x+box.w));x++) {
        const index=(y*canvas.width+x)*4;
        const ratio=window.qaRatio(info.foreground,pixels.slice(index,index+3));
        min=Math.min(min,ratio);max=Math.max(max,ratio);count++;
      }
      return {min,max,pixels:count};
    }, capture.data, info);
    const result={...context,label:info.label,fontSize:info.fontSize,fontWeight:info.fontWeight,disabled:info.disabled,opacity:info.opacity,gradient:info.gradient,method:"raster background across every character bounding box; authored foreground with element opacity, no text antialiasing",...raster};
    result.status = info.disabled ? "EXEMPT_DISABLED" : !Number.isFinite(raster.min) || raster.pixels===0 ? "PENDIENTE" : raster.min>=4.5 ? "PASS" : "FAIL";
    ctaSamples.push(result);
    return result;
  }
  const samples = [];
  for (const locale of ["es", "pt-BR"]) {
    await cdp("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
    await cdp("Page.navigate", { url: origin + "/enviar?lang=" + locale });
    await until(() => evaluate(locale => !!document.querySelector("main form") && document.querySelector("main").lang === locale && document.readyState === "complete", locale), locale);
    await evaluate(() => document.fonts.ready.then(() => true));
    assert.equal(await evaluate(()=>Math.abs(window.qaRatio(new Uint8ClampedArray([255,255,255]),new Uint8ClampedArray([102,102,102]))-5.74183648145415)<.00001),true,'raster luminance uses floating point, not clamped channels');
    await pause(100);
    // Check all currently mounted references, including inactive fieldsets, for every category.
    for (const category of ["simulation", "first_job", "career_change"]) {
      await evaluate(category => document.querySelector(`input[value="${category}"]`).click(), category);
      await pause(40);
      const associations = await evaluate(() => {
        const ids = [...document.querySelectorAll("[id]")].map(el => el.id);
        const broken = [...document.querySelectorAll("[aria-labelledby],[aria-describedby],label[for]")].flatMap(el =>
          ["aria-labelledby", "aria-describedby", "for"].flatMap(attr =>
            (el.getAttribute(attr) ?? "").split(/\s+/).filter(Boolean)
              .filter(id => !document.getElementById(id)).map(id => ({ attr, id })),
          ),
        );
        return { duplicates: ids.filter((id, i) => ids.indexOf(id) !== i), broken };
      });
      assert.deepEqual(associations, { duplicates: [], broken: [] });
      samples.push({locale,category,width:1440,fields:await evaluate(()=>window.qaFields('normal'))});
    }
    await evaluate(() => [...document.querySelectorAll("main button")].find(el => el.getClientRects().length).click());
    await pause(60);
    await evaluate(() => [...document.querySelectorAll("main button")].find(el => el.getClientRects().length && el.textContent.trim() === (document.querySelector("main").lang === "es" ? "Siguiente" : "Próximo")).click());
    await pause(60);
    const validation = await evaluate(() => [...document.querySelectorAll('input[aria-invalid="true"],select[aria-invalid="true"]')].map(el => ({ name: el.name, labelled: !!(el.labels?.length || el.getAttribute("aria-labelledby")), described: (el.getAttribute("aria-describedby") ?? "").split(/\s+/).some(id => document.getElementById(id)?.textContent.trim()) })));
    assert.deepEqual(validation.map(el => el.name).sort(), ["avatar", "country", "email", "full_name"]);
    assert.ok(validation.every(el => el.labelled && el.described));
    await input('input[name="full_name"]','Persona QA');
    await input('input[name="full_name"]','');
    await pause(60);
    const ax = await cdp("Accessibility.getFullAXTree");
    const selectName = locale === "es" ? "Idioma del formulario" : "Idioma do formulário";
    assert.ok(ax.nodes.some(node => !node.ignored && node.role?.value === "combobox" && node.name?.value === selectName));
    assert.equal(await evaluate(() => document.querySelector("header").lang === document.querySelector("main").lang), true);
    for (const width of [1440, 375]) {
      await cdp("Emulation.setDeviceMetricsOverride", { width, height: 1000, deviceScaleFactor: 1, mobile: false });
      await pause(60);
      await evaluate(()=>document.querySelector('input[name="email"]').focus({preventScroll:true}));
      await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'ArrowLeft',code:'ArrowLeft',windowsVirtualKeyCode:37});
      await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:'ArrowLeft',code:'ArrowLeft',windowsVirtualKeyCode:37});
      await evaluate(()=>{const el=document.querySelector('input[name="email"]');el.blur();el.focus({preventScroll:true});});
      if(phase==='after'){
        await pause(50);
        const focus=await evaluate(()=>{const el=document.querySelector('input[name="email"]');const s=getComputedStyle(el);return{outline:s.outlineStyle,focusVisible:el.matches(':focus-visible'),className:el.className,active:document.activeElement.name};});
        assert.equal(focus.outline,'solid','error field retains distinct focus outline: '+JSON.stringify(focus));
      }
      samples.push({locale,width,fields:await evaluate(()=>window.qaFields('error/focus'))});
      await evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
      const clip=await evaluate(()=>({x:0,y:0,width:innerWidth,height:document.documentElement.scrollHeight,scale:1}));
      const capture=await cdp('Page.captureScreenshot',{format:'png',clip,captureBeyondViewport:true});
      const name=`${phase}-${locale}-${width}.png`;
      await writeFile(join(output,name),Buffer.from(capture.data,'base64'));screenshots.push(name);
      const nextSelector='main button[data-slot="button"]:last-child';
      await measureCTA(nextSelector,{locale,width,action:'next'});
      await evaluate(()=>document.querySelector('input[name="full_name"]').focus({preventScroll:true}));
      samples.push({locale,width,fields:await evaluate(()=>window.qaFields('normal/focus'))});
      await evaluate(()=>{const el=document.querySelector('input[name="full_name"]');el.blur();el.disabled=true;});
      samples.push({locale,width,fields:await evaluate(()=>window.qaFields('disabled probe'))});
      await evaluate(()=>document.querySelector('input[name="full_name"]').disabled=false);
      await evaluate(()=>document.documentElement.style.fontSize='200%');
      assert.equal(await evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth&&[...document.querySelectorAll('main input,main textarea,main select,main button,header select')].filter(el=>el.getClientRects().length).every(el=>{const r=el.getBoundingClientRect();return r.left>=-1&&r.right<=document.documentElement.clientWidth+1;})),true,'no overflow at enlarged font');
      await evaluate(()=>document.documentElement.style.removeProperty('font-size'));
    }
    // Focused traversal to render the actual crop, submit and success CTAs. No server action runs.
    await input('input[name="full_name"]','Persona QA');
    await input('input[name="email"]','persona@example.com');
    await input('select[name="country"]','Argentina');
    await evaluate(()=>document.querySelector('input[value="simulation"]').click());
    await pause(50);
    await evaluate(async()=>{
      const canvas=document.createElement('canvas');canvas.width=canvas.height=720;
      const ctx=canvas.getContext('2d');ctx.fillStyle='#19304b';ctx.fillRect(0,0,720,720);
      const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
      const transfer=new DataTransfer();transfer.items.add(new File([blob],'qa-avatar.png',{type:'image/png'}));
      const el=document.querySelector('input[name="avatar"]');el.files=transfer.files;el.dispatchEvent(new Event('change',{bubbles:true}));
    });
    await until(()=>evaluate(()=>!!document.querySelector('dialog[open]')),'crop open');
    await pause(100);
    assert.equal(await evaluate(()=>document.querySelectorAll('[data-form-language-select]').length===1&&!!document.querySelector('dialog select')),true);
    samples.push({locale,width:375,fields:await evaluate(()=>window.qaFields('crop'))});
    await measureCTA('dialog button:last-child',{locale,width:375,action:'crop confirm'});
    await evaluate(()=>document.querySelector('dialog button:last-child').click());
    await until(()=>evaluate(()=>!document.querySelector('dialog[open]')),'crop confirmed');
    await next();
    await input('textarea[name="story"]','Historia sintética para medir los controles del formulario.');
    await next();await next();
    assert.equal(await evaluate(()=>!document.querySelectorAll('fieldset')[4].hidden),true,'consent step');
    await measureCTA('button[type="submit"]',{locale,width:375,action:'submit'});
    await evaluate(()=>document.querySelector('input[name="consent"]').click());
    expectSuccess=true;
    await evaluate(()=>document.querySelector('button[type="submit"]').click());
    await until(()=>evaluate(()=>!document.querySelector('main form')&&!!document.querySelector('main h1')),'mock success');
    await measureCTA('main button',{locale,width:375,action:'copy invite'});
  }
  // Attempt browser shortcut, without using CSS font-size or a page-scale emulation.
  const zoomMetrics = () => evaluate(() => ({ width: innerWidth, dpr: devicePixelRatio, scale: visualViewport.scale }));
  const before = await zoomMetrics();
  await cdp("Input.dispatchKeyEvent", { type: "keyDown", key: "+", code: "Equal", modifiers: 2, windowsVirtualKeyCode: 187 });
  await cdp("Input.dispatchKeyEvent", { type: "keyUp", key: "+", code: "Equal", modifiers: 2, windowsVirtualKeyCode: 187 });
  await pause(150);
  const after = await zoomMetrics();
  assert.equal(blockedPosts, 2); assert.deepEqual(errors, []);
  const fields=samples.flatMap(sample=>sample.fields);
  const required=['language','avatar','full_name','country','email','primary_role','company','role_achieved','previous_profession','new_role','story','capture','video_url','instagram','linkedin'];
  const missing=['es','pt-BR'].flatMap(locale=>required.filter(name=>!samples.filter(sample=>sample.locale===locale).some(sample=>sample.fields.some(field=>field.name===name))).map(name=>locale+':'+name));
  const expectedCTA=['es','pt-BR'].flatMap(locale=>[['next',1440],['next',375],['crop confirm',375],['submit',375],['copy invite',375]].flatMap(([action,width])=>['normal','hover','focus'].map(state=>({locale,action,width,state}))));
  const missingCTA=expectedCTA.filter(expected=>!ctaSamples.some(sample=>Object.entries(expected).every(([key,value])=>sample[key]===value)));
  const summarize=items=>{
    const active=items.filter(item=>!item.disabled&&item.status!=='EXEMPT_DISABLED');
    return {status:active.some(item=>item.status==='FAIL')?'FAIL':active.length===0||active.some(item=>item.status!=='PASS'||!Number.isFinite(item.contrast??item.min))?'PENDIENTE':'PASS',count:items.length,min:active.length?Math.min(...active.map(item=>item.contrast??item.min)):null};
  };
  const placeholder=summarize(fields.flatMap(field=>field.placeholder?[field.placeholder]:[]));
  const boundary=summarize(fields.filter(field=>!field.disabled).map(field=>field.border));
  const cta=summarize(ctaSamples);
  const coverage={status:missing.length===0&&missingCTA.length===0&&ctaSamples.length===30&&disabledSamples.length===10&&disabledSamples.every(sample=>sample.disabled&&sample.opacity===.5&&sample.pointerEvents==='none')?'PASS':'PENDIENTE',missing,missingCTA,ctaSamples:ctaSamples.length,disabledSamples:disabledSamples.length};
  const checks=[placeholder,boundary,cta,coverage];
  const contrast=checks.some(check=>check.status==='FAIL')?'FAIL':checks.some(check=>check.status!=='PASS')?'PENDIENTE':'PASS';
  const report={phase,associations:'PASS',contrast,criteria:{placeholder,boundary,cta,coverage},screenReader:'PENDIENTE',browserZoom:{status:'PENDIENTE',shortcutChangedMetrics:JSON.stringify(before)!==JSON.stringify(after)},samples,ctaSamples,disabledSamples,screenshots,blockedPosts,realSubmissions:0,browserErrors:errors};
  await writeFile(join(output,`${phase}-results.json`),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({phase,contrast,criteria:report.criteria,blockedPosts,browserErrors:errors}));
} finally {
  if (socket?.readyState === WebSocket.OPEN) { try { await cdp("Browser.close"); } catch { /* Chrome can close before its acknowledgement. */ } socket.close(); }
  server.kill(); chrome.kill(); await pause(700);
  if (dirname(resolve(profile)) !== resolve(tmpdir()) || !basename(profile).startsWith("testimonios-acceptance-")) throw new Error("Unexpected profile; cleanup refused");
  await rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 250 });
}
