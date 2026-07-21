// Headless smoke test over the built single-file app (dist/times-tables.html).
// jsdom has no matchMedia and no layout, so theme media queries, slider drag
// math and safe-area CSS are out of scope here — check those in a real browser.
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { JSDOM } from "jsdom";

const html = await readFile(new URL("../dist/times-tables.html", import.meta.url), "utf8");

// Default about:blank is an opaque origin, so localStorage access throws and
// the app must fall back to its baked-in defaults — exactly the tablet's
// file:// worst case.
function boot() {
  const { window } = new JSDOM(html, { runScripts: "dangerously" });
  return window;
}

const click = (el) => el.click();
const $ = (w, sel) => w.document.querySelector(sel);
const $$ = (w, sel) => [...w.document.querySelectorAll(sel)];

test("menu renders with the tablet defaults: pt, colours on, table 2", () => {
  const w = boot();
  assert.ok($(w, "#app .pills"), "menu pill groups render");
  assert.equal(w.document.title, "tabuada", "Portuguese by default");
  assert.equal(w.document.documentElement.lang, "pt");
  assert.ok($(w, '[data-a="table"][data-v="2"]').classList.contains("on"), "table 2 preselected");
  assert.ok($(w, '#codeseg [data-code="1"]').classList.contains("on"), "colour-coding on by default");
});

test("mode and range changes re-render the menu", () => {
  const w = boot();
  const noteBefore = $(w, ".modeline").textContent;
  click($(w, '[data-a="mode"][data-v="reveal"]'));
  assert.ok($(w, '[data-a="mode"][data-v="reveal"]').classList.contains("on"));
  assert.notEqual($(w, ".modeline").textContent, noteBefore, "mode note updated");
  click($(w, '[data-a="range"][data-v="1-5"]'));
  assert.ok($(w, '[data-a="range"][data-v="1-5"]').classList.contains("on"));
});

test("start enters practice with the full table column", () => {
  const w = boot();
  click($(w, '[data-a="start"]'));
  assert.ok($(w, ".q-big"), "question card shown");
  assert.equal($$(w, ".tbl .line").length, 10, "full 1-10 table always visible");
  assert.equal($(w, ".progress").textContent, "1 / 10");
});

test("reveal mode hides the answer until tapped", () => {
  const w = boot();
  click($(w, '[data-a="mode"][data-v="reveal"]'));
  click($(w, '[data-a="start"]'));
  assert.ok($(w, ".ans.q"), "answer hidden at first");
  click($(w, '[data-a="reveal"]'));
  const ans = $(w, ".ans.reveal");
  assert.ok(ans, "answer revealed");
  assert.ok(ans.textContent.includes("2"), "2 x 1 = 2");
});

test("colour-coding toggle injects and removes var(--dN) tints", () => {
  const w = boot();
  click($(w, '[data-a="start"]'));
  assert.ok($(w, "#app").innerHTML.includes("var(--d"), "coded digits by default");
  click($(w, '#codeseg [data-code="0"]'));
  assert.ok(!$(w, "#app").innerHTML.includes("var(--d"), "plain after toggle off");
  click($(w, '#codeseg [data-code="1"]'));
  assert.ok($(w, "#app").innerHTML.includes("var(--d"), "coded again after toggle on");
});

test("language switch changes the chrome", () => {
  const w = boot();
  click($(w, '#langseg [data-lang="it"]'));
  assert.equal(w.document.title, "tabelline");
  assert.equal(w.document.documentElement.lang, "it");
  click($(w, '#langseg [data-lang="en"]'));
  assert.equal(w.document.title, "times tables");
});
