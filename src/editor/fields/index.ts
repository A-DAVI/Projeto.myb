// Dispatcher: dado um Field e valor, retorna o HTML do controle correto.

import type { Field } from "../../core/types"
import { renderTextField } from "./TextField"
import { renderTextareaField } from "./TextareaField"
import { renderRichTextField } from "./RichTextField"
import { renderImageField } from "./ImageField"
import { renderColorField } from "./ColorField"
import { renderSelectField } from "./SelectField"

export function renderField(
  field: Field,
  value: string,
  inputId: string,
): string {
  switch (field.type) {
    case "text":     return renderTextField(field, value, inputId)
    case "textarea": return renderTextareaField(field, value, inputId)
    case "richtext": return renderRichTextField(field, value, inputId)
    case "image":    return renderImageField(field, value, inputId)
    case "color":    return renderColorField(field, value, inputId)
    case "select":   return renderSelectField(field, value, inputId)
  }
}

export { bindImageFields } from "./ImageField"
