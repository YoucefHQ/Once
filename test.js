const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());
const assert = require('assert');

const extensionPath = 'build';
let optionsPage = null;
let browser = null;

describe('Test: Once', function () {
  this.timeout(20000000); // default is 2 seconds and that may not be enough to boot browsers and pages.
  before(async function () {
    await boot();
  });

  describe('Installation', async function () {
    it('Welcome Copy', async function () {
      const welcomeCopy = await optionsPage.$eval(
        'h2',
        (element) => element.textContent
      );
      assert.equal(
        welcomeCopy,
        'Welcome to Once!',
        'Welcome message is not shown'
      );
    });
    it('Sign in Button', async function () {
      const signInButton = await optionsPage.$eval(
        'button',
        (element) => element.textContent
      );
      assert.equal(
        signInButton,
        'Sign in with Google',
        'Sign in button is not shown'
      );
    });
    it('Guest Copy', async function () {
      const guestCopy = await optionsPage.$eval(
        'span',
        (element) => element.textContent
      );
      assert.equal(guestCopy, 'Guest ▾', 'Guest is not shown');
    });
  });

  describe('Authentication', async function () {
    it('Google Auth', async function () {
      await optionsPage.waitForSelector('button');
      await optionsPage.click('button');

      const pages = await browser.pages();
      const page = pages[pages.length - 1];

      const nav = new Promise((res) => browser.on('targetcreated', res));

      await page.waitForSelector('#identifierId');
      await page.type('#identifierId', 'technologiste@gmail.com');
      await page.click('#identifierNext');
      await page.close();
    });
  });

  describe('Core functionality', async function () {
    it('Hacker News on blocklist', async function () {
      await optionsPage.evaluate(() => {
        localStorage.setItem(
          'onceBlockedWebsites',
          '["https://news.ycombinator.com/"]'
        );
      });
    });
    it('Visiting Hacker News', async function () {
      const hn = await browser.newPage();
      await hn.goto('https://news.ycombinator.com/');
      const onboardingCopy = await hn.$eval(
        '#onceContent',
        (element) => element.textContent
      );
      assert.equal(
        onboardingCopy,
        'Once limits your visits of Hacker News to once an hour. The timer will start after closing this tabGot it',
        'Onboarding is not shown'
      );
      await hn.close();
    });
    it('Blocking Hacker News', async function () {
      const hn = await browser.newPage();
      await hn.goto('https://news.ycombinator.com/');
      const blockedButtonCopy = await hn.$eval(
        '#onceButton',
        (element) => element.textContent
      );
      assert.equal(
        blockedButtonCopy,
        'Close Hacker News',
        'Close Button is not shown'
      );
      await hn.close();
    });
  });

  after(async function () {
    await browser.close();
  });
});

async function boot() {
  browser = await puppeteer.launch({
    executablePath: '/opt/homebrew/bin/chromium',
    headless: false, // extension are allowed only in head-full mode
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
    ],
  });

  optionsPage = await browser.newPage();
  await optionsPage.goto(
    `chrome-extension://pehpnecbcgnojaehcffciiaplapajkda/options.html`
  );
}
