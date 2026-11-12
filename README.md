# WikiCraft — Modern Theme for Wikipedia

A clean, **Notion & Craft-inspired reading theme** for Wikipedia (`*.wikipedia.org`), built with **WXT + TypeScript + Manifest V3**.

## Key Features

- **In-Place Typography & Layout Upgrade**: Retains all native Wikipedia functionality (editing, language switching, talk pages, history) while upgrading typography, line height, and reading width.
- **Zero-Config Light & Dark Modes**: One finely crafted neutral palette with seamless **Light**, **Dark**, and **System** appearance modes.
- **Zero FOUC (Flash of Unstyled Content)**: Synchronously applies cached theme variables at `document_start` before the first frame paints.
- **Card-Styled Infoboxes, Tables & Navboxes**: Transforms Wikipedia's right-hand infoboxes, data tables (`.wikitable`), and bottom navboxes into rounded Notion/Craft cards, while normalizing jarring hardcoded inline background colors.
- **Smart Sidebar Decluttering**: Automatically hides Wikipedia's redundant right-hand Appearance panel and restyles the left Table of Contents into a sticky Notion-like outline.
- **Dual-Entry Toggle**: Switch modes via the subtle pill button in Wikipedia's top bar or from the Chrome toolbar popup.

## Development & Build

```bash
# Install dependencies
npm install

# Start development mode (with HMR)
npm run dev

# Build production unpacked extension (.output/chrome-mv3)
npm run build

# Package zip for Chrome Web Store upload (.output/wikicraft-1.0.0-chrome.zip)
npm run zip
```

## Loading Unpacked Extension in Chrome

1. Run `npm run build`.
2. Open `chrome://extensions/` in Chrome.
3. Enable **Developer mode** (top-right toggle).
4. Click **Load unpacked** and select `/Users/cypresskuo/Documents/code/wikicraft/.output/chrome-mv3`.
