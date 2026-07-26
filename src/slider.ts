import type { State } from "./types";

/**
 * Wire the custom dual-thumb range slider. Updates state and repaints the slider
 * DOM directly (no full re-render) so dragging is smooth and nothing collapses
 * mid-interaction. Works with pointer, touch and keyboard.
 */
export function wireSlider(root: HTMLElement, s: State): void {
  const line = root.querySelector<HTMLElement>(".rs-line")!;
  const tMin = root.querySelector<HTMLElement>('[data-t="min"]')!;
  const tMax = root.querySelector<HTMLElement>('[data-t="max"]')!;
  const fill = root.querySelector<HTMLElement>(".rs-fill")!;
  const val = root.querySelector<HTMLElement>(".rs-value")!;

  const pct = (v: number): number => ((v - 1) / 9) * 100;

  function paint(): void {
    tMin.style.left = pct(s.start) + "%";
    tMax.style.left = pct(s.end) + "%";
    fill.style.left = pct(s.start) + "%";
    fill.style.width = pct(s.end) - pct(s.start) + "%";
    tMin.setAttribute("aria-valuenow", String(s.start));
    tMax.setAttribute("aria-valuenow", String(s.end));
    val.innerHTML = `<span class="v">\u00d7${s.start}</span> <span class="op">\u2013</span> <span class="v">\u00d7${s.end}</span>`;
  }

  function valueAt(clientX: number): number {
    const r = line.getBoundingClientRect();
    return Math.max(1, Math.min(10, Math.round(1 + ((clientX - r.left) / r.width) * 9)));
  }

  function setThumb(which: "min" | "max", v: number): void {
    if (which === "min") s.start = Math.min(v, s.end);
    else s.end = Math.max(v, s.start);
    s.custom = true;
    paint();
  }

  (
    [
      ["min", tMin],
      ["max", tMax],
    ] as const
  ).forEach(([which, el]) => {
    el.addEventListener("pointerdown", (e: PointerEvent) => {
      e.preventDefault();
      el.setPointerCapture(e.pointerId);
      el.classList.add("dragging");
      const move = (ev: PointerEvent) => setThumb(which, valueAt(ev.clientX));
      const up = () => {
        try {
          el.releasePointerCapture(e.pointerId);
        } catch {
          /* already released */
        }
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerup", up);
        el.classList.remove("dragging");
      };
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerup", up);
    });

    el.addEventListener("keydown", (e: KeyboardEvent) => {
      const d =
        e.key === "ArrowRight" || e.key === "ArrowUp"
          ? 1
          : e.key === "ArrowLeft" || e.key === "ArrowDown"
            ? -1
            : 0;
      if (!d) return;
      e.preventDefault();
      e.stopPropagation();
      setThumb(which, (which === "min" ? s.start : s.end) + d);
    });
  });

  // Tap on the track moves the nearer thumb.
  line.addEventListener("pointerdown", (e: PointerEvent) => {
    if ((e.target as HTMLElement).classList.contains("rs-thumb")) return;
    const v = valueAt(e.clientX);
    setThumb(Math.abs(v - s.start) <= Math.abs(v - s.end) ? "min" : "max", v);
  });

  paint();
}
