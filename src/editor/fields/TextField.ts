// Campo de texto simples (input[type=text]).

import type { Field } from "../../core/types"
import { esc } from "../../core/template"

export function renderTextField(
  field: Field,
  value: string,
  inputId: string,
): string {
  return `
    <div class="field">
      <label for="${inputId}">${esc(field.label)}</label>
      <input type="text" id="${inputId}" data-field="${esc(field.id)}" value="${esc(value)}">
      ${field.hint ? `<p class="field-hint">${esc(field.hint)}</p>` : ""}
    </div>
  `
}
