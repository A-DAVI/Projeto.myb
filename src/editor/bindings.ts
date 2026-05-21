// Liga cada input da sidebar ao estado e ao DOM dos slides.

import { store, EditorState } from '../state'

// Cada entrada: [inputId, setter no store, [ids no DOM do slide a atualizar inline]]
// Casos especiais (handle, CTA, stats com tupla, cards, quote) são tratados separadamente.

type SimpleBinding = { inputId: string; setFn: (v: string) => void; renderIds: string[] }

function statPatch(idx: 0 | 1 | 2, field: 'num' | 'label' | 'detail', v: string) {
  const stats = [...store.get().f2.stats] as EditorState['f2']['stats']
  stats[idx] = { ...stats[idx], [field]: v }
  store.set({ f2: { stats } })
}

function cardPatch(idx: 0 | 1 | 2, field: 'emoji' | 'num' | 'label', v: string) {
  const cards = [...store.get().f2.cards] as EditorState['f2']['cards']
  cards[idx] = { ...cards[idx], [field]: v }
  store.set({ f2: { cards } })
}

function featPatch(idx: 0 | 1 | 2, v: string) {
  const feats = [...store.get().f3.feats] as EditorState['f3']['feats']
  feats[idx] = v
  store.set({ f3: { feats } })
}

export function initTextBindings(): void {
  const bindings: SimpleBinding[] = [
    // slide 1
    { inputId: 'f1-eyebrow',         setFn: v => store.set({ f1: { eyebrow: v } }),        renderIds: ['render-f1-eyebrow'] },
    { inputId: 'f1-headline-text',   setFn: v => store.set({ f1: { headlineText: v } }),   renderIds: ['render-f1-headline-text'] },
    { inputId: 'f1-headline-accent', setFn: v => store.set({ f1: { headlineAccent: v } }), renderIds: ['render-f1-headline-accent'] },
    { inputId: 'f1-headline-end',    setFn: v => store.set({ f1: { headlineEnd: v } }),    renderIds: ['render-f1-headline-end'] },
    { inputId: 'f1-subline',         setFn: v => store.set({ f1: { subline: v } }),        renderIds: ['render-f1-subline'] },
    // slide 2 — comuns
    { inputId: 'f2-title',    setFn: v => store.set({ f2: { title: v } }),    renderIds: ['render-f2-title'] },
    { inputId: 'f2-subtitle', setFn: v => store.set({ f2: { subtitle: v } }), renderIds: ['render-f2-subtitle'] },
    { inputId: 'f2-source',   setFn: v => store.set({ f2: { source: v } }),   renderIds: ['render-f2-source'] },
    // slide 2 — stats
    { inputId: 'f2-num1',    setFn: v => statPatch(0, 'num', v),    renderIds: ['render-f2-num1'] },
    { inputId: 'f2-label1',  setFn: v => statPatch(0, 'label', v),  renderIds: ['render-f2-label1'] },
    { inputId: 'f2-detail1', setFn: v => statPatch(0, 'detail', v), renderIds: ['render-f2-detail1'] },
    { inputId: 'f2-num2',    setFn: v => statPatch(1, 'num', v),    renderIds: ['render-f2-num2'] },
    { inputId: 'f2-label2',  setFn: v => statPatch(1, 'label', v),  renderIds: ['render-f2-label2'] },
    { inputId: 'f2-detail2', setFn: v => statPatch(1, 'detail', v), renderIds: ['render-f2-detail2'] },
    { inputId: 'f2-num3',    setFn: v => statPatch(2, 'num', v),    renderIds: ['render-f2-num3'] },
    { inputId: 'f2-label3',  setFn: v => statPatch(2, 'label', v),  renderIds: ['render-f2-label3'] },
    { inputId: 'f2-detail3', setFn: v => statPatch(2, 'detail', v), renderIds: ['render-f2-detail3'] },
    // slide 2 — cards
    { inputId: 'f2-emoji1',  setFn: v => cardPatch(0, 'emoji', v), renderIds: ['render-f2-emoji1'] },
    { inputId: 'f2-cnum1',   setFn: v => cardPatch(0, 'num', v),   renderIds: ['render-f2-cnum1'] },
    { inputId: 'f2-clabel1', setFn: v => cardPatch(0, 'label', v), renderIds: ['render-f2-clabel1'] },
    { inputId: 'f2-emoji2',  setFn: v => cardPatch(1, 'emoji', v), renderIds: ['render-f2-emoji2'] },
    { inputId: 'f2-cnum2',   setFn: v => cardPatch(1, 'num', v),   renderIds: ['render-f2-cnum2'] },
    { inputId: 'f2-clabel2', setFn: v => cardPatch(1, 'label', v), renderIds: ['render-f2-clabel2'] },
    { inputId: 'f2-emoji3',  setFn: v => cardPatch(2, 'emoji', v), renderIds: ['render-f2-emoji3'] },
    { inputId: 'f2-cnum3',   setFn: v => cardPatch(2, 'num', v),   renderIds: ['render-f2-cnum3'] },
    { inputId: 'f2-clabel3', setFn: v => cardPatch(2, 'label', v), renderIds: ['render-f2-clabel3'] },
    // slide 2 — quote
    { inputId: 'f2-q-highlight', setFn: v => store.set({ f2: { quote: { highlight: v } } }), renderIds: ['render-f2-q-highlight'] },
    { inputId: 'f2-q-text',      setFn: v => store.set({ f2: { quote: { text: v } } }),      renderIds: ['render-f2-q-text'] },
    { inputId: 'f2-q-author',    setFn: v => store.set({ f2: { quote: { author: v } } }),    renderIds: ['render-f2-q-author'] },
    // slide 3
    { inputId: 'f3-tag',            setFn: v => store.set({ f3: { tag: v } }),            renderIds: ['render-f3-tag'] },
    { inputId: 'f3-headline-text',  setFn: v => store.set({ f3: { headlineText: v } }),   renderIds: ['render-f3-headline-text'] },
    { inputId: 'f3-headline-accent',setFn: v => store.set({ f3: { headlineAccent: v } }), renderIds: ['render-f3-headline-accent'] },
    { inputId: 'f3-headline-end',   setFn: v => store.set({ f3: { headlineEnd: v } }),    renderIds: ['render-f3-headline-end'] },
    { inputId: 'f3-feat1', setFn: v => featPatch(0, v), renderIds: ['render-f3-feat1'] },
    { inputId: 'f3-feat2', setFn: v => featPatch(1, v), renderIds: ['render-f3-feat2'] },
    { inputId: 'f3-feat3', setFn: v => featPatch(2, v), renderIds: ['render-f3-feat3'] },
  ]

  bindings.forEach(({ inputId, setFn, renderIds }) => {
    const input = document.getElementById(inputId) as HTMLInputElement | HTMLTextAreaElement | null
    if (!input) return
    input.addEventListener('input', () => {
      setFn(input.value)
      renderIds.forEach(id => {
        const el = document.getElementById(id)
        if (el) el.textContent = input.value
      })
    })
  })

  // handle — atualiza em dois lugares com classe .render-handle
  const handleInput = document.getElementById('handle') as HTMLInputElement | null
  handleInput?.addEventListener('input', () => {
    store.set({ handle: handleInput.value })
    applyHandle(handleInput.value)
  })

  // CTA — "siga e <strong>X</strong>"
  const ctaInput = document.getElementById('f3-cta') as HTMLInputElement | null
  ctaInput?.addEventListener('input', () => {
    store.set({ f3: { cta: ctaInput.value } })
    applyCTA(ctaInput.value)
  })
}

export function applyHandle(value: string): void {
  document.querySelectorAll<HTMLElement>('.render-handle').forEach(el => { el.textContent = value })
}

export function applyCTA(value: string): void {
  const el = document.getElementById('render-f3-cta')
  if (!el) return
  el.innerHTML = `siga e <strong>${value}</strong>`
}

// Preenche todos os inputs da sidebar com os valores do estado (init e reset)
export function syncInputsToState(state: EditorState): void {
  const set = (id: string, val: string) => {
    const el = document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement | null
    if (el) el.value = val
  }

  set('handle', state.handle)
  set('f1-eyebrow', state.f1.eyebrow)
  set('f1-headline-text', state.f1.headlineText)
  set('f1-headline-accent', state.f1.headlineAccent)
  set('f1-headline-end', state.f1.headlineEnd)
  set('f1-subline', state.f1.subline)
  set('f2-title', state.f2.title)
  set('f2-subtitle', state.f2.subtitle)
  set('f2-source', state.f2.source)
  set('f2-num1', state.f2.stats[0].num)
  set('f2-label1', state.f2.stats[0].label)
  set('f2-detail1', state.f2.stats[0].detail)
  set('f2-num2', state.f2.stats[1].num)
  set('f2-label2', state.f2.stats[1].label)
  set('f2-detail2', state.f2.stats[1].detail)
  set('f2-num3', state.f2.stats[2].num)
  set('f2-label3', state.f2.stats[2].label)
  set('f2-detail3', state.f2.stats[2].detail)
  set('f2-emoji1', state.f2.cards[0].emoji)
  set('f2-cnum1', state.f2.cards[0].num)
  set('f2-clabel1', state.f2.cards[0].label)
  set('f2-emoji2', state.f2.cards[1].emoji)
  set('f2-cnum2', state.f2.cards[1].num)
  set('f2-clabel2', state.f2.cards[1].label)
  set('f2-emoji3', state.f2.cards[2].emoji)
  set('f2-cnum3', state.f2.cards[2].num)
  set('f2-clabel3', state.f2.cards[2].label)
  set('f2-q-highlight', state.f2.quote.highlight)
  set('f2-q-text', state.f2.quote.text)
  set('f2-q-author', state.f2.quote.author)
  set('f3-tag', state.f3.tag)
  set('f3-headline-text', state.f3.headlineText)
  set('f3-headline-accent', state.f3.headlineAccent)
  set('f3-headline-end', state.f3.headlineEnd)
  set('f3-feat1', state.f3.feats[0])
  set('f3-feat2', state.f3.feats[1])
  set('f3-feat3', state.f3.feats[2])
  set('f3-cta', state.f3.cta)

  // seletor de layout
  document.querySelectorAll<HTMLElement>('.layout-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.layout === state.f2.layout)
  })
}
