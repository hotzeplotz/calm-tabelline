import type { State } from "./types";

// --- persistence -----------------------------------------------------------
// Wrapped so a sandboxed or file:// origin that throws on storage access just
// falls back to defaults instead of crashing the app.

const KEY = "tt_";

export function load(key: string, fallback: string): string {
  try {
    const v = window.localStorage.getItem(KEY + key);
    return v === null ? fallback : v;
  } catch {
    return fallback;
  }
}

export function save(key: string, value: string): void {
  try {
    window.localStorage.setItem(KEY + key, value);
  } catch {
    /* storage unavailable — ignore */
  }
}

// --- factory ---------------------------------------------------------------

export function createState(): State {
  return {
    theme: load("theme", "system") as State["theme"],
    lang: load("lang", "pt") as State["lang"],
    code: load("code", "1") === "1",
    view: "menu",
    table: 2,
    start: 1,
    end: 10,
    custom: false,
    order: "seq",
    mode: "study",
    n: 4,
    items: [],
    idx: 0,
    revealed: false,
    choices: [],
    picked: null,
    done: {},
    results: {},
    retryMode: false,
    missed: [],
  };
}

// --- pure helpers ----------------------------------------------------------

export function shuffle<T>(a: readonly T[]): T[] {
  const r = a.slice();
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j]!, r[i]!];
  }
  return r;
}

export function range(lo: number, hi: number): number[] {
  const r: number[] = [];
  for (let i = lo; i <= hi; i++) r.push(i);
  return r;
}

export function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

/**
 * Build plausible multiple-choice options for a x b: the near-miss products
 * kids actually reach for (adjacent multiples, off-by-one, digit swaps),
 * ranked by closeness then sampled, with the correct answer shuffled in.
 */
export function makeChoices(a: number, b: number, n: number): number[] {
  const correct = a * b;
  const raw = [
    a * (b + 1),
    a * (b - 1),
    (a + 1) * b,
    (a - 1) * b,
    correct + a,
    correct - a,
    correct + b,
    correct - b,
    correct + 1,
    correct - 1,
    correct + 2,
    correct - 2,
    a * (b + 2),
    a * (b - 2),
  ];
  if (correct >= 10) raw.push(parseInt(String(correct).split("").reverse().join(""), 10));

  const seen = new Set<number>();
  const pool: number[] = [];
  for (const c of raw) {
    if (c > 0 && c !== correct && !seen.has(c)) {
      seen.add(c);
      pool.push(c);
    }
  }
  pool.sort((x, y) => Math.abs(x - correct) - Math.abs(y - correct));
  const near = pool.slice(0, Math.max(n + 2, 6));
  const picks = shuffle(near).slice(0, n - 1);
  let k = 1;
  while (picks.length < n - 1) {
    if (correct + k > 0 && !picks.includes(correct + k)) picks.push(correct + k);
    k++;
  }
  return shuffle([correct, ...picks]);
}

/** Prepare a fresh practice run over the given multipliers. */
export function buildSession(s: State, list: number[]): void {
  s.items = s.order === "shuffle" ? shuffle(list) : list.slice();
  s.idx = 0;
  s.revealed = false;
  s.picked = null;
  s.done = {};
  s.results = {};
  if (s.mode === "choose") s.choices = makeChoices(s.table, s.items[0]!, s.n);
}

export function currentB(s: State): number {
  return s.items[s.idx]!;
}
