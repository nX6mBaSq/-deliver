const { chromium } = require('C:/Users/tryha/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('node:fs');
const phase = process.argv[2] || 'after';
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage();
  const result = {};
  const dir = `design-preview/layout/${phase}`;
  fs.mkdirSync(dir, { recursive: true });
  try {
    for (const width of [390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const file of ['index.html', 'company.html', 'important-notes.html', 'privacy-policy.html']) {
        await page.goto(`http://127.0.0.1:8765/${file}`);
        await page.evaluate(() => document.fonts.ready);
        result[`${file}-${width}`] = await page.evaluate(() => {
          const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
          const texts = [];
          while(walker.nextNode()) {
            const text = walker.currentNode.textContent.replace(/\s+/g, ' ').trim();
            if(text) texts.push(text);
          }
          return { height: document.documentElement.scrollHeight, text: texts.sort(), heroCta: document.querySelector('.hero__primary')?.getBoundingClientRect().top };
        });
        await page.screenshot({ path: `${dir}/${file.replace('.html','')}-${width}-top.png` });
        if (width !== 768) await page.screenshot({ path: `${dir}/${file.replace('.html','')}-${width}.png`, fullPage: true });
      }
      await page.goto('http://127.0.0.1:8765/index.html');
      await page.evaluate(() => document.fonts.ready);
      for (const id of ['price2','features','strengths','step','qa','cta']) {
        await page.locator(`#${id}`).screenshot({path:`${dir}/${id}-${width}.png`,style:'.header,.mobile-contact { visibility: hidden; }'});
      }
    }
    fs.writeFileSync(`${dir}/measurements.json`, JSON.stringify(result, null, 2));
    console.log(Object.fromEntries(Object.entries(result).map(([k,v])=>[k,{height:v.height,heroCta:v.heroCta}])));
    if (phase === 'after') {
      const before = JSON.parse(fs.readFileSync('design-preview/layout/before/measurements.json'));
      const assert = require('node:assert/strict');
      for (const key in result) assert.deepEqual(result[key].text, before[key].text, `${key}: content must be preserved`);
      console.log('All page text preserved across layout changes.');
    }
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
