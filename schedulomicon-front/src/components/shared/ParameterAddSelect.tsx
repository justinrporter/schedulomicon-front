interface ParameterAddSelectOption {
  kind: string
  label: string
  disabled: boolean
}

interface ParameterAddSelectProps {
  options: ParameterAddSelectOption[]
  onAdd: (kind: string) => void
}

export function ParameterAddSelect({ options, onAdd }: ParameterAddSelectProps) {
  return (
    <select
      className="input-field text-sm"
      value=""
      onChange={(event) => {
        const kind = event.target.value
        if (kind) {
          onAdd(kind)
          // Reset is handled by controlled value=""
        }
      }}
    >
      <option value="" disabled>
        Add parameter…
      </option>
      {options.map((option) => (
        <option key={option.kind} value={option.kind} disabled={option.disabled}>
          {option.label}
        </option>
      ))}
    </select>
  )
}
