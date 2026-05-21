// Select com options[].

import type { Field } from "../../core/types"
import { esc } from "../../core/template"

export function renderSelectField(
  field: Field,
  value: string,
  inputId: string,
): string {
  const options = (field.options ?? [])
    .map(opt =>
      `<option value="${esc(opt.value)}" ${opt.value === value ? "selected" : ""}>${esc(opt.label)}</option>`,
    )
    .join("")

  return `
    <div class="field">
      <label for="${inputId}">${esc(field.label)}</label>
      <select id="${inputId}" data-field="${esc(field.id)}">${options}</select>
    </div>
  `
}
