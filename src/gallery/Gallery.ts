// Tela inicial: grid de layouts disponíveis.
// Cada card mostra o 1º slide renderizado em mini-escala.
//
// Nota CSS importante: cada layout traz seu próprio styles via injectLayoutStyles
// quando entra no editor; na galeria todos precisam estar carregados ao mesmo tempo
// porque os thumbs renderizam slides de layouts diferentes. Então a galeria injeta
// TODOS os styles de uma vez (concatenados num único <style>).

import type { Layout } from "../core/types"
import { layouts } from "../layouts"
import { renderLayoutCard } from "./LayoutCard"
import { esc } from "../core/template"

const GALLERY_STYLE_TAG_ID = "gallery-layout-styles"

export class Gallery {
  constructor(
    private appRoot: HTMLElement,
    private onPickLayout: (layout: Layout) => void,
  ) {}

  mount(): void {
    this.injectAllLayoutStyles()
    this.appRoot.innerHTML = `
      <div class="gallery">
        <header class="gallery-head">
          <h1>🐾 MyBuddy Carousel Editor</h1>
          <p>escolha um layout pra começar.</p>
        </header>
        <div class="gallery-grid">
          ${layouts.map(renderLayoutCard).join("")}
        </div>
        <footer class="gallery-foot">
          <p>${layouts.length} layouts disponíveis · adicionar mais: ver README</p>
        </footer>
      </div>
    `

    this.appRoot.querySelectorAll<HTMLElement>(".layout-card").forEach(card => {
      const pick = () => {
        const id = card.dataset.layoutId
        const layout = layouts.find(l => l.id === id)
        if (layout) this.onPickLayout(layout)
      }
      card.addEventListener("click", pick)
      card.addEventListener("keydown", e => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          pick()
        }
      })
    })
  }

  unmount(): void {
    this.removeAllLayoutStyles()
    this.appRoot.innerHTML = ""
  }

  private injectAllLayoutStyles(): void {
    this.removeAllLayoutStyles()
    const css = layouts.map(l => l.styles ?? "").join("\n")
    if (!css.trim()) return
    const tag = document.createElement("style")
    tag.id = GALLERY_STYLE_TAG_ID
    // marca os thumbnails pra não exibirem labels de slide etc.
    tag.textContent = css
    document.head.appendChild(tag)
  }

  private removeAllLayoutStyles(): void {
    document.getElementById(GALLERY_STYLE_TAG_ID)?.remove()
  }
}

// evita unused import quando o módulo é importado só pelo side-effect
void esc
