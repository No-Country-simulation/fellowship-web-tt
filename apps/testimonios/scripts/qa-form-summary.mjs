import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, mkdir, rm, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve, dirname, basename } from "node:path";
import { createServer } from "node:net";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

// Run after build. Every POST is intercepted before Next and receives a mock result.
// Browser fixtures and URL accounting check confirmed images, cleanup and unchanged payloads.
// No real action, uploads, persistence or notifications run.
const appDir = fileURLToPath(new URL("../", import.meta.url));
const require = createRequire(import.meta.url);
const diagnosis = process.argv.includes('--diagnose');
const output = join(appDir, "docs/ui/assets/form-summary", ...(diagnosis ? ['investigation'] : []));
const captures=[];
// Sharp is already installed by Next. Only screenshot PNGs are cropped here;
// no form file or application image processing is involved, and no resize runs.
async function cropScreenshot(name,source,height){
 const sharp=createRequire(require.resolve('next/package.json'))('sharp');
 const image=sharp(await readFile(join(output,source))),metadata=await image.metadata();
 const crop={left:0,top:0,width:metadata.width,height:Math.min(height,metadata.height)};
 const png=await image.extract(crop).png().toBuffer();
 assert.equal(png.readUInt32BE(16),crop.width);assert.equal(png.readUInt32BE(20),crop.height);
 await writeFile(join(output,name),png);
 return{name,kind:'pixel crop of full screenshot; no resize',source,sourcePixels:{width:metadata.width,height:metadata.height},crop,png:{width:crop.width,height:crop.height}};
}
// Refresh only the two critical detail crops from an already completed matrix.
// No browser, server or request is started in this mode.
if(process.argv.includes('--refresh-crops')){
 const path=join(output,'qa-results.json'),report=JSON.parse(await readFile(path,'utf8'));
 for(let i=0;i<report.captures.length;i++){const c=report.captures[i];if(c.name.endsWith('-top.png'))report.captures[i]=await cropScreenshot(c.name,c.name.replace('-top.png','.png'),1200);}
 await writeFile(path,JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({refreshed:report.captures.filter(c=>c.name.endsWith('-top.png')),realSubmissions:0}));
 process.exit(0);
}
const pause = ms => new Promise(r => setTimeout(r, ms));
let expectAction = false, pendingAction = null;
async function port(){const s=createServer();await new Promise(r=>s.listen(0,'127.0.0.1',r));const n=s.address().port;await new Promise(r=>s.close(r));return n;}
let server,chrome,socket,profile,cdp;const pending=new Map();const errors=[];const reports=[];let blockedPosts=0,blockedExternal=0,seq=0;
async function until(fn,label){for(let n=0;n<100;n++){if(await fn())return;await pause(80);}throw Error('Timeout '+label);}
try{
 profile=await mkdtemp(join(tmpdir(),'testimonios-summary-'));
 const appPort=await port(),debugPort=await port(),origin='http://127.0.0.1:'+appPort;
 server=spawn(process.execPath,['--import',new URL('./qa-public-fixture.mjs',import.meta.url).href,require.resolve('next/dist/bin/next'),'start','--hostname','127.0.0.1','--port',String(appPort)],{cwd:appDir,windowsHide:true,stdio:'ignore'});
 chrome=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--remote-debugging-port='+debugPort,'--user-data-dir='+profile,'--disable-background-networking','--disable-sync','--no-first-run','--no-default-browser-check','about:blank'],{windowsHide:true,stdio:'ignore'});
 await until(async()=>{try{return (await fetch(origin+'/enviar')).ok;}catch{return false;}},'local server');
 await until(async()=>{try{return (await fetch('http://127.0.0.1:'+debugPort+'/json/version')).ok;}catch{return false;}},'Chrome');
 const version=await (await fetch('http://127.0.0.1:'+debugPort+'/json/version')).json();
 console.log(JSON.stringify({browser:version.Browser,mode:'confirmed-file summary against current production build'}));
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
 async function next(){const s=await step();await button('next');try{await until(async()=>await step()===s+1,'next step from '+s);}catch{throw Error('Cannot advance from '+s+': '+JSON.stringify(await ev(()=>({invalid:[...document.querySelectorAll('fieldset:not([hidden]) [aria-invalid="true"]')].map(e=>e.name),category:document.querySelector('[name="type"]:checked')?.value,focused:document.activeElement.tagName,width:innerWidth,rootFont:getComputedStyle(document.documentElement).fontSize}))));}}
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
  await until(()=>ev(()=>Object.keys(document.querySelector('form')).some(k=>k.startsWith('__reactProps$'))),'React hydration');
  await ev(()=>document.fonts.ready.then(()=>true));
  await pause(150);
  await click('form ol li:last-child > span');assert.equal(await step(),1,'future step cannot advance from step 1');
  await click('[name="type"][value="'+category+'"]');await next();
  await type('full_name','Persona Sintetica');await type('email','persona@example.com');
  await ev(()=>{const el=document.querySelector('select[name="country"]');Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set.call(el,'Argentina');el.dispatchEvent(new Event('change',{bubbles:true}));});
  await ev(async()=>{const canvas=document.createElement('canvas');canvas.width=960;canvas.height=720;const ctx=canvas.getContext('2d');ctx.fillStyle='#12132a';ctx.fillRect(0,0,960,720);ctx.fillStyle='#02beef';ctx.beginPath();ctx.arc(480,260,130,0,Math.PI*2);ctx.fill();ctx.fillStyle='#646cf6';ctx.beginPath();ctx.ellipse(480,670,240,230,0,0,Math.PI*2);ctx.fill();const blob=await new Promise(r=>canvas.toBlob(r,'image/png'));const d=new DataTransfer();d.items.add(new File([blob],'synthetic.png',{type:'image/png'}));const e=document.querySelector('input[name="avatar"]');e.files=d.files;e.dispatchEvent(new Event('change',{bubbles:true}));});
  await until(()=>ev(()=>!!document.querySelector('dialog[open] button:last-child:not(:disabled)')),'crop ready');
  await click('dialog[open] button:last-child');await until(()=>ev(()=>!document.querySelector('dialog[open]')),'crop closed');
  await next();
  await ev(()=>{
   window.__qaStepsForm=document.querySelector('form');
  });
 }
 const snap=()=>ev(()=>({fields:Object.fromEntries([...document.querySelectorAll('fieldset:nth-of-type(3) input,fieldset:nth-of-type(3) textarea')].map(e=>[e.name,e.value]))}));



 const copy={
  es:{titles:['Datos personales','Tu experiencia','Fotografías y enlaces'],empty:'Sin fotografía de experiencia (opcional)'},
  en:{titles:['Personal details','Your experience','Photos and links'],empty:'No experience photo attached (optional)'},
  pt:{titles:['Dados pessoais','Sua experiência','Fotos e links'],empty:'Sem foto da experiência (opcional)'},
 };
 const professionalValues={primary_role:'Desarrollo frontend',company:'Equipo de práctica QA',role_achieved:'Desarrollo de software',previous_profession:'Docencia',new_role:'Desarrollo de software'};
 const story='Trabajar con el equipo me ayudó a organizar mis ideas y aprender de otras personas. Ahora tengo más confianza para encarar un proyecto.\n\nCompartimos decisiones, pedimos ayuda y encontramos soluciones en conjunto. Esta experiencia me dejó herramientas que puedo seguir practicando.\n\n'+('AprendizajeCompartido').repeat(8);
 const recorder=()=>{
  window.__qaUrls=new Map();window.__qaPayloads=[];
  const create=URL.createObjectURL,revoke=URL.revokeObjectURL,set=FormData.prototype.set,records=new WeakMap();
  URL.createObjectURL=function(file){const url=create.call(URL,file);window.__qaUrls.set(url,{file,revokes:0});return url;};
  URL.revokeObjectURL=function(url){const record=window.__qaUrls.get(url);if(record)record.revokes++;return revoke.call(URL,url);};
  FormData.prototype.set=function(name,value,...rest){if(name==='type'){const record={};records.set(this,record);window.__qaPayloads.push(record);}const record=records.get(this);if(record)record[name]=value;return set.call(this,name,value,...rest);};
 };
 await cdp('Page.addScriptToEvaluateOnNewDocument',{source:'('+recorder.toString()+')()'});
 const live=()=>ev(()=>[...window.__qaUrls.values()].filter(x=>x.revokes===0).length);
 async function liveCount(n){await until(async()=>await live()===n,'live object URLs '+n);}
 async function earlier(n){await click('form ol li:nth-child('+n+') button');await until(async()=>await step()===n,'earlier step');}
 async function choose(name,variant){
  await ev(async(name,variant)=>{
   const c=document.createElement('canvas');c.width=1280;c.height=960;const x=c.getContext('2d'),g=x.createLinearGradient(0,0,1280,960);g.addColorStop(0,variant%2?'#646cf6':'#033d66');g.addColorStop(1,variant%2?'#cc087d':'#06778d');x.fillStyle=g;x.fillRect(0,0,1280,960);
   if(name==='avatar'){x.fillStyle='#02beef';x.beginPath();x.arc(640,340,160,0,Math.PI*2);x.fill();x.fillStyle='#7983f5';x.beginPath();x.ellipse(640,880,300,260,0,0,Math.PI*2);x.fill();}
   else {x.fillStyle='#ffffff';x.font='bold 80px sans-serif';x.fillText('Equipo QA',150,450);x.font='40px sans-serif';x.fillText('Experiencia compartida',150,530);x.fillStyle='#02beef';x.fillRect(1100,200,24,560);x.fillStyle='#ff0094';x.fillRect(100,200,24,560);}
   const blob=await new Promise(r=>c.toBlob(r,'image/png')),d=new DataTransfer();d.items.add(new File([blob],'qa-'+name+'-'+variant+'.png',{type:'image/png'}));const e=document.querySelector('[name="'+name+'"]');e.files=d.files;e.dispatchEvent(new Event('change',{bubbles:true}));
  },name,variant);
  await until(()=>ev(()=>!!document.querySelector('dialog[open] button:last-child:not(:disabled)')),'crop ready');
 }
 async function confirm(){await click('dialog[open] button:last-child');await until(()=>ev(()=>!document.querySelector('dialog[open]')),'crop confirmed');}
 async function cancel(){await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});await until(()=>ev(()=>!document.querySelector('dialog[open]')),'crop cancelled');}
 async function imagesReady(count){await until(()=>ev(count=>{const imgs=[...document.querySelectorAll('[aria-labelledby="testimonial-summary-title"] img')];return imgs.length===count&&imgs.every(e=>e.complete&&e.naturalWidth>0);},count),'summary images loaded');}
 async function summaryProbe(locale,category,hasCapture){
  await imagesReady(hasCapture?2:1);await liveCount(hasCapture?4:2);
  const info=await ev(()=>{
   const summary=document.querySelector('[aria-labelledby="testimonial-summary-title"]'),sections=[...summary.querySelectorAll(':scope > section')];
   const rows=[...summary.querySelectorAll('img')].map(img=>{const name=img.closest('section').getAttribute('aria-labelledby')==='summary-personal-title'?'avatar':'capture',picker=document.querySelector('[name="'+name+'"]').closest('[data-field]').querySelector('img'),entry=window.__qaUrls.get(img.src),editor=window.__qaUrls.get(picker.src),style=getComputedStyle(img),r=img.getBoundingClientRect();return {name,src:img.src,alt:img.alt,width:img.naturalWidth,height:img.naturalHeight,fit:style.objectFit,ratio:(r.width-parseFloat(style.borderLeftWidth)-parseFloat(style.borderRightWidth))/(r.height-parseFloat(style.borderTopWidth)-parseFloat(style.borderBottomWidth)),sameFinalFile:entry.file===editor.file,type:entry.file.type,revoked:entry.revokes};});
   return {titles:sections.map(s=>s.querySelector('h5').textContent),rows,story:document.querySelector('[aria-labelledby="summary-experience-title"] dl > div:last-child dd').textContent,whiteSpace:getComputedStyle(document.querySelector('[aria-labelledby="summary-experience-title"] dl > div:last-child dd')).whiteSpace,empty:document.querySelector('[aria-labelledby="summary-media-title"] p')?.textContent,controls:summary.querySelectorAll('button,input,select,textarea,iframe').length,experience:document.querySelector('[aria-labelledby="summary-experience-title"]').textContent,category:document.querySelector('[name="type"]:checked').closest('label').querySelector('[id$="-label"]').textContent,mediaImages:document.querySelectorAll('[aria-labelledby="summary-media-title"] img').length};
  });
  assert.deepEqual(info.titles,copy[locale].titles);assert.equal(info.story,story);assert.equal(info.whiteSpace,'pre-wrap');assert.equal(info.controls,0);assert.ok(info.experience.includes(info.category));
  for(const name of roleNames(category))assert.ok(info.experience.includes(professionalValues[name]));
  for(const image of info.rows){assert.ok(image.alt);assert.ok(image.sameFinalFile,'summary shows the confirmed File used by FileField');assert.equal(image.type,'image/jpeg');assert.equal(image.revoked,0);assert.equal(image.fit,'fill','no object-cover visual crop');assert.ok(Math.abs(image.ratio-image.width/image.height)<.01,'natural file ratio preserved');assert.equal(image.width,image.name==='avatar'?720:1080);assert.equal(image.height,image.name==='avatar'?720:608);}
  assert.equal(info.mediaImages,hasCapture?1:0,'avatar never repeated in media');
  if(!hasCapture)assert.equal(info.empty,copy[locale].empty);
  return info.rows.map(x=>x.src);
 }
 async function screenshot(name,{elementClip=false,height,source}={}){
  if(height){captures.push(await cropScreenshot(name,source??name.replace('-top.png','.png'),height));return;}
  // Keep viewport width in CSS pixels: the image shows the actual surrounding gutters.
  // Element-only clips are retained solely for the diagnostic comparison.
  // Warm each summary region before an offscreen full-height capture, then
  // verify painted text: correct DOM geometry alone does not validate a PNG.
  await ev(async()=>{const summary=document.querySelector('[aria-labelledby="testimonial-summary-title"]'),r=summary.getBoundingClientRect(),start=r.top+scrollY;for(let y=start;y<start+r.height;y+=Math.max(200,innerHeight/2)){window.scrollTo(0,y);await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));}window.scrollTo(0,0);await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));});
  const before=await layoutProbe();
  const rect=await ev((elementClip,height)=>{const r=document.querySelector('[aria-labelledby="testimonial-summary-title"]').getBoundingClientRect();return{x:elementClip?r.x+scrollX:0,y:r.y+scrollY,width:elementClip?r.width:innerWidth,height:height??r.height,scale:1};},elementClip,height);
  const metrics=await cdp('Page.getLayoutMetrics');
  const shot=await cdp('Page.captureScreenshot',{format:'png',fromSurface:true,captureBeyondViewport:true,clip:rect});
  const png=Buffer.from(shot.data,'base64');
  const dimensions={width:png.readUInt32BE(16),height:png.readUInt32BE(20)};
  assert.ok(Math.abs(dimensions.width-rect.width)<=1&&Math.abs(dimensions.height-rect.height)<=1,'PNG dimensions match CSS clip at scale 1');
  const lines=await ev(()=>[...document.querySelectorAll('[aria-labelledby="testimonial-summary-title"] :is(h5,dt,dd,p,figcaption)')].flatMap(e=>{const walker=document.createTreeWalker(e,NodeFilter.SHOW_TEXT),rects=[];while(walker.nextNode()){for(const word of walker.currentNode.textContent.matchAll(/\S+/g)){const range=document.createRange();range.setStart(walker.currentNode,word.index);range.setEnd(walker.currentNode,word.index+word[0].length);for(const r of range.getClientRects())if(r.width>1&&r.height>1)rects.push({x:r.x+scrollX,y:r.y+scrollY,width:r.width,height:r.height});}}return rects;}));
  const sharp=createRequire(require.resolve('next/package.json'))('sharp'),raw=await sharp(png).ensureAlpha().raw().toBuffer();
  for(const [index,line] of lines.entries()){
   let painted=false;
   for(let y=Math.max(0,Math.floor(line.y-rect.y));y<Math.min(dimensions.height,Math.ceil(line.y-rect.y+line.height))&&!painted;y++)for(let x=Math.max(0,Math.floor(line.x-rect.x));x<Math.min(dimensions.width,Math.ceil(line.x-rect.x+line.width));x++){
    const offset=(y*dimensions.width+x)*4;if(raw[offset]>110&&raw[offset+1]>110&&raw[offset+2]>110){painted=true;break;}
   }
   assert.ok(painted,'screenshot contains painted text for fragment '+index+' in '+name);
  }
  // Chrome restores its temporary capture surface asynchronously after the reply.
  await ev(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  const after=await layoutProbe();
  for(const key of ['innerWidth','rootFont','scrollWidth','visualScale'])assert.equal(after.viewport[key],before.viewport[key],'screenshot preserves '+key);
  // Full-height capture may suppress the scrollbar. Its gutter remains reserved;
  // compare actual element geometry rather than requiring equal clientWidth.
  assert.ok(after.viewport.clientWidth>=before.viewport.clientWidth&&after.viewport.clientWidth<=before.viewport.innerWidth,'capture clientWidth stays within scrollbar-gutter bounds');
  for(const [name,element] of Object.entries(before.elements)){
   assert.deepEqual(after.elements[name].css,element.css,'screenshot preserves computed styles');
   // The full-height capture surface can grow flex main/min-height:100dvh.
   // Reflow is checked on every width and on the summary's own text/card heights.
   const keys=['x','width','contentWidth',...(['summary','personal','experience','media','title','story'].includes(name)?['height']:[])];
   for(const key of keys)assert.ok(Math.abs(after.elements[name][key]-element[key])<=1,'screenshot preserves geometry within one CSS pixel: '+name+' '+key+' '+element[key]+' -> '+after.elements[name][key]);
  }
  captures.push({name,kind:'document clip',paintedTextFragments:lines.length,clip:rect,png:dimensions,cssLayoutViewport:metrics.cssLayoutViewport,cssVisualViewport:metrics.cssVisualViewport,captureSurfaceViewport:after.viewport,layout:before,afterCapture:after});
  await writeFile(join(output,name),png);
 }
 async function layoutProbe(){return ev(()=>{
  const selectors={main:'main',container:'main > div',form:'form',fieldset:'form > fieldset:nth-of-type(5)',summary:'[aria-labelledby="testimonial-summary-title"]',personal:'[aria-labelledby="summary-personal-title"]',experience:'[aria-labelledby="summary-experience-title"]',media:'[aria-labelledby="summary-media-title"]',title:'#summary-personal-title',story:'[aria-labelledby="summary-experience-title"] dl > div:last-child dd'};
  const elements=Object.fromEntries(Object.entries(selectors).map(([name,sel])=>{const e=document.querySelector(sel),r=e.getBoundingClientRect(),s=getComputedStyle(e);return[name,{x:r.x,width:r.width,height:r.height,contentWidth:e.clientWidth-parseFloat(s.paddingLeft)-parseFloat(s.paddingRight),css:Object.fromEntries(['width','minWidth','maxWidth','paddingLeft','paddingRight','marginLeft','marginRight','gap','display','gridTemplateColumns','flexDirection','flexShrink','fontSize','lineHeight','overflowWrap','wordBreak'].map(k=>[k,s[k]]))}];}));
  return{viewport:{innerWidth,clientWidth:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth,visualWidth:visualViewport.width,visualScale:visualViewport.scale,rootFont:getComputedStyle(document.documentElement).fontSize,remPixels:parseFloat(getComputedStyle(document.documentElement).fontSize)},elements};
 });}
 async function diagnose(){
  const measurements=[];
  for(const width of [320,375,768,1440])for(const scale of [1,2]){
   await cdp('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});
   await ev(scale=>{document.documentElement.style.fontSize=16*scale+'px';window.scrollTo(0,0);},scale);await pause(120);
   const before=await layoutProbe();
   if(width===320&&scale===2){
    await screenshot('diagnostic-pt-320-200-element-clip.png',{elementClip:true});
    const afterElementClip=await layoutProbe();
    await screenshot('diagnostic-pt-320-200-viewport-clip.png');
    await screenshot('diagnostic-pt-320-200-viewport-top.png',{height:1200,source:'diagnostic-pt-320-200-viewport-clip.png'});
    measurements.push({width,fontPercent:200,before,afterElementClip,afterViewportClip:await layoutProbe()});
   }else measurements.push({width,fontPercent:scale*100,before});
  }
  await writeFile(join(output,'layout-diagnostic.json'),JSON.stringify(measurements,null,2)+'\n');
  await writeFile(join(output,'diagnostic-captures.json'),JSON.stringify(captures,null,2)+'\n');
  console.log(JSON.stringify({diagnosis:measurements.map(x=>({width:x.width,fontPercent:x.fontPercent,viewport:x.before.viewport,summary:x.before.elements.summary.width,card:x.before.elements.personal.width,content:x.before.elements.personal.contentWidth,titleFont:x.before.elements.title.css.fontSize}))}));
 }
 async function responsive(locale,category,hasCapture){
  const checks=[];
  for(const width of [320,375,768,1440])for(const scale of [1,2]){
   await cdp('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});
   await ev(scale=>{document.documentElement.style.fontSize=16*scale+'px';},scale);await pause(90);
   assert.ok(await ev(()=>{const w=document.documentElement.clientWidth,root=document.querySelector('[aria-labelledby="testimonial-summary-title"]');return document.documentElement.scrollWidth<=w&&[...root.querySelectorAll('section,img,dd')].every(e=>{const r=e.getBoundingClientRect();return r.left>=0&&r.right<=w+1;});}),'summary fits '+locale+' '+category+' '+width+' '+scale);
   await summaryProbe(locale,category,hasCapture);
   const layout=await layoutProbe();
   const reading=await ev(()=>{
    const cards=[...document.querySelectorAll('[aria-labelledby="testimonial-summary-title"] > section')];
    const splitTitleWords=[];
    for(const card of cards){const title=card.querySelector('h5'),text=title.firstChild;for(const match of text.textContent.matchAll(/\S+/g)){const range=document.createRange();range.setStart(text,match.index);range.setEnd(text,match.index+match[0].length);if(new Set([...range.getClientRects()].map(r=>Math.round(r.top))).size>1)splitTitleWords.push(match[0]);}}
    const story=document.querySelector('[aria-labelledby="summary-experience-title"] dl > div:last-child dd');
    return{splitTitleWords,storyEms:story.clientWidth/parseFloat(getComputedStyle(story).fontSize)};
   });
   assert.deepEqual(reading.splitTitleWords,[],'ordinary heading words remain whole');
   assert.ok(reading.storyEms>=7,'at least seven em of usable story width, not just no overflow');
   checks.push({width,fontPercent:scale*100,hasCapture,reading,layout});
   if(hasCapture&&scale===1&&locale==='es'&&width===1440&&category!=='first_job')await screenshot('es-'+category+'-1440.png');
   if(category==='first_job'&&((locale==='es'&&width===375&&scale===1)||(locale==='en'&&width===1440&&scale===1)||(locale==='pt'&&[320,375,768].includes(width)))){
    const name=locale+'-'+width+'-'+(scale===2?'200':'100')+'-'+(hasCapture?'present':'absent');
    await screenshot(name+'.png');
    if(locale==='pt'&&width===320&&scale===2)await screenshot(name+'-top.png',{height:1200});
   }
  }
  await ev(()=>document.documentElement.style.removeProperty('font-size'));
  await cdp('Emulation.setDeviceMetricsOverride',{width:375,height:1000,deviceScaleFactor:1,mobile:false});
  return checks;
 }
 async function language(code){
  await click('[data-form-language-trigger]');
  const selector=await ev(code=>{const e=[...document.querySelectorAll('[role="option"]')].find(e=>e.textContent.trim()===({es:'ES',en:'EN',pt:'PT'})[code]);e.setAttribute('data-qa-language','');return '[data-qa-language]';},code);
  await click(selector);await until(()=>ev(code=>document.querySelector('main').lang===(code==='pt'?'pt-BR':code),code),'locale switched');
 }
 async function mock(response,category,hasCapture){
  expectAction=true;await click('button[type="submit"]');await until(()=>pendingAction!==null,'intercepted submit');
  assert.ok(await ev(hasCapture=>{const payload=window.__qaPayloads.at(-1),avatar=document.querySelector('[aria-labelledby="summary-personal-title"] img'),capture=document.querySelector('[aria-labelledby="summary-media-title"] img');return payload.avatar===window.__qaUrls.get(avatar.src).file&&(hasCapture?payload.capture===window.__qaUrls.get(capture.src).file:!('capture'in payload));},hasCapture),'payload contains exactly the files displayed');
  const payload=await ev(()=>{const p=window.__qaPayloads.at(-1);return{keys:Object.keys(p).sort(),type:p.type,story:p.story,consent:p.consent};});
  assert.deepEqual(payload.keys,['type','full_name','country','email','story',...roleNames(category),'video_url','instagram','linkedin','avatar','consent',...(hasCapture?['capture']:[])].sort());
  assert.equal(payload.type,category);assert.equal(payload.story,story);assert.equal(payload.consent,'1');
  await cdp('Fetch.fulfillRequest',{requestId:pendingAction,responseCode:200,responseHeaders:[{name:'content-type',value:'text/x-component'}],body:Buffer.from('0:'+JSON.stringify({a:response,f:''})+'\n').toString('base64')});
  pendingAction=null;expectAction=false;await until(()=>ev(()=>!document.querySelector('form')||!document.querySelector('button[type="submit"]').disabled),'mock completed');
 }
 await mkdir(output,{recursive:true});
 for(const locale of ['es','en','pt'])for(const category of ['simulation','first_job','career_change']){
  if(diagnosis&&(locale!=='pt'||category!=='first_job'))continue;
  await setup(locale,375,category);
  const original=(await snap()).fields;assert.equal(original.story,'');
  for(const name of roleNames(category))await type(name,professionalValues[name]);
  await type('story',story);await earlier(2);
  await replace('full_name','Persona de pruebas QA con un nombre suficientemente largo para comprobar la lectura en dispositivos móviles');
  await next();await next();
  await type('video_url','https://youtu.be/abcdefghijk?contexto='+('experiencia').repeat(12));await type('instagram','@persona_qa');await type('linkedin','https://www.linkedin.com/in/persona-qa');
  await next();
  await summaryProbe(locale,category,false);
  if(locale==='es'&&category==='first_job')await screenshot('es-375-absent.png');
  const absentSizes=diagnosis?[]:await responsive(locale,category,false);
  await earlier(4);await liveCount(1);await choose('capture',0);await confirm();await next();
  const firstUrls=await summaryProbe(locale,category,true);
  if(diagnosis){await diagnose();break;}
  const sizes=[...absentSizes,...await responsive(locale,category,true)];
  const beforeLocale=await ev(()=>[...document.querySelectorAll('[aria-labelledby="testimonial-summary-title"] img')].map(e=>e.src));
  const otherLocale=locale==='en'?'pt':'en';await language(otherLocale);await summaryProbe(otherLocale,category,true);await language(locale);
  assert.deepEqual(await ev(()=>[...document.querySelectorAll('[aria-labelledby="testimonial-summary-title"] img')].map(e=>e.src)),beforeLocale,'locale changes never allocate new image resources');
  await earlier(2);await liveCount(2);
  assert.ok(await ev(urls=>urls.every(url=>window.__qaUrls.get(url).revokes===1),firstUrls),'summary URLs revoked on leaving step 5');
  await choose('avatar',1);await cancel();await liveCount(2);await next();await next();await next();
  await summaryProbe(locale,category,true);
  assert.ok(await ev(url=>{const current=document.querySelector('[aria-labelledby="summary-personal-title"] img');return window.__qaUrls.get(current.src).file===window.__qaUrls.get(url).file;},firstUrls[0]),'cancelled avatar replacement keeps the confirmed file');
  await earlier(2);await choose('avatar',1);await confirm();await next();await next();await next();await summaryProbe(locale,category,true);
  assert.ok(await ev(url=>{const current=document.querySelector('[aria-labelledby="summary-personal-title"] img');return window.__qaUrls.get(current.src).file!==window.__qaUrls.get(url).file;},firstUrls[0]),'confirmed avatar replacement updates the summary');
  await earlier(4);await choose('capture',1);await cancel();await liveCount(2);await next();await summaryProbe(locale,category,true);
  assert.ok(await ev(url=>{const current=document.querySelector('[aria-labelledby="summary-media-title"] img');return window.__qaUrls.get(current.src).file===window.__qaUrls.get(url).file;},firstUrls[1]),'cancelled capture replacement keeps the confirmed file');
  await earlier(4);await choose('capture',1);await confirm();await next();await summaryProbe(locale,category,true);
  assert.ok(await ev(url=>{const current=document.querySelector('[aria-labelledby="summary-media-title"] img');return window.__qaUrls.get(current.src).file!==window.__qaUrls.get(url).file;},firstUrls[1]),'confirmed capture replacement updates the summary');
  await back();await ev(()=>{document.querySelector('[name="capture"]').closest('[data-field]').querySelector('button').setAttribute('data-qa-remove','');});await click('[data-qa-remove]');await liveCount(1);await next();await summaryProbe(locale,category,false);
  const hasCapture=category!=='simulation';
  if(hasCapture){await earlier(4);await choose('capture',2);await confirm();await next();await summaryProbe(locale,category,true);}
  await click('[name="consent"]');const stable=await ev(()=>[...document.querySelectorAll('[aria-labelledby="testimonial-summary-title"] img')].map(e=>e.src));
  await mock({status:'error',issue:{code:'submit.saveFailed'}},category,hasCapture);
  assert.ok(await ev(()=>!!document.querySelector('form [role="alert"]')),'server errors still visible outside the summary');
  assert.deepEqual(await ev(()=>[...document.querySelectorAll('[aria-labelledby="testimonial-summary-title"] img')].map(e=>e.src)),stable,'server response never remounts unchanged previews');
  await mock({status:'success'},category,hasCapture);await until(()=>ev(()=>!document.querySelector('form')),'mock success');await liveCount(0);
  assert.ok(await ev(()=>[...window.__qaUrls.values()].every(x=>x.revokes===1)),'all URL resources revoked exactly once after success');
  reports.push({locale,category,result:'PASS',responsive:sizes,finalFileIdentity:true,naturalRatio:true,optionalPresentAbsent:true,replacementsAndCancellation:true,localeUrlStability:true,cleanup:'all created URLs revoked once',payloadUnchanged:true});
  console.log(JSON.stringify({progress:reports.length,locale,category}));
 }
 if(diagnosis){assert.equal(blockedPosts,0);assert.equal(blockedExternal,0);assert.equal(errors.length,0);}
 else {
 assert.equal(blockedPosts,18);assert.equal(blockedExternal,0);assert.equal(errors.length,0);
 const report={result:'PASS',reports,captures,blockedPosts,realSubmissions:0,blockedExternal,browserExceptionCount:errors.length,manual:'Screen reader, physical devices and native browser zoom remain manual. Root font scaling also scales rem spacing; it is not text-only zoom or native page zoom. Viewport-wide CDP clips at scale 1 retain gutters; PNG dimensions and DOM geometry are verified. All photographs are synthetic canvas fixtures.'};
 await writeFile(join(output,'qa-results.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({...report,reports:reports.map(r=>({locale:r.locale,category:r.category,responsive:r.responsive.length})),captures:captures.length}));
 }
} catch(e){console.log(JSON.stringify({result:'FAILED',error:e.message,completed:reports.map(r=>({locale:r.locale,category:r.category})),blockedPosts,blockedExternal,browserExceptionCount:errors.length}));process.exitCode=1;}
finally{
 if(cdp&&socket?.readyState===WebSocket.OPEN){try{await cdp('Browser.close');}catch{}}
 socket?.close();for(const p of pending.values()){clearTimeout(p.timer);p.r({});}pending.clear();
 if(chrome&&!chrome.killed)chrome.kill();if(server&&!server.killed)server.kill();
 if(profile){if(dirname(resolve(profile))!==resolve(tmpdir())||!basename(profile).startsWith('testimonios-summary-'))throw Error('Unexpected temp path');await rm(profile,{recursive:true,force:true,maxRetries:15,retryDelay:200});}
 console.log(JSON.stringify({cleanup:'own server/browser closed; temporary profile removed'}));
}
