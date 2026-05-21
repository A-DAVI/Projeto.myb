// Ponto de entrada da aplicação. Orquestra módulos sem esconder a reatividade.

import './styles/tokens.css'
import './styles/editor.css'
import './styles/slides.css'

import { store, DEFAULT_STATE } from './state'
import { initColorPickers, applyColors } from './editor/ColorPicker'
import { initTextBindings, syncInputsToState, applyHandle, applyCTA } from './editor/bindings'
import { initImageUploaders, restoreImages } from './editor/ImageUploader'
import { exportFrame, exportAll, exportZip } from './export/PngExporter'

// ===== INICIALIZAÇÃO =====

function init(): void {
  const state = store.get()

  // 1. Aplica estado salvo nos inputs da sidebar e nos slides
  applyColors(state.colors)
  syncInputsToState(state)
  applyHandle(state.handle)
  applyCTA(state.f3.cta)
  applyStateToSlides(state)
  restoreImages(state.images)

  // 2. Liga eventos dos controles ao store
  initColorPickers()
  initTextBindings()
  initImageUploaders()
  initExportButtons()
  initPersistenceButtons()
  initKeyboardShortcuts()

  // 3. Toda vez que o estado mudar, re-renderiza os slides
  // (mudanças de texto já atualizam inline em bindings.ts; aqui cobrimos resets/imports)
  store.subscribe(s => {
    applyColors(s.colors)
    syncInputsToState(s)
    applyHandle(s.handle)
    applyCTA(s.f3.cta)
    applyStateToSlides(s)
    restoreImages(s.images)
  })
}

// Sincroniza o DOM dos slides com o estado (usado após reset/import JSON)
function applyStateToSlides(state: ReturnType<typeof store.get>): void {
  const setText = (id: string, val: string) => {
    const el = document.getElementById(id)
    if (el) el.textContent = val
  }

  setText('render-f1-eyebrow', state.f1.eyebrow)
  setText('render-f1-headline-text', state.f1.headlineText)
  setText('render-f1-headline-accent', state.f1.headlineAccent)
  setText('render-f1-headline-end', state.f1.headlineEnd)
  setText('render-f1-subline', state.f1.subline)
  setText('render-f2-title', state.f2.title)
  setText('render-f2-subtitle', state.f2.subtitle)
  setText('render-f2-source', state.f2.source)
  setText('render-f2-num1', state.f2.stats[0].num)
  setText('render-f2-label1', state.f2.stats[0].label)
  setText('render-f2-detail1', state.f2.stats[0].detail)
  setText('render-f2-num2', state.f2.stats[1].num)
  setText('render-f2-label2', state.f2.stats[1].label)
  setText('render-f2-detail2', state.f2.stats[1].detail)
  setText('render-f2-num3', state.f2.stats[2].num)
  setText('render-f2-label3', state.f2.stats[2].label)
  setText('render-f2-detail3', state.f2.stats[2].detail)
  setText('render-f3-tag', state.f3.tag)
  setText('render-f3-headline-text', state.f3.headlineText)
  setText('render-f3-headline-accent', state.f3.headlineAccent)
  setText('render-f3-headline-end', state.f3.headlineEnd)
  setText('render-f3-feat1', state.f3.feats[0])
  setText('render-f3-feat2', state.f3.feats[1])
  setText('render-f3-feat3', state.f3.feats[2])
  applyCTA(state.f3.cta)
}

// ===== BOTÕES DE EXPORT =====

function initExportButtons(): void {
  const wrap = (fn: () => Promise<void>, btnId: string) => {
    const btn = document.getElementById(btnId) as HTMLButtonElement | null
    if (!btn) return
    btn.addEventListener('click', async () => {
      btn.disabled = true
      btn.textContent = '⏳ exportando...'
      try { await fn() } catch (e) { alert('Erro ao exportar: ' + (e as Error).message) }
      finally { btn.disabled = false; btn.textContent = btn.dataset.label ?? '' }
    })
    btn.dataset.label = btn.textContent ?? ''
  }

  wrap(exportAll, 'btn-export-all')
  wrap(exportZip, 'btn-export-zip')
  wrap(() => exportFrame(1), 'btn-export-1')
  wrap(() => exportFrame(2), 'btn-export-2')
  wrap(() => exportFrame(3), 'btn-export-3')
}

// ===== PERSISTÊNCIA: export/import JSON + reset =====

function initPersistenceButtons(): void {
  document.getElementById('btn-export-json')?.addEventListener('click', () => {
    const json = store.toJSON()
    const blob = new Blob([json], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'mybuddy-config.json'
    a.click()
  })

  document.getElementById('import-json')?.addEventListener('change', (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      try {
        store.fromJSON(ev.target?.result as string)
      } catch {
        alert('Arquivo JSON inválido.')
      }
    }
    reader.readAsText(file)
  })

  document.getElementById('btn-reset')?.addEventListener('click', () => {
    if (confirm('Resetar todos os textos e cores para o padrão? As imagens serão mantidas.')) {
      // mantém imagens, reseta o resto
      const images = store.get().images
      store.reset()
      store.set({ images })
    }
  })
}

// ===== ATALHOS DE TECLADO =====

function initKeyboardShortcuts(): void {
  document.addEventListener('keydown', (e) => {
    // Ctrl+E → exportar todos
    if (e.ctrlKey && e.key === 'e') {
      e.preventDefault()
      exportAll().catch(err => alert('Erro ao exportar: ' + err.message))
    }
  })
}

// aguarda o DOM estar pronto (Vite garante defer, mas por segurança)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}

// evita TS de reclamar de DEFAULT_STATE não usado diretamente aqui
void DEFAULT_STATE
