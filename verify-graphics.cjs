const { chromium } = require('C:/Users/tryha/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('node:fs');
const assert = require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const page=await browser.newPage();
 const dir='design-preview/graphics';fs.mkdirSync(dir,{recursive:true});
 try {
  for(const width of [390,768,1440]){
   await page.setViewportSize({width,height:900});
   await page.goto('http://127.0.0.1:8765/index.html');
   await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(async i=>{i.loading='eager';await i.decode()}));});
   assert.equal(await page.locator('main .image-placeholder').count(),0);
   assert.equal(await page.locator('img:not([alt])').count(),0);
   assert.equal(await page.locator('.capacity-examples .loadex__card').count(),2);
   assert(await page.locator('.capacity-dimensions').isVisible());
   assert(await page.locator('.capacity-examples').isVisible());
   for(const id of ['hero','service','price2','features','strengths','step']){
    await page.locator('#'+id).screenshot({path:`${dir}/${id}-${width}.png`,style:'.header,.mobile-contact{visibility:hidden}'});
   }
   await page.locator('.capacity-examples').screenshot({path:`${dir}/capacity-examples-${width}.png`,style:'.header,.mobile-contact{visibility:hidden}'});
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   console.log(`Graphics @ ${width}px: decoded, alternatives present, key dimensions and both load examples visible without overflow.`);
  }
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
