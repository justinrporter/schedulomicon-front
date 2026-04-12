import type { NumericInput } from '../../types'
import { parseNumericInput } from '../../utils/strings'

interface MinMaxInputProps {
  minValue: NumericInput
  maxValue: NumericInput
  onMinChange: (value: NumericInput) => void
  onMaxChange: (value: NumericInput) => void
  disabled?: boolean
  variant?: 'stacked' | 'addon'
  label?: string
  className?: string
}

export function MinMaxInput({
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  disabled = false,
  variant = 'stacked',
  label,
  className = '',
}: MinMaxInputProps) {
  if (variant === 'addon') {
    return (
      <div className={`flex min-w-0 flex-col gap-2 md:flex-row md:items-center md:gap-3 ${className}`}>
        {label ? <span className="inline-field-label">{label}</span> : null}

        <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2">
          <label className="addon-field">
            <span className="addon-field-prefix">Min</span>
            <input
              type="number"
              inputMode="numeric"
              className="addon-field-input"
              value={minValue}
              disabled={disabled}
              onChange={(event) => onMinChange(parseNumericInput(event.target.value))}
            />
          </label>

          <label className="addon-field">
            <span className="addon-field-prefix">Max</span>
            <input
              type="number"
              inputMode="numeric"
              className="addon-field-input"
              value={maxValue}
              disabled={disabled}
              onChange={(event) => onMaxChange(parseNumericInput(event.target.value))}
            />
          </label>
        </div>
      </div>
    )
  }

  return (
    <div className={`grid grid-cols-2 gap-3 ${className}`}>
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
