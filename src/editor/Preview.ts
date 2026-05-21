// Renderiza os slides do layout ativo no container central.
// Re-renderiza inteiro a cada mudança de estado — frames são HTML simples
// em 1080×1350 com transform: scale() externo, então rerender é barato e evita
// drift de estado entre patches.

import type { Layout, RenderContext } from "../core/types"
import type { LayoutStore } from "../core/state"
import { colors } from "../core/colors"
import { handle } from "../core/handle"

export class Preview {
  constructor(
    private root: HTMLElement,
    private store: LayoutStore,
  ) {}

  render(): void {
    const layout = this.store.layout
    const html: string[] = []

    for (let i = 0; i < layout.slides.length; i++) {
      const slide = layout.slides[i]
      const slideState = this.store.slideState(slide.id)
      const ctx: RenderContext = {
        handle: handle.get(),
        colors: colors.get(),
        slideIndex: i,
        totalSlides: layout.slides.length,
      }
      const inner = slide.render(slideState, ctx)
      html.push(`
        <div class="frame-scaler" data-slide-index="${i}">
          <div class="frame-mount" id="frame-mount-${i}">${inner}</div>
        </div>
      `)
    }

    this.root.innerHTML = html.join("")
  }

  /** Retorna o elemento .frame de cada slide (usado pelo exporter). */
  frameAt(index: number): HTMLElement | null {
    const mount = document.getElementById(`frame-mount-${index}`)
    return mount?.querySelector<HTMLElement>(".frame") ?? null
  }

  /** Garantia: usa o layout do construtor. Útil pra exporter saber quantos slides existem. */
  get layout(): Layout {
    return this.store.layout
  }
}
