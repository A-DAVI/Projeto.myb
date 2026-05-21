// Helpers reutilizados pelos layouts: top bar com logo+counter, handle pill,
// label do slide (canto superior esquerdo do preview).
//
// Tudo retorna HTML escapado/seguro pra ser injetado no render do slide.

import { html } from "../core/template"
import type { RenderContext } from "../core/types"

/** Logo + counter de slides no topo do frame. */
export function topBar(ctx: RenderContext, opts: { invertLogo?: boolean } = {}): string {
  const logoClass = opts.invertLogo ? "mb-logo mb-logo--inverted" : "mb-logo"
  const dots: string[] = []
  for (let i = 0; i < ctx.totalSlides; i++) {
    const cls = i === ctx.slideIndex ? "active" : ""
    dots.push(`<span class="${cls}"></span>`)
  }
  return html`
    <div class="top">
      <div class="${logoClass}">MyBuddy</div>
      <div class="counter">${html.raw(dots.join(""))}</div>
    </div>
  `
}

/** Pill com o @handle do Instagram. */
export function handlePill(ctx: RenderContext, opts: { variant?: "dark" | "light" } = {}): string {
  const cls = opts.variant === "light" ? "handle-pill handle-pill--light" : "handle-pill"
  return html`<span class="${cls}">${ctx.handle}</span>`
}

/** Etiqueta "01 · problema" no canto superior esquerdo (decorativa, fora do export). */
export function frameLabel(ctx: RenderContext, label: string): string {
  const num = String(ctx.slideIndex + 1).padStart(2, "0")
  return html`<span class="frame-label" data-no-export><span>${num}</span> · ${label}</span>`
}

/** Estilo background-image inline a partir de um data URL (ou vazio). */
export function bgImage(dataUrl: string): string {
  if (!dataUrl) return ""
  // dataUrl é base64 confiável (vem do FileReader local), mas escapar aspas mesmo assim
  return `background-image:url(${JSON.stringify(dataUrl)});`
}
