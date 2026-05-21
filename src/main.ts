// Bootstrap: monta o app em #app, escuta o router e troca entre galeria/editor.

import "./styles/tokens.css"
import "./styles/base.css"
import "./styles/gallery.css"
import "./styles/editor.css"
import "./styles/slides.css"

import { router } from "./core/router"
import { layouts, findLayout } from "./layouts"
import { Gallery } from "./gallery/Gallery"
import { Editor } from "./editor/Editor"
import "./core/colors"   // side-effect: aplica vars CSS no :root

type ActiveView =
  | { kind: "gallery"; instance: Gallery }
  | { kind: "editor"; instance: Editor }
  | { kind: "not-found" }
  | { kind: "none" }

const app = document.getElementById("app") as HTMLElement
if (!app) throw new Error("#app não encontrado no index.html")

let active: ActiveView = { kind: "none" }

function unmount(): void {
  if (active.kind === "gallery") active.instance.unmount()
  else if (active.kind === "editor") active.instance.unmount()
  active = { kind: "none" }
}

function mountGallery(): void {
  unmount()
  document.body.dataset.view = "gallery"
  const g = new Gallery(app, layout => {
    router.go({ name: "editor", layoutId: layout.id })
  })
  g.mount()
  active = { kind: "gallery", instance: g }
}

function mountEditor(layoutId: string): void {
  const layout = findLayout(layoutId)
  if (!layout) {
    mountNotFound(layoutId)
    return
  }
  unmount()
  document.body.dataset.view = "editor"
  const e = new Editor(app, layout, () => router.go({ name: "gallery" }))
  e.mount()
  active = { kind: "editor", instance: e }
}

function mountNotFound(path: string): void {
  unmount()
  document.body.dataset.view = "not-found"
  app.innerHTML = `
    <div class="not-found">
      <h1>🐾 ops...</h1>
      <p>layout "<code>${escapeForAttr(path)}</code>" não encontrado.</p>
      <button class="export-btn" id="btn-go-gallery">← voltar pra galeria</button>
    </div>
  `
  app.querySelector("#btn-go-gallery")?.addEventListener("click", () => {
    router.go({ name: "gallery" })
  })
  active = { kind: "not-found" }
}

function escapeForAttr(s: string): string {
  return s.replace(/[<>&"]/g, c => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c]!))
}

function route(): void {
  const r = router.get()
  if (r.name === "gallery") mountGallery()
  else if (r.name === "editor") mountEditor(r.layoutId)
  else mountNotFound(r.path)
}

router.subscribe(route)
route()

// nota: a primeira renderização da galeria gera thumbnails de TODOS os layouts;
// pra log futuro de quais layouts existem, basta consultar o array `layouts`.
void layouts
