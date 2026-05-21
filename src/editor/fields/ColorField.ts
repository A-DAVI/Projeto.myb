// Picker de cor único. Usado tanto pela paleta global quanto por fields locais.

import type { Field } from "../../core/types"
import { esc } from "../../core/template"

export function renderColorField(
  field: Field,
  value: string,
  inputId: string,
): string {
  return `
    <div class="color-field">
      <label for="${inputId}">${esc(field.label)}</label>
      <input type="color" id="${inputId}" data-field="${esc(field.id)}" value="${esc(value)}">
    </div>
  `
}
