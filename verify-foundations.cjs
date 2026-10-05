const { chromium } = require('C:/Users/tryha/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const previewDir = process.env.DESIGN_PREVIEW_DIR || 'design-preview';
fs.mkdirSync(previewDir, { recursive: true });
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage();
  const results = [];
  const files = ['index.html', 'company.html', 'important-notes.html', 'privacy-policy.html'];
  async function load(file, width) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`http://127.0.0.1:8765/${file}`);
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all([...document.images].map(async i => { i.loading = 'eager'; try { await i.decode(); } catch {} }));
    });
  }
  async function inspect(label) {
    const problems = await page.evaluate(() => {
      const problems = [];
      if (location.pathname.endsWith('/index.html')) {
        const copy = document.querySelector('.hero__copy');
        if (!copy || !copy.closest('.hero')) problems.push('hero content is outside hero');
      }
      if (document.documentElement.scrollWidth > innerWidth) problems.push('page overflow');
      for (const e of document.querySelectorAll('main p, main h1, main h2, main h3, main button, .btn, .header__logo, .header__menu-button')) {
        if (!e.checkVisibility() || !e.getClientRects().length) continue;
        if (e.scrollWidth > e.clientWidth + 2) problems.push(`clipped: ${e.className}`);
      }
      const logo = document.querySelector('.header__logo').getBoundingClientRect();
      const menu = document.querySelector('.header__menu-button').getBoundingClientRect();
      if (menu.width && logo.right > menu.left) problems.push('header overlap');
      const actions = [...document.querySelectorAll('.cta__buttons > *')];
      const boxes = actions.map(e => e.getBoundingClientRect());
      for (let i = 1; i < boxes.length; i++) {
        const prev = boxes[i - 1], curr = boxes[i];
        if (curr.top + 1 < prev.top || (Math.abs(curr.top - prev.top) < 1 && curr.left < prev.right)) problems.push('contact order/overlap');
      }
      return problems;
    });
    assert.deepEqual(problems, [], label);
    results.push(`${label}: OK`);
  }
  for (const width of [320, 700, 767, 768, 959, 960, 1099, 1100, 1199, 1200, 1440]) {
    await load('index.html', width);
    for (const button of await page.locator('.features__toggle, .faq__question').all()) await button.click();
    await inspect(`Expanded content @ ${width}px`);
    if (width === 768) await page.locator('#features-spec-detail').screenshot({
      path: `${previewDir}/foundations-details-768.png`,
      style: '.header,.mobile-contact { visibility: hidden; }'
    });
  }
  for (const file of files) {
    for (const width of [320, 768, 960, 1100, 1440]) {
      await load(file, width);
      if (file === 'index.html') for (const button of await page.locator('.features__toggle, .faq__question').all()) await button.click();
      await page.addStyleTag({ content: 'html { font-size: 200%; }' });
      await inspect(`${file}, 200% root font @ ${width}px`);
      await page.reload();
      await page.addStyleTag({ content: '* { line-height: 1.5 !important; letter-spacing: .12em !important; word-spacing: .16em !important; } p { margin-bottom: 2em !important; }' });
      if (file === 'index.html') for (const button of await page.locator('.features__toggle, .faq__question').all()) await button.click();
      await inspect(`${file}, custom text spacing @ ${width}px`);
    }
    for (const width of [390, 1440]) {
      await load(file, width);
      await page.screenshot({ path: `${previewDir}/foundations-${file.replace('.html', '')}-${width}.png`, fullPage: file !== 'index.html' });
      if (width === 390 && file !== 'index.html') await page.screenshot({ path: `${previewDir}/foundations-${file.replace('.html', '')}-top.png` });
    }
  }
  await load('index.html', 1440);
  for (const selector of ['#price2', '#strengths', '#cta']) {
    await page.locator(selector).screenshot({ path: `${previewDir}/foundations-${selector.slice(1)}-1440.png`, style: '.header,.mobile-contact { visibility: hidden; }' });
  }
  fs.writeFileSync('foundations-check.txt', results.join('\n') + '\n');
  console.log(results.join('\n'));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
