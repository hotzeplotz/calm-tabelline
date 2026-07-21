// The Bortolato "Striscia delle tabelline" palette lives in SCSS as CSS custom
// properties --d0..--d9, defined once per theme (see src/styles/_tokens.scss).
// Because we emit `var(--dN)` here, flipping light/dark instantly re-tints every
// number with no re-render, and swapping in exact hex values is a one-file change.

/**
 * Render a number with each digit tinted by its Bortolato colour when `coded`
 * is true; otherwise return the plain string. Non-digit characters pass through.
 */
export function colorNum(n: number, coded: boolean): string {
  const s = String(n);
  if (!coded) return s;
  let out = "";
  for (const ch of s) {
    const d = ch.charCodeAt(0) - 48;
    out += d >= 0 && d <= 9 ? `<span style="color:var(--d${d})">${ch}</span>` : ch;
  }
  return out;
}
