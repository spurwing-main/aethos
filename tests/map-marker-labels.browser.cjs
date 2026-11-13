// Regression: location markers must expose individual names, including after re-add.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('/Users/sampilgrim/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const evidence = path.resolve(__dirname, '../../local/outputs/map-marker-labels');
fs.mkdirSync(evidence, { recursive: true });
const source = fs.readFileSync(path.join(__dirname, '../aethos.js'), 'utf8');
const start = source.indexOf('\taethos.map.init = async function');
const end = source.indexOf('\n\t/* update copyright */', start);
assert.ok(start >= 0 && end > start);
const executablePath = process.env.AETHOS_CHROMIUM || '/Users/sampilgrim/Library/Caches/ms-playwright/chromium-1217/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
(async () => {
  const leaflet = path.join(evidence, 'leaflet-1.9.4.js');
  if (!fs.existsSync(leaflet)) {
    const response = await fetch('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js');
    assert.ok(response.ok, `Leaflet download failed: ${response.status}`);
    fs.writeFileSync(leaflet, await response.text());
  }
  const browser = await chromium.launch({ headless: true, executablePath });
  const results = [];
  try {
    for (const theme of ['club', 'default']) {
      const page = await browser.newPage();
      await page.route('**/*', route => route.abort());
      await page.setContent('<div class="map" style="height:500px;width:800px"></div><div class="map-data" aethos-dest-name="Aethos Ericeira" aethos-dest-lat="38.96" aethos-dest-long="-9.41" aethos-dest-slug="ericeira"></div>');
      await page.addScriptTag({ path: leaflet });
      await page.evaluate(theme => {
        window.aethos = { map: { tileIds: { default: 'test' }, accessToken: 'test' }, settings: { theme }, themes: {}, log() {} };
        window.gsap = { set() {} };
        window.fetch = async () => ({ json: async () => ({ data: [{ location: { latitude: 51.5, longitude: -.12, location_name: 'Partner Club & Spa', city_country: 'London, UK' } }] }) });
      }, theme);
      await page.addScriptTag({ content: source.slice(start, end) });
      await page.evaluate(() => aethos.map.init());
      const hotel = page.getByLabel('Show details for Aethos Ericeira', { exact: true });
      await assert.equal(await hotel.count(), 1, `${theme}: hotel marker lacks its location name`);
      if (theme === 'club') {
        assert.equal(await hotel.getAttribute('alt'), 'Aethos Ericeira');
        const partner = page.getByRole('button', { name: 'Show details for Partner Club & Spa', exact: true });
        assert.equal(await partner.count(), 1, 'partner circle must expose its name in the accessibility tree');
        await partner.focus();
        await page.keyboard.press('Space');
        assert.equal(await page.locator('.leaflet-popup').count(), 1, 'circle marker must open its popup using the keyboard');
        await hotel.click({ force: true });
        await page.waitForFunction(() => document.querySelectorAll('.leaflet-popup').length === 1);
        assert.equal(await page.locator('.leaflet-popup').count(), 1, 'named marker must still open its popup');
      } else {
        const button = page.getByRole('button', { name: 'Show details for Aethos Ericeira', exact: true });
        assert.equal(await button.count(), 1, 'hotel circle must expose its name in the accessibility tree');
        await button.focus();
        await page.keyboard.press('Enter');
        assert.equal(await page.locator('.leaflet-popup').count(), 1);
      }
      await page.evaluate(() => {
        const marker = aethos.map.destinations[0].marker;
        marker.remove();
        marker.addTo(aethos.map.map);
      });
      assert.equal(await hotel.count(), 1, 'label must survive marker re-add');
      const snapshot = await page.locator('.map').ariaSnapshot();
      assert.match(snapshot, /button "Show details for Aethos Ericeira"/);
      if (theme === 'club') assert.match(snapshot, /button "Show details for Partner Club & Spa"/);
      results.push({ theme, pass: true, accessibility: snapshot });
      console.log('PASS', theme, 'location labels, marker re-add and popup behaviour');
      await page.close();
    }
  } finally {
    await browser.close();
    fs.writeFileSync(path.join(evidence, 'browser-results.json'), JSON.stringify(results, null, 2));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
