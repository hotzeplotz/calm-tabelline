# Handover — times tables app

This is the working brief for picking the project up in a Claude Code session.
It assumes you can run a terminal, install npm packages, and edit files directly.

## What this is

A single-purpose practice app for one ~8-year-old learning her times tables. The
guiding principle is **anti-patronising**: it looks like a calm terminal tool, not
a children's game. No timers, no points, gentle wrong-answer wording, and the full
1–10 table always visible as a "this is a small, finite thing" reassurance. UI in
English, Portuguese and Italian (the child is Italian, living in Portugal). Uses
the colour associations from Camillo Bortolato's _Striscia delle tabelline_ as an
optional memory aid.

It ships as one self-contained HTML file so it can be copied onto a Samsung Galaxy
Tab and opened offline in Webview Kiosk under a restricted child profile.

## Build & verify

Node 26 via fnm (`.node-version` is committed; `fnm use` picks it up).

```bash
npm install
npm run typecheck          # strict tsc, must stay at 0 errors
npm run build              # typecheck + bundle -> dist/times-tables.html
npm run build -- --minify  # smaller output for the device
npm test                   # build:fast + jsdom smoke test (node:test)
npm run dev                # watch mode: rebuild on any src/ change
npm run format:check       # prettier (CI enforces this)
```

CI (`.github/workflows/deploy.yml`) runs format check + typecheck + smoke test
on every push to main, then publishes the minified build to GitHub Pages:
<https://hotzeplotz.github.io/calm-tabelline/>.

The build (`build.mjs`) does three things: compiles `src/styles/main.scss` with
dart-sass, bundles `src/main.ts` to an ES2019 IIFE with esbuild, and inlines both
into `src/index.html` by replacing the `/*__CSS__*/` and `/*__JS__*/` placeholders.
The replacers are **function-form `.replace()`** on purpose — the CSS/JS contain
`$` sequences that string-form replacement would mangle. Keep them that way.

The smoke test is committed at `test/smoke.test.mjs` (`npm test`): it loads
`dist/times-tables.html` into jsdom with `runScripts:"dangerously"` and covers
menu render + defaults, mode/range re-render, entering practice, reveal, the
`var(--dN)` colour toggle, and language switching. jsdom's default about:blank
origin makes `localStorage` throw, so the test exercises the same baked-in
defaults path as the tablet's `file://` worst case. jsdom has no `matchMedia`
(the code guards for it) and no real layout, so the slider drag math and
safe-area CSS can only be checked in a real browser.

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

Digits 2–9 are now **measured** from the user-supplied cover photo of _Tabelline
al volo_ (`../striscia.jpg`, median-sampled per strip panel / fan card). The
light set keeps the measured values, with 6/7/8 darkened just enough to reach
≥3:1 contrast on white; the dark set keeps the same hues lifted to ≥4.5:1 on the
dark panel. Two caveats: the source is a shaded cover illustration (so hues are
the product's muted print style, and 6-olive sits close to 7-yellow, as on the
strip itself), and 0/1 remain unmeasured — 0 has no colour on the strip (neutral
grey), 1 (black / canna di fucile) has no visible panel in the photo.

**To refine further:** edit the two blocks marked `Bortolato palette` in
`_tokens.scss`, rebuild. If the user hands you hex codes read off the physical
strip, replace the light-theme block verbatim, then produce the dark-theme block
by nudging each toward higher lightness (only enough to clear the dark bg) rather
than inventing new hues.

## Defaults for the tablet

`state.ts#createState()` sets the starting preferences, baked in for the tablet
(a `file://` origin's `localStorage` may not persist between launches):
`theme:"system"`, `lang:"pt"`, `code:true` (via `load("code","1")`), plus
`tables:[2]` (the picker is multi-select), full range, `order:"seq"`,
`mode:"study"`, `n:4`. To change the launch
state, edit the `load(...)` fallbacks / literals there — the smoke test asserts
them, so update `test/smoke.test.mjs` in the same change.

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

Done in the takeover session (2026-07-21): exact palette measured from
`../striscia.jpg`, smoke test committed as `npm test`, `--watch` mode added
(`npm run dev`), tablet defaults baked in (pt / colours on / table 2), Node
pinned to 26 via fnm, repo initialised.

Still open:

- **Menu table pills are deliberately uncoloured.** Colouring the 2–9 picker pills
  in their tabellina hues would reinforce the mapping, but the selected-pill
  highlight (amber fill) needs rethinking so a coloured digit on amber doesn't
  clash — likely: when coding is on, show the number in its colour and mark
  selection with a ring/border instead of the fill. Palette is in, so this is
  unblocked.
- **`0` and `1` colours** are still unmeasured (see palette section); values read
  off the physical strip would settle them — and could refine 2–9 beyond the
  cover-illustration approximation.
- **Real-device check** of the safe-area/titlebar CSS and the measured palette on
  the tablet.

## Constraints worth respecting

- Keep it one self-contained file with no network calls — that property is load-
  bearing for the offline/kiosk use.
- Keep `npm run typecheck` at zero errors; `tsconfig` is strict on purpose
  (`verbatimModuleSyntax` means type-only imports must use `import type`).
- Keep the tone anti-patronising in any new copy (`i18n.ts`), and keep all three
  languages in sync when adding strings — `Strings` is a typed interface, so a
  missing key fails the typecheck, which is the intended safety net.
