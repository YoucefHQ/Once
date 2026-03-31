// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';
process.env.ASSET_PATH = '/';

var webpack = require('webpack'),
  config = require('../webpack.config');

delete config.chromeExtensionBoilerplate;

config.mode = 'production';

webpack(config, function (err, stats) {
  if (err) throw err;
  if (stats.hasErrors()) {
    console.error(
      stats.toString({
        colors: true,
        errors: true,
        warnings: false,
        modules: false,
        chunks: false,
        assets: false,
      })
    );
    process.exit(1);
  }
});
