// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';
process.env.ASSET_PATH = '/';

var WebpackDevServer = require('webpack-dev-server'),
  webpack = require('webpack'),
  config = require('../webpack.config'),
  env = require('./env'),
  path = require('path'),
  net = require('net');

function findFreePort(startPort) {
  return new Promise(function (resolve, reject) {
    var server = net.createServer();
    server.listen(startPort, function () {
      var port = server.address().port;
      server.close(function () {
        resolve(port);
      });
    });
    server.on('error', function () {
      resolve(findFreePort(startPort + 1));
    });
  });
}

var browserLaunched = false;

async function launchBrowser() {
  if (browserLaunched) return;
  browserLaunched = true;

  var puppeteer = require('puppeteer');
  var extensionPath = path.resolve(__dirname, '../build');

  var browser = await puppeteer.launch({
    headless: false,
    args: [
      '--disable-extensions-except=' + extensionPath,
      '--load-extension=' + extensionPath,
      '--no-first-run',
      '--disable-default-apps',
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

  console.log('Browser launched with extension loaded (ID: ' + extensionId + ')');
  console.log('Reload the extension at chrome://extensions after making changes');

  // Exit the dev server when the browser is closed
  browser.on('disconnected', function () {
    console.log('Browser closed, shutting down dev server...');
    process.exit(0);
  });
}

(async () => {
  var preferredPort = process.env.PORT || env.PORT;
  var port = await findFreePort(preferredPort);

  // Don't inject HMR client into entry points — Chrome extensions block
  // eval() via Content Security Policy, which the HMR runtime requires.
  // Instead, we just use writeToDisk and let the developer reload the extension.
  delete config.chromeExtensionBoilerplate;

  var compiler = webpack(config);

  var server = new WebpackDevServer(
    {
      server: 'http',
      hot: false,
      liveReload: false,
      client: false,
      port: port,
      static: {
        directory: path.join(__dirname, '../build'),
      },
      devMiddleware: {
        writeToDisk: true,
        publicPath: 'http://localhost:' + port,
      },
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      allowedHosts: 'all',
    },
    compiler
  );

  await server.start();
  console.log('Dev server is listening on port ' + port);

  // Launch browser after the first successful build
  compiler.hooks.done.tap('LaunchBrowser', function (stats) {
    if (!stats.hasErrors()) {
      launchBrowser();
    }
  });
})();
