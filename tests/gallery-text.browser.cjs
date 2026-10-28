const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('/Users/sampilgrim/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const executablePath = process.env.AETHOS_CHROMIUM || '/Users/sampilgrim/Library/Caches/ms-playwright/chromium-1217/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const source = fs.readFileSync(path.join(__dirname, '../aethos.js'), 'utf8');
const start = source.indexOf('\taethos.anim.carousel = function');
const end = source.indexOf('\taethos.anim.loadSliders = function', start);
const carouselCode = source.slice(start, end);
const results = [];
let browser;
const test = async (name, fn) => { try { await fn(); results.push({ name, pass: true }); console.log('PASS', name); } catch (error) { results.push({ name, pass: false, error: error.message }); console.error('FAIL', name, error.message); } };
async function setup({ reducedMotion = 'no-preference', width = 1440, library = true } = {}) {
  const page = await browser.newPage({ viewport: { width, height: 1200 }, reducedMotion });
  await page.goto(pathToFileURL(path.join(__dirname, 'fixtures/gallery-text.html')).href);
  await page.addStyleTag({ content: fs.readFileSync(path.join(__dirname, '../css/globalstyles/4_components.css'), 'utf8') });
  if (library) await page.addScriptTag({ url: 'https://cdn.jsdelivr.net/npm/@splidejs/splide@4.1.4/dist/js/splide.min.js' });
  if (library) await page.addScriptTag({ content: source.match(/Splide\.defaults = \{[\s\S]*?\n\t\t\};/)[0] });
  await page.addScriptTag({ content: carouselCode });
  return page;
}
async function initialise(page) {
  await page.evaluate(() => aethos.anim.carousel());
  await page.waitForTimeout(80);
}
async function go(page, id, direction) {
  await page.evaluate(({ id, direction }) => document.getElementById(id)._aethosGalleryText.splide.go(direction), { id, direction });
  await page.waitForTimeout(750);
}
(async () => {
  browser = await chromium.launch({ headless: true, executablePath });
  await test('static and CMS galleries use real Splide and preserve original CMS nodes in field order', async () => {
    const page = await setup();
    await page.evaluate(() => { makeGallery('static', ['Static 1', 'Static 2', 'Static 3']); const cms = makeGallery('cms', ['Placeholder'], ['CMS 1', 'CMS 2', 'CMS 3', 'CMS 4', 'CMS 5']); window.cmsOriginal = cms.querySelector('[data-gallery-text-source] .amenity-gallery-slide'); });
    await initialise(page);
    const data = await page.evaluate(() => { const roots = [...document.querySelectorAll('.s-gallery-text')]; const cms = document.getElementById('cms'); return { ready: roots.every(r => r._aethosGalleryText?.splide), counts: roots.map(r => r.querySelectorAll('.gallery-text_list > .amenity-gallery-slide:not(.splide__slide--clone)').length), names: [...cms.querySelectorAll('.gallery-text_list > .amenity-gallery-slide:not(.splide__slide--clone) h3')].map(h => h.textContent), sameNode: cms.querySelector('.gallery-text_list > .amenity-gallery-slide:not(.splide__slide--clone)') === cmsOriginal, strong: cmsOriginal.querySelector('strong').textContent }; });
    assert.equal(data.ready, true); assert.deepEqual(data.counts, [3, 5]); assert.deepEqual(data.names, ['CMS 1', 'CMS 2', 'CMS 3', 'CMS 4', 'CMS 5']); assert.equal(data.sameNode, true); assert.equal(data.strong, 'CMS 1'); await page.close();
  });
  await test('one stationary accessible pagination set and arrow pair per instance; repeated initialisation is safe', async () => {
    const page = await setup(); await page.evaluate(() => makeGallery('repeat', ['One', 'Two', 'Three'])); await initialise(page);
    await page.evaluate(() => { window.firstController = document.querySelector('.s-gallery-text')._aethosGalleryText; aethos.anim.carousel(); });
    const d = await page.evaluate(() => { const r = document.getElementById('repeat'); const c = r._aethosGalleryText; return { same: c === firstController, dots: r.querySelectorAll('.gallery-text_pagination').length, buttons: r.querySelectorAll('.gallery-text_pagination button').length, arrows: r.querySelectorAll('.gallery-text_arrows button').length, native: { type: c.splide.options.type, autoplay: c.splide.options.autoplay, drag: c.splide.options.drag }, live: r.querySelector('.splide__track').getAttribute('aria-live') }; });
    assert.equal(d.same, true); assert.equal(d.dots, 1); assert.equal(d.buttons, 3); assert.equal(d.arrows, 2); assert.equal(d.native.type, 'loop'); assert.equal(d.native.autoplay, false); assert.equal(d.native.drag, true); assert.equal(d.live, 'polite'); await page.close();
  });
  await test('captions stay hidden during movement and only the settled centre caption is interactive, including both loop boundaries', async () => {
    const page = await setup(); await page.evaluate(() => makeGallery('motion', ['One', 'Two', 'Three'])); await initialise(page);
    await page.evaluate(() => document.querySelector('#motion')._aethosGalleryText.splide.go('>'));
    assert.equal(await page.locator('#motion .amenity-gallery-slide_content[data-gallery-text-current]').count(), 0);
    await page.waitForTimeout(750);
    for (const [direction, expected] of [['>', 'Three'], ['>', 'One'], ['<', 'Three']]) {
      await go(page, 'motion', direction);
      const d = await page.evaluate(() => { const r = document.getElementById('motion'), shown = [...r.querySelectorAll('.amenity-gallery-slide_content[data-gallery-text-current]')]; const frame = r.querySelector('.gallery-text_slider').getBoundingClientRect(); return { captions: shown.length, title: shown[0]?.querySelector('h3').textContent, inert: shown[0]?.inert, centreError: shown[0] ? Math.abs(shown[0].closest('.amenity-gallery-slide').getBoundingClientRect().x - frame.x) : 999, inactiveSafe: [...r.querySelectorAll('.amenity-gallery-slide_content:not([data-gallery-text-current])')].every(c => c.inert && c.getAttribute('aria-hidden') === 'true') }; });
      assert.equal(d.captions, 1); assert.equal(d.title, expected); assert.equal(d.inert, false); assert.ok(d.centreError < 2); assert.equal(d.inactiveSafe, true);
    } await page.close();
  });
  await test('native dots, keyboard activation and neighbouring image clicks navigate the gallery', async () => {
    const page = await setup(); await page.evaluate(() => makeGallery('controls', ['One', 'Two', 'Three'])); await initialise(page);
    const dots = page.locator('#controls .gallery-text_pagination button'); await dots.nth(2).focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(750);
    assert.equal(await page.evaluate(() => document.getElementById('controls')._aethosGalleryText.splide.index), 2);
    await page.locator('#controls .splide__arrow--next').focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(750);
    assert.equal(await page.evaluate(() => document.getElementById('controls')._aethosGalleryText.splide.index), 0);
    const point = await page.evaluate(() => { const r = document.querySelector('#controls .gallery-text_slider').getBoundingClientRect(); return { x: r.right + 45, y: r.top + 60 }; });
    await page.mouse.click(point.x, point.y); await page.waitForTimeout(750);
    assert.equal(await page.evaluate(() => document.getElementById('controls')._aethosGalleryText.splide.index), 1); await page.close();
  });
  await test('real dragging snaps and cannot activate a caption link', async () => {
    const page = await setup({ width: 390 }); await page.evaluate(() => { makeGallery('drag', ['One', 'Two', 'Three']); window.linkClicks = 0; document.addEventListener('click', e => { if (e.target.closest('.amenity-gallery-slide_content a')) linkClicks++; }); }); await initialise(page);
    const box = await page.locator('#drag .gallery-text_slider').boundingBox(); await page.mouse.move(box.x + box.width * .8, box.y + 50); await page.mouse.down(); await page.mouse.move(box.x + box.width * .15, box.y + 50, { steps: 12 }); await page.mouse.up(); await page.waitForTimeout(850);
    const d = await page.evaluate(() => { const c = document.getElementById('drag')._aethosGalleryText; return { index: c.splide.index, clicks: linkClicks, captions: document.querySelectorAll('#drag [data-gallery-text-current]').length }; });
    assert.notEqual(d.index, 0); assert.equal(d.clicks, 0); assert.equal(d.captions, 1); await page.close();
  });
  await test('a drag returning to the same slide restores its caption', async () => {
    const page = await setup(); await page.evaluate(() => makeGallery('small-drag', ['One', 'Two'])); await initialise(page); const box = await page.locator('#small-drag .gallery-text_slider').boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + 60); await page.mouse.down(); await page.mouse.move(box.x + box.width / 2 - 12, box.y + 60, { steps: 4 }); await page.waitForTimeout(250); await page.mouse.up(); await page.waitForTimeout(850);
    assert.equal(await page.locator('#small-drag [data-gallery-text-current]').count(), 1); await page.close();
  });
  await test('mobile controls stay below the image after resize and reduced motion removes transport and caption animation', async () => {
    const page = await setup({ reducedMotion: 'reduce' }); await page.evaluate(() => makeGallery('responsive', ['One', 'Two', 'Three'])); await initialise(page); await page.setViewportSize({ width: 390, height: 1000 }); await page.waitForTimeout(200);
    const d = await page.evaluate(() => { const root = document.getElementById('responsive'), image = root.querySelector('[data-gallery-text-current]').closest('.amenity-gallery-slide').querySelector('.amenity-gallery-slide_media').getBoundingClientRect(), dots = root.querySelector('.gallery-text_pagination').getBoundingClientRect(), arrow = root.querySelector('.splide__arrow--next').getBoundingClientRect(); return { imageBottom: image.bottom, dotsTop: dots.top, arrowTop: arrow.top, speed: root._aethosGalleryText.splide.options.speed, transition: getComputedStyle(root.querySelector('[data-gallery-text-current]')).transitionDuration, overflow: document.documentElement.scrollWidth > innerWidth }; });
    assert.ok(d.dotsTop >= d.imageBottom); assert.ok(d.arrowTop >= d.imageBottom); assert.equal(d.speed, 0); assert.equal(d.transition, '0s'); assert.equal(d.overflow, false); await page.close();
  });
  await test('zero and one slide, conditionally hidden slides and missing Splide have readable fallbacks', async () => {
    const page = await setup({ library: false }); await page.evaluate(() => { makeGallery('zero', []); makeGallery('single', ['Only']); makeGallery('fallback', ['One', 'Two']); const r = makeGallery('hidden', ['Visible', 'Hidden']); r.querySelectorAll('.amenity-gallery-slide')[1].hidden = true; }); await initialise(page);
    const d = await page.evaluate(() => ({ emptyHidden: document.getElementById('zero').hidden, singleCaptionVisible: getComputedStyle(document.querySelector('#single .amenity-gallery-slide_content')).visibility !== 'hidden', fallbackCaptions: [...document.querySelectorAll('#fallback .amenity-gallery-slide_content')].every(c => !c.inert && getComputedStyle(c).visibility !== 'hidden'), noControls: [...document.querySelectorAll('.gallery-text_pagination')].every(e => e.hidden || getComputedStyle(e).display === 'none') }));
    assert.equal(d.emptyHidden, true); assert.equal(d.singleCaptionVisible, true); assert.equal(d.fallbackCaptions, true); assert.equal(d.noControls, true); await page.close();
  });
  await test('mount failure preserves CMS node identity and readable captions', async () => {
    const page = await setup(); await page.evaluate(() => { const r = makeGallery('failure', ['Placeholder'], ['CMS One', 'CMS Two']); window.failureNode = r.querySelector('[data-gallery-text-source] .amenity-gallery-slide'); const Real = Splide; window.Splide = function () { const s = new Real(...arguments); s.mount = () => { throw Error('simulated mount failure'); }; return s; }; }); await initialise(page);
    const d = await page.evaluate(() => { const r = document.getElementById('failure'); return { node: r.querySelector('.gallery-text_list .amenity-gallery-slide') === failureNode, count: r.querySelectorAll('.gallery-text_list .amenity-gallery-slide').length, safe: [...r.querySelectorAll('.amenity-gallery-slide_content')].every(c => !c.inert && getComputedStyle(c).visibility !== 'hidden') }; });
    assert.equal(d.node, true); assert.equal(d.count, 2); assert.equal(d.safe, true); await page.close();
  });
  await test('destroy restores readable original slides and reinitialisation creates a single fresh controller', async () => {
    const page = await setup(); await page.evaluate(() => makeGallery('lifecycle', ['One', 'Two', 'Three'])); await initialise(page); await go(page, 'lifecycle', '>');
    await page.evaluate(() => { const root = document.getElementById('lifecycle'); window.oldController = root._aethosGalleryText; root._aethosGalleryText.destroy(); });
    const fallback = await page.evaluate(() => { const root = document.getElementById('lifecycle'); return { clones: root.querySelectorAll('.splide__slide--clone').length, readable: [...root.querySelectorAll('.amenity-gallery-slide_content')].every(c => !c.inert && getComputedStyle(c).visibility !== 'hidden'), arrows: root.querySelectorAll('.gallery-text_arrows').length, ready: root.hasAttribute('data-gallery-text-ready') }; });
    assert.deepEqual(fallback, { clones: 0, readable: true, arrows: 0, ready: false });
    await initialise(page);
    const restored = await page.evaluate(() => { const root = document.getElementById('lifecycle'); return { fresh: root._aethosGalleryText !== oldController, count: aethos.splides.length, dots: root.querySelectorAll('.gallery-text_pagination button').length, captions: root.querySelectorAll('[data-gallery-text-current]').length }; });
    assert.deepEqual(restored, { fresh: true, count: 1, dots: 3, captions: 1 }); await page.close();
  });
  await test('hidden static slides never enter pagination or layout, including after destroy and reinitialisation', async () => {
    const page = await setup(); await page.evaluate(() => { const root = makeGallery('conditional', ['One', 'Hidden', 'Three']); root.querySelectorAll('.amenity-gallery-slide')[1].hidden = true; }); await initialise(page);
    assert.equal(await page.locator('#conditional .gallery-text_pagination button').count(), 2);
    await go(page, 'conditional', '>');
    assert.equal(await page.locator('#conditional [data-gallery-text-current] h3').textContent(), 'Three');
    await page.evaluate(() => { const root = document.getElementById('conditional'); root._aethosGalleryText.destroy(); root.querySelectorAll('.amenity-gallery-slide')[0].classList.add('w-condition-invisible'); root.querySelectorAll('.amenity-gallery-slide')[1].hidden = false; }); await initialise(page);
    assert.equal(await page.locator('#conditional .gallery-text_pagination button').count(), 2);
    await go(page, 'conditional', '>');
    assert.equal(await page.locator('#conditional [data-gallery-text-current] h3').textContent(), 'Three');
    await page.evaluate(() => document.getElementById('conditional')._aethosGalleryText.destroy());
    assert.equal(await page.evaluate(() => [...document.querySelectorAll('#conditional .amenity-gallery-slide_content')].every(c => !c.inert && !c.hasAttribute('aria-hidden'))), true); await page.close();
  });
  await test('existing image carousel settings remain unchanged', async () => {
    const page = await setup(); await page.evaluate(() => { const room = document.createElement('div'); room.className = 'room-card'; room.innerHTML = '<div class="splide"><div class="splide__track"><div class="room-card_media-list splide__list"><div class="img-wrap splide__slide"></div><div class="img-wrap splide__slide"></div></div></div></div><div class="room-card_pagination"></div>'; document.querySelector('#fixtures').append(room); const Real = Splide; window.createdSplides = []; window.Splide = function (...args) { const s = new Real(...args); createdSplides.push(s); return s; }; }); await initialise(page);
    const d = await page.evaluate(() => ({ type: createdSplides[0].options.type, perPage: createdSplides[0].options.perPage, autoplay: createdSplides[0].options.autoplay, pagination: createdSplides[0].options.pagination, arrows: createdSplides[0].options.arrows, drag: createdSplides[0].options.drag, dots: document.querySelectorAll('.room-card_pagination-dot').length }));
    assert.deepEqual(d, { type: 'loop', perPage: 1, autoplay: false, pagination: false, arrows: true, drag: true, dots: 2 }); await page.close();
  });
  fs.mkdirSync(path.join(__dirname, '../../local/outputs/gallery-text-js'), { recursive: true });
  fs.writeFileSync(path.join(__dirname, '../../local/outputs/gallery-text-js/test-results.json'), JSON.stringify(results, null, 2));
  await browser.close();
  console.log(`${results.filter(r => r.pass).length}/${results.length} passed`);
  if (results.some(r => !r.pass)) process.exitCode = 1;
})().catch(async error => { console.error(error); await browser?.close(); process.exitCode = 1; });
