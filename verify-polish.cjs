const {chromium}=require('C:/Users/tryha/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const dir='design-preview/polish';fs.mkdirSync(dir,{recursive:true});
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const context=await browser.newContext({permissions:['clipboard-read','clipboard-write']});
 const page=await context.newPage();const result=[],errors=[];page.on('pageerror',e=>errors.push(e.message));
 const goto=async(width,file='index.html')=>{await page.setViewportSize({width,height:900});await page.goto('http://127.0.0.1:8765/'+file);await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(async i=>{i.loading='eager';await i.decode()}));});};
 const overflow=()=>page.evaluate(()=>{const bad=[];if(document.documentElement.scrollWidth>innerWidth)bad.push('page');for(const e of document.querySelectorAll('main p, main h1, main h2, main h3, main input, main label, main button, main summary'))if(e.checkVisibility()&&e.scrollWidth>e.clientWidth+2)bad.push(e.className||e.tagName);return bad;});
 try{
  for(const width of [320,390,768,1100,1440]){
   await goto(width);await page.locator('#load-planner summary').click();
   assert(await page.locator('[data-copy-note]').isDisabled());
   await page.locator('[name="fridge"]').fill('1');await page.locator('[name="boxes"]').fill('12');await page.locator('#planner-extra').fill('自転車1台');
   const memo=await page.locator('#planner-note').inputValue();assert(memo.includes('冷蔵庫（2ドア）：1台')&&memo.includes('ダンボール：12個')&&memo.includes('自転車1台'));
   await page.locator('[data-copy-note]').click();assert.equal((await page.evaluate(()=>navigator.clipboard.readText())).replace(/\r\n/g,'\n'),memo);
   assert((await page.locator('[data-planner-status]').textContent()).includes('コピーしました'));
   await page.locator('[name="boxes"]').fill('-1');assert(await page.locator('[data-copy-note]').isDisabled());assert((await page.locator('[data-planner-status]').textContent()).includes('0〜999'));assert.equal(await page.locator('[name="boxes"]').getAttribute('aria-invalid'),'true');
   await page.locator('[name="boxes"]').fill('1.5');assert(await page.locator('[data-copy-note]').isDisabled());
   await page.locator('[name="boxes"]').fill('1000');assert(await page.locator('[data-copy-note]').isDisabled());
   await page.locator('[name="boxes"]').fill('20');assert.deepEqual(await overflow(),[],`Planner @ ${width}`);
   if([390,1440].includes(width))await page.locator('#load-planner').screenshot({path:`${dir}/planner-${width}.png`,style:'.header,.mobile-contact{visibility:hidden}'});
   await page.addStyleTag({content:'html{font-size:200%}'});assert.deepEqual(await overflow(),[],`Planner 200% @ ${width}`);
   await page.locator('[type="reset"]').click();await page.waitForFunction(()=>document.querySelector('[data-copy-note]').disabled);assert.equal(await page.locator('[name="fridge"]').inputValue(),'0');assert.equal(await page.locator('#planner-extra').inputValue(),'');
   result.push(`Planner quantities, invalid input, copy, reset, 200% reflow @ ${width}px: OK`);
  }
  await goto(390);await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:()=>Promise.reject(Error('denied'))}}));await page.locator('#load-planner summary').click();await page.locator('[name="washer"]').fill('1');await page.locator('[data-copy-note]').click();assert((await page.locator('[data-planner-status]').textContent()).includes('端末のコピー'));assert(await page.locator('#planner-note').evaluate(e=>e.selectionEnd===e.value.length&&e===document.activeElement));result.push('Clipboard denied: manual selection fallback OK');
  for(const width of [390,768,1440]){
   await goto(width);
   for(const id of ['hero','service','features','step','cta'])await page.locator('#'+id).screenshot({path:`${dir}/${id}-${width}.png`,style:'.header,.mobile-contact{visibility:hidden}'});
   await page.screenshot({path:`${dir}/index-${width}.png`,fullPage:true});
   for(const file of ['company.html','important-notes.html','privacy-policy.html']){await goto(width,file);await page.screenshot({path:`${dir}/${file.replace('.html','')}-${width}.png`,fullPage:true});}
  }
  const nojs=await browser.newContext({javaScriptEnabled:false});const staticPage=await nojs.newPage();await staticPage.setViewportSize({width:390,height:844});await staticPage.goto('http://127.0.0.1:8765/index.html');assert(await staticPage.locator('#features-spec-detail').isVisible());assert(await staticPage.locator('#features-loadex-detail').isVisible());assert(await staticPage.locator('#faq-answer-1').isVisible());assert(await staticPage.locator('.hero__primary').isVisible());await nojs.close();result.push('JavaScript disabled: core content, details, FAQ, contact remain available');
  await page.route('**/fonts/*.woff2',r=>r.abort());await goto(320);assert.deepEqual(await overflow(),[],'Fallback font');result.push('Local fonts blocked @ 320px: readable without overflow');
  await page.emulateMedia({media:'print'});assert(await page.locator('#features-spec-detail').isVisible());assert.equal(await page.locator('.mobile-contact').isVisible(),false);result.push('Print: disclosure content available, fixed navigation hidden');
  assert.deepEqual(errors,[]);fs.writeFileSync(`${dir}/check.txt`,result.join('\n')+'\n');console.log(result.join('\n'));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
