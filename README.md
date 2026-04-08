<img src="src/assets/img/icon-240.png" width="80">

# Once

Once is a Chrome extension that limits your visits to distracting websites to once per hour. Instead of blocking sites entirely, Once lets you visit them — but only once an hour, helping you stay productive without going cold turkey.

## How it works

1. Pick the websites that waste your time (Reddit, X, YouTube, etc.)
2. Visit one of those sites and Once starts a one-hour timer
3. If you try to visit the same site again within the hour, Once blocks it and shows you how much time is left

## Features

- **One-hour cooldown** — visit blocked sites once per hour, no cold-turkey required
- **Stats dashboard** — track your streaks, per-site block counts, daily trends, and estimated time saved
- **Shareable stats card** — generate a branded image card with your focus stats for X, Instagram Stories, or anywhere else
- **Privacy-first sharing** — site names are hidden by default; toggle them on only if you want to
- **Milestone badges** — earn badges as you hit block milestones (10, 50, 100, 250, …)

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
