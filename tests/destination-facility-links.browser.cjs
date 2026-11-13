const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('/Users/sampilgrim/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

const source = fs.readFileSync(path.join(__dirname, '../aethos.js'), 'utf8');
const start = source.indexOf('\taethos.functions.updateDestinationCardFacilityLinks = function');
const end = source.indexOf('\taethos.functions.handleCMSFilter = function', start);
assert.ok(start >= 0 && end > start, 'Destination facility-link handler must be available');
const handler = source.slice(start, end);
const results = [];

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.AETHOS_CHROMIUM || '/Users/sampilgrim/Library/Caches/ms-playwright/chromium-1217/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
  });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    const setup = async (gridClass = 'c-destinations-grid') => {
      await page.setContent(`<section class="${gridClass}"><div fs-cmsfilter-element="list">
        <div class="card-grid_item w-dyn-item" id="monterosa">
          <a class="link-cover" href="/destinations/monterosa?p=base#intro"></a>
          <div class="display-none"><div class="w-dyn-list"><div class="w-dyn-items">
            <div class="w-dyn-item"><div data-facility-link="/wellness" fs-cmsfilter-field="facility">Wellness</div></div>
            <div class="w-dyn-item"><div data-facility-link="retreats" fs-cmsfilter-field="facility">Wellbeing Retreats</div></div>
            <div class="w-dyn-item"><div data-facility-link="  " fs-cmsfilter-field="facility">Club</div></div>
          </div></div></div>
        </div>
      </div></section>`);
      await page.addScriptTag({ content: 'window.aethos = { functions: {} };\n' + handler });
    };
    const apply = values => page.evaluate(values => {
      const card = document.getElementById('monterosa');
      const instance = { formBlock: document.querySelector('section'), filtersData: [{ filterKeys: ['facility'], values: new Set(values) }] };
      aethos.functions.updateDestinationCardFacilityLinks(instance, [{ element: card }]);
      return card.querySelector('.link-cover').getAttribute('href');
    }, values);
    const test = async (name, fn) => {
      try { await setup(); await fn(); results.push({ name, pass: true }); console.log('PASS', name); }
      catch (error) { results.push({ name, pass: false, error: error.message }); console.error('FAIL', name, error.message); }
    };

    await test('native facility text rewrites the card without a helper anchor or href', async () => {
      assert.equal(await apply(['Wellness']), '/destinations/monterosa/wellness?p=base#intro');
    });
    await test('switching to a multiword facility uses the original destination as its base', async () => {
      await apply(['Wellness']);
      assert.equal(await apply(['  WELLBEING RETREATS  ']), '/destinations/monterosa/retreats?p=base#intro');
    });
    await test('clearing a facility restores the exact original card link', async () => {
      await apply(['Wellness']);
      assert.equal(await apply([]), '/destinations/monterosa?p=base#intro');
    });
    await test('multiple facilities restore the original card link', async () => {
      await apply(['Wellness']);
      assert.equal(await apply(['Wellness', 'Wellbeing Retreats']), '/destinations/monterosa?p=base#intro');
    });
    await test('an unmatched facility or blank suffix restores the original link', async () => {
      await apply(['Wellness']);
      assert.equal(await apply(['Experience']), '/destinations/monterosa?p=base#intro');
      await apply(['Wellness']);
      assert.equal(await apply(['Club']), '/destinations/monterosa?p=base#intro');
    });
    await test('a render without event items finds native facility data through the list', async () => {
      const href = await page.evaluate(() => {
        const instance = { formBlock: document.querySelector('section'), filtersData: [{ filterKeys: ['facility'], values: new Set(['Wellness']) }] };
        aethos.functions.updateDestinationCardFacilityLinks(instance);
        return document.querySelector('.link-cover').getAttribute('href');
      });
      assert.equal(href, '/destinations/monterosa/wellness?p=base#intro');
    });
    await test('other filtered grids retain their original card links', async () => {
      await setup('c-other-grid');
      assert.equal(await apply(['Wellness']), '/destinations/monterosa?p=base#intro');
    });

    assert.deepEqual(errors, [], 'Handler should not emit browser errors');
    if (results.some(result => !result.pass)) process.exitCode = 1;
    console.log(`${results.filter(result => result.pass).length}/${results.length} checks passed`);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
