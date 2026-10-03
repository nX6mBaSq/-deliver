const { chromium } = require('C:/Users/tryha/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');

(async () => {
  // Headless normally hides scrollbars; retain them to reproduce the Windows shift.
  const browser = await chromium.launch({ channel: 'msedge', headless: true, ignoreDefaultArgs: ['--hide-scrollbars'] });
  const page = await browser.newPage();
  const results = [];
  const snapshot = () => page.evaluate(() => ({
    scrollY,
    boxes: ['.header', '.header__logo', '[data-nav-open]', 'main', '.mobile-contact'].map(selector => {
      const element = document.querySelector(selector);
      const { x, y, width, height } = element.getBoundingClientRect();
      return { selector, x, y, width, height };
    }),
    opacity: getComputedStyle(document.querySelector('.header')).opacity
  }));
  const clickWithoutScrolling = async selector => {
    const box = await page.locator(selector).boundingBox();
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  };
  try {
    for (const width of [320, 390, 768, 960, 1199]) {
      await page.setViewportSize({ width, height: 844 });
      for (const file of ['index.html', 'company.html', 'important-notes.html', 'privacy-policy.html']) {
        await page.goto(`http://127.0.0.1:8765/${file}`);
        await page.evaluate(() => document.fonts.ready);
        await page.addStyleTag({ content: '::-webkit-scrollbar { width: 16px; }' });
        assert(await page.evaluate(() => innerWidth > document.documentElement.clientWidth), 'Classic scrollbar must be present');
        for (const offset of [0, 500]) {
          await page.evaluate(y => scrollTo(0, y), offset);
          const before = await snapshot();
          for (const method of ['button', 'escape', ...(width > 390 ? ['backdrop'] : [])]) {
            await clickWithoutScrolling('[data-nav-open]');
            assert.deepEqual(await snapshot(), before, `${file} ${width}px ${offset}: opening shifts layout`);
            assert.equal(await page.locator('[data-nav-open]').getAttribute('aria-expanded'), 'true');
            assert(await page.locator('.nav-drawer__panel').evaluate(e => e.scrollWidth <= e.clientWidth), 'Menu must not overflow horizontally');
            await page.mouse.move(5, 400);
            await page.mouse.wheel(0, 240);
            await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
            assert.equal(await page.evaluate(() => scrollY), before.scrollY, 'Background must stay locked');
            await page.locator('.nav-drawer__panel').evaluate(e => { e.scrollTop = 0; });
            if (method === 'button') await clickWithoutScrolling('[data-nav-close]');
            else if (method === 'escape') await page.keyboard.press('Escape');
            else await page.mouse.click(5, 400);
            await page.waitForFunction(() => document.querySelector('[data-nav-open]').getAttribute('aria-expanded') === 'false');
            assert.deepEqual(await snapshot(), before, `${file} ${width}px ${offset}: closing shifts layout`);
            assert(await page.locator('[data-nav-open]').evaluate(e => e === document.activeElement), 'Focus must return to menu button');
          }
        }
        results.push(`${file} @ ${width}px: open/close geometry, scroll lock, focus restoration OK`);
      }
    }
    fs.mkdirSync('design-preview/header', { recursive: true });
    await page.setViewportSize({ width: 960, height: 844 });
    await page.goto('http://127.0.0.1:8765/index.html');
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: 'design-preview/header/closed.png' });
    await clickWithoutScrolling('[data-nav-open]');
    await page.screenshot({ path: 'design-preview/header/open.png' });
    fs.writeFileSync('header-check.txt', results.join('\n') + '\n');
    console.log(results.join('\n'));
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
