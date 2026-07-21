// Build pipeline: SCSS -> CSS, TS -> bundled JS, both inlined into a single HTML file.
// The output at dist/times-tables.html has zero external requests, so it runs offline
// from a file:// path (e.g. loaded into Webview Kiosk) or from any static host.
import esbuild from "esbuild";
import * as sass from "sass";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(fileURLToPath(import.meta.url));
const p = (...a) => path.join(root, ...a);

const minify = process.argv.includes("--minify");

async function build() {
  // 1. SCSS -> CSS
  const css = sass.compile(p("src/styles/main.scss"), {
    style: minify ? "compressed" : "expanded",
    loadPaths: [p("src/styles")],
  }).css;

  // 2. TS -> single IIFE bundle (targets Android WebView on Android 6+)
  const result = await esbuild.build({
    entryPoints: [p("src/main.ts")],
    bundle: true,
    format: "iife",
    target: ["es2019"],
    minify,
    legalComments: "none",
    write: false,
  });
  const js = result.outputFiles[0].text;

  // 3. Inline into the template. Function replacers avoid $-pattern interpretation.
  let html = await readFile(p("src/index.html"), "utf8");
  html = html.replace("/*__CSS__*/", () => css);
  html = html.replace("/*__JS__*/", () => js);

  await mkdir(p("dist"), { recursive: true });
  await writeFile(p("dist/times-tables.html"), html, "utf8");
  console.log(`built dist/times-tables.html  (${(html.length / 1024).toFixed(1)} kB${minify ? ", minified" : ""})`);
}

build().catch((e) => {
  console.error(e);
  process.exit(1);
});
