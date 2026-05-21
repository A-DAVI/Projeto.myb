// Campo richtext: input com hint sobre {{palavra}} pra destaque laranja.
// O parsing acontece no template.ts → richText(); aqui é só UI.

import type { Field } from "../../core/types"
import { esc } from "../../core/template"

export function renderRichTextField(
  field: Field,
  value: string,
  inputId: string,
): string {
  return `
    <div class="field field--richtext">
      <label for="${inputId}">${esc(field.label)}</label>
      <textarea id="${inputId}" data-field="${esc(field.id)}" rows="2">${esc(value)}</textarea>
      <p class="field-hint">use <code>{{palavra}}</code> pra destacar em laranja.</p>
    </div>
  `
}
