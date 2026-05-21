// Drop-zone com upload + drag&drop. Salva como base64 dentro do field.

import type { Field } from "../../core/types"
import { esc } from "../../core/template"

export function renderImageField(
  field: Field,
  value: string,
  inputId: string,
): string {
  const filled = !!value
  return `
    <div class="field field--image">
      <label>${esc(field.label)}</label>
      <div class="drop-zone ${filled ? "filled" : ""}" data-image-input-id="${inputId}">
        <input type="file" id="${inputId}" data-field="${esc(field.id)}" accept="image/*" class="file-input">
        <span class="drop-hint">${filled ? "✓ imagem carregada — clique pra trocar" : "arraste ou clique para escolher"}</span>
      </div>
      <button type="button" class="remove-img-btn" data-remove-image-for="${inputId}" ${filled ? "" : "hidden"}>remover imagem</button>
      ${field.optional ? `<p class="field-hint">(opcional)</p>` : ""}
    </div>
  `
}

/** Anexa handlers de drag/drop/click no container raiz dado. */
export function bindImageFields(
  root: HTMLElement,
  onUpload: (inputId: string, dataUrl: string) => void,
  onRemove: (inputId: string) => void,
): void {
  root.querySelectorAll<HTMLElement>(".drop-zone").forEach(zone => {
    const inputId = zone.dataset.imageInputId!
    const fileInput = zone.querySelector<HTMLInputElement>(".file-input")
    if (!fileInput) return

    fileInput.addEventListener("change", e => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) readFile(file, dataUrl => onUpload(inputId, dataUrl))
    })

    zone.addEventListener("dragover", e => {
      e.preventDefault()
      zone.classList.add("drag-over")
    })
    zone.addEventListener("dragleave", () => zone.classList.remove("drag-over"))
    zone.addEventListener("drop", e => {
      e.preventDefault()
      zone.classList.remove("drag-over")
      const file = e.dataTransfer?.files[0]
      if (file && file.type.startsWith("image/")) {
        readFile(file, dataUrl => onUpload(inputId, dataUrl))
      }
    })
  })

  root.querySelectorAll<HTMLButtonElement>("[data-remove-image-for]").forEach(btn => {
    btn.addEventListener("click", () => {
      const inputId = btn.dataset.removeImageFor!
      const fileInput = document.getElementById(inputId) as HTMLInputElement | null
      if (fileInput) fileInput.value = ""
      onRemove(inputId)
    })
  })
}

function readFile(file: File, cb: (dataUrl: string) => void): void {
  // Alerta se a imagem for muito pequena — vai borrar no export 1080×1350.
  const url = URL.createObjectURL(file)
  const img = new Image()
  img.onload = () => {
    if (img.width < 800 || img.height < 800) {
      alert(
        `⚠️ imagem pequena (${img.width}×${img.height}px). pode borrar no export. ideal: > 800px.`,
      )
    }
    URL.revokeObjectURL(url)
  }
  img.src = url

  const reader = new FileReader()
  reader.onload = ev => cb(ev.target?.result as string)
  reader.readAsDataURL(file)
}
