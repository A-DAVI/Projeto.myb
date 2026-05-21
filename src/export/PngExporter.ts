// Exporter PNG genérico — trabalha com qualquer Layout (N slides).
//
// Estratégia: o .frame já é intrinsecamente 1080×1350. O preview só aplica
// transform: scale() externo. Pra exportar, desligamos o transform e capturamos.
// Isso elimina o regime [data-exporting] e a duplicação de CSS preview/export.

import html2canvas from "html2canvas"
import JSZip from "jszip"
import type { Layout } from "../core/types"
import type { Preview } from "../editor/Preview"

async function renderFrame(preview: Preview, index: number): Promise<HTMLCanvasElement> {
  const frame = preview.frameAt(index)
  if (!frame) throw new Error(`frame ${index} não encontrado no DOM`)

  // O wrapper .frame-scaler aplica o transform; o frame interno é 1080×1350.
  const scaler = frame.closest<HTMLElement>(".frame-scaler")
  const original = scaler?.style.cssText ?? ""

  // Move o scaler pra fora da viewport e remove o scale para o html2canvas
  // pegar as dimensões reais sem cortes.
  if (scaler) {
    scaler.style.cssText = `
      position: absolute;
      top: -99999px;
      left: -99999px;
      width: 1080px;
      height: 1350px;
      transform: none;
    `
  }

  // espera o browser repintar
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))

  try {
    return await html2canvas(frame, {
      width: 1080,
      height: 1350,
      scale: 1,
      backgroundColor: null,
      useCORS: true,
      logging: false,
      windowWidth: 1080,
      windowHeight: 1350,
      // ignora elementos marcados (ex: label "01 · problema") que não devem entrar na arte final
      ignoreElements: (el: Element) => el instanceof HTMLElement && el.dataset.noExport === "",
    })
  } finally {
    if (scaler) scaler.style.cssText = original
  }
}

function filename(layout: Layout, index: number): string {
  const slide = layout.slides[index]
  return `mybuddy-${layout.id}-slide-${index + 1}-${slide.id}.png`
}

export async function exportFrame(preview: Preview, layout: Layout, index: number): Promise<void> {
  const canvas = await renderFrame(preview, index)
  download(canvas.toDataURL("image/png"), filename(layout, index))
}

export async function exportAll(preview: Preview, layout: Layout): Promise<void> {
  for (let i = 0; i < layout.slides.length; i++) {
    const canvas = await renderFrame(preview, i)
    download(canvas.toDataURL("image/png"), filename(layout, i))
    // dá tempo do navegador processar o download anterior
    await new Promise(r => setTimeout(r, 400))
  }
}

export async function exportZip(preview: Preview, layout: Layout): Promise<void> {
  const zip = new JSZip()
  for (let i = 0; i < layout.slides.length; i++) {
    const canvas = await renderFrame(preview, i)
    const base64 = canvas.toDataURL("image/png").split(",")[1]
    zip.file(filename(layout, i), base64, { base64: true })
    await new Promise(r => setTimeout(r, 200))
  }
  const blob = await zip.generateAsync({ type: "blob" })
  download(URL.createObjectURL(blob), `mybuddy-${layout.id}.zip`)
}

function download(href: string, name: string): void {
  const a = document.createElement("a")
  a.href = href
  a.download = name
  a.click()
}
