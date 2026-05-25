// Layout "Pet pra adoção (post)" — versão carrossel.
// Divulga 1 a 5 pets num único post: capa + slots de pet + CTA final.
//
// Foto domina ~60% do slide (810px de 1350), texto embaixo.
//
// ENQUADRAMENTO DA FOTO (drag + zoom):
//   A <img> é exibida no tamanho NATURAL com transform: translate() scale().
//   No load, calculamos a "scale base" (equivalente ao object-fit: cover):
//   o quanto a imagem precisa ser escalada pra cobrir o container 1080×810.
//   • scale = baseScale → equivalente a cover (ponto de partida)
//   • drag = translate(x, y) em px no espaço real
//   • scroll = aumenta scale a partir do baseScale
//   Estado persistido em localStorage paralelo ao LayoutStore.
//
// IMPORTANTE: nunca aninhe html`...` dentro de outro html`...`. Use html.raw().

import type { Layout, SlideState, RenderContext } from "../core/types"
import { html, richText, esc } from "../core/template"
import { topBar, handlePill, frameLabel } from "./_shared"

// ─── constantes do container da foto ────────────────────────────────────
const PHOTO_W = 1080
const PHOTO_H = 810

// ─── crop state lateral ─────────────────────────────────────────────────
// tx, ty em px (espaço real da imagem natural — antes do scale)
// scale = multiplicador aplicado ao tamanho natural da imagem.
//   Pra "cover" (estado inicial), calculamos baseScale baseado nas dimensões
//   naturais da imagem e do container. A scale armazenada NUNCA é menor que
//   o baseScale (senão aparece borda preta).
// userZoom = quanto o usuário aumentou ALÉM do cover (1.0 a 3.0)

type CropState = { tx: number; ty: number; userZoom: number }
const CROP_STORAGE_KEY = "mybuddy-editor:pet-adocao-post:crops"
const DEFAULT_CROP: CropState = { tx: 0, ty: 0, userZoom: 1 }

function loadCrops(): Record<string, CropState> {
  try {
    const raw = localStorage.getItem(CROP_STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveCrops(crops: Record<string, CropState>): void {
  localStorage.setItem(CROP_STORAGE_KEY, JSON.stringify(crops))
}

function getCrop(petKey: string): CropState {
  const all = loadCrops()
  return all[petKey] ?? { ...DEFAULT_CROP }
}

function setCrop(petKey: string, crop: CropState): void {
  const all = loadCrops()
  all[petKey] = crop
  saveCrops(all)
}

// ─── matemática do crop ─────────────────────────────────────────────────
// Calcula a escala mínima pra imagem cobrir o container (equivalente CSS object-fit:cover)
function coverScale(naturalW: number, naturalH: number): number {
  return Math.max(PHOTO_W / naturalW, PHOTO_H / naturalH)
}

// Limita tx/ty pra imagem nunca sair do container (deixar borda visível).
// Imagem renderizada = natural * scale. Container = 1080×810. Centro da imagem
// começa em (PHOTO_W/2, PHOTO_H/2) com tx=ty=0. Os limites são metade da
// diferença entre tamanho renderizado e container.
function clampTranslate(
  tx: number, ty: number,
  naturalW: number, naturalH: number,
  scale: number,
): { tx: number; ty: number } {
  const renderedW = naturalW * scale
  const renderedH = naturalH * scale
  const maxOffsetX = Math.max(0, (renderedW - PHOTO_W) / 2)
  const maxOffsetY = Math.max(0, (renderedH - PHOTO_H) / 2)
  return {
    tx: clamp(tx, -maxOffsetX, maxOffsetX),
    ty: clamp(ty, -maxOffsetY, maxOffsetY),
  }
}

function applyCropToImg(img: HTMLImageElement, crop: CropState): void {
  const naturalW = img.naturalWidth
  const naturalH = img.naturalHeight
  if (!naturalW || !naturalH) return // ainda não carregou

  const base = coverScale(naturalW, naturalH)
  const scale = base * crop.userZoom
  const clamped = clampTranslate(crop.tx, crop.ty, naturalW, naturalH, scale)

  // posiciona a imagem com o canto superior esquerdo em (PHOTO_W/2 - renderedW/2, ...)
  // pra ficar centralizada com tx=ty=0
  const renderedW = naturalW * scale
  const renderedH = naturalH * scale
  const left = (PHOTO_W - renderedW) / 2 + clamped.tx
  const top = (PHOTO_H - renderedH) / 2 + clamped.ty

  img.style.width = `${naturalW}px`
  img.style.height = `${naturalH}px`
  img.style.transform = `translate(${left}px, ${top}px) scale(${scale})`
  img.style.transformOrigin = "0 0"
}

// ─── interação ──────────────────────────────────────────────────────────
let interactionSetup = false

function setupInteractions(): void {
  if (interactionSetup) return
  interactionSetup = true

  let dragging: {
    container: HTMLElement
    img: HTMLImageElement
    petKey: string
    startClientX: number
    startClientY: number
    startTx: number
    startTy: number
    scaleVisualToReal: number
  } | null = null

  document.addEventListener("mousedown", (e) => {
    const target = e.target as HTMLElement
    const container = target.closest<HTMLElement>(".pap-photo[data-pet-key]")
    if (!container) return
    const img = container.querySelector<HTMLImageElement>(".pap-photo-img")
    if (!img || !img.naturalWidth) return

    const petKey = container.dataset.petKey!
    const crop = getCrop(petKey)

    // fator de escala visual: o container tem offsetWidth=1080 (real), mas
    // na tela aparece menor por causa do transform: scale() no frame-scaler.
    const rect = container.getBoundingClientRect()
    const scaleVisualToReal = container.offsetWidth / rect.width

    dragging = {
      container,
      img,
      petKey,
      startClientX: e.clientX,
      startClientY: e.clientY,
      startTx: crop.tx,
      startTy: crop.ty,
      scaleVisualToReal,
    }
    container.style.cursor = "grabbing"
    e.preventDefault()
  })

  document.addEventListener("mousemove", (e) => {
    if (!dragging) return
    const dxVisual = e.clientX - dragging.startClientX
    const dyVisual = e.clientY - dragging.startClientY
    const dxReal = dxVisual * dragging.scaleVisualToReal
    const dyReal = dyVisual * dragging.scaleVisualToReal

    const crop = getCrop(dragging.petKey)
    const next: CropState = {
      tx: dragging.startTx + dxReal,
      ty: dragging.startTy + dyReal,
      userZoom: crop.userZoom,
    }
    setCrop(dragging.petKey, next)
    applyCropToImg(dragging.img, next)
  })

  document.addEventListener("mouseup", () => {
    if (!dragging) return
    dragging.container.style.cursor = ""
    dragging = null
  })

  document.addEventListener(
    "wheel",
    (e) => {
      const target = e.target as HTMLElement
      const container = target.closest<HTMLElement>(".pap-photo[data-pet-key]")
      if (!container) return
      const img = container.querySelector<HTMLImageElement>(".pap-photo-img")
      if (!img || !img.naturalWidth) return

      e.preventDefault()
      const petKey = container.dataset.petKey!
      const crop = getCrop(petKey)
      const step = e.deltaY > 0 ? -0.05 : 0.05
      const newZoom = clamp(crop.userZoom + step, 1, 3)
      const next: CropState = { tx: crop.tx, ty: crop.ty, userZoom: newZoom }
      if (newZoom === 1) { next.tx = 0; next.ty = 0 }
      setCrop(petKey, next)
      applyCropToImg(img, next)
    },
    { passive: false },
  )
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}

// Re-aplica crops após render. Também precisa lidar com imagens que ainda não
// carregaram (naturalWidth=0 no momento do render).
let observerSetup = false
function setupCropReapplication(): void {
  if (observerSetup) return
  observerSetup = true

  const applyToImg = (img: HTMLImageElement) => {
    const container = img.closest<HTMLElement>(".pap-photo[data-pet-key]")
    if (!container) return
    const petKey = container.dataset.petKey!
    applyCropToImg(img, getCrop(petKey))
  }

  const reapply = () => {
    document.querySelectorAll<HTMLImageElement>(".pap-photo-img").forEach(img => {
      if (img.naturalWidth) {
        applyToImg(img)
      } else {
        // imagem ainda carregando — escuta o load
        img.addEventListener("load", () => applyToImg(img), { once: true })
      }
    })
  }

  const obs = new MutationObserver(reapply)
  obs.observe(document.body, { childList: true, subtree: true })
  reapply()
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      setupInteractions()
      setupCropReapplication()
    })
  } else {
    setupInteractions()
    setupCropReapplication()
  }
}

// ─── helper: monta um slide de pet ─────────────────────────────────────────
function buildPetSlide(index: number) {
  const petKey = `pet-${index}`
  return {
    id: petKey,
    label: `pet ${index}`,
    fields: [
      {
        id: "photo",
        type: "image" as const,
        label: `pet ${index} — foto`,
        shape: "rect" as const,
        optional: true,
        default: "",
        hint: "arraste a foto pra reposicionar · scroll pra zoom",
      },
      { id: "name", type: "text" as const, label: `pet ${index} — nome`, default: "", optional: true },
      { id: "age", type: "text" as const, label: `pet ${index} — idade`, default: "", optional: true },
      {
        id: "size",
        type: "select" as const,
        label: `pet ${index} — porte`,
        default: "médio",
        optional: true,
        options: [
          { label: "pequeno", value: "pequeno" },
          { label: "médio", value: "médio" },
          { label: "grande", value: "grande" },
        ],
      },
      {
        id: "temperament",
        type: "text" as const,
        label: `pet ${index} — temperamento`,
        default: "",
        optional: true,
        hint: "ex: brincalhão, tímido, calmo",
      },
      { id: "org", type: "text" as const, label: `pet ${index} — ONG / contato`, default: "", optional: true },
    ],
    render: (s: SlideState, ctx: RenderContext): string => {
      const hasContent = (s.name ?? "").trim().length > 0

      const tagParts: string[] = []
      if (s.age) tagParts.push(`<span class="pap-tag">${esc(s.age)}</span>`)
      if (s.size) tagParts.push(`<span class="pap-tag">${esc(s.size)}</span>`)
      if (s.temperament) tagParts.push(`<span class="pap-tag pap-tag--accent">${esc(s.temperament)}</span>`)
      const tagsHtml = tagParts.length ? `<div class="pap-tags">${tagParts.join("")}</div>` : ""

      const orgHtml = s.org
        ? `<div class="pap-org"><span class="pap-org-label">contato</span><span class="pap-org-value">${esc(s.org)}</span></div>`
        : ""

      const contentHtml = hasContent
        ? `<h2 class="pap-name">${esc(s.name)}</h2>${tagsHtml}${orgHtml}`
        : `<p class="pap-empty">preencha as infos do pet ${index} ao lado →</p>`

      let photoInner: string
      if (s.photo) {
        photoInner = `<img class="pap-photo-img" src="${s.photo}" alt="" draggable="false"/><div class="pap-photo-hint" data-no-export>arraste pra mover · scroll pra zoom</div>`
      } else {
        photoInner = `<span class="pap-photo-placeholder">📷<br><small>foto do pet</small></span>`
      }

      return html`
        ${html.raw(frameLabel(ctx, `pet ${index}`))}
        <div class="frame frame-pap">
          ${html.raw(topBar(ctx))}

          <div class="pap-photo ${s.photo ? "has-image" : ""}" data-pet-key="${petKey}">
            ${html.raw(photoInner)}
          </div>

          <div class="pap-content">
            ${html.raw(contentHtml)}
          </div>

          <div class="pap-bottom">
            ${html.raw(handlePill(ctx))}
          </div>
        </div>
      `
    },
  }
}

export const petAdocaoPost: Layout = {
  id: "pet-adocao-post",
  name: "Pets pra adoção (post)",
  description: "Carrossel pra divulgar até 5 pets pra adoção. Capa + pets + CTA. Arraste a foto pra ajustar o enquadramento.",
  format: "carousel",
  category: "adoção",
  defaultTypography: {
    heading: { family: "DynaPuff", weight: 700 },
    body: { family: "Inter", weight: 400 },
  },

  slides: [
    {
      id: "cover",
      label: "capa",
      fields: [
        { id: "eyebrow", type: "text", label: "olho (em cima do título)", default: "pets esperando um lar" },
        {
          id: "headline",
          type: "richtext",
          label: "título principal (use {{palavra}} pra destaque)",
          default: "conheça quem está {{esperando}} por você",
        },
        {
          id: "subline",
          type: "textarea",
          label: "subtítulo",
          default: "arraste pra conhecer cada um deles 🐾",
          optional: true,
        },
      ],
      render: (s, ctx) => {
        const sublineHtml = s.subline ? `<p class="pap-subline">${esc(s.subline)}</p>` : ""
        return html`
          ${html.raw(frameLabel(ctx, "capa"))}
          <div class="frame frame-pap-cover">
            ${html.raw(topBar(ctx))}
            <div class="pap-cover-content">
              <p class="pap-eyebrow">${s.eyebrow}</p>
              <h1 class="pap-headline">${html.raw(richText(s.headline))}</h1>
              ${html.raw(sublineHtml)}
            </div>
            <div class="pap-bottom">
              ${html.raw(handlePill(ctx))}
              <span class="pap-swipe">arraste →</span>
            </div>
          </div>
        `
      },
    },

    buildPetSlide(1),
    buildPetSlide(2),
    buildPetSlide(3),
    buildPetSlide(4),
    buildPetSlide(5),

    {
      id: "cta",
      label: "CTA final",
      fields: [
        {
          id: "headline",
          type: "richtext",
          label: "chamada final (use {{palavra}} pra destaque)",
          default: "viu algum que te {{chamou}}?",
        },
        {
          id: "body",
          type: "textarea",
          label: "texto de apoio",
          default: "entre em contato com a ONG do pet que você gostou. cada lar muda uma vida.",
        },
        { id: "cta", type: "text", label: "CTA", default: "fale com a gente no direct" },
      ],
      render: (s, ctx) => html`
        ${html.raw(frameLabel(ctx, "CTA"))}
        <div class="frame frame-pap-cta">
          ${html.raw(topBar(ctx, { invertLogo: true }))}
          <div class="pap-cta-content">
            <h2 class="pap-cta-headline">${html.raw(richText(s.headline))}</h2>
            <p class="pap-cta-body">${s.body}</p>
          </div>
          <div class="pap-cta-bottom">
            <span class="pap-cta-text">${s.cta}</span>
            ${html.raw(handlePill(ctx, { variant: "light" }))}
          </div>
        </div>
      `,
    },
  ],

  styles: `
    /* ═══ BASE ═══════════════════════════════════════════════════════ */
    .frame-pap-cover, .frame-pap, .frame-pap-cta {
      width: 1080px; height: 1350px;
      background: var(--bg);
      font-family: var(--font-body);
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .frame-pap-cover, .frame-pap-cta { padding: 84px; }
    .frame-pap-cover .top, .frame-pap-cta .top { display: flex; justify-content: space-between; align-items: center; }

    /* ═══ CAPA ═══════════════════════════════════════════════════════ */
    .frame-pap-cover { justify-content: space-between; }
    .pap-cover-content { flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 30px; }
    .pap-eyebrow {
      font-family: var(--font-heading); font-weight: 500;
      color: var(--orange); font-size: 42px; letter-spacing: 0.01em;
    }
    .pap-headline {
      font-family: var(--font-heading); font-weight: var(--font-heading-weight, 700);
      color: var(--ink); font-size: 120px; line-height: 1.02; letter-spacing: -0.02em;
    }
    .pap-headline .accent { color: var(--orange); }
    .pap-subline {
      font-size: 42px; color: var(--ink); opacity: 0.7;
      line-height: 1.4; max-width: 80%;
    }
    .pap-bottom { display: flex; justify-content: space-between; align-items: center; }
    .pap-swipe { font-family: var(--font-heading); font-size: 33px; color: var(--ink); opacity: 0.5; }

    /* ═══ PET SLIDE ══════════════════════════════════════════════════ */
    .frame-pap { padding: 0; }
    .frame-pap .top {
      position: absolute;
      top: 60px; left: 60px; right: 60px;
      display: flex; justify-content: space-between; align-items: center;
      z-index: 10;
    }

    /* container da foto: 1080×810. overflow:hidden faz o crop. */
    .pap-photo {
      width: 100%;
      height: 810px;
      background-color: var(--olive);
      flex-shrink: 0;
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .pap-photo.has-image { cursor: grab; }
    .pap-photo.has-image:active { cursor: grabbing; }

    /* a <img> real — tamanho natural, controlada por transform via JS */
    .pap-photo-img {
      position: absolute;
      top: 0; left: 0;
      user-select: none;
      pointer-events: none;
      will-change: transform;
      /* sem object-fit aqui — width/height/transform vêm via JS */
    }

    .pap-photo-placeholder {
      font-size: 120px;
      color: var(--bg);
      opacity: 0.5;
      text-align: center;
      line-height: 1.2;
    }
    .pap-photo-placeholder small {
      display: block;
      font-size: 33px;
      margin-top: 18px;
      font-family: var(--font-body);
      opacity: 0.85;
    }

    .pap-photo-hint {
      position: absolute;
      bottom: 18px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.6);
      color: white;
      font-family: var(--font-body);
      font-size: 24px;
      padding: 9px 21px;
      border-radius: 60px;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.2s;
      z-index: 5;
    }
    .pap-photo.has-image:hover .pap-photo-hint { opacity: 1; }

    .pap-content {
      flex: 1;
      padding: 54px 84px 36px;
      display: flex;
      flex-direction: column;
      gap: 27px;
    }
    .pap-name {
      font-family: var(--font-heading); font-weight: var(--font-heading-weight, 700);
      font-size: 108px; color: var(--ink); letter-spacing: -0.02em; line-height: 1;
    }
    .pap-tags { display: flex; flex-wrap: wrap; gap: 15px; }
    .pap-tag {
      background: rgba(26,24,21,0.08); color: var(--ink);
      font-family: var(--font-heading); font-weight: 500;
      font-size: 33px; padding: 12px 27px; border-radius: 60px;
    }
    .pap-tag--accent { background: var(--orange); color: var(--white); }
    .pap-org { margin-top: auto; display: flex; flex-direction: column; gap: 6px; }
    .pap-org-label {
      font-size: 27px; color: var(--ink); opacity: 0.5;
      text-transform: uppercase; letter-spacing: 0.1em;
    }
    .pap-org-value {
      font-family: var(--font-heading); font-weight: 600;
      font-size: 45px; color: var(--olive);
    }
    .pap-empty {
      font-family: var(--font-heading); font-size: 39px;
      color: var(--ink); opacity: 0.35; font-style: italic;
    }
    .frame-pap .pap-bottom { padding: 0 84px 48px; }

    /* ═══ CTA FINAL ══════════════════════════════════════════════════ */
    .frame-pap-cta {
      background: var(--olive);
      justify-content: space-between;
    }
    .frame-pap-cta::before {
      content: '';
      position: absolute;
      top: -180px; right: -180px;
      width: 540px; height: 540px;
      background: var(--orange);
      border-radius: 50%;
      opacity: 0.95;
    }
    .frame-pap-cta::after {
      content: '';
      position: absolute;
      bottom: -150px; left: -150px;
      width: 420px; height: 420px;
      background: var(--bg);
      border-radius: 50%;
      opacity: 0.1;
    }
    .frame-pap-cta > * { position: relative; z-index: 1; }
    .pap-cta-content {
      flex: 1; display: flex; flex-direction: column;
      justify-content: center; gap: 36px;
    }
    .pap-cta-headline {
      font-family: var(--font-heading); font-weight: var(--font-heading-weight, 700);
      color: var(--bg); font-size: 108px; line-height: 1.02; letter-spacing: -0.02em;
    }
    .pap-cta-headline .accent { color: var(--orange); }
    .pap-cta-body {
      font-size: 42px; color: var(--bg); opacity: 0.9;
      line-height: 1.4; max-width: 88%;
    }
    .pap-cta-bottom {
      display: flex; justify-content: space-between; align-items: center;
      padding-top: 36px;
      border-top: 3px solid rgba(218,218,184,0.25);
    }
    .pap-cta-text {
      font-family: var(--font-heading); font-weight: 500;
      font-size: 39px; color: var(--bg);
    }
  `,
}
