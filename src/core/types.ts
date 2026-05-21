// Tipos centrais do sistema plugável de layouts.
//
// Um Layout descreve um carrossel: nome, descrição, e a lista de Slides.
// Cada Slide tem fields (declarativos) e uma função render(state) → HTML string.
// A sidebar do editor é gerada inteira a partir dos fields; o preview chama render
// sempre que o estado muda.

export type FieldType =
  | "text"
  | "textarea"
  | "richtext"
  | "image"
  | "color"
  | "select"

export interface SelectOption {
  label: string
  value: string
}

export interface Field {
  id: string
  type: FieldType
  label: string
  default: string
  optional?: boolean
  hint?: string

  // específico de image
  shape?: "circle" | "rect" | "decorative"

  // específico de select
  options?: SelectOption[]
}

// Estado de um slide: chave = field.id, valor = string (inclusive base64 pra imagem).
export type SlideState = Record<string, string>

// Estado completo do layout: chave = slide.id, valor = SlideState.
export type LayoutState = Record<string, SlideState>

export interface Slide {
  id: string
  label: string                       // ex: "problema", "membro 1"
  fields: Field[]
  render: (state: SlideState, ctx: RenderContext) => string
}

// Contexto passado pra render — coisas globais que o slide pode querer usar.
export interface RenderContext {
  handle: string
  colors: ColorPalette
  slideIndex: number                   // 0-based
  totalSlides: number
}

export interface Layout {
  id: string
  name: string
  description: string
  category?: string
  thumbnail?: string                   // URL opcional; senão é gerado a partir do 1º slide
  slides: Slide[]
  /**
   * CSS específico do layout (string). Injetado em <style data-layout="..."> ao
   * entrar no editor. Authore em px reais (frame é 1080×1350); o preview aplica
   * transform: scale() externo.
   */
  styles?: string
}

export interface ColorPalette {
  bg: string
  orange: string
  olive: string
  ink: string
  red: string
  white: string
}
