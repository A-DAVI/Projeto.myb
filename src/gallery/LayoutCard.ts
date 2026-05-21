// Card visual de um layout na galeria. O thumbnail é gerado a partir do
// 1º slide do layout, renderizado em mini-escala (transform: scale(0.18)).
// Mantém o "wow factor" sem precisar de imagem pré-gerada.

import type { Layout, RenderContext } from "../core/types"
import { esc } from "../core/template"
import { colors } from "../core/colors"
import { handle } from "../core/handle"

export function renderLayoutCard(layout: Layout): string {
  const firstSlide = layout.slides[0]
  const ctx: RenderContext = {
    handle: handle.get(),
    colors: colors.get(),
    slideIndex: 0,
    totalSlides: layout.slides.length,
  }
  // estado default puro pra exibição
  const defaults: Record<string, string> = {}
  for (const f of firstSlide.fields) defaults[f.id] = f.default

  const slideCount = layout.slides.length
  const slideWord = slideCount === 1 ? "slide" : "slides"

  return `
    <article class="layout-card" data-layout-id="${esc(layout.id)}" role="button" tabindex="0">
      <div class="layout-card-preview">
        <div class="frame-scaler frame-scaler--thumb">
          <div class="frame-mount">${firstSlide.render(defaults, ctx)}</div>
        </div>
      </div>
      <div class="layout-card-meta">
        <div class="layout-card-row">
          <h3>${esc(layout.name)}</h3>
          <span class="layout-card-count">${slideCount} ${slideWord}</span>
        </div>
        <p>${esc(layout.description)}</p>
        ${layout.category ? `<span class="layout-card-tag">${esc(layout.category)}</span>` : ""}
      </div>
    </article>
  `
}
