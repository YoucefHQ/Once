# AGENTS.md

This file provides guidance to AI coding agents when working with code in this repository.

## What This Is

Once is a Chrome Extension (Manifest V3) that limits visits to distracting websites to once per hour. Users pick sites to block via an options page; the extension tracks visit timestamps and shows a blocking overlay with a countdown timer on repeat visits within the hour.

## Commands

- **Build**: `npm run build` — production build to `build/`
- **Dev**: `npm start` — builds, watches for changes, and launches Chrome with the extension loaded
- **Test**: `npm test` — production build then Puppeteer integration tests via Mocha
- **Single test**: `npm run build && npx mocha test.js --grep "pattern"`

Tests are end-to-end only (Puppeteer launches Chrome with the extension). No unit test framework is configured. The pre-commit hook (Husky) runs `npm test`.

## Architecture

Three entry points, bundled by esbuild (`utils/build.js`):

1. **Background Service Worker** (`src/pages/Background/index.js`) — Core logic. Listens for `checkWebsite` messages from content scripts, checks `chrome.storage.local` for visit timestamps, and decides whether to block. Records visit timestamps when tabs close (`chrome.tabs.onRemoved`), not on page load.

2. **Content Script** (`src/pages/Content/index.js`) — Injected into matched sites per manifest patterns. Sends `checkWebsite` to background on load. Shows either a blocking overlay (with time remaining) or a first-visit onboarding banner. Uses inline CSS to avoid style conflicts with host pages.

3. **Options Page** (`src/pages/Options/`) — React class component (`Options.tsx`) with `react-select` multi-select. Saves blocklist to `chrome.storage.local` as `onceBlockedWebsites`. Special handling: selecting X or Reddit adds URL variants (e.g., `x.com/home`, `old.reddit.com`).

**Data flow**: Content script → message → Background (check storage) → response → Content script (render overlay or banner). All persistent state lives in `chrome.storage.local`.

## Key Details

- Mixed TypeScript (Options page `.tsx`) and JavaScript (Background, Content, build scripts, tests)
- `tsconfig.json`: strict mode, `jsx: "react-jsx"`, target es5
- Matched sites are hardcoded in `src/manifest.json` content_scripts patterns — adding a new site requires updating both the manifest and `src/pages/Options/default-websites.tsx`
- Build output goes to `build/` (gitignored); manifest version/description are injected from `package.json`
- Prettier config: single quotes, trailing commas (es5), always arrow parens
- Color scheme: primary `#8e97fd`, text `#19191b`, font "DM Sans" from Google Fonts
