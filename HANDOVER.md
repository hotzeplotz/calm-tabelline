# Handover — times tables app

This is the working brief for picking the project up in a Claude Code session.
It assumes you can run a terminal, install npm packages, and edit files directly.

## What this is

A single-purpose practice app for one ~8-year-old learning her times tables. The
guiding principle is **anti-patronising**: it looks like a calm terminal tool, not
a children's game. No timers, no points, gentle wrong-answer wording, and the full
1–10 table always visible as a "this is a small, finite thing" reassurance. UI in
English, Portuguese and Italian (the child is Italian, living in Portugal). Uses
the colour associations from Camillo Bortolato's *Striscia delle tabelline* as an
optional memory aid.

It ships as one self-contained HTML file so it can be copied onto a Samsung Galaxy
Tab and opened offline in Webview Kiosk under a restricted child profile.

## Build & verify

```bash
npm install
npm run typecheck          # strict tsc, must stay at 0 errors
npm run build              # typecheck + bundle -> dist/times-tables.html
npm run build -- --minify  # smaller output for the device
```

The build (`build.mjs`) does three things: compiles `src/styles/main.scss` with
dart-sass, bundles `src/main.ts` to an ES2019 IIFE with esbuild, and inlines both
into `src/index.html` by replacing the `/*__CSS__*/` and `/*__JS__*/` placeholders.
The replacers are **function-form `.replace()`** on purpose — the CSS/JS contain
`$` sequences that string-form replacement would mangle. Keep them that way.

There is no committed test, but a headless jsdom smoke test was used during the
rewrite and is easy to recreate: load `dist/times-tables.html` with
`runScripts:"dangerously"`, then assert the menu renders, a mode/range change
re-renders, `start` enters practice, tapping `[data-a="reveal"]` shows the answer,
the `#codeseg` toggle injects `var(--dN)`, and a language switch changes the title.
jsdom has no `matchMedia` (the code guards for it) and no real layout, so the
slider drag math and safe-area CSS can only be checked in a real browser.

## Architecture in one paragraph

`app.ts` owns a single mutable `State` object (typed in `types.ts`) and a
`render()` that swaps `#app.innerHTML` for the current view's HTML string
(`views/menu.ts`, `views/practice.ts`, `views/done.ts`). All interaction is
delegated: one click listener on `#app` reads `data-a` / `data-v` attributes, one
click listener on `#titlebar` handles the three segmented toggles, one keydown
listener on `document`. The custom range slider is the only component that mutates
its own DOM in place (`slider.ts`) instead of re-rendering, so dragging stays
smooth. Persistence (`state.ts`) is `localStorage` wrapped in try/catch so a
`file://` origin that throws doesn't crash anything.

## The Bortolato palette (the thing most likely to change next)

The palette is **not** in the TypeScript. `colors.ts#colorNum()` only emits
`<span style="color:var(--dN)">` per digit; the actual colours are CSS custom
properties `--d0..--d9` defined **twice** in `src/styles/_tokens.scss` — once under
`:root` (dark theme) and once under `[data-theme="light"]`. This is why toggling
the theme re-tints every number instantly with no re-render.

The current values are **inferred**, not measured: the reference image
(`erickson.it/media/.../237675_EDI2702_Tabelline-al-volo_2.jpg`) blocks automated
fetching. The mapping (digit → colour) came from the user's description: 1 =
black/canna di fucile, 2 = reddish-purple, 3 = purple, 4 = blue, 5 = green-blue,
6 = pea green, 7 = egg-yolk yellow, 8 = orange, 9 = red; 0 is unspecified (neutral
grey placeholder). The light set targets the print colours tuned for contrast on
white; the dark set is lightened to stay legible on the dark background.

**To drop in exact values:** edit the two blocks marked `Bortolato palette` in
`_tokens.scss`, rebuild. If the user hands you real hex codes they read off the
strip, replace the light-theme block verbatim, then produce the dark-theme block
by nudging each toward higher lightness (only enough to clear the dark bg) rather
than inventing new hues.

## Defaults for the tablet

`state.ts#createState()` sets the starting preferences: `theme:"system"`,
`lang:"en"`, `code:false` (via `load("code","0")`), plus `table:6`, full range,
`order:"seq"`, `mode:"study"`, `n:4`. On a `file://` origin `localStorage` may not
persist between launches, so if the child should always open in, say, Italian with
colour-coding on, **bake it into the defaults** rather than relying on the toggles:
change the `load(...)` fallbacks (`"en"` → `"it"`, `"0"` → `"1"`).

## Distribution (context, not a task)

Target device is a Galaxy Tab S6 Lite (Android 13). The plan the user settled on:
a **secondary/child Android profile** with per-app restrictions, and the HTML file
placed **inside that profile** (config and files are per-user isolated — copy the
file over MTP while logged into the child's profile). Webview Kiosk
(`uk.nktnet.webviewkiosk`, F-Droid) points at the local file and runs it
fullscreen. The profile is the real containment, so hard lock-task isn't required.
The app will show under the "Webview Kiosk" name/icon (accepted).

The recent CSS work in `_base.scss` (the `@media (max-width: 600px)` block) fixes
the earlier complaint that the app's titlebar was hidden behind the browser/kiosk
chrome on phones: the window becomes exactly `100dvh`, the titlebar is `sticky`
with `env(safe-area-inset-top)` padding, and the body scrolls inside. `viewport-fit=cover`
is set in `index.html`. Worth a real-device sanity check.

## Current TODOs / open threads

- **Exact palette RGBs** — swap the inferred values once the user supplies them
  (see palette section). This is the top item.
- **Menu table pills are deliberately uncoloured.** Colouring the 2–9 picker pills
  in their tabellina hues would reinforce the mapping, but the selected-pill
  highlight (amber fill) needs rethinking so a coloured digit on amber doesn't
  clash — likely: when coding is on, show the number in its colour and mark
  selection with a ring/border instead of the fill. Held pending the palette.
- **No watch mode.** `build.mjs` is one-shot. A `--watch` using esbuild's `context`
  API plus a sass recompile on change would speed iteration; left out to keep deps
  minimal.
- **Commit the smoke test** as a proper `npm test` if the project grows.
- **`0` colour** is a guess; confirm whether the strip assigns 0 a colour at all.

## Constraints worth respecting

- Keep it one self-contained file with no network calls — that property is load-
  bearing for the offline/kiosk use.
- Keep `npm run typecheck` at zero errors; `tsconfig` is strict on purpose
  (`verbatimModuleSyntax` means type-only imports must use `import type`).
- Keep the tone anti-patronising in any new copy (`i18n.ts`), and keep all three
  languages in sync when adding strings — `Strings` is a typed interface, so a
  missing key fails the typecheck, which is the intended safety net.
