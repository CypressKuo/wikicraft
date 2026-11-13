# Changelog

All notable changes to **WikiCraft** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

---

## [1.0.1] - 2026-11-13

### Added
- **Promotional Previews**: Added localized English and Traditional Chinese (`zh_TW`) Before/After and Light/Dark preview banners in `assets/`, and embedded them into [README.md](./README.md) and [README.zh-TW.md](./README.zh-TW.md).

### Changed
- **Dropdown Hover Styling**: Added Notion-style rounded hover background (`var(--wc-surface-elevated)`) and refined item spacing for Wikipedia's top-left main menu and dropdown lists.

### Fixed
- **Dark Mode Logo**: Prevented double color inversion on `.mw-logo-wordmark` and `.mw-logo-tagline` when Wikipedia's native `.skin-invert` class is present, ensuring the Wikipedia wordmark renders cleanly in white under Dark Mode.

---

## [1.0.0] - 2026-11-13

### Added
- **Modern Notion & Craft-Inspired Theme**: In-place typography, comfortable line height, and balanced reading width for desktop Wikipedia (`*.wikipedia.org`) while preserving all native editing, talk page, history, and language-switching features.
- **Zero-Config Light & Dark Modes**: Hand-crafted Warm Light and Soft Charcoal palettes with `Light`, `Dark`, and `System` modes, synced instantaneously at `document_start` to prevent flash of unstyled content (No FOUC).
- **Card-Styled Infoboxes & Tables**: Redesigned right-hand infoboxes, `.wikitable`, and bottom `.navbox` elements into rounded cards, with automatic sanitization of jarring hardcoded inline background colors.
- **Smart Sidebar Decluttering**: Automatically hides Wikipedia's redundant right-hand Appearance sidebar and restyles the left Table of Contents (TOC) into a sticky Notion-like outline.
- **Dual-Entry Controls**: Added an in-page top-header toggle pill alongside a minimal toolbar popup for one-click theme switching and pause/resume.
- **Multi-Browser & i18n Support**: Built with WXT + TypeScript (Chrome MV3 & Safari Web Extension) with English (`en`) and Traditional Chinese (`zh_TW`) localization and strict zero-data-collection privacy compliance.
