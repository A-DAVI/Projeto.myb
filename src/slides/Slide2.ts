// Renderiza o corpo dinâmico do frame 2 conforme o layout selecionado.
// O topo (logo, counter) e o f2-deco são estáticos no HTML; só o #f2-body é substituído.

import { EditorState, Slide2Layout } from '../state'

export function renderSlide2(state: EditorState): void {
  const body = document.getElementById('f2-body')
  if (!body) return

  switch (state.f2.layout) {
    case 'stats': body.innerHTML = buildStats(state); break
    case 'cards': body.innerHTML = buildCards(state); break
    case 'quote': body.innerHTML = buildQuote(state); break
  }

  // mostra/oculta campos do editor conforme o layout
  syncEditorFields(state.f2.layout)
}

// ===== LAYOUT: STATS (original) =====

function buildStats(s: EditorState): string {
  const [s1, s2, s3] = s.f2.stats
  return `
    <h3 class="f2-title" id="render-f2-title">${esc(s.f2.title)}</h3>
    <p class="f2-subtitle" id="render-f2-subtitle">${esc(s.f2.subtitle)}</p>
    <div class="f2-stats">
      <div class="f2-stat">
        <div class="num" id="render-f2-num1">${esc(s1.num)}</div>
        <div class="info">
          <div class="label" id="render-f2-label1">${esc(s1.label)}</div>
          <div class="detail" id="render-f2-detail1">${esc(s1.detail)}</div>
        </div>
      </div>
      <div class="f2-stat">
        <div class="num" id="render-f2-num2">${esc(s2.num)}</div>
        <div class="info">
          <div class="label" id="render-f2-label2">${esc(s2.label)}</div>
          <div class="detail" id="render-f2-detail2">${esc(s2.detail)}</div>
        </div>
      </div>
      <div class="f2-stat positive">
        <div class="num" id="render-f2-num3">${esc(s3.num)}</div>
        <div class="info">
          <div class="label" id="render-f2-label3">${esc(s3.label)}</div>
          <div class="detail" id="render-f2-detail3">${esc(s3.detail)}</div>
        </div>
      </div>
    </div>
    <p class="f2-source" id="render-f2-source">${esc(s.f2.source)}</p>
  `
}

// ===== LAYOUT: CARDS (grid 3 cards visuais) =====

function buildCards(s: EditorState): string {
  const [c1, c2, c3] = s.f2.cards
  return `
    <h3 class="f2-title" id="render-f2-title">${esc(s.f2.title)}</h3>
    <p class="f2-subtitle" id="render-f2-subtitle">${esc(s.f2.subtitle)}</p>
    <div class="f2-cards">
      <div class="f2-card">
        <div class="f2-card-emoji" id="render-f2-emoji1">${esc(c1.emoji)}</div>
        <div class="f2-card-num" id="render-f2-cnum1">${esc(c1.num)}</div>
        <div class="f2-card-label" id="render-f2-clabel1">${esc(c1.label)}</div>
      </div>
      <div class="f2-card">
        <div class="f2-card-emoji" id="render-f2-emoji2">${esc(c2.emoji)}</div>
        <div class="f2-card-num" id="render-f2-cnum2">${esc(c2.num)}</div>
        <div class="f2-card-label" id="render-f2-clabel2">${esc(c2.label)}</div>
      </div>
      <div class="f2-card f2-card--positive">
        <div class="f2-card-emoji" id="render-f2-emoji3">${esc(c3.emoji)}</div>
        <div class="f2-card-num" id="render-f2-cnum3">${esc(c3.num)}</div>
        <div class="f2-card-label" id="render-f2-clabel3">${esc(c3.label)}</div>
      </div>
    </div>
    <p class="f2-source" id="render-f2-source">${esc(s.f2.source)}</p>
  `
}

// ===== LAYOUT: QUOTE (citação de impacto) =====

function buildQuote(s: EditorState): string {
  const q = s.f2.quote
  return `
    <h3 class="f2-title" id="render-f2-title">${esc(s.f2.title)}</h3>
    <div class="f2-quote-layout">
      <div class="f2-quote-highlight" id="render-f2-q-highlight">${esc(q.highlight)}</div>
      <div class="f2-quote-divider"></div>
      <p class="f2-quote-text" id="render-f2-q-text">${esc(q.text)}</p>
      <p class="f2-quote-author" id="render-f2-q-author">${esc(q.author)}</p>
    </div>
    <p class="f2-source" id="render-f2-source">${esc(s.f2.source)}</p>
  `
}

// ===== EXPORTING STYLES =====
// O PngExporter adiciona [data-exporting] ao frame; aqui escalamos os elementos
// específicos de cada layout novo (stats já tem estilos em slides.css).

export function getExportStyles(layout: Slide2Layout): string {
  if (layout === 'cards') return `
    .frame[data-exporting] .f2-cards { gap: 30px; }
    .frame[data-exporting] .f2-card { padding: 36px 24px; border-radius: 24px; }
    .frame[data-exporting] .f2-card-emoji { font-size: 72px; }
    .frame[data-exporting] .f2-card-num { font-size: 72px; }
    .frame[data-exporting] .f2-card-label { font-size: 30px; }
  `
  if (layout === 'quote') return `
    .frame[data-exporting] .f2-quote-highlight { font-size: 180px; }
    .frame[data-exporting] .f2-quote-text { font-size: 42px; line-height: 1.3; }
    .frame[data-exporting] .f2-quote-author { font-size: 30px; margin-top: 24px; }
    .frame[data-exporting] .f2-quote-divider { width: 90px; height: 6px; margin: 24px 0; }
  `
  return ''
}

// ===== HELPERS =====

function esc(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// Mostra/oculta grupos de campos na sidebar conforme o layout
function syncEditorFields(layout: Slide2Layout): void {
  const groups: Record<string, Slide2Layout[]> = {
    'f2-fields-stats': ['stats'],
    'f2-fields-cards': ['cards'],
    'f2-fields-quote': ['quote'],
  }
  for (const [id, layouts] of Object.entries(groups)) {
    const el = document.getElementById(id)
    if (el) el.style.display = layouts.includes(layout) ? '' : 'none'
  }
}
