import type { Mode, Order, State } from "./types";
import type { Strings } from "./i18n";
import { T } from "./i18n";
import { buildSession, createState, current, itemKey, makeChoices, save, sessionItems } from "./state";
import { wireSlider } from "./slider";
import { renderMenu } from "./views/menu";
import { renderPractice } from "./views/practice";
import { renderDone } from "./views/done";

const S: State = createState();
const L = (): Strings => T[S.lang];

let app: HTMLElement;

// --- theme -----------------------------------------------------------------

function effectiveTheme(): "light" | "dark" {
  if (S.theme === "system") {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }
  return S.theme;
}
function applyTheme(): void {
  document.documentElement.setAttribute("data-theme", effectiveTheme());
}

// --- transitions -----------------------------------------------------------

function startPractice(): void {
  if (S.end < S.start) [S.start, S.end] = [S.end, S.start];
  S.retryMode = false;
  S.view = "practice";
  buildSession(S, sessionItems(S));
  render();
}
function advance(): void {
  S.done[itemKey(current(S))] = true;
  if (S.idx < S.items.length - 1) {
    S.idx++;
    S.revealed = false;
    S.picked = null;
    if (S.mode === "choose") {
      const it = current(S);
      S.choices = makeChoices(it.a, it.b, S.n);
    }
  } else {
    S.view = "done";
  }
  render();
}
function back(): void {
  if (S.idx === 0) return;
  S.idx--;
  S.revealed = S.mode === "study";
  S.picked = null;
  const it = current(S);
  delete S.done[itemKey(it)];
  if (S.mode === "choose") {
    delete S.results[itemKey(it)];
    S.choices = makeChoices(it.a, it.b, S.n);
  }
  render();
}
function reveal(): void {
  if (!S.revealed) {
    S.revealed = true;
    render();
  }
}
function pick(v: number): void {
  if (S.picked !== null) return;
  S.picked = v;
  const it = current(S);
  S.results[itemKey(it)] = v === it.a * it.b;
  render();
}
// Toggle a table in the selection; the last selected one stays put so a
// session always has at least one table.
function toggleTable(t: number): void {
  const i = S.tables.indexOf(t);
  if (i >= 0) {
    if (S.tables.length > 1) S.tables.splice(i, 1);
  } else {
    S.tables.push(t);
    S.tables.sort((a, b) => a - b);
  }
}
function toMenu(): void {
  S.view = "menu";
  render();
}
function setRange(v: string): void {
  if (v === "1-10") ((S.custom = false), (S.start = 1), (S.end = 10));
  else if (v === "1-5") ((S.custom = false), (S.start = 1), (S.end = 5));
  else if (v === "6-10") ((S.custom = false), (S.start = 6), (S.end = 10));
  else S.custom = true;
}

// --- chrome + render -------------------------------------------------------

function updateChrome(): void {
  const l = L();
  (document.getElementById("ttl") as HTMLElement).innerHTML = `<b>${l.brand}</b> ${l.suffix}`;
  document.title = l.brand;
  document.documentElement.lang = S.lang;
  syncSeg("langseg", "data-lang", S.lang);
  syncSeg("themeseg", "data-theme", S.theme);
  syncSeg("codeseg", "data-code", S.code ? "1" : "0");
}
function syncSeg(id: string, attr: string, value: string): void {
  document
    .getElementById(id)!
    .querySelectorAll("button")
    .forEach((b) => {
      b.classList.toggle("on", b.getAttribute(attr) === value);
    });
}

function render(): void {
  const l = L();
  if (S.view === "menu") app.innerHTML = renderMenu(S, l);
  else if (S.view === "practice") app.innerHTML = renderPractice(S, l);
  else app.innerHTML = renderDone(S, l);

  updateChrome();

  if (S.view === "menu") {
    const rs = document.getElementById("rslider");
    if (rs) wireSlider(rs, S);
  }
  // Keep space/enter from re-triggering a focused menu button during practice.
  if (S.view !== "menu") {
    const ae = document.activeElement as HTMLElement | null;
    if (ae && typeof ae.blur === "function") ae.blur();
  }
}

// --- events ----------------------------------------------------------------

function onAppClick(e: MouseEvent): void {
  const el = (e.target as HTMLElement).closest<HTMLElement>("[data-a]");
  if (!el) return;
  const a = el.getAttribute("data-a")!;
  const v = el.getAttribute("data-v");
  switch (a) {
    case "table":
      toggleTable(Number(v));
      break;
    case "range":
      setRange(v!);
      break;
    case "order":
      S.order = v as Order;
      break;
    case "mode":
      S.mode = v as Mode;
      break;
    case "n":
      S.n = Number(v);
      break;
    case "start":
      startPractice();
      return;
    case "pick":
      pick(Number(v));
      return;
    case "reveal":
      reveal();
      return;
    case "next":
      advance();
      return;
    case "prev":
      back();
      return;
    case "again":
      S.retryMode = false;
      S.view = "practice";
      buildSession(S, sessionItems(S));
      render();
      return;
    case "retry":
      S.retryMode = true;
      S.view = "practice";
      buildSession(S, S.missed.slice());
      render();
      return;
    case "menu":
      toMenu();
      return;
    default:
      return;
  }
  render();
}

function onTitlebarClick(e: MouseEvent): void {
  const b = (e.target as HTMLElement).closest<HTMLButtonElement>("button");
  if (!b) return;
  if (b.hasAttribute("data-lang")) {
    S.lang = b.getAttribute("data-lang") as State["lang"];
    save("lang", S.lang);
    render();
  } else if (b.hasAttribute("data-theme")) {
    S.theme = b.getAttribute("data-theme") as State["theme"];
    save("theme", S.theme);
    applyTheme();
    updateChrome();
  } else if (b.hasAttribute("data-code")) {
    S.code = b.getAttribute("data-code") === "1";
    save("code", S.code ? "1" : "0");
    render();
  }
}

function onKeydown(e: KeyboardEvent): void {
  const k = e.key;
  if (S.view === "menu") {
    if (k >= "2" && k <= "9") {
      toggleTable(Number(k));
      render();
      e.preventDefault();
    } else if (k === "Enter") {
      startPractice();
      e.preventDefault();
    }
    return;
  }
  if (S.view === "done") {
    if (k === "Enter") {
      S.retryMode = false;
      S.view = "practice";
      buildSession(S, sessionItems(S));
      render();
      e.preventDefault();
    } else if (k === "Escape") {
      toMenu();
      e.preventDefault();
    }
    return;
  }
  // practice
  if (k === "Escape") {
    toMenu();
    e.preventDefault();
    return;
  }
  if (S.mode === "study") {
    if (k === " " || k === "ArrowRight") (advance(), e.preventDefault());
    else if (k === "ArrowLeft") (back(), e.preventDefault());
  } else if (S.mode === "reveal") {
    if (k === " ") (S.revealed ? advance() : reveal(), e.preventDefault());
    else if (k === "ArrowRight" && S.revealed) (advance(), e.preventDefault());
    else if (k === "ArrowLeft") (back(), e.preventDefault());
  } else {
    if (S.picked === null) {
      const num = parseInt(k, 10);
      if (num >= 1 && num <= S.choices.length) (pick(S.choices[num - 1]!), e.preventDefault());
    } else if (k === " " || k === "ArrowRight") (advance(), e.preventDefault());
  }
}

// --- bootstrap -------------------------------------------------------------

export function init(): void {
  app = document.getElementById("app") as HTMLElement;
  app.addEventListener("click", onAppClick);
  document.getElementById("titlebar")!.addEventListener("click", onTitlebarClick);
  document.addEventListener("keydown", onKeydown);

  if (window.matchMedia) {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (): void => {
      if (S.theme === "system") applyTheme();
    };
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }

  applyTheme();
  render();
}
