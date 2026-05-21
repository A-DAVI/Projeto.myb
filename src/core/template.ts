// Helpers de template HTML. Centralizam o escape de input do usuário pra evitar
// XSS quando a string vai parar em innerHTML.

/** Escapa um texto pra uso seguro em innerHTML. */
export function esc(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

/**
 * Converte o syntax {{palavra}} num <span class="accent">palavra</span>.
 * O resto do texto é escapado normalmente.
 */
export function richText(raw: string): string {
  // primeiro escapa tudo, depois injeta os <span>s — assim {{ ataques }} também
  // são neutralizados se vierem com HTML.
  return esc(raw).replace(
    /\{\{(.+?)\}\}/g,
    (_m, inner) => `<span class="accent">${inner}</span>`,
  )
}

/**
 * Tag template literal que escapa interpolações automaticamente.
 * Uso: html`<p>${userInput}</p>` — userInput é escapado.
 *
 * Pra passar HTML pré-renderizado sem escape (ex: resultado de richText),
 * envolva em html.raw(): html`<h2>${html.raw(richText(s.headline))}</h2>`.
 */
type Raw = { __raw: string }
function isRaw(x: unknown): x is Raw {
  return typeof x === "object" && x !== null && "__raw" in x
}

export function html(strings: TemplateStringsArray, ...values: unknown[]): string {
  let out = ""
  for (let i = 0; i < strings.length; i++) {
    out += strings[i]
    if (i < values.length) {
      const v = values[i]
      if (isRaw(v)) out += v.__raw
      else if (Array.isArray(v)) out += v.map(x => (isRaw(x) ? x.__raw : esc(String(x)))).join("")
      else if (v == null) out += ""
      else out += esc(String(v))
    }
  }
  return out
}

html.raw = (s: string): Raw => ({ __raw: s })
