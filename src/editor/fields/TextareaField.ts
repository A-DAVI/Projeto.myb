// Textarea pra textos mais longos (subtítulos, manifestos, etc).

import type { Field } from "../../core/types"
import { esc } from "../../core/template"

export function renderTextareaField(
  field: Field,
  value: string,
  inputId: string,
): string {
  return `
    <div class="field">
      <label for="${inputId}">${esc(field.label)}</label>
      <textarea id="${inputId}" data-field="${esc(field.id)}">${esc(value)}</textarea>
      ${field.hint ? `<p class="field-hint">${esc(field.hint)}</p>` : ""}
    </div>
  `
}
