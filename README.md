<img src="src/assets/img/icon-240.png" width="80">

# Once

Once is a Chrome extension that limits your visits to distracting websites to once per hour. Instead of blocking sites entirely, Once lets you visit them — but only once an hour, helping you stay productive without going cold turkey.

## Features

- **Once-per-hour blocking** — visit a distracting site, then it's blocked for an hour
- **Aggressive mode** — visiting any blocked site starts the timer for all blocked sites
- **Stats dashboard** — track your streak, total blocks, time saved, per-site breakdown, and 30-day trend chart
- **Milestones** — earn badges at 50, 100, 250, 500, 1K, 5K, and 10K blocks
- **Dark mode** — automatically follows your system preference
- **Blocking overlay** — shows stats pills (streak, blocks, time saved) and a link to your full stats

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

This builds the extension, launches Chrome with it loaded, and opens the options page automatically. esbuild watches for file changes and rebuilds — reload the extension at `chrome://extensions` to pick up updates.

### Run tests

```bash
npm test
```

Tests use [Puppeteer](https://pptr.dev/) to launch Chrome with the extension loaded and verify the options page, onboarding flow, and site blocking.

### Build for production

```bash
npm run build
```

The `build` folder will contain the extension ready for the Chrome Web Store.

## Tech stack

- [React 19](https://react.dev/)
- [TypeScript 5](https://www.typescriptlang.org/)
- [esbuild](https://esbuild.github.io/)
- Chrome Extension Manifest V3

## License

[MIT](LICENSE)
