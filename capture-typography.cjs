const { chromium } = require('C:/Users/tryha/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const phase = process.argv[2] || 'after';
const root = 'design-preview/typography';

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage();
  const report = {};
  const dir = `${root}/${phase}`;
  fs.mkdirSync(dir, { recursive: true });
  try {
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const file of ['index.html', 'company.html', 'important-notes.html', 'privacy-policy.html']) {
        await page.goto(`http://127.0.0.1:8765/${file}`);
        await page.evaluate(() => document.fonts.ready);
        report[`${file}-${width}`] = await page.evaluate(() => {
          const items = [];
          const selectors = 'main h1,main h2:not(.policy__article-title),.article-subject,main h3,.faq__question-text,.process__desc,.features__desc,.section-intro,.service-facts dd,.area__desc,.booking-notes>p,.cta__desc,.contact-method small,.document-lead,.message__body,.message__catch,.policy__article-body,.policy__list>li,.policy__sublist>li,.important-notes__item';
          for (const element of document.querySelectorAll(selectors)) {
            if (!element.checkVisibility()) continue;
            const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
            const rows = new Map();
            while (walker.nextNode()) {
              const node = walker.currentNode;
              for (let i = 0; i < node.length; i++) {
                if (!node.textContent[i].trim()) continue;
                const range = document.createRange();
                range.setStart(node, i); range.setEnd(node, i + 1);
                const rect = range.getBoundingClientRect();
                if (!rect.width || !rect.height) continue;
                const key = Math.round(rect.top);
                rows.set(key, (rows.get(key) || '') + node.textContent[i]);
              }
            }
            const lines = [...rows.entries()].sort((a,b)=>a[0]-b[0]).map(r=>r[1]);
            const style = getComputedStyle(element);
            items.push({ tag: element.tagName, class: element.className, size: style.fontSize, weight: style.fontWeight, leading: style.lineHeight, lines });
          }
          return { text: document.body.textContent.replace(/\s+/g, ''), items };
        });
        await page.screenshot({ path: `${dir}/${file.replace('.html','')}-${width}.png` });
        if(file === 'index.html') {
          for (const id of ['service','price2','features','strengths','step','qa','cta']) {
            await page.locator(`#${id}`).screenshot({path:`${dir}/${id}-${width}.png`,style:'.header,.mobile-contact { visibility: hidden; }'});
          }
          await page.locator('.faq__question').first().click();
          await page.locator('#qa').screenshot({path:`${dir}/faq-open-${width}.png`,style:'.header,.mobile-contact { visibility: hidden; }'});
          await page.locator('.features__toggle').first().click();
          await page.locator('#features-spec-detail').screenshot({path:`${dir}/spec-open-${width}.png`,style:'.header,.mobile-contact { visibility: hidden; }'});
        }
        if(file === 'company.html') await page.locator('#message').screenshot({path:`${dir}/message-${width}.png`,style:'.header,.mobile-contact { visibility: hidden; }'});
        if(file === 'privacy-policy.html') await page.locator('#article-3').screenshot({path:`${dir}/policy-text-${width}.png`,style:'.header,.mobile-contact { visibility: hidden; }'});
      }
    }
    fs.writeFileSync(`${dir}/report.json`, JSON.stringify(report,null,2));
    if (phase === 'after') {
      const before = JSON.parse(fs.readFileSync(`${root}/before/report.json`, 'utf8'));
      for(const key in report) assert.equal(report[key].text, before[key].text, `${key}: all original text preserved`);
      console.log('All four pages: wording, numbers and content order preserved.');
    }
    for(const [key,{items}] of Object.entries(report)) {
      const shortEndings = items.filter(item => item.lines.length > 1 && item.lines.at(-1).length <= 4);
      console.log(key + ': ' + JSON.stringify(shortEndings.map(item=>({class:item.class,lines:item.lines}))));
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
