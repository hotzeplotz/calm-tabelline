# Calm Tabelline

A calm, terminal-styled times-tables practice app for a young child. It treats
practice as a real tool rather than a game: no timers, no scores-against-you, no
cartoon reward loops. Three languages (EN / PT / IT), light/dark/system themes,
and optional Bortolato _Striscia delle tabelline_ colour-coding.

The whole app builds to **one self-contained HTML file** (`dist/times-tables.html`)
with zero external requests, so it runs offline from a `file://` path — e.g. copied
onto a tablet and opened in Webview Kiosk — or from any static host.

[![build](https://github.com/hotzeplotz/calm-tabelline/actions/workflows/deploy.yml/badge.svg?branch=main)](https://github.com/hotzeplotz/calm-tabelline/actions/workflows/deploy.yml)
[![pages](https://img.shields.io/website?url=https%3A%2F%2Fhotzeplotz.github.io%2Fcalm-tabelline%2F&label=pages)](https://hotzeplotz.github.io/calm-tabelline/)

## Quick start

```bash
npm install          # Node 26 (fnm reads .node-version)
npm run build        # typecheck + bundle -> dist/times-tables.html
npm run build:fast   # bundle only (skip typecheck)
npm run dev          # watch mode: rebuild on any src/ change
npm run typecheck    # tsc --noEmit
npm test             # build:fast + jsdom smoke test
npm run build -- --minify   # minified output
```

Open `dist/times-tables.html` in a browser, or copy it to the device.

`npm run format` / `npm run format:check` run Prettier.

## Deployment

Every push to `main` runs `.github/workflows/deploy.yml`: format check,
typecheck, jsdom smoke test, then a minified build published to GitHub Pages
at <https://hotzeplotz.github.io/calm-tabelline/>. The tablet still uses the
offline file copied onto the device — the Pages site is just the same single
file, hosted.

## Structure

```
src/
  index.html          template; static titlebar chrome + CSS/JS placeholders
  main.ts             entry -> init()
  app.ts              controller: state, render dispatch, events, theme/toggles
  state.ts            state factory, persistence, pure helpers (shuffle, choices)
  i18n.ts             typed EN/PT/IT strings
  colors.ts           colorNum(): per-digit Bortolato tinting via CSS vars
  types.ts            shared domain types
  slider.ts           custom dual-thumb range slider (pointer/touch/keyboard)
  views/
    menu.ts           setup screen
    practice.ts       the drill: table column + question card + touch controls
    done.ts           end screen
  styles/
    _tokens.scss      UI colours + Bortolato palette (--d0..--d9) per theme
    _base.scss        layout, window chrome, responsive/full-screen + safe-area
    _menu.scss _practice.scss _done.scss
    main.scss         @use of all partials
test/
  smoke.test.mjs      jsdom smoke test over the built file (npm test)
build.mjs             SCSS -> CSS, TS -> IIFE bundle, inlined into one HTML file (--watch, --minify)
```

See `HANDOVER.md` for the full picture, the palette-swap procedure, tablet
distribution notes, and the current TODO list.
