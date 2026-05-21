// Orquestrador da tela de edição. Monta sidebar + preview, injeta CSS do layout,
// e re-renderiza preview quando o estado ou contexto global muda.

import type { Layout } from "../core/types"
import { LayoutStore } from "../core/state"
import { colors } from "../core/colors"
import { handle } from "../core/handle"
import { Sidebar } from "./Sidebar"
import { Preview } from "./Preview"
import { exportFrame, exportAll, exportZip } from "../export/PngExporter"

const STYLE_TAG_ID = "layout-styles"

export class Editor {
  private store: LayoutStore
  private sidebar: Sidebar | null = null
  private preview: Preview | null = null
  private unsubscribers: Array<() => void> = []

  constructor(
    private appRoot: HTMLElement,
    private layout: Layout,
    private onBackToGallery: () => void,
  ) {
    this.store = new LayoutStore(layout)
  }

  mount(): void {
    this.injectLayoutStyles()
    this.appRoot.innerHTML = `
      <aside class="sidebar" id="sidebar-host"></aside>
      <main class="main">
        <div class="main-header">
          <button class="sidebar-toggle" id="sidebar-toggle" aria-label="Abrir editor">
            <span></span><span></span><span></span>
          </button>
          <div>
            <h2>${this.layout.name}</h2>
            <p>preview ao vivo · 1080×1350</p>
          </div>
        </div>
        <div class="sidebar-overlay" id="sidebar-overlay"></div>
        <div class="carousel" id="preview-host"></div>
      </main>
    `

    const sidebarHost = this.appRoot.querySelector<HTMLElement>("#sidebar-host")!
    const previewHost = this.appRoot.querySelector<HTMLElement>("#preview-host")!

    this.preview = new Preview(previewHost, this.store)
    this.sidebar = new Sidebar(
      sidebarHost,
      this.store,
      this.onBackToGallery,
      () => exportAll(this.preview!, this.store.layout),
      () => exportZip(this.preview!, this.store.layout),
      (idx) => exportFrame(this.preview!, this.store.layout, idx),
    )

    this.sidebar.render()
    this.preview.render()

    // Qualquer mudança em store/colors/handle → re-renderiza o preview.
    // (a sidebar não re-renderiza inteira a cada keystroke pra manter o foco do input;
    // só os botões "remover imagem" e "reset" chamam render() explícito.)
    this.unsubscribers.push(
      this.store.subscribe(() => this.preview!.render()),
      colors.subscribe(() => this.preview!.render()),
      handle.subscribe(() => this.preview!.render()),
    )

    this.initSidebarToggle()
    this.initKeyboardShortcuts()
  }

  unmount(): void {
    for (const off of this.unsubscribers) off()
    this.unsubscribers = []
    this.sidebar = null
    this.preview = null
    this.removeLayoutStyles()
    this.appRoot.innerHTML = ""
  }

  // ===== CSS do layout =====

  private injectLayoutStyles(): void {
    this.removeLayoutStyles()
    if (!this.layout.styles) return
    const tag = document.createElement("style")
    tag.id = STYLE_TAG_ID
    tag.textContent = this.layout.styles
    document.head.appendChild(tag)
  }

  private removeLayoutStyles(): void {
    document.getElementById(STYLE_TAG_ID)?.remove()
  }

  // ===== UI helpers =====

  private initSidebarToggle(): void {
    const toggle = this.appRoot.querySelector<HTMLElement>("#sidebar-toggle")
    const sidebar = this.appRoot.querySelector<HTMLElement>(".sidebar")
    const overlay = this.appRoot.querySelector<HTMLElement>("#sidebar-overlay")
    if (!toggle || !sidebar || !overlay) return
    const open = () => {
      sidebar.classList.add("open")
      toggle.classList.add("open")
      overlay.classList.add("visible")
    }
    const close = () => {
      sidebar.classList.remove("open")
      toggle.classList.remove("open")
      overlay.classList.remove("visible")
    }
    toggle.addEventListener("click", () => sidebar.classList.contains("open") ? close() : open())
    overlay.addEventListener("click", close)
  }

  private initKeyboardShortcuts(): void {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "e") {
        e.preventDefault()
        if (this.preview) {
          exportAll(this.preview, this.store.layout).catch(err =>
            alert("Erro ao exportar: " + (err as Error).message),
          )
        }
      }
    }
    document.addEventListener("keydown", handler)
    this.unsubscribers.push(() => document.removeEventListener("keydown", handler))
  }
}
