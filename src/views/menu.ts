import type { State } from "../types";
import type { Strings } from "../i18n";
import { colorNum } from "../colors";

function pill(attr: string, value: string, label: string, on: boolean, cls = ""): string {
  return `<button type="button" class="pill${cls}${on ? " on" : ""}" data-a="${attr}" data-v="${value}">${label}</button>`;
}

function slider(s: State): string {
  let notches = "";
  let scale = "";
  for (let i = 1; i <= 10; i++) {
    const p = ((i - 1) / 9) * 100;
    notches += `<div class="rs-notch" style="left:${p}%"></div>`;
    scale += `<span style="left:${p}%">${i}</span>`;
  }
  const pmn = ((s.start - 1) / 9) * 100;
  const pmx = ((s.end - 1) / 9) * 100;
  return (
    `<div class="rslider" id="rslider">` +
    `<div class="rs-value"><span class="v">\u00d7${s.start}</span> <span class="op">\u2013</span> <span class="v">\u00d7${s.end}</span></div>` +
    `<div class="rs-wrap"><div class="rs-line">${notches}` +
    `<div class="rs-fill" style="left:${pmn}%;width:${pmx - pmn}%"></div>` +
    `<div class="rs-thumb" data-t="min" tabindex="0" role="slider" aria-label="from" aria-valuemin="1" aria-valuemax="10" aria-valuenow="${s.start}" style="left:${pmn}%"></div>` +
    `<div class="rs-thumb" data-t="max" tabindex="0" role="slider" aria-label="to" aria-valuemin="1" aria-valuemax="10" aria-valuenow="${s.end}" style="left:${pmx}%"></div>` +
    `</div></div>` +
    `<div class="rs-scale">${scale}</div></div>`
  );
}

export function renderMenu(s: State, l: Strings): string {
  // With colour-coding on, each pill wears its tabellina hue; selection then
  // becomes a ring instead of the amber fill so the tint stays legible.
  const tables = [2, 3, 4, 5, 6, 7, 8, 9]
    .map((t) => pill("table", String(t), colorNum(t, s.code), s.tables.includes(t), s.code ? " tint" : ""))
    .join("");

  const preset = (a: number, b: number): boolean => !s.custom && s.start === a && s.end === b;
  const ranges =
    pill("range", "1-10", l.rAll, preset(1, 10)) +
    pill("range", "1-5", l.rFirst, preset(1, 5)) +
    pill("range", "6-10", l.rHard, preset(6, 10)) +
    pill("range", "custom", l.rCustom, s.custom);
  const customUI = s.custom ? slider(s) : "";

  const order =
    pill("order", "seq", l.oOrder, s.order === "seq") +
    pill("order", "shuffle", l.oShuffle, s.order === "shuffle");

  const modes =
    pill("mode", "study", l.mStudy, s.mode === "study") +
    pill("mode", "reveal", l.mReveal, s.mode === "reveal") +
    pill("mode", "choose", l.mChoose, s.mode === "choose");
  const note = { study: l.noteStudy, reveal: l.noteReveal, choose: l.noteChoose }[s.mode];

  const choices =
    s.mode === "choose"
      ? `<div class="row"><div class="rl">${l.kchoices}</div><div><div class="pills">` +
        [3, 4, 5]
          .map((k) => pill("n", String(k), String(k), k === s.n))
          .join("")
          .replace(/class="pill/g, 'class="pill mini') +
        `</div></div></div>`
      : "";

  return (
    `<p class="lead">${l.leadPre}<kbd>enter</kbd>${l.leadPost}<span class="caret"></span></p>` +
    `<div class="row"><div class="rl">${l.ktable}</div><div><div class="pills">${tables}</div><div class="hint">${l.numHint}</div></div></div>` +
    `<div class="row"><div class="rl">${l.krange}</div><div><div class="pills">${ranges}</div>${customUI}</div></div>` +
    `<div class="row"><div class="rl">${l.korder}</div><div class="pills">${order}</div></div>` +
    `<div class="row"><div class="rl">${l.kmode}</div><div><div class="pills">${modes}</div><div class="modeline">${note}</div></div></div>` +
    choices +
    `<div class="start"><button type="button" class="btn" data-a="start">${l.start} \u21b5</button>` +
    `<span class="hint">${l.tablesOf(s.tables)} \u00b7 ${l.ord[s.order]} \u00b7 ${l.md[s.mode]}</span></div>`
  );
}
