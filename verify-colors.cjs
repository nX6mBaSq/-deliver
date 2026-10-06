const {chromium}=require('C:/Users/tryha/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs');
const assert=require('node:assert/strict');
const phase=process.argv[2]||'after';
const dir=`design-preview/colors/${phase}`;
fs.mkdirSync(dir,{recursive:true});
async function contrast(page){return page.evaluate(()=>{
 const rgb=s=>{const n=s.match(/[\d.]+/g)?.map(Number);return n?.length>=3?[...n.slice(0,3),n[3]??1]:null};
 const blend=(f,b)=>f.slice(0,3).map((v,i)=>v*f[3]+b[i]*(1-f[3]));
 const lum=c=>c.slice(0,3).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0);
 const failures=[],unknown=[],pairs=new Map();let checked=0;
 for(const e of document.querySelectorAll('body *')){
  if(!e.checkVisibility({checkOpacity:true,checkVisibilityCSS:true})||e.closest('.visually-hidden,.skip-link,script,style'))continue;
  const text=(e.matches('input,textarea')?e.value:[...e.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent.trim()).join('')).trim();if(!text)continue;
  const c=getComputedStyle(e);let bgs=[[255,255,255]],image=false;
  const ancestors=[];for(let a=e;a;a=a.parentElement)ancestors.unshift(a);
  // Color-only gradients are measured conservatively: the text is checked against every stop.
  for(const a of ancestors){const s=getComputedStyle(a),col=rgb(s.backgroundColor);if(col)bgs=bgs.map(b=>blend(col,b));
   if(s.backgroundImage==='none')continue;if(/url\(/.test(s.backgroundImage)){image=true;continue;}
   const stops=(s.backgroundImage.match(/rgba?\([^)]*\)/g)||[]).map(rgb);bgs=bgs.flatMap(b=>stops.map(st=>blend(st,b)));}
  if(image){unknown.push({class:e.className,text:text.slice(0,45)});continue;}
  const fg=rgb(c.color);if(!fg)continue;
  let ratio=Infinity,bg;for(const b of bgs){const l1=lum(blend(fg,b)),l2=lum(b),r=(Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05);if(r<ratio){ratio=r;bg=b;}}
  const min=parseFloat(c.fontSize)>=24||(parseFloat(c.fontSize)>=18.66&&parseInt(c.fontWeight)>=700)?3:4.5;
  const item={class:e.className,text:text.slice(0,55),foreground:c.color,background:bg,ratio:+ratio.toFixed(2),min};
  checked++;pairs.set(`${c.color}/${bg}/${min}`,item);if(ratio+.01<min)failures.push(item);
 }
 return {checked,failures,unknown,pairs:[...pairs.values()]};
});}
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});const page=await browser.newPage();const report={};
 try{
  for(const width of [390,1440])for(const file of ['index.html','company.html','important-notes.html','privacy-policy.html']){
   await page.setViewportSize({width,height:900});await page.goto(`http://127.0.0.1:8765/${file}`);
   await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(async i=>{i.loading='eager';await i.decode()}));});
   const layout=await page.evaluate(()=>({text:document.querySelector('main').textContent.replace(/\s/g,''),boxes:[...document.querySelectorAll('main>section,main h1,main h2,.features__toggle,.hero__primary,.contact-method')].map(e=>{const r=e.getBoundingClientRect();return {class:e.className,x:r.x,y:r.y,w:r.width,h:r.height}})}));
   report[`${file}-${width}`]={layout,normal:await contrast(page)};
   await page.screenshot({path:`${dir}/${file.replace('.html','')}-${width}.png`,fullPage:true});
   if(file==='index.html'){
    for(const id of ['hero','price2','features','strengths','cta'])await page.locator('#'+id).screenshot({path:`${dir}/${id}-${width}.png`,style:'.header,.mobile-contact{visibility:hidden}'});
    for(const b of await page.locator('.features__toggle,.faq__question').all())await b.click();
    report[`${file}-${width}`].expanded=await contrast(page);
    if(phase==='polish'){
     await page.locator('#load-planner summary').click();
     report[`${file}-${width}`].plannerEmpty=await contrast(page);
     await page.locator('[name="fridge"]').fill('1');
     report[`${file}-${width}`].plannerFilled=await contrast(page);
     await page.locator('#load-planner summary').click();
    }
    await page.locator('#features-loadex-detail').screenshot({path:`${dir}/loadex-${width}.png`,style:'.header,.mobile-contact{visibility:hidden}'});
    if(width===390){await page.locator('[data-nav-open]').click();report[`${file}-${width}`].menu=await contrast(page);await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.querySelector('#nav-drawer').open);}
    if(phase!=='before')for(const sel of ['.hero__primary','.features__toggle','.faq__question','.cta .btn--form','.cta .btn--tel']){
     await page.locator(sel).first().hover();report[`${file}-${width}`]['hover-'+sel]=await contrast(page);
     await page.mouse.move(0,0);await page.keyboard.press('Tab');await page.locator(sel).first().focus();assert(await page.locator(sel).first().evaluate(e=>getComputedStyle(e).outlineStyle!=='none'),`Visible keyboard focus: ${sel}`);
    }
   }
  }
  fs.writeFileSync(`${dir}/report.json`,JSON.stringify(report,null,2));
  let bad=0;
  for(const [key,states] of Object.entries(report))for(const [state,result] of Object.entries(states))if(state!=='layout'){
   console.log(`${key} ${state}: ${result.checked} text nodes, ${result.failures.length} low-contrast, ${result.unknown.length} backgrounds to inspect`);
   if(result.failures.length)console.log(JSON.stringify(result.failures.slice(0,12)));bad+=result.failures.length;
  }
  if(phase!=='before'){
   assert.equal(bad,0,'All sampled visible text must meet size-appropriate contrast');
   for(const states of Object.values(report))for(const [name,state] of Object.entries(states))if(name!=='layout')assert.equal(state.unknown.length,0,'No unmeasured image/gradient backgrounds behind sampled text');
   if(phase==='after'){
    const before=JSON.parse(fs.readFileSync('design-preview/colors/before/report.json','utf8'));
    for(const key in report)assert.deepEqual(report[key].layout,before[key].layout,`${key}: color changes must preserve wording and geometry`);
    console.log('All four pages: wording and measured layout unchanged.');
   }
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
