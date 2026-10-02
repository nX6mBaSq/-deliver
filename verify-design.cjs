const { chromium } = require('C:/Users/tryha/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  const results = [];
  const loadImages = () => page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map(async image => {
      image.loading = 'eager';
      try { await image.decode(); } catch (_) { /* Report failed images below. */ }
    }));
  });
  for (const width of [320, 375, 390, 480, 768, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    for (const file of ['index.html', 'company.html', 'important-notes.html', 'privacy-policy.html']) {
      await page.goto(`http://127.0.0.1:8765/${file}`);
      await loadImages();
      const state = await page.evaluate(() => ({
        width: innerWidth, scroll: document.documentElement.scrollWidth,
        missing: [...document.images].filter(i => !i.complete || !i.naturalWidth).map(i => i.src),
        animated: [...document.querySelectorAll('*')].filter(e => {
          const c = getComputedStyle(e);
          return c.animationName !== 'none' || c.transitionDuration.split(',').some(v => parseFloat(v) > 0);
        }).length,
        brokenAnchors: [...document.querySelectorAll('a[href^="#"]')].filter(a => !document.getElementById(a.hash.slice(1))).map(a => a.hash)
      }));
      assert.equal(state.scroll, width, `${file} overflow at ${width}`);
      assert.deepEqual(state.missing, [], `${file} images`);
      assert.deepEqual(state.brokenAnchors, [], `${file} anchors`);
      assert.equal(state.animated, 0, `${file} animations`);
      results.push(`${file} @ ${width}px: OK`);
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://127.0.0.1:8765/index.html');
  await loadImages();
  await page.locator('[data-nav-open]').click();
  assert.equal(await page.locator('#nav-drawer').evaluate(e => e.open), true);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#nav-drawer').evaluate(e => e.open), false);
  assert.equal(await page.locator('body').evaluate(e => e.style.overflow), '');
  await page.locator('[data-nav-open]').click();
  await page.locator('.nav-drawer__link[href="index.html#price2"]').click();
  assert.equal(await page.locator('#nav-drawer').evaluate(e => e.open), false);
  const feePosition = await page.locator('#price2').boundingBox();
  assert(feePosition.y >= 72, 'anchor must clear sticky header');
  for (const button of await page.locator('.features__toggle, .faq__question').all()) {
    const target = page.locator('#' + await button.getAttribute('aria-controls'));
    assert.equal(await target.isVisible(), false);
    await button.click();
    assert.equal(await target.isVisible(), true);
    assert.equal(await button.getAttribute('aria-expanded'), 'true');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), 390);
    await button.click();
    assert.equal(await target.isVisible(), false);
  }
  await page.goto('http://127.0.0.1:8765/index.html');
  await loadImages();
  fs.mkdirSync('design-preview', { recursive: true });
  await page.screenshot({ path: 'design-preview/preview-mobile-top.png' });
  await page.screenshot({ path: 'design-preview/preview-mobile.png', fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: 'design-preview/preview-desktop-top.png' });
  await page.screenshot({ path: 'design-preview/preview-desktop.png', fullPage: true });
  assert.deepEqual(errors, []);
  results.push('Menu open, Escape, menu anchor, header clearance, all accordions, no runtime errors: OK');
  fs.writeFileSync('design-check.txt', results.join('\n') + '\n');
  console.log(results.join('\n'));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
