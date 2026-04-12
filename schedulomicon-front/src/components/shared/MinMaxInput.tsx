import type { NumericInput } from '../../types'
import { parseNumericInput } from '../../utils/strings'

interface MinMaxInputProps {
  minValue: NumericInput
  maxValue: NumericInput
  onMinChange: (value: NumericInput) => void
  onMaxChange: (value: NumericInput) => void
  disabled?: boolean
}

export function MinMaxInput({
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  disabled = false,
}: MinMaxInputProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <label>
        <span className="field-label">Min</span>
        <input
          type="number"
          inputMode="numeric"
          className="input-field"
          value={minValue}
          disabled={disabled}
          onChange={(event) => onMinChange(parseNumericInput(event.target.value))}
        />
      </label>
      <label>
        <span className="field-label">Max</span>
        <input
          type="number"
          inputMode="numeric"
          className="input-field"
          value={maxValue}
          disabled={disabled}
          onChange={(event) => onMaxChange(parseNumericInput(event.target.value))}
        />
      </label>
    </div>
  )
}
