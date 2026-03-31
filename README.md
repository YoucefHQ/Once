<img src="src/assets/img/icon-240.png" width="80">

# Once

Once is a Chrome extension that limits your visits to distracting websites to once per hour. Instead of blocking sites entirely, Once lets you visit them — but only once an hour, helping you stay productive without going cold turkey.

## How it works

1. Pick the websites that waste your time (Reddit, X, YouTube, etc.)
2. Visit one of those sites and Once starts a one-hour timer
3. If you try to visit the same site again within the hour, Once blocks it and shows you how much time is left

## Install

[Get Once on the Chrome Web Store](https://chromewebstore.google.com/detail/once-block-distracting-we/cmkicojchpmgdakmdjfhjjibbfmfplep)

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) >= 18

### Setup

```bash
git clone https://github.com/YoucefHQ/Once.git
cd Once
npm install
```

### Run in development

```bash
npm start
```

Then load the extension in Chrome:

1. Go to `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `build` folder

### Run tests

```bash
npm test
```

Tests use [Puppeteer](https://pptr.dev/) to launch Chrome with the extension loaded and verify the options page, onboarding flow, and site blocking.

### Build for production

```bash
NODE_ENV=production npm run build
```

The `build` folder will contain the extension ready for the Chrome Web Store.

## Tech stack

- [React 19](https://react.dev/)
- [TypeScript 5](https://www.typescriptlang.org/)
- [Webpack 5](https://webpack.js.org/)
- [Sass](https://sass-lang.com/)
- Chrome Extension Manifest V3

## License

[MIT](LICENSE)

---

Youcef Es-skouri | [Website](https://cef.im)
