// Handle do Instagram — global, compartilhado entre layouts (mesma conta @mybuddy.pet).

import { read, write } from "./storage"

const KEY = "mybuddy-editor:handle"
const DEFAULT = "@mybuddy.pet"

type Listener = (handle: string) => void

class HandleStore {
  private value: string = read<string>(KEY, DEFAULT)
  private listeners: Listener[] = []

  get(): string {
    return this.value
  }

  set(v: string): void {
    if (this.value === v) return
    this.value = v
    write(KEY, this.value)
    this.notify()
  }

  subscribe(fn: Listener): () => void {
    this.listeners.push(fn)
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn)
    }
  }

  private notify(): void {
    for (const fn of this.listeners) fn(this.value)
  }
}

export const handle = new HandleStore()
