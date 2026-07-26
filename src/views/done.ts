import type { State } from "../types";
import type { Strings } from "../i18n";

export function renderDone(s: State, l: Strings): string {
  const t = s.table;
  let sub: string;
  const missed: number[] = [];

  if (s.mode === "choose") {
    let right = 0;
    for (const b of s.items) {
      if (s.results[b]) right++;
      else missed.push(b);
    }
    sub = l.subChoose(right, s.items.length);
  } else {
    sub = l.subPlain;
  }
  s.missed = missed;

  const actions =
    `<button type="button" class="ctrl primary" data-a="again">${l.goAgain} \u21b5</button>` +
    (missed.length
      ? `<button type="button" class="ctrl ghost" data-a="retry">${l.retryBtn(missed.length)}</button>`
      : "") +
    `<button type="button" class="ctrl ghost" data-a="menu">${l.changeSetup}</button>`;

  return (
    `<h2 class="done-h">${l.doneH(t)}</h2>` +
    `<p class="done-sub">${sub} ${l.subTail}</p>` +
    `<div class="done-actions">${actions}</div>`
  );
}
