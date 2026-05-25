// Exporter PNG genérico — trabalha com qualquer Layout (N slides).
// Carousel: 1080×1350 (4:5). Story: 1080×1920 (9:16).
//
// Estratégia: o .frame já é intrinsecamente no tamanho final. O preview aplica
// transform: scale() externo. Pra exportar, desligamos o transform e capturamos.
//
// Slides que retornam HTML vazio do render() não têm .frame no DOM. O exporter
// pula esses automaticamente (frameAt() retorna null).

import html2canvas from "html2canvas"
import JSZip from "jszip"
import type { Layout } from "../core/types"
import type { Preview } from "../editor/Preview"

function frameDims(layout: Layout): { w: number; h: number } {
  return layout.format === "story"
    ? { w: 1080, h: 1920 }
    : { w: 1080, h: 1350 }
}

/**
 * Renderiza um slide pra canvas. Retorna null se o slide está desativado
 * (frame não existe no DOM porque o render() retornou string vazia).
 */
async function renderFrame(preview: Preview, layout: Layout, index: number): Promise<HTMLCanvasElement | null> {
  const frame = preview.frameAt(index)
  if (!frame) return null // slide desativado — pula silenciosamente

  const { w, h } = frameDims(layout)

  const scaler = frame.closest<HTMLElement>(".frame-scaler")
  const mount  = frame.closest<HTMLElement>(".frame-mount")
  const scalerOriginal = scaler?.style.cssText ?? ""
  const mountOriginal  = mount?.style.cssText ?? ""

  if (scaler) {
    scaler.style.cssText = `
      position: absolute;
      top: -99999px;
      left: -99999px;
      width: ${w}px;
      height: ${h}px;
      transform: none;
    `
  }

  if (mount) {
    mount.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: ${w}px;
      height: ${h}px;
      transform: none;
    `
  }

  await new Promise(r => setTimeout(r, 200))

  try {
    return await html2canvas(frame, {
      width: w,
      height: h,
      scale: 1,
      backgroundColor: null,
      useCORS: true,
      logging: false,
      windowWidth: w,
      windowHeight: h,
      ignoreElements: (el: Element) => el instanceof HTMLElement && el.dataset.noExport === "",
    })
  } finally {
    if (scaler) scaler.style.cssText = scalerOriginal
    if (mount)  mount.style.cssText  = mountOriginal
  }
}

function filename(layout: Layout, index: number): string {
  const slide = layout.slides[index]
  return `mybuddy-${layout.id}-${layout.format}-${index + 1}-${slide.id}.png`
}

export async function exportFrame(preview: Preview, layout: Layout, index: number): Promise<void> {
  const canvas = await renderFrame(preview, layout, index)
  if (!canvas) {
    console.warn(`Slide ${index} (${layout.slides[index].id}) está desativado — nada pra exportar.`)
    return
  }
  download(canvas.toDataURL("image/png"), filename(layout, index))
}

export async function exportAll(preview: Preview, layout: Layout): Promise<void> {
  for (let i = 0; i < layout.slides.length; i++) {
    const canvas = await renderFrame(preview, layout, i)
    if (!canvas) continue // pula slides desativados
    download(canvas.toDataURL("image/png"), filename(layout, i))
    await new Promise(r => setTimeout(r, 400))
  }
}

export async function exportZip(preview: Preview, layout: Layout): Promise<void> {
  const zip = new JSZip()
  for (let i = 0; i < layout.slides.length; i++) {
    const canvas = await renderFrame(preview, layout, i)
    if (!canvas) continue // pula slides desativados
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
