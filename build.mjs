// Build pipeline: SCSS -> CSS, TS -> bundled JS, both inlined into a single HTML file.
// The output at dist/times-tables.html has zero external requests, so it runs offline
// from a file:// path (e.g. loaded into Webview Kiosk) or from any static host.
//
// Flags: --minify for the device artifact, --watch to rebuild on any src/ change.
import esbuild from "esbuild";
import * as sass from "sass";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { watch } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(fileURLToPath(import.meta.url));
const p = (...a) => path.join(root, ...a);

const minify = process.argv.includes("--minify");
const watching = process.argv.includes("--watch");

// esbuild context so watch-mode JS rebuilds are incremental.
const ctx = await esbuild.context({
  entryPoints: [p("src/main.ts")],
  bundle: true,
  format: "iife",
  target: ["es2019"], // Android WebView on Android 6+
  minify,
  legalComments: "none",
  write: false,
});

async function build() {
  const css = sass.compile(p("src/styles/main.scss"), {
    style: minify ? "compressed" : "expanded",
    loadPaths: [p("src/styles")],
  }).css;

  const result = await ctx.rebuild();
  const js = result.outputFiles[0].text;

  // Inline into the template. Function replacers avoid $-pattern interpretation.
  let html = await readFile(p("src/index.html"), "utf8");
  html = html.replace("/*__CSS__*/", () => css);
  html = html.replace("/*__JS__*/", () => js);

  await mkdir(p("dist"), { recursive: true });
  await writeFile(p("dist/times-tables.html"), html, "utf8");
  console.log(`built dist/times-tables.html  (${(html.length / 1024).toFixed(1)} kB${minify ? ", minified" : ""})`);
}

if (watching) {
  await build().catch((e) => console.error(e));
  let timer = null;
  watch(p("src"), { recursive: true }, (_event, file) => {
    clearTimeout(timer); // debounce editor save bursts
    timer = setTimeout(() => {
      console.log(`[watch] ${file ?? "src"} changed`);
      build().catch((e) => console.error(e)); // keep watching after a bad save
    }, 60);
  });
  console.log("[watch] watching src/ — ctrl-c to stop");
} else {
  try {
    await build();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
  await ctx.dispose();
}
