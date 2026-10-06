const { chromium } = require('C:/Users/tryha/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const origin = 'http://127.0.0.1:8765';
const files = ['index.html', 'company.html', 'important-notes.html', 'privacy-policy.html'];
const previewDir = process.env.DESIGN_PREVIEW_DIR || 'design-preview/structure';

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage();
  const pages = new Map();
  const results = [];
  try {
    for (const file of files) {
      await page.goto(`${origin}/${file}`);
      const state = await page.evaluate(() => ({
        ids: [...document.querySelectorAll('[id]')].map(e => e.id),
        links: [...document.querySelectorAll('a[href]')].map(e => e.href),
        assets: [...document.querySelectorAll('script[src], link[rel="stylesheet"]')].map(e => e.src || e.href),
        h1: document.querySelectorAll('h1').length,
        missingControls: [...document.querySelectorAll('[aria-controls]')].filter(e => !document.getElementById(e.getAttribute('aria-controls'))).length,
        emptySections: [...document.querySelectorAll('main > section')].filter(e => !e.querySelector('h1,h2')).length
      }));
      assert.equal(state.h1, 1, `${file}: one page heading`);
      assert.equal(new Set(state.ids).size, state.ids.length, `${file}: no duplicate IDs`);
      assert.equal(state.missingControls, 0, `${file}: disclosure targets exist`);
      assert.equal(state.emptySections, 0, `${file}: sections have headings`);
      pages.set(`/${file}`, state);
    }
    const assets = new Set();
    let internalLinks = 0;
    for (const [file, state] of pages) {
      for (const href of state.links) {
        const url = new URL(href);
        if (url.origin !== origin) continue;
        internalLinks++;
        assert(pages.has(url.pathname), `${file}: missing page ${href}`);
        if (url.hash) assert(pages.get(url.pathname).ids.includes(decodeURIComponent(url.hash.slice(1))), `${file}: missing anchor ${href}`);
      }
      for (const asset of state.assets) if (asset.startsWith(origin)) assets.add(asset);
    }
    for (const asset of assets) assert.equal((await page.request.get(asset)).status(), 200, `asset ${asset}`);
    results.push(`${internalLinks} internal links, all local styles/scripts, page headings, unique IDs and disclosure targets: OK`);

    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`${origin}/index.html`);
      await page.evaluate(() => document.fonts.ready);
      for (const href of ['#service', '#price2', '#features', '#step']) {
        await page.evaluate(hash => { location.hash = hash; }, href);
        const box = await page.locator(href).boundingBox();
        const header = await page.locator('.header').boundingBox();
        assert(box.y >= header.y + header.height && box.y < 900, `${href}: target visible below header at ${width}`);
      }
      await page.locator('a[href="company.html#message"]').first().click();
      assert.equal(new URL(page.url()).hash, '#message');
      assert(await page.locator('#message .message__body').isVisible(), 'Representative message remains accessible');
      await page.goto(`${origin}/important-notes.html`);
      await page.locator('.document-toc a[href="#cancel"]').click();
      const cancelBox = await page.locator('#cancel').boundingBox();
      const header = await page.locator('.header').boundingBox();
      assert(cancelBox.y >= header.y + header.height && cancelBox.y < 900, `Cancellation jump at ${width}`);
      results.push(`Section anchors, company message and cancellation destination @ ${width}px: OK`);
      await page.goto(`${origin}/index.html`);
      await page.locator('.mobile-contact__cta, .header__estimate').filter({ visible: true }).first().click();
      assert.equal(new URL(page.url()).hash, '#cta');
      assert.equal(await page.locator('#cta a[href^="https://docs.google.com/forms/"]').count(), 1);
      assert.equal(await page.locator('#cta a[href="tel:0568281105"]').count(), 1);
      results.push(`Contact destination and existing form/phone links @ ${width}px: OK (no submissions or calls)`);
      fs.mkdirSync(previewDir, { recursive: true });
      for (const selector of ['#service', '#features', '#step', '#qa', '#cta']) {
        await page.locator(selector).screenshot({ path: `${previewDir}/${selector.slice(1)}-${width}.png`, style: '.header,.mobile-contact { visibility: hidden; }' });
      }
    }
    fs.writeFileSync('navigation-check.txt', results.join('\n') + '\n');
    console.log(results.join('\n'));
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
