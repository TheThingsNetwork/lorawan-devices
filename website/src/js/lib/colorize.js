// Single-pass JSON/JS syntax highlighter from the design handoff.
// One regex with alternation so later matches never re-scan injected HTML.

const esc = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export const colorize = (txt) =>
  esc(txt).replace(
    /(\/\/[^\n]*)|("[^"\n]*"\s*:)|("[^"\n]*")|('[^'\n]*')|(-?\b\d+\.?\d*\b)/g,
    (m, com, key, str, sstr, num) =>
      com
        ? `<span class="c-com">${com}</span>`
        : key
          ? `<span class="c-key">${key}</span>`
          : str || sstr
            ? `<span class="c-str">${str || sstr}</span>`
            : `<span class="c-num">${num}</span>`,
  )
