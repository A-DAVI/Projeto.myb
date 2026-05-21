// Paleta global da marca: compartilhada entre todos os layouts.
// Aplica via CSS custom properties no :root para que o CSS dos slides
// puxe automaticamente.

import type { ColorPalette } from "./types"
import { read, write } from "./storage"

const KEY = "mybuddy-editor:colors"

export const DEFAULT_COLORS: ColorPalette = {
  bg: "#DADAB8",
  orange: "#E67E22",
  olive: "#556B2F",
  ink: "#1A1815",
  red: "#C84A2E",
  white: "#FFFFFF",
}

type Listener = (colors: ColorPalette) => void

class ColorStore {
  private colors: ColorPalette = read<ColorPalette>(KEY, DEFAULT_COLORS)
  private listeners: Listener[] = []

  constructor() {
    this.apply()
  }

  get(): ColorPalette {
    return this.colors
  }

  set(key: keyof ColorPalette, value: string): void {
    if (this.colors[key] === value) return
    this.colors = { ...this.colors, [key]: value }
    write(KEY, this.colors)
    this.apply()
    this.notify()
  }

  reset(): void {
    this.colors = { ...DEFAULT_COLORS }
    write(KEY, this.colors)
    this.apply()
    this.notify()
  }

  subscribe(fn: Listener): () => void {
    this.listeners.push(fn)
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn)
    }
  }

  private apply(): void {
    const root = document.documentElement
    root.style.setProperty("--bg", this.colors.bg)
    root.style.setProperty("--orange", this.colors.orange)
    root.style.setProperty("--olive", this.colors.olive)
    root.style.setProperty("--ink", this.colors.ink)
    root.style.setProperty("--red", this.colors.red)
    root.style.setProperty("--white", this.colors.white)
  }

  private notify(): void {
    for (const fn of this.listeners) fn(this.colors)
  }
}

export const colors = new ColorStore()
