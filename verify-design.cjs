const { chromium } = require('C:/Users/tryha/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const previewDir = process.env.DESIGN_PREVIEW_DIR || 'design-preview';
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
  for (const width of [320, 375, 390, 480, 768, 960, 1024, 1280, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    for (const file of ['index.html', 'company.html', 'important-notes.html', 'privacy-policy.html']) {
      await page.goto(`http://127.0.0.1:8765/${file}`);
      await loadImages();
      const state = await page.evaluate(() => ({
        width: document.documentElement.getBoundingClientRect().width, scroll: document.documentElement.scrollWidth,
        missing: [...document.images].filter(i => !i.complete || !i.naturalWidth).map(i => i.src),
        animated: [...document.querySelectorAll('*')].filter(e => {
          const c = getComputedStyle(e);
          return c.animationName !== 'none' || c.transitionDuration.split(',').some(v => parseFloat(v) > 0);
        }).length,
        brokenAnchors: [...document.querySelectorAll('a[href^="#"]')].filter(a => !document.getElementById(a.hash.slice(1))).map(a => a.hash)
      }));
      assert(state.scroll <= state.width + 1, `${file} overflow at ${width}`);
      assert.deepEqual(state.missing, [], `${file} images`);
      assert.deepEqual(state.brokenAnchors, [], `${file} anchors`);
      assert.equal(state.animated, 0, `${file} animations`);
      results.push(`${file} @ ${width}px: OK`);
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://127.0.0.1:8765/index.html');
  await loadImages();
  await page.keyboard.press('Tab');
  assert.equal(await page.locator('.skip-link').evaluate(e => e === document.activeElement), true);
  await page.keyboard.press('Enter');
  assert.equal(await page.locator('main').evaluate(e => e === document.activeElement), true);
  await page.locator('[data-nav-open]').focus();
  await page.keyboard.press('Enter');
  assert.equal(await page.locator('[data-nav-open]').getAttribute('aria-expanded'), 'true');
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => document.querySelector('[data-nav-open]').getAttribute('aria-expanded') === 'false');
  assert.equal(await page.locator('[data-nav-open]').getAttribute('aria-expanded'), 'false');
  assert.equal(await page.locator('[data-nav-open]').evaluate(e => e === document.activeElement), true);
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
    await button.focus();
    await page.keyboard.press('Enter');
    assert.equal(await target.isVisible(), true);
    assert.equal(await button.getAttribute('aria-expanded'), 'true');
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.getBoundingClientRect().width + 1));
    await page.keyboard.press('Space');
    assert.equal(await target.isVisible(), false);
  }
  for (const file of ['index.html', 'company.html', 'important-notes.html', 'privacy-policy.html']) {
    await page.goto(`http://127.0.0.1:8765/${file}`);
    // Type sizes now vary by editorial role. Reflow and zoom remain checked below
    // and in verify-foundations.cjs; there is no site-wide 14px minimum.
    for (const link of await page.locator('a[target="_blank"]').all()) {
      assert.equal(await link.locator('.external-link-icon').count(), 1);
      assert.equal(await link.locator('.visually-hidden').textContent(), '（新しいタブで開きます）');
    }
    await page.setViewportSize({ width: 320, height: 844 });
    await page.addStyleTag({ content: 'html { font-size: 200%; }' });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.getBoundingClientRect().width + 1), `${file}: enlarged text overflow`);
    await page.setViewportSize({ width: 390, height: 844 });
  }
  await page.goto('http://127.0.0.1:8765/index.html');
  await loadImages();
  fs.mkdirSync(previewDir, { recursive: true });
  await page.screenshot({ path: `${previewDir}/preview-mobile-top.png` });
  await page.screenshot({ path: `${previewDir}/preview-mobile.png`, fullPage: true });
  for (const [selector, name] of [['#price2', 'fees'], ['#step', 'process']]) {
    await page.locator(selector).screenshot({
      path: `${previewDir}/mobile-${name}.png`,
      style: '.header, .mobile-contact { visibility: hidden; }'
    });
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: `${previewDir}/preview-desktop-top.png` });
  await page.screenshot({ path: `${previewDir}/preview-desktop.png`, fullPage: true });
  assert.deepEqual(errors, []);
  results.push('Menu open, Escape, menu anchor, header clearance, all accordions, no runtime errors: OK');
  results.push('Keyboard skip link, menu focus restoration/state, Enter/Space disclosures, new-tab labels, 200% root text at 320px: OK');
  fs.writeFileSync('design-check.txt', results.join('\n') + '\n');
  console.log(results.join('\n'));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
