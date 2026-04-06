var esbuild = require('esbuild');
var fs = require('fs-extra');
var path = require('path');

var root = path.resolve(__dirname, '..');
var buildDir = path.join(root, 'build');

function getCommonOptions() {
  var isProduction = process.env.NODE_ENV === 'production';
  return {
    bundle: true,
    minify: isProduction,
    sourcemap: isProduction ? false : 'inline',
    define: {
      'process.env.NODE_ENV': JSON.stringify(
        process.env.NODE_ENV || 'development'
      ),
    },
    jsx: 'automatic',
  };
}

function getEntryPoints() {
  var common = getCommonOptions();
  return [
    {
      ...common,
      entryPoints: [path.join(root, 'src', 'pages', 'Options', 'index.tsx')],
      outfile: path.join(buildDir, 'options.bundle.js'),
    },
    {
      ...common,
      entryPoints: [path.join(root, 'src', 'pages', 'Background', 'index.js')],
      outfile: path.join(buildDir, 'background.bundle.js'),
      format: 'esm',
    },
    {
      ...common,
      entryPoints: [path.join(root, 'src', 'pages', 'Content', 'index.js')],
      outfile: path.join(buildDir, 'contentScript.bundle.js'),
    },
  ];
}

async function copyAssets() {
  await fs.emptyDir(buildDir);

  // Manifest with version/description from package.json
  var pkg = await fs.readJson(path.join(root, 'package.json'));
  var manifest = await fs.readJson(path.join(root, 'src', 'manifest.json'));
  manifest.description = pkg.description;
  manifest.version = pkg.version;
  await fs.writeJson(path.join(buildDir, 'manifest.json'), manifest);

  // Icons
  var imgDir = path.join(root, 'src', 'assets', 'img');
  var icons = await fs.readdir(imgDir);
  await Promise.all(
    icons.map(function (icon) {
      return fs.copy(path.join(imgDir, icon), path.join(buildDir, icon));
    })
  );

  // Generate options.html with CSS and JS references
  var html = await fs.readFile(
    path.join(root, 'src', 'pages', 'Options', 'index.html'),
    'utf-8'
  );
  html = html.replace(
    '</body>',
    '  <script src="options.bundle.js"></script>\n  <link rel="stylesheet" href="options.bundle.css">\n  </body>'
  );
  await fs.writeFile(path.join(buildDir, 'options.html'), html);

  // CSS to public/ (for the website)
  await fs.copy(
    path.join(root, 'src', 'assets', 'css'),
    path.join(root, 'public')
  );
  await fs.copy(
    path.join(root, 'src', 'pages', 'Options', 'Options.css'),
    path.join(root, 'public', 'Options.css')
  );
}

async function build() {
  await copyAssets();
  await Promise.all(
    getEntryPoints().map(function (opts) {
      return esbuild.build(opts);
    })
  );
  console.log('Build complete!');
}

module.exports = { build, copyAssets, getEntryPoints, root, buildDir };

if (require.main === module) {
  process.env.BABEL_ENV = 'production';
  process.env.NODE_ENV = 'production';
  process.env.ASSET_PATH = '/';

  build().catch(function (err) {
    console.error(err);
    process.exit(1);
  });
}
