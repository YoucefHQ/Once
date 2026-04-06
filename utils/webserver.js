process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';
process.env.ASSET_PATH = '/';

var esbuild = require('esbuild');
var path = require('path');
var { copyAssets, getEntryPoints, root } = require('./build');

var browserLaunched = false;

async function launchBrowser() {
  if (browserLaunched) return;
  browserLaunched = true;

  var puppeteer = require('puppeteer');
  var extensionPath = path.join(root, 'build');

  var browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: [
      '--disable-extensions-except=' + extensionPath,
      '--load-extension=' + extensionPath,
      '--no-first-run',
      '--disable-default-apps',
      '--window-size=1280,900',
    ],
  });

  // Wait for the extension service worker to register
  var swTarget = await browser.waitForTarget(
    function (t) {
      return (
        t.type() === 'service_worker' &&
        t.url().includes('background.bundle.js')
      );
    },
    { timeout: 10000 }
  );
  var extensionId = new URL(swTarget.url()).hostname;

  // Open the options page
  var page = (await browser.pages())[0] || (await browser.newPage());
  await page.goto('chrome-extension://' + extensionId + '/options.html');

  console.log(
    'Browser launched with extension loaded (ID: ' + extensionId + ')'
  );
  console.log(
    'Reload the extension at chrome://extensions after making changes'
  );

  // Exit the dev server when the browser is closed
  browser.on('disconnected', function () {
    console.log('Browser closed, shutting down...');
    process.exit(0);
  });
}

async function start() {
  await copyAssets();

  // Create esbuild contexts for watch mode
  var contexts = await Promise.all(
    getEntryPoints().map(function (opts) {
      return esbuild.context(opts);
    })
  );

  // Initial build
  await Promise.all(
    contexts.map(function (ctx) {
      return ctx.rebuild();
    })
  );
  console.log('Initial build complete');

  // Watch for changes
  await Promise.all(
    contexts.map(function (ctx) {
      return ctx.watch();
    })
  );
  console.log('Watching for changes...');

  await launchBrowser();
}

start().catch(function (err) {
  console.error(err);
  process.exit(1);
});
