import type { State } from "../types";
import type { Strings } from "../i18n";
import { colorNum } from "../colors";
import { currentB } from "../state";

const X = "\u00d7";

type Action = "prev" | "next" | "reveal" | "menu";

function ctrl(action: Action, label: string, key: string, primary: boolean): string {
  return (
    `<button type="button" class="ctrl${primary ? " primary" : " ghost"}" data-a="${action}">` +
    `${label}${key ? `<small>${key}</small>` : ""}</button>`
  );
}

export function renderPractice(s: State, l: Strings): string {
  const t = s.table;
  const cur = currentB(s);
  const coded = s.code;

  // Left column: the whole table 1..10, with the active subset lit and filling in.
  let lines = "";
  for (let b = 1; b <= 10; b++) {
    const inS = b >= s.start && b <= s.end;
    const isCur = inS && b === cur;
    const isDone = !!s.done[b];
    const showAns =
      (s.mode === "study" && inS) ||
      isDone ||
      (isCur && s.mode === "reveal" && s.revealed) ||
      (isCur && s.mode === "choose" && s.picked !== null);
    const cls = !inS ? "out" : isCur ? "cur" : isDone ? "done" : "pend";
    const aTxt = !inS ? "\u00b7" : showAns ? colorNum(t * b, coded) : isCur ? "?" : "\u00b7";
    lines +=
      `<div class="line ${cls}"><span class="q">${colorNum(t, coded)} ${X} ${colorNum(b, coded)}</span>` +
      `<span class="a">${aTxt}</span></div>`;
  }

  const qhtml = `<div class="q-big">${colorNum(t, coded)}<span class="op">${X}</span>${colorNum(cur, coded)}</div>`;
  const backBtn = s.idx > 0 ? ctrl("prev", l.back, "\u2190", false) : "";
  const menuBtn = ctrl("menu", l.menu, "esc", false);

  let cue = "";
  let body = "";
  let controls = "";
  let cardAction = "";
  let feedback = "";

  if (s.mode === "study") {
    cue = l.cueStudy;
    body = qhtml + `<div class="ans reveal">= ${colorNum(t * cur, coded)}</div>`;
    controls = backBtn + ctrl("next", l.next, `${l.keySpace} / \u2192`, true) + menuBtn;
    cardAction = "next";
  } else if (s.mode === "reveal") {
    if (s.revealed) {
      cue = l.cueShown;
      body = qhtml + `<div class="ans reveal">= ${colorNum(t * cur, coded)}</div>`;
      controls = backBtn + ctrl("next", l.next, `${l.keySpace} / \u2192`, true) + menuBtn;
      cardAction = "next";
    } else {
      cue = l.cueHidden;
      body = qhtml + `<div class="ans q">= ?</div>`;
      controls = backBtn + ctrl("reveal", l.reveal, l.keySpace, true) + menuBtn;
      cardAction = "reveal";
    }
  } else {
    cue = l.cueChoose;
    const opts = s.choices
      .map((v, i) => {
        let cls = "opt";
        if (s.picked !== null) {
          if (v === t * cur) cls += " correct";
          else if (v === s.picked) cls += " wrong";
          else cls += " muted";
        }
        return `<div class="${cls}" data-a="pick" data-v="${v}"><span class="k">${i + 1}</span><span>${colorNum(v, coded)}</span></div>`;
      })
      .join("");
    body = qhtml + `<div class="opts">${opts}</div>`;
    if (s.picked !== null) {
      feedback =
        s.picked === t * cur
          ? l.fbRight
          : l.fbWrongPre +
            `${colorNum(t, coded)} ${X} ${colorNum(cur, coded)} = ` +
            (coded ? colorNum(t * cur, coded) : `<span class="num">${t * cur}</span>`) +
            l.fbWrongPost;
      controls = backBtn + ctrl("next", l.next, `${l.keySpace} / \u2192`, true) + menuBtn;
    } else {
      controls = backBtn + `<span class="ctrl-hint">${l.pickHint}</span>` + menuBtn;
    }
  }

  const feedbackHtml = s.mode === "choose" ? `<div class="feedback">${feedback}</div>` : "";
  const recap =
    `${l.tableOf(t)}  \u00b7  ${X}${s.start}\u2013${X}${s.end}  \u00b7  ${l.ord[s.order]}  \u00b7  ${l.md[s.mode]}` +
    (s.retryMode ? `  \u00b7  ${l.retrying}` : "");

  return (
    `<div class="recap">${recap}</div>` +
    `<div class="grid">` +
    `<div class="col"><div class="col-h">${l.wholeTable(t)}</div><div class="tbl">${lines}</div></div>` +
    `<div class="card">` +
    `<div class="tap"${cardAction ? ` data-a="${cardAction}"` : ""}>` +
    `<div class="progress">${s.idx + 1} / ${s.items.length}</div>` +
    `<div class="cue">${cue}</div>${body}${feedbackHtml}` +
    `</div>` +
    `<div class="controls">${controls}</div>` +
    `</div></div>`
  );
}
