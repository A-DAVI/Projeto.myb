// Store de estado por-layout. Cada layout tem um Store próprio com chave
// localStorage independente, então editar um não afeta os outros.

import type { Layout, LayoutState, SlideState } from "./types"
import { read, write, remove } from "./storage"

type Listener = (state: LayoutState) => void

function stateKey(layoutId: string): string {
  return `mybuddy-editor:${layoutId}`
}

export class LayoutStore {
  private state: LayoutState
  private listeners: Listener[] = []

  constructor(public readonly layout: Layout) {
    this.state = this.load()
  }

  get(): LayoutState {
    return this.state
  }

  /** Atualiza o valor de um field de um slide. */
  setField(slideId: string, fieldId: string, value: string): void {
    const slide = this.state[slideId] ?? {}
    if (slide[fieldId] === value) return
    this.state = {
      ...this.state,
      [slideId]: { ...slide, [fieldId]: value },
    }
    this.persist()
    this.notify()
  }

  /** Substitui o estado inteiro (usado em import JSON). */
  replace(newState: LayoutState): void {
    this.state = this.merge(this.defaults(), newState)
    this.persist()
    this.notify()
  }

  /** Reseta pros defaults declarados nos fields. */
  reset(): void {
    this.state = this.defaults()
    this.persist()
    this.notify()
  }

  /** Limpa do localStorage. */
  clear(): void {
    remove(stateKey(this.layout.id))
  }

  subscribe(fn: Listener): () => void {
    this.listeners.push(fn)
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn)
    }
  }

  /** Exporta como JSON serializável (compartilhável). */
  toJSON(): string {
    return JSON.stringify(
      { layoutId: this.layout.id, state: this.state },
      null,
      2,
    )
  }

  /** Reads slide state with defaults filled in for any missing field. */
  slideState(slideId: string): SlideState {
    const stored = this.state[slideId] ?? {}
    const slide = this.layout.slides.find(s => s.id === slideId)
    if (!slide) return stored
    const merged: SlideState = {}
    for (const f of slide.fields) {
      merged[f.id] = stored[f.id] ?? f.default
    }
    return merged
  }

  private defaults(): LayoutState {
    const out: LayoutState = {}
    for (const slide of this.layout.slides) {
      const s: SlideState = {}
      for (const field of slide.fields) {
        s[field.id] = field.default
      }
      out[slide.id] = s
    }
    return out
  }

  private merge(base: LayoutState, patch: LayoutState): LayoutState {
    const out: LayoutState = { ...base }
    for (const slideId of Object.keys(patch)) {
      out[slideId] = { ...(base[slideId] ?? {}), ...patch[slideId] }
    }
    return out
  }

  private load(): LayoutState {
    const stored = read<LayoutState | null>(stateKey(this.layout.id), null)
    if (!stored) return this.defaults()
    return this.merge(this.defaults(), stored)
  }

  private persist(): void {
    write(stateKey(this.layout.id), this.state)
  }

  private notify(): void {
    for (const fn of this.listeners) fn(this.state)
  }
}
