const puppeteer = require('puppeteer');
const assert = require('assert');
const path = require('path');
const fs = require('fs');

const extensionPath = path.resolve(__dirname, 'build');
let optionsPage = null;
let browser = null;
let extensionId = null;

describe('Test: Once', function () {
  this.timeout(30000);
  before(async function () {
    await boot();
  });

  describe('Options page', function () {
    it('shows the heading', async function () {
      const heading = await optionsPage.$eval(
        'h1',
        (element) => element.textContent
      );
      assert.equal(heading, 'Once');
    });
    it('shows the subtitle', async function () {
      const subtitle = await optionsPage.$eval(
        'h2',
        (element) => element.textContent
      );
      assert.equal(subtitle, 'Which websites waste your time?');
    });
    it('shows the multi-select', async function () {
      const select = await optionsPage.$('.multi-select');
      assert.ok(select);
    });
  });

  describe('Core functionality', function () {
    it('adds Hacker News to blocklist via the options page', async function () {
      // Click the react-select input to open the dropdown
      await optionsPage.click('.multi-select input');
      // Type to filter for Hacker News
      await optionsPage.type('.multi-select input', 'Hacker');
      // Wait for the option to appear and click it
      await optionsPage.waitForSelector('[class*="-option"]', {
        timeout: 3000,
      });
      await optionsPage.click('[class*="-option"]');
      // Close the dropdown (stays open with closeMenuOnSelect={false})
      await optionsPage.keyboard.press('Escape');
      // Click Save
      await optionsPage.click('button');
      // Verify the button text changed to confirm the save
      const buttonText = await optionsPage.$eval(
        'button',
        (el) => el.textContent
      );
      assert.ok(buttonText.includes('You are all set'));
    });
    it('shows onboarding on first visit to blocked site', async function () {
      const hn = await browser.newPage();
      await hn.goto('https://news.ycombinator.com/', {
        waitUntil: 'domcontentloaded',
      });
      await hn.waitForSelector('#onceContent', { timeout: 5000 });
      const onboardingText = await hn.$eval(
        '#onceContent p',
        (element) => element.textContent
      );
      assert.ok(
        onboardingText.includes('Once'),
        'Onboarding banner should mention Once'
      );
      assert.ok(
        onboardingText.includes('Hacker News'),
        'Onboarding banner should mention the website name'
      );
      // Close tab — triggers onRemoved which records the visit timestamp
      await hn.close();
    });
    it('blocks the site on subsequent visit', async function () {
      // Wait for the background's onRemoved handler to store the visit timestamp
      await new Promise((r) => setTimeout(r, 1000));

      const hn = await browser.newPage();
      await hn.goto('https://news.ycombinator.com/', {
        waitUntil: 'load',
      });

      await hn.waitForSelector('#onceButton', { timeout: 10000 });
      const buttonText = await hn.$eval(
        '#onceButton',
        (element) => element.textContent
      );
      assert.equal(buttonText, 'Close tab');
      await hn.close();
    });
  });

  describe('Aggressive mode', function () {
    it('shows the toggle defaulting to off', async function () {
      const toggleExists = await optionsPage.$('.toggle-switch');
      assert.ok(toggleExists, 'Toggle switch should exist on options page');
      const isActive = await optionsPage.$eval('.toggle-switch', (el) =>
        el.classList.contains('active')
      );
      assert.equal(isActive, false, 'Toggle should default to off');
    });

    it('adds Techmeme to blocklist', async function () {
      await optionsPage.click('.multi-select input');
      await optionsPage.type('.multi-select input', 'Techmeme');
      await optionsPage.waitForSelector('[class*="-option"]', {
        timeout: 3000,
      });
      await optionsPage.click('[class*="-option"]');
      await optionsPage.keyboard.press('Escape');
      // Click Save
      await optionsPage.click('button');
    });

    it('enables aggressive mode via toggle click', async function () {
      await optionsPage.click('.toggle-switch');
      const isActive = await optionsPage.$eval('.toggle-switch', (el) =>
        el.classList.contains('active')
      );
      assert.equal(isActive, true, 'Toggle should be active after click');
    });

    it('shows aggressive onboarding on first visit to Hacker News', async function () {
      // Clear any existing timestamps so this counts as a fresh visit
      const sw = await getServiceWorker();
      await sw.evaluate(() =>
        chrome.storage.local.remove([
          'Hacker News',
          'Techmeme',
          'onceGlobalTimestamp',
          'onceGlobalTriggerSite',
        ])
      );

      const hn = await browser.newPage();
      await hn.goto('https://news.ycombinator.com/', {
        waitUntil: 'domcontentloaded',
      });
      await hn.waitForSelector('#onceContent', { timeout: 5000 });
      const onboardingText = await hn.$eval(
        '#onceContent p',
        (el) => el.textContent
      );
      assert.ok(
        onboardingText.includes('all blocked websites'),
        'Aggressive onboarding should mention all blocked websites'
      );
      assert.ok(
        onboardingText.includes('timer has started'),
        'Aggressive onboarding should say timer has started'
      );
      await hn.close();
    });

    it('blocks a different site (Techmeme) after visiting Hacker News', async function () {
      // Wait for the background's onRemoved handler to store the visit timestamp
      await new Promise((r) => setTimeout(r, 1000));

      const tm = await browser.newPage();
      await tm.goto('https://techmeme.com/', {
        waitUntil: 'load',
      });

      await tm.waitForSelector('#onceButton', { timeout: 10000 });
      const buttonText = await tm.$eval(
        '#onceButton',
        (el) => el.textContent
      );
      assert.equal(buttonText, 'Close tab');
      await tm.close();
    });
  });

  after(async function () {
    if (browser) await browser.close();
    const tmpDir = path.join(__dirname, '.test-profile');
    fs.rmSync(tmpDir, { recursive: true, force: true, maxRetries: 3 });
  });
});

async function getServiceWorker() {
  const swTarget = await browser.waitForTarget(
    (t) =>
      t.type() === 'service_worker' &&
      t.url().startsWith(`chrome-extension://${extensionId}/`),
    { timeout: 5000 }
  );
  return await swTarget.worker();
}

async function boot() {
  const tmpDir = path.join(__dirname, '.test-profile');
  browser = await puppeteer.launch({
    headless: false, // extensions are allowed only in head-full mode
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
      '--no-first-run',
      '--disable-default-apps',
      `--user-data-dir=${tmpDir}`,
    ],
  });

  // Wait for our extension's service worker to register
  const swTarget = await browser.waitForTarget(
    (t) =>
      t.type() === 'service_worker' &&
      t.url().includes('background.bundle.js'),
    { timeout: 15000 }
  );
  extensionId = new URL(swTarget.url()).hostname;

  // The extension auto-opens the options page on install; find that tab
  await new Promise((r) => setTimeout(r, 500));
  const pages = await browser.pages();
  optionsPage = pages.find((p) =>
    p.url().includes(`chrome-extension://${extensionId}/options.html`)
  );
  if (!optionsPage) {
    optionsPage = await browser.newPage();
    await optionsPage.goto(
      `chrome-extension://${extensionId}/options.html`,
      { waitUntil: 'domcontentloaded' }
    );
  }
}
