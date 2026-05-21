// Store central de estado. Pub/sub simples: qualquer módulo pode ouvir mudanças.

export interface EditorColors {
  bg: string
  orange: string
  olive: string
  ink: string
  red: string
  white: string
}

export type Slide2Layout = 'stats' | 'cards' | 'quote'

export interface Stat { num: string; label: string; detail: string }
export interface Card { emoji: string; num: string; label: string }
export interface Quote { highlight: string; text: string; author: string }

export interface EditorState {
  colors: EditorColors
  handle: string
  images: { 1: string | null; 2: string | null; 3: string | null }
  f1: {
    eyebrow: string
    headlineText: string
    headlineAccent: string
    headlineEnd: string
    subline: string
  }
  f2: {
    layout: Slide2Layout
    title: string
    subtitle: string
    source: string
    stats: [Stat, Stat, Stat]
    cards: [Card, Card, Card]
    quote: Quote
  }
  f3: {
    tag: string
    headlineText: string
    headlineAccent: string
    headlineEnd: string
    feats: [string, string, string]
    cta: string
  }
}

export const DEFAULT_STATE: EditorState = {
  colors: { bg: '#DADAB8', orange: '#E67E22', olive: '#556B2F', ink: '#1A1815', red: '#C84A2E', white: '#FFFFFF' },
  handle: '@mybuddy.pet',
  images: { 1: null, 2: null, 3: null },
  f1: {
    eyebrow: 'você sabia?',
    headlineText: 'milhões de pets ',
    headlineAccent: 'esperam',
    headlineEnd: ' um lar no Brasil.',
    subline: 'ONGs sem visibilidade. Adotantes perdidos em redes sociais. Tutores sem guia confiável.',
  },
  f2: {
    layout: 'stats',
    title: 'o cenário hoje',
    subtitle: 'números que mostram a urgência',
    source: 'fonte: dados brasileiros de abandono pet',
    stats: [
      { num: '25%', label: 'abandono de cães', detail: '~20,2 milhões de cães abandonados' },
      { num: '26%', label: 'abandono de gatos', detail: '~10 milhões de gatos abandonados' },
      { num: '73%', label: 'interesse por adoção', detail: 'acima da média histórica no país' },
    ],
    cards: [
      { emoji: '🐕', num: '25%', label: 'abandono de cães' },
      { emoji: '🐈', num: '26%', label: 'abandono de gatos' },
      { emoji: '💚', num: '73%', label: 'querem adotar' },
    ],
    quote: {
      highlight: '30M',
      text: 'pets sem lar no Brasil precisam de visibilidade e de uma chance real.',
      author: '— IBGE / CFMV, 2023',
    },
  },
  f3: {
    tag: 'a nossa proposta',
    headlineText: 'o hub ',
    headlineAccent: 'completo',
    headlineEnd: ' do ecossistema pet.',
    feats: ['adoção com busca inteligente', 'visibilidade pra ONGs e protetores', 'marketplace e serviços num só lugar'],
    cta: 'faça parte',
  },
}

const STORAGE_KEY = 'mybuddy-editor-state'

type Listener = (state: EditorState) => void
type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] }

class Store {
  private state: EditorState
  private listeners: Listener[] = []

  constructor() {
    this.state = this.load()
  }

  get(): EditorState {
    return this.state
  }

  set(patch: DeepPartial<EditorState>): void {
    this.state = deepMerge(this.state, patch) as EditorState
    this.save()
    this.notify()
  }

  subscribe(fn: Listener): () => void {
    this.listeners.push(fn)
    return () => { this.listeners = this.listeners.filter(l => l !== fn) }
  }

  reset(): void {
    this.state = JSON.parse(JSON.stringify(DEFAULT_STATE))
    this.save()
    this.notify()
  }

  toJSON(): string {
    const { images: _images, ...rest } = this.state
    return JSON.stringify(rest, null, 2)
  }

  fromJSON(json: string): void {
    const parsed = JSON.parse(json)
    this.state = deepMerge(this.state, parsed) as EditorState
    this.save()
    this.notify()
  }

  private notify(): void {
    this.listeners.forEach(fn => fn(this.state))
  }

  private save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state))
    } catch {
      const { images: _images, ...rest } = this.state
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...rest, images: { 1: null, 2: null, 3: null } }))
    }
  }

  private load(): EditorState {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return JSON.parse(JSON.stringify(DEFAULT_STATE))
      return deepMerge(JSON.parse(JSON.stringify(DEFAULT_STATE)), JSON.parse(raw)) as EditorState
    } catch {
      return JSON.parse(JSON.stringify(DEFAULT_STATE))
    }
  }
}

function deepMerge(base: unknown, patch: unknown): unknown {
  // arrays são substituídos inteiros, nunca merged campo a campo
  if (Array.isArray(patch)) return patch
  if (typeof patch !== 'object' || patch === null) return patch ?? base
  const result = { ...(base as Record<string, unknown>) }
  for (const key of Object.keys(patch as object)) {
    result[key] = deepMerge(result[key], (patch as Record<string, unknown>)[key])
  }
  return result
}

export const store = new Store()
