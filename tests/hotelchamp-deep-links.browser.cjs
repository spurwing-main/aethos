const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('/Users/sampilgrim/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

const executablePath = process.env.AETHOS_CHROMIUM || '/Users/sampilgrim/Library/Caches/ms-playwright/chromium-1217/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const source = fs.readFileSync(path.join(__dirname, '../aethos.js'), 'utf8');
// Exercise the production HC implementation and its actual startup guard.
// The remaining site functions depend on unrelated Webflow/animation markup.
const coreStart = source.indexOf('\taethos.functions.hc = function () {');
const coreEnd = source.indexOf('\n\taethos.functions.scrollbarWidth = function', coreStart);
const startupStart = source.indexOf('\tif (!aethos.settings.dev.all) {', coreEnd);
const startupEnd = source.indexOf('\n\taethos.anim.smoothScroll();', startupStart);
assert(coreStart >= 0 && coreEnd > coreStart && startupStart > coreEnd && startupEnd > startupStart);
const hcCode = source.slice(coreStart, coreEnd) + '\n(function () {\n' + source.slice(startupStart, startupEnd) + '\n})();';
const transitionStart = source.indexOf('\taethos.anim.pageTransition = function');
const transitionEnd = source.indexOf('\n\t/* site loader */', transitionStart);
const transitionCode = source.slice(transitionStart, transitionEnd);
const externalStart = source.indexOf('\t(function openExternalLinksInNewTab() {');
const externalEnd = source.indexOf('\n\t})();', externalStart) + '\n\t})();'.length;
assert(externalStart >= 0 && externalEnd > externalStart);
const externalCode = source.slice(externalStart, externalEnd);
const relativeStart = source.indexOf('\t(function updateRelativeLinks() {');
assert(relativeStart >= 0 && relativeStart < externalStart);
const relativeCode = source.slice(relativeStart, externalStart);
const genericQuery = '?p=base&c=search&fo=true';
const rateQuery = '?p=base&c=search&fo=true&pr=76481';
let browser;
let failures = 0;

async function setup(query = '', { mobile = false, ready = false, transition = false, links = [], pathname = '/destinations/monterosa', providerDropsHash = false, nativeAutoOpen = false, introHidden = false, providerPaused = false } = {}) {
  const context = await browser.newContext({
    viewport: { width: mobile ? 390 : 1440, height: 900 },
    isMobile: mobile,
    hasTouch: mobile,
  });
  const page = await context.newPage();
  page.setDefaultTimeout(1500);
  let releaseProvider;
  const providerGate = new Promise(resolve => { releaseProvider = resolve; });
  // Only replace the external provider. Script injection, event listeners,
  // shared loading state and readiness polling remain production behaviour.
  await page.route('https://ibe.hotelchamp.io/**', async route => {
    if (providerPaused) await providerGate;
    await route.fulfill({
    contentType: 'application/javascript',
    headers: { 'access-control-allow-origin': '*' },
    body: `
      if (${nativeAutoOpen} && new URLSearchParams(location.search).get('p') === 'base' && new URLSearchParams(location.search).has('fo')) window.nativeOpenRequests++;
      if (${providerDropsHash}) history.replaceState(history.state, '', location.pathname + location.search);
      window.__HC__.ibe.search = (...args) => window.hcSearchCalls.push(args);
    `,
    });
  });
  await page.route('https://aethos-hc.test/**', route => route.fulfill({
    contentType: 'text/html',
    body: '<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body><div class="page-transition"><div class="page-transition_lottie"></div></div><a class="button reservenow" href="#">Book now</a></body></html>',
  }));
  await page.goto('https://aethos-hc.test' + pathname + query);
  await page.evaluate(({ ready, introHidden }) => {
    window.hcSearchCalls = [];
    window.nativeOpenRequests = 0;
    if (introHidden) document.body.classList.add('hc-hidden');
    window.__HC__ = { ibe: { propertyGroupId: 'fixture-group' } };
    if (ready) window.__HC__.ibe.search = (...args) => window.hcSearchCalls.push(args);
    window.aethos = { anim: {}, functions: {}, helpers: {}, settings: { destinationSlug: 'monterosa', dev: { all: true } }, log() {} };
    window.lottie = { loadAnimation() { return {}; } };
  }, { ready, introHidden });
  await page.evaluate(links => {
    for (const [id, href, relative] of links) {
      const anchor = document.createElement('a');
      anchor.id = id;
      anchor.textContent = 'Booking link';
      anchor.setAttribute('href', href);
      if (relative) anchor.setAttribute('aethos-relative-link', '');
      document.body.appendChild(anchor);
    }
  }, links);
  // Execute the real first-main setup before any existing link helpers.
  // A first-main rewrite must work before HC startup or user interaction.
  const earlyEnd = source.indexOf('\n\taethos.settings.dev =');
  await page.addScriptTag({ content: source.slice(source.indexOf('function main() {') + 'function main() {'.length, earlyEnd) || '/* No early setup yet. */' });
  await page.addScriptTag({ content: relativeCode + '\n' + externalCode + '\n' + hcCode });
  if (transition) await page.addScriptTag({ content: transitionCode + '\naethos.anim.pageTransition();' });
  return { page, releaseProvider, close: () => { releaseProvider(); return context.close(); } };
}

async function addLink(page, href, { reserve = false } = {}) {
  await page.evaluate(({ href, reserve }) => {
    const wrapper = document.createElement('div');
    wrapper.className = reserve ? 'button reservenow' : 'offer';
    const anchor = document.createElement('a');
    anchor.id = 'offer-link';
    anchor.className = 'button_link';
    anchor.href = href;
    anchor.innerHTML = '<span>Book this offer</span>';
    wrapper.appendChild(anchor);
    document.body.appendChild(wrapper);
  }, { href, reserve });
}

async function dispatchOffer(page, options = {}) {
  return page.evaluate(options => {
    const event = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0, ...options });
    document.querySelector('#offer-link span').dispatchEvent(event);
    return event.defaultPrevented;
  }, options);
}

const scriptCount = page => page.locator('script[data-aethos-hc="true"]').count();
async function waitForLoad(page) {
  await page.waitForFunction(() => typeof window.__HC__?.ibe?.search === 'function', null, { timeout: 1000 });
  // Readiness is found on the loader's next polling tick.
  await page.evaluate(() => aethos.hotelChampLazy.loadPromise);
}
async function test(name, run) {
  try { await run(); console.log('PASS', name); }
  catch (error) { failures++; console.error('FAIL', name, error.message); }
}

(async () => {
  try {
    browser = await chromium.launch({ headless: true, executablePath });
    await test('pending automatic marker opening is cancelled by navigation to an ordinary anchor',async()=>{
      const fixture=await setup('#reservenow?pr=11111',{providerPaused:true});
      try {
        await fixture.page.evaluate(()=>new Promise(resolve=>{
          addEventListener('hashchange',()=>resolve(),{once:true});
          location.hash='rooms';
        }));
        fixture.releaseProvider();
        await waitForLoad(fixture.page);
        await fixture.page.waitForTimeout(75);
        assert.deepEqual(await fixture.page.evaluate(()=>hcSearchCalls),[]);
      } finally { await fixture.close(); }
    });

    await test('only the latest automatic marker opens when navigation changes during loading',async()=>{
      const fixture=await setup('#reservenow?pr=11111',{providerPaused:true,providerDropsHash:true});
      try {
        await fixture.page.evaluate(()=>new Promise(resolve=>{
          addEventListener('hashchange',()=>resolve(),{once:true});
          location.hash='reservenow?pr=22222';
        }));
        fixture.releaseProvider();
        await waitForLoad(fixture.page);
        await fixture.page.waitForTimeout(75);
        assert.deepEqual(await fixture.page.evaluate(()=>hcSearchCalls),[[{promotionalRateId:'22222'}]]);
      } finally { await fixture.close(); }
    });

    await test('an explicit booking click supersedes an automatic arrival still waiting for HC',async()=>{
      const fixture=await setup('#reservenow?pr=11111',{providerPaused:true});
      try {
        await addLink(fixture.page,'#reservenow?pr=22222');
        assert.equal(await dispatchOffer(fixture.page),true);
        fixture.releaseProvider();
        await waitForLoad(fixture.page);
        await fixture.page.waitForTimeout(75);
        assert.deepEqual(await fixture.page.evaluate(()=>hcSearchCalls),[[{promotionalRateId:'22222'}]]);
        assert.equal(await fixture.page.evaluate(()=>document.body.classList.contains('hc-hidden')),false);
      } finally { await fixture.close(); }
    });

    for (const mobile of [false,true]) {
      for (const [hash,expected] of [
        ['#reservenow',[]],
        ['#reservenow?pr=76480&propertyId=hotel-monterosa&pc=MEMBER%2BSPA',[{promotionalRateId:'76480',propertyId:'hotel-monterosa',promoCode:'MEMBER+SPA'}]],
      ]) {
        await test(`named marker arrival opens once without ${mobile?'touch':'mouse'} and survives provider hash removal: ${hash}`,async()=>{
          const fixture=await setup('?utm_source=email&dest=monterosa'+hash,{mobile,providerDropsHash:true,pathname:'/development/hotelchamp-url'});
          try {
            await fixture.page.waitForFunction(()=>hcSearchCalls.length===1);
            assert.deepEqual(await fixture.page.evaluate(()=>hcSearchCalls),[expected]);
            assert.equal(await scriptCount(fixture.page),1);
            assert.equal(await fixture.page.evaluate(()=>location.pathname),'/development/hotelchamp-url');
            assert.equal(await fixture.page.evaluate(()=>new URLSearchParams(location.search).get('utm_source')),'email');
            assert.equal(await fixture.page.evaluate(()=>location.hash),'');
            assert.equal(await fixture.page.evaluate(()=>document.body.classList.contains('hc-hidden')),false);
            await fixture.page.waitForTimeout(100);
            assert.equal(await fixture.page.evaluate(()=>hcSearchCalls.length),1);
          } finally { await fixture.close(); }
        });
      }
    }

    await test('named marker takes precedence over stale native automatic opening without losing campaign context',async()=>{
      const fixture=await setup('?utm_source=email&dest=monterosa&p=base&c=search&fo=true&pr=99999#reservenow?pr=76480&propertyId=hotel-monterosa',{nativeAutoOpen:true,providerDropsHash:true});
      try {
        await fixture.page.waitForFunction(()=>hcSearchCalls.length===1);
        assert.deepEqual(await fixture.page.evaluate(()=>hcSearchCalls),[[{promotionalRateId:'76480',propertyId:'hotel-monterosa'}]]);
        assert.equal(await fixture.page.evaluate(()=>nativeOpenRequests),0,'old native URL must not open a second offer');
        assert.deepEqual(await fixture.page.evaluate(()=>Object.fromEntries(new URLSearchParams(location.search))),{utm_source:'email',dest:'monterosa'});
      } finally { await fixture.close(); }
    });

    await test('automatic named marker opening preserves an active intro visibility guard',async()=>{
      const fixture=await setup('#reservenow',{introHidden:true});
      try {
        await fixture.page.waitForFunction(()=>hcSearchCalls.length===1);
        assert.equal(await fixture.page.evaluate(()=>document.body.classList.contains('hc-hidden')),true);
      } finally { await fixture.close(); }
    });

    for (const [name,href,reserve,expected] of [
      ['generic','#reservenow',false,[]],
      ['rate and code','#reservenow?pr=76480&promoCode=MEMBER',true,[{promotionalRateId:'76480',promoCode:'MEMBER'}]],
      ['absolute same page','https://aethos-hc.test/development/hotelchamp-url#reservenow?propertyId=hotel-london&pc=DIRECT',false,[{propertyId:'hotel-london',promoCode:'DIRECT'}]],
    ]) {
      await test('named marker click opens in place without rewriting its href: '+name,async()=>{
        const fixture=await setup('',{pathname:'/development/hotelchamp-url',transition:true});
        try {
          await addLink(fixture.page,href,{reserve});
          assert.equal(await dispatchOffer(fixture.page),true);
          await fixture.page.waitForFunction(()=>hcSearchCalls.length===1);
          assert.deepEqual(await fixture.page.evaluate(()=>hcSearchCalls),[expected]);
          assert.equal(await fixture.page.locator('#offer-link').getAttribute('href'),href);
          assert.equal(fixture.page.url(),'https://aethos-hc.test/development/hotelchamp-url');
          assert.equal(await fixture.page.locator('link[rel="prerender"]').count(),0);
        } finally { await fixture.close(); }
      });
    }

    await test('hash navigation opens the new marker and allows deliberately reopening the same offer',async()=>{
      const fixture=await setup('',{providerDropsHash:true});
      try {
        await fixture.page.evaluate(()=>{location.hash='reservenow?pr=76480';});
        await fixture.page.waitForFunction(()=>hcSearchCalls.length===1);
        assert.deepEqual(await fixture.page.evaluate(()=>hcSearchCalls),[[{promotionalRateId:'76480'}]]);
        await fixture.page.evaluate(()=>{location.hash='reservenow?pr=76480';});
        await fixture.page.waitForFunction(()=>hcSearchCalls.length===2);
        assert.deepEqual(await fixture.page.evaluate(()=>hcSearchCalls),[[{promotionalRateId:'76480'}],[{promotionalRateId:'76480'}]]);
        assert.equal(await scriptCount(fixture.page),1);
      } finally { await fixture.close(); }
    });

    await test('rapid hash navigation ignores stale queued marker events',async()=>{
      const fixture=await setup('',{ready:true});
      try {
        await fixture.page.evaluate(()=>{location.hash='reservenow?pr=11111';location.hash='reservenow?pr=22222';});
        await fixture.page.waitForFunction(()=>hcSearchCalls.length===1);
        await fixture.page.waitForTimeout(75);
        assert.deepEqual(await fixture.page.evaluate(()=>hcSearchCalls),[[{promotionalRateId:'22222'}]]);
      } finally { await fixture.close(); }
    });

    await test('invalid named marker arrivals stay lazy instead of falling back to native state',async()=>{
      for(const hash of ['#reservenow?pr=invalid','#reservenow?propertyId=','#reservenow?pc=']) {
        const fixture=await setup('?p=base&c=search&fo=true&pr=99999'+hash);
        try {
          await fixture.page.waitForTimeout(75);
          assert.equal(await scriptCount(fixture.page),0,hash);
          assert.deepEqual(await fixture.page.evaluate(()=>hcSearchCalls),[]);
        } finally { await fixture.close(); }
      }
    });

    await test('cross-page named marker links navigate before the destination handles opening',async()=>{
      const fixture=await setup('',{ready:true,transition:true});
      try {
        await addLink(fixture.page,'/destinations/ericeira#reservenow?pr=76480',{reserve:true});
        await Promise.all([
          fixture.page.waitForURL('https://aethos-hc.test/destinations/ericeira#reservenow?pr=76480'),
          fixture.page.locator('#offer-link').click(),
        ]);
      } finally { await fixture.close(); }
    });

    await test('native arrivals keep loading when unused on-page option fields are blank', async () => {
      for (const extra of ['&promoCode=','&propertyId=','&pc=','&pc=MEMBER&promoCode=']) {
        const fixture=await setup(rateQuery+extra);
        try {
          await waitForLoad(fixture.page);
          assert.equal(await scriptCount(fixture.page),1);
          assert.deepEqual(await fixture.page.evaluate(()=>hcSearchCalls),[], 'native startup must not make a second opening call');
        } finally { await fixture.close(); }
      }
    });

    for (const [name, href, expected] of [
      ['short native promo code', '/reservenow?pc=TIQUO2027', {promoCode:'TIQUO2027'}],
      ['encoded promoCode', '/reservenow?promoCode=TIQUO%2BMEMBER%20%26%20SPA', {promoCode:'TIQUO+MEMBER & SPA'}],
      ['property only', '/reservenow?propertyId=hotel-monterosa', {propertyId:'hotel-monterosa'}],
      ['combined short options', '/reservenow?propertyId=hotel-monterosa&pr=76480&promoCode=TIQUO2027', {propertyId:'hotel-monterosa',promotionalRateId:'76480',promoCode:'TIQUO2027'}],
      ['fragment property and code', '#/?p=base&c=search&fo=true&propertyId=hotel-ericeira&pc=MEMBER', {propertyId:'hotel-ericeira',promoCode:'MEMBER'}],
      ['same-page native query options', '?p=base&c=search&fo=true&propertyId=hotel-london&pr=78915&pc=MEMBER', {propertyId:'hotel-london',promotionalRateId:'78915',promoCode:'MEMBER'}],
      ['explicit promoCode overrides pc', '#?p=base&c=search&fo=true&promoCode=MEMBER&pc=OLD', {promoCode:'MEMBER'}],
    ]) {
      await test(name + ' passes explicit options together without inheriting page state', async () => {
        const fixture = await setup('', {pathname:'/development/hotelchamp-url',transition:true,links:[['options-link',href]]});
        try {
          await fixture.page.evaluate(() => history.replaceState(null,'','?p=base&c=search&fo=true&pr=99999&propertyId=outer-property&promoCode=OUTER&pc=OUTER'));
          const before=fixture.page.url();
          await fixture.page.locator('#options-link').click();
          await fixture.page.waitForFunction(() => hcSearchCalls.length === 1);
          assert.deepEqual(await fixture.page.evaluate(() => hcSearchCalls), [[expected]]);
          assert.equal(fixture.page.url(),before);
          assert.equal(await scriptCount(fixture.page),1);
        } finally { await fixture.close(); }
      });
    }

    await test('consecutive hotel offer buttons pass distinct properties and generic booking adds no options', async () => {
      const fixture=await setup('',{ready:true,transition:true,pathname:'/development/hotelchamp-url',links:[
        ['offer-a','/reservenow?propertyId=hotel-monterosa&pr=76480&pc=TIQUO'],
        ['offer-b','/reservenow?propertyId=hotel-london&pr=78915'],
        ['offer-generic','/reservenow'],
      ]});
      try {
        await fixture.page.locator('#offer-a').click();
        await fixture.page.waitForFunction(()=>hcSearchCalls.length===1);
        await fixture.page.locator('#offer-b').click();
        await fixture.page.waitForFunction(()=>hcSearchCalls.length===2);
        await fixture.page.locator('#offer-generic').click();
        await fixture.page.waitForFunction(()=>hcSearchCalls.length===3);
        assert.deepEqual(await fixture.page.evaluate(()=>hcSearchCalls),[
          [{propertyId:'hotel-monterosa',promotionalRateId:'76480',promoCode:'TIQUO'}],
          [{propertyId:'hotel-london',promotionalRateId:'78915'}],
          [],
        ]);
        assert.equal(fixture.page.url(),'https://aethos-hc.test/development/hotelchamp-url');
      } finally { await fixture.close(); }
    });

    await test('blank property or promo fields do not fall back to generic reserve opening', async () => {
      for (const href of ['/reservenow?propertyId=','/reservenow?propertyId=%20%20','/reservenow?promoCode=','/reservenow?pc=%20%20']) {
        const fixture=await setup('',{ready:true});
        try {
          await addLink(fixture.page,href,{reserve:true});
          const handled=await fixture.page.evaluate(()=>{
            let handled;
            document.addEventListener('click',e=>{handled=e.defaultPrevented;e.preventDefault();},{once:true});
            document.querySelector('#offer-link').click();
            return handled;
          });
          assert.equal(handled,false,href);
          assert.deepEqual(await fixture.page.evaluate(()=>hcSearchCalls),[]);
        } finally { await fixture.close(); }
      }
    });

    for (const [href, expectedHref, expected] of [
      ['/reservenow', '#?p=base&c=search&fo=true', []],
      ['/reservenow?pr=76480', '#?p=base&c=search&fo=true&pr=76480', [{ promotionalRateId: '76480' }]],
      ['https://aethos-hc.test/reservenow/', '#?p=base&c=search&fo=true', []],
    ]) {
      await test('short link rewrites before HC loads and opens on the nested page: ' + href, async () => {
        const fixture = await setup('', { pathname: '/development/hotelchamp-url', transition: true, links: [['offer-link', href]] });
        try {
          assert.equal(await fixture.page.locator('#offer-link').getAttribute('href'), expectedHref);
          assert.equal(await fixture.page.locator('#offer-link').getAttribute('target'), null);
          assert.equal(await scriptCount(fixture.page), 0, 'rewriting must not load HC');
          await fixture.page.evaluate(() => history.replaceState(null, '', '?p=base&c=search&fo=true&pr=88888'));
          const before = fixture.page.url();
          await fixture.page.locator('#offer-link').click();
          await fixture.page.waitForFunction(() => hcSearchCalls.length === 1);
          assert.deepEqual(await fixture.page.evaluate(() => hcSearchCalls), [expected]);
          assert.equal(fixture.page.url(), before);
          assert.equal(await fixture.page.locator('link[rel="prerender"]').count(), 0);
        } finally { await fixture.close(); }
      });
    }

    await test('dynamically inserted short rate link rewrites through the delegated handler', async () => {
      const fixture = await setup('', { ready: true, transition: true, pathname: '/development/hotelchamp-url' });
      try {
        await addLink(fixture.page, '/reservenow?pr=76480', { reserve: true });
        assert.equal(await dispatchOffer(fixture.page), true);
        await fixture.page.waitForFunction(() => hcSearchCalls.length === 1);
        assert.deepEqual(await fixture.page.evaluate(() => hcSearchCalls), [[{ promotionalRateId: '76480' }]]);
        assert.equal(await fixture.page.locator('#offer-link').getAttribute('href'), '#?p=base&c=search&fo=true&pr=76480');
        assert.equal(fixture.page.url(), 'https://aethos-hc.test/development/hotelchamp-url');
      } finally { await fixture.close(); }
    });

    await test('non-alias paths and other origins are not rewritten', async () => {
      const links = [
        ['other-origin', 'https://example.com/reservenow'],
        ['other-page', '/destinations/ericeira/reservenow'],
        ['similar-path', '/reservenow-offer'],
      ];
      const fixture = await setup('', { links });
      try {
        for (const [id, href] of links) assert.equal(await fixture.page.locator('#' + id).getAttribute('href'), href);
        assert.equal(await scriptCount(fixture.page), 0);
      } finally { await fixture.close(); }
    });

    await test('dynamic short links are normalised without intercepting modified or targeted clicks', async () => {
      for (const [attributes, options] of [[{}, {ctrlKey:true}], [{target:'_blank'}, {}], [{download:'booking'}, {}]]) {
        const fixture = await setup('', { ready:true, transition:true });
        try {
          await addLink(fixture.page, '/reservenow?pr=76480');
          const handled = await fixture.page.evaluate(({attributes, options}) => {
            const link=document.querySelector('#offer-link');
            for(const [key,value] of Object.entries(attributes)) link.setAttribute(key,value);
            let handled;
            document.addEventListener('click', event=>{handled=event.defaultPrevented;event.preventDefault();},{once:true});
            link.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,button:0,...options}));
            return handled;
          },{attributes,options});
          assert.equal(handled,false);
          assert.equal(await fixture.page.locator('#offer-link').getAttribute('href'),'#?p=base&c=search&fo=true&pr=76480');
          assert.deepEqual(await fixture.page.evaluate(()=>hcSearchCalls),[]);
        } finally { await fixture.close(); }
      }
    });

    await test('invalid short rate links do not fall back to generic reserve opening', async () => {
      const fixture = await setup('', {ready:true});
      try {
        await addLink(fixture.page,'/reservenow?pr=invalid',{reserve:true});
        const handled=await fixture.page.evaluate(()=>{
          let handled;
          document.addEventListener('click', event=>{handled=event.defaultPrevented;event.preventDefault();},{once:true});
          document.querySelector('#offer-link').click();
          return handled;
        });
        assert.equal(handled,false);
        assert.deepEqual(await fixture.page.evaluate(()=>hcSearchCalls),[]);
      } finally { await fixture.close(); }
    });

    for (const [name, href, reserve, expected] of [
      ['generic fragment', '#?p=base&c=search&fo=true', false, []],
      ['rate fragment overrides reserve class', '#?p=base&c=search&fo=true&pr=76480', true, [{ promotionalRateId: '76480' }]],
      ['slash generic fragment', '#/?p=base&c=search&fo=true', false, []],
      ['slash rate fragment', '#/?p=base&c=search&fo=true&pr=76480', false, [{ promotionalRateId: '76480' }]],
      ['absolute generic fragment overrides outer rate', 'https://aethos-hc.test/development/hotelchamp-url?p=base&c=search&fo=true&pr=99999#?p=base&c=search&fo=true', false, []],
      ['absolute rate fragment overrides outer rate', 'https://aethos-hc.test/development/hotelchamp-url?p=base&c=search&fo=true&pr=99999#/?p=base&c=search&fo=true&pr=76480', false, [{ promotionalRateId: '76480' }]],
    ]) {
      await test(name + ' opens on the current nested page after HC changes its URL', async () => {
        const fixture = await setup('', { pathname: '/development/hotelchamp-url', transition: true });
        try {
          await addLink(fixture.page, href, { reserve });
          // Model HC updating the page URL after the button has been rendered.
          await fixture.page.evaluate(() => history.replaceState(null, '', '/development/hotelchamp-url?p=base&c=search&fo=true&pr=88888&br=remembered&lg=en-US'));
          const before = fixture.page.url();
          assert.equal(await dispatchOffer(fixture.page), true, 'fragment booking click was not intercepted');
          await fixture.page.waitForFunction(() => hcSearchCalls.length === 1);
          assert.deepEqual(await fixture.page.evaluate(() => hcSearchCalls), [expected]);
          assert.equal(fixture.page.url(), before, 'booking must not navigate or add a hash');
          assert.equal(await fixture.page.locator('#offer-link').getAttribute('href'), href, 'authored href must be preserved');
          assert.equal(await fixture.page.locator('link[rel="prerender"]').count(), 0);
          assert.equal(await scriptCount(fixture.page), 1);
        } finally { await fixture.close(); }
      });
    }

    await test('ordinary hashes and invalid or cross-page fragments do not open HC', async () => {
      for (const [href, reserve] of [
        ['#', false], ['#rooms', false], ['#?p=base&c=search&fo=false', false],
        ['#?p=base&c=search&fo=true&pr=invalid', true],
        ['#/?p=base&c=search&fo=true&pr=', true],
        ['/destinations/ericeira#?p=base&c=search&fo=true&pr=76480', true],
        ['https://example.com/#?p=base&c=search&fo=true&pr=76480', true],
      ]) {
        const fixture = await setup('', { ready: true, transition: true });
        try {
          await fixture.page.evaluate(() => history.replaceState(null, '', '?p=base&c=search&fo=true&pr=88888'));
          await addLink(fixture.page, href, { reserve });
          const handled = await fixture.page.evaluate(() => {
            let handled;
            document.addEventListener('click', event => { handled = event.defaultPrevented; event.preventDefault(); }, { once: true });
            document.querySelector('#offer-link').click();
            return handled;
          });
          assert.equal(handled, false, href);
          assert.deepEqual(await fixture.page.evaluate(() => hcSearchCalls), [], href);
        } finally { await fixture.close(); }
      }
    });

    await test('fragment-only arrival stays lazy rather than invoking native auto-opening', async () => {
      const fixture = await setup('#?p=base&c=search&fo=true&pr=76480');
      try {
        await fixture.page.waitForTimeout(100);
        assert.equal(await scriptCount(fixture.page), 0);
        assert.deepEqual(await fixture.page.evaluate(() => hcSearchCalls), []);
      } finally { await fixture.close(); }
    });

    await test('malformed Webflow hrefs do not stop link setup or HC startup', async () => {
      const fixture = await setup(rateQuery, { links: [
        ['bad-generic', 'https://?p=base&c=search&fo=true'],
        ['bad-rate', 'https://?p=base&c=search&fo=true&pr=76480'],
        ['external', 'https://example.com/'],
        ['internal', 'https://aethos-hc.test/destinations/monterosa'],
      ] });
      try {
        await waitForLoad(fixture.page);
        assert.equal(await fixture.page.locator('#external').getAttribute('target'), '_blank');
        assert.equal(await fixture.page.locator('#external').getAttribute('rel'), 'noopener');
        for (const id of ['bad-generic', 'bad-rate', 'internal']) {
          assert.equal(await fixture.page.locator('#' + id).getAttribute('target'), null);
        }
        assert.equal(await scriptCount(fixture.page), 1);
      } finally { await fixture.close(); }
    });

    await test('page transition ignores malformed hrefs without throwing', async () => {
      const fixture = await setup('', { ready: true, transition: true });
      try {
        await addLink(fixture.page, 'https://?p=base&c=search&fo=true&pr=76480');
        const errors = [];
        fixture.page.on('pageerror', error => errors.push(error.message));
        await fixture.page.evaluate(() => {
          document.addEventListener('click', event => event.preventDefault(), { once: true });
          document.querySelector('#offer-link').click();
        });
        await fixture.page.waitForTimeout(75);
        assert.deepEqual(errors, []);
        assert.equal(await fixture.page.locator('link[rel="prerender"]').count(), 0);
        assert.deepEqual(await fixture.page.evaluate(() => hcSearchCalls), []);
      } finally { await fixture.close(); }
    });

    for (const [query, expected] of [[genericQuery, []], [rateQuery, [{ promotionalRateId: '76481' }]]]) {
      await test('existing relative-link attribute repairs Webflow ./ booking URL: ' + query, async () => {
        const fixture = await setup('', { ready: true, links: [['relative-booking', 'https://./' + query, true]] });
        try {
          const link = fixture.page.locator('#relative-booking');
          assert.equal(await link.getAttribute('href'), '/destinations/monterosa/' + query);
          assert.equal(await link.getAttribute('target'), null);
          await link.click();
          await fixture.page.waitForFunction(() => hcSearchCalls.length === 1);
          assert.deepEqual(await fixture.page.evaluate(() => hcSearchCalls), [expected]);
          assert.equal(fixture.page.url(), 'https://aethos-hc.test/destinations/monterosa');
        } finally { await fixture.close(); }
      });
    }

    for (const mobile of [false, true]) {
      await test(`native rate link loads without ${mobile ? 'touch' : 'mouse movement'}`, async () => {
        const fixture = await setup(rateQuery + '&utm_source=festive', { mobile });
        try {
          await waitForLoad(fixture.page);
          assert.equal(await scriptCount(fixture.page), 1);
          assert.equal(await fixture.page.evaluate(() => location.search), rateQuery + '&utm_source=festive');
          assert.deepEqual(await fixture.page.evaluate(() => hcSearchCalls), [], 'Aethos must leave native auto-opening to Hotelchamp');
          await fixture.page.mouse.move(100, 100);
          if (mobile) await fixture.page.touchscreen.tap(200, 200);
          await fixture.page.waitForTimeout(100);
          assert.equal(await scriptCount(fixture.page), 1, 'later intent duplicated the provider script');
        } finally { await fixture.close(); }
      });
      await test(`generic native link loads without ${mobile ? 'touch' : 'mouse movement'}`, async () => {
        const fixture = await setup(genericQuery, { mobile });
        try {
          await waitForLoad(fixture.page);
          assert.equal(await scriptCount(fixture.page), 1);
          assert.deepEqual(await fixture.page.evaluate(() => hcSearchCalls), []);
        } finally { await fixture.close(); }
      });
    }

    await test('ordinary and incomplete links stay lazy', async () => {
      for (const query of [
        '', '?utm_source=festive', '?pr=76481',
        '?p=base&c=search&fo=false&pr=76481',
        '?p=other&c=search&fo=true&pr=76481',
        '?p=base&c=other&fo=true&pr=76481',
        '?p=base&c=search&fo=true&pr=',
        '?p=base&c=search&fo=true&pr=invalid',
      ]) {
        const fixture = await setup(query);
        try {
          await fixture.page.waitForTimeout(75);
          assert.equal(await scriptCount(fixture.page), 0, query || 'ordinary visit');
        } finally { await fixture.close(); }
      }
    });

    await test('ordinary desktop movement still warms the provider without opening', async () => {
      const fixture = await setup();
      try {
        await fixture.page.mouse.move(100, 100);
        await waitForLoad(fixture.page);
        assert.equal(await scriptCount(fixture.page), 1);
        assert.deepEqual(await fixture.page.evaluate(() => hcSearchCalls), []);
      } finally { await fixture.close(); }
    });

    await test('ordinary mobile touch still warms the provider', async () => {
      const fixture = await setup('', { mobile: true });
      try {
        await fixture.page.touchscreen.tap(200, 200);
        await waitForLoad(fixture.page);
        assert.equal(await scriptCount(fixture.page), 1);
      } finally { await fixture.close(); }
    });

    await test('booking click still opens once and restores visibility', async () => {
      const fixture = await setup();
      try {
        await fixture.page.locator('.button.reservenow').click();
        await fixture.page.waitForFunction(() => hcSearchCalls.length === 1);
        assert.deepEqual(await fixture.page.evaluate(() => hcSearchCalls), [[]]);
        assert.equal(await fixture.page.locator('body.hc-hidden').count(), 0);
      } finally { await fixture.close(); }
    });

    await test('deep link reuses a provider that is already ready', async () => {
      const fixture = await setup(rateQuery, { ready: true });
      try {
        await fixture.page.waitForTimeout(75);
        assert.equal(await scriptCount(fixture.page), 0);
        assert.deepEqual(await fixture.page.evaluate(() => hcSearchCalls), []);
      } finally { await fixture.close(); }
    });

    for (const [name, href, reserve, expected] of [
      ['query-only generic link', genericQuery, false, []],
      ['query-only rate link', rateQuery, false, [{ promotionalRateId: '76481' }]],
      ['nested reserve link gives URL rate precedence', rateQuery, true, [{ promotionalRateId: '76481' }]],
      ['absolute same-page link', 'https://aethos-hc.test/destinations/monterosa' + rateQuery, false, [{ promotionalRateId: '76481' }]],
      ['destination-path generic link', '/destinations/monterosa' + genericQuery, false, []],
      ['destination-path rate link', '/destinations/monterosa' + rateQuery, false, [{ promotionalRateId: '76481' }]],
      ['same-page link with trailing slash', '/destinations/monterosa/' + rateQuery, false, [{ promotionalRateId: '76481' }]],
    ]) {
      await test(name + ' opens in place once', async () => {
        const fixture = await setup('?utm_source=retained');
        try {
          await addLink(fixture.page, href, { reserve });
          assert.equal(await dispatchOffer(fixture.page), true, 'booking click was not intercepted');
          await fixture.page.waitForFunction(() => hcSearchCalls.length === 1);
          assert.deepEqual(await fixture.page.evaluate(() => hcSearchCalls), [expected]);
          assert.equal(await fixture.page.evaluate(() => location.pathname + location.search), '/destinations/monterosa?utm_source=retained');
          assert.equal(await scriptCount(fixture.page), 1);
        } finally { await fixture.close(); }
      });
    }

    await test('page transition does not navigate after an in-place booking click', async () => {
      const fixture = await setup('', { ready: true, transition: true });
      try {
        await addLink(fixture.page, rateQuery, { reserve: true });
        assert.equal(await dispatchOffer(fixture.page), true);
        await fixture.page.waitForTimeout(150);
        assert.equal(fixture.page.url(), 'https://aethos-hc.test/destinations/monterosa');
        assert.deepEqual(await fixture.page.evaluate(() => hcSearchCalls), [[{ promotionalRateId: '76481' }]]);
        assert.equal(await fixture.page.locator('link[rel="prerender"]').count(), 0);
      } finally { await fixture.close(); }
    });

    for (const query of [genericQuery, rateQuery]) {
      await test('cross-hotel reserve link navigates with options: ' + query, async () => {
        const fixture = await setup('', { ready: true });
        try {
          await addLink(fixture.page, '/destinations/ericeira' + query, { reserve: true });
          await Promise.all([
            fixture.page.waitForURL('https://aethos-hc.test/destinations/ericeira' + query),
            fixture.page.locator('#offer-link').click(),
          ]);
        } finally { await fixture.close(); }
      });
    }

    await test('new-tab, modified and download booking links keep native behaviour', async () => {
      for (const href of [rateQuery, '#reservenow?pr=76481']) {
      for (const [attributes, options] of [
        [{ target: '_blank' }, {}], [{ target: 'booking-tab' }, {}],
        [{ download: 'booking' }, {}], [{}, { metaKey: true }],
        [{}, { ctrlKey: true }], [{}, { shiftKey: true }],
        [{}, { altKey: true }], [{}, { button: 1 }],
      ]) {
        const fixture = await setup('', { ready: true, transition: true });
        try {
          await addLink(fixture.page, href, { reserve: true });
          const handled = await fixture.page.evaluate(({ attributes, options }) => {
            const link = document.querySelector('#offer-link');
            for (const [key, value] of Object.entries(attributes)) link.setAttribute(key, value);
            let wasHandled;
            // Observe the production listeners, then cancel the browser default
            // so this test does not actually open windows or download a page.
            document.addEventListener('click', event => {
              wasHandled = event.defaultPrevented;
              event.preventDefault();
            }, { once: true });
            link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0, ...options }));
            return wasHandled;
          }, { attributes, options });
          assert.equal(handled, false, JSON.stringify({ attributes, options }));
          assert.deepEqual(await fixture.page.evaluate(() => hcSearchCalls), []);
          assert.equal(await fixture.page.locator('link[rel="prerender"]').count(), 0);
        } finally { await fixture.close(); }
      }
      }
    });
  } finally {
    if (browser) await browser.close();
  }
  if (failures) process.exitCode = 1;
})().catch(error => { console.error(error); process.exitCode = 1; });
