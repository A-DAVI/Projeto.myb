// Ponto de entrada. Orquestra módulos sem esconder a reatividade.

import './styles/tokens.css'
import './styles/editor.css'
import './styles/slides.css'

import { store, DEFAULT_STATE, Slide2Layout } from './state'
import { initColorPickers, applyColors } from './editor/ColorPicker'
import { initTextBindings, syncInputsToState, applyHandle, applyCTA } from './editor/bindings'
import { initImageUploaders, restoreImages } from './editor/ImageUploader'
import { exportFrame, exportAll, exportZip } from './export/PngExporter'
import { renderSlide2 } from './slides/Slide2'
import {
  loadApiKey, saveApiKey, clearApiKey,
  generateFullCarousel, generateSlide1, generateSlide2, generateSlide3,
} from './ai/generator'

// ===== INICIALIZAÇÃO =====

function init(): void {
  const state = store.get()

  applyColors(state.colors)
  syncInputsToState(state)
  applyHandle(state.handle)
  applyCTA(state.f3.cta)
  applyStateToSlide1(state)
  renderSlide2(state)       // renderiza o corpo do slide 2 conforme o layout salvo
  applyStateToSlide3(state)
  restoreImages(state.images)

  // restaura a chave de API na sidebar (não faz parte do EditorState)
  const keyInput = document.getElementById('ai-key') as HTMLInputElement | null
  if (keyInput) keyInput.value = loadApiKey()

  initColorPickers()
  initTextBindings()
  initImageUploaders()
  initExportButtons()
  initPersistenceButtons()
  initLayoutSelector()
  initAIButtons()
  initSidebarToggle()
  initKeyboardShortcuts()

  // quando o estado muda por reset ou import JSON, re-renderiza tudo
  store.subscribe(s => {
    applyColors(s.colors)
    syncInputsToState(s)
    applyHandle(s.handle)
    applyCTA(s.f3.cta)
    applyStateToSlide1(s)
    renderSlide2(s)
    applyStateToSlide3(s)
    restoreImages(s.images)
  })
}

// ===== RENDER HELPERS =====

function applyStateToSlide1(state: ReturnType<typeof store.get>): void {
  setText('render-f1-eyebrow', state.f1.eyebrow)
  setText('render-f1-headline-text', state.f1.headlineText)
  setText('render-f1-headline-accent', state.f1.headlineAccent)
  setText('render-f1-headline-end', state.f1.headlineEnd)
  setText('render-f1-subline', state.f1.subline)
}

function applyStateToSlide3(state: ReturnType<typeof store.get>): void {
  setText('render-f3-tag', state.f3.tag)
  setText('render-f3-headline-text', state.f3.headlineText)
  setText('render-f3-headline-accent', state.f3.headlineAccent)
  setText('render-f3-headline-end', state.f3.headlineEnd)
  setText('render-f3-feat1', state.f3.feats[0])
  setText('render-f3-feat2', state.f3.feats[1])
  setText('render-f3-feat3', state.f3.feats[2])
  applyCTA(state.f3.cta)
}

function setText(id: string, val: string): void {
  const el = document.getElementById(id)
  if (el) el.textContent = val
}

// ===== SELETOR DE LAYOUT (slide 2) =====

function initLayoutSelector(): void {
  document.querySelectorAll<HTMLElement>('.layout-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const layout = btn.dataset.layout as Slide2Layout
      store.set({ f2: { layout } })
      // renderSlide2 é chamado pelo subscriber do store acima
    })
  })
}

// ===== EXPORT =====

function initExportButtons(): void {
  const wrap = (fn: () => Promise<void>, btnId: string) => {
    const btn = document.getElementById(btnId) as HTMLButtonElement | null
    if (!btn) return
    const label = btn.textContent ?? ''
    btn.addEventListener('click', async () => {
      btn.disabled = true
      btn.textContent = '⏳ exportando...'
      try { await fn() } catch (e) { alert('Erro ao exportar: ' + (e as Error).message) }
      finally { btn.disabled = false; btn.textContent = label }
    })
  }

  wrap(exportAll, 'btn-export-all')
  wrap(exportZip, 'btn-export-zip')
  wrap(() => exportFrame(1), 'btn-export-1')
  wrap(() => exportFrame(2), 'btn-export-2')
  wrap(() => exportFrame(3), 'btn-export-3')
}

// ===== PERSISTÊNCIA =====

function initPersistenceButtons(): void {
  document.getElementById('btn-export-json')?.addEventListener('click', () => {
    const blob = new Blob([store.toJSON()], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'mybuddy-config.json'
    a.click()
  })

  document.getElementById('import-json')?.addEventListener('change', e => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      try { store.fromJSON(ev.target?.result as string) }
      catch { alert('Arquivo JSON inválido.') }
    }
    reader.readAsText(file)
  })

  document.getElementById('btn-reset')?.addEventListener('click', () => {
    if (confirm('Resetar todos os textos e cores para o padrão? As imagens serão mantidas.')) {
      const images = store.get().images
      store.reset()
      store.set({ images })
    }
  })
}

// ===== IA =====

function getAIKey(): string | null {
  const keyInput = document.getElementById('ai-key') as HTMLInputElement | null
  const key = keyInput?.value.trim() ?? ''
  if (!key) { alert('Cole sua chave da API Anthropic (sk-ant-...) no campo "chave da API".'); return null }
  saveApiKey(key)
  return key
}

function getTopic(): string {
  const el = document.getElementById('ai-topic') as HTMLTextAreaElement | null
  return el?.value.trim() || 'adoção de pets no Brasil — problema, dados e solução MyBuddy'
}

function withLoadingBtn(btnId: string, fn: () => Promise<void>): void {
  const btn = document.getElementById(btnId) as HTMLButtonElement | null
  if (!btn) return

  // desabilita todos os botões de IA durante a geração
  const aiBtns = document.querySelectorAll<HTMLButtonElement>('.ai-btn')
  aiBtns.forEach(b => { b.disabled = true; b.classList.add('loading') })

  fn()
    .catch(e => alert('Erro na geração com IA: ' + (e as Error).message))
    .finally(() => {
      aiBtns.forEach(b => { b.disabled = false; b.classList.remove('loading') })
    })
}

function initAIButtons(): void {
  // chave — salvar ao digitar, limpar com botão
  const keyInput = document.getElementById('ai-key') as HTMLInputElement | null
  keyInput?.addEventListener('change', () => saveApiKey(keyInput.value.trim()))
  document.getElementById('btn-clear-key')?.addEventListener('click', () => {
    clearApiKey()
    if (keyInput) keyInput.value = ''
  })

  // gerar carrossel completo
  document.getElementById('btn-gen-all')?.addEventListener('click', () => {
    withLoadingBtn('btn-gen-all', async () => {
      const key = getAIKey(); if (!key) return
      const payload = await generateFullCarousel(key, getTopic())
      store.set({
        f1: payload.f1,
        f2: {
          title: payload.f2.title,
          subtitle: payload.f2.subtitle,
          source: payload.f2.source,
          stats: payload.f2.stats,
          cards: payload.f2.cards,
          quote: payload.f2.quote,
        },
        f3: payload.f3,
      })
    })
  })

  // gerar slide 1
  document.getElementById('btn-gen-1')?.addEventListener('click', () => {
    withLoadingBtn('btn-gen-1', async () => {
      const key = getAIKey(); if (!key) return
      const result = await generateSlide1(key, getTopic(), store.get().f1)
      store.set({ f1: result })
    })
  })

  // gerar slide 2
  document.getElementById('btn-gen-2')?.addEventListener('click', () => {
    withLoadingBtn('btn-gen-2', async () => {
      const key = getAIKey(); if (!key) return
      const { layout } = store.get().f2
      const result = await generateSlide2(key, getTopic(), layout, store.get().f2)
      store.set({ f2: result })
    })
  })

  // gerar slide 3
  document.getElementById('btn-gen-3')?.addEventListener('click', () => {
    withLoadingBtn('btn-gen-3', async () => {
      const key = getAIKey(); if (!key) return
      const result = await generateSlide3(key, getTopic(), store.get().f3)
      store.set({ f3: result })
    })
  })
}

// ===== TOGGLE SIDEBAR (mobile) =====

function initSidebarToggle(): void {
  const toggle = document.getElementById('sidebar-toggle')
  const sidebar = document.querySelector<HTMLElement>('.sidebar')
  const overlay = document.getElementById('sidebar-overlay')
  if (!toggle || !sidebar || !overlay) return

  const open = () => { sidebar.classList.add('open'); toggle.classList.add('open'); overlay.classList.add('visible') }
  const close = () => { sidebar.classList.remove('open'); toggle.classList.remove('open'); overlay.classList.remove('visible') }

  toggle.addEventListener('click', () => sidebar.classList.contains('open') ? close() : open())
  overlay.addEventListener('click', close)
  document.querySelectorAll<HTMLButtonElement>('[id^="btn-export"]').forEach(btn => {
    btn.addEventListener('click', () => { if (window.innerWidth <= 768) close() })
  })
}

// ===== ATALHOS =====

function initKeyboardShortcuts(): void {
  document.addEventListener('keydown', e => {
    if (e.ctrlKey && e.key === 'e') {
      e.preventDefault()
      exportAll().catch(err => alert('Erro ao exportar: ' + err.message))
    }
  })
}

// evita TS reclamar de DEFAULT_STATE não usado aqui diretamente
void DEFAULT_STATE

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
