import type { ConstraintOption } from './components/constraints/ProhibitRow'
import { normalizeText } from './utils/strings'

export function buildConstraintOptions(
  items: Array<{ name: string }>,
  staleValue?: string,
): ConstraintOption[] {
  const counts = new Map<string, number>()
  const orderedValues: string[] = []

  for (const item of items) {
    const value = normalizeText(item.name)

    if (!value) {
      continue
    }

    counts.set(value, (counts.get(value) ?? 0) + 1)

    if (!orderedValues.includes(value)) {
      orderedValues.push(value)
    }
  }

  if (staleValue && !orderedValues.includes(staleValue)) {
    orderedValues.unshift(staleValue)
  }

  return orderedValues.map((value) => {
    const count = counts.get(value) ?? 0

    if (count === 0) {
      return {
        value,
        label: `[Deleted: ${value}]`,
        tone: 'danger',
      }
    }

    if (count > 1) {
      return {
        value,
        label: `${value} (duplicate name)`,
        tone: 'warning',
      }
    }

    return {
      value,
      label: value,
      tone: 'default',
    }
  })
}

export function withWarningPrefix(
  yamlString: string,
  issueCount: number,
  hasErrors: boolean,
) {
  if (!hasErrors) {
    return yamlString
  }

  return `# WARNING: ${issueCount} issue${
    issueCount === 1 ? '' : 's'
  } — review before running solver\n${yamlString}`
}

export function downloadYaml(yamlString: string) {
  const blob = new Blob([yamlString], { type: 'text/yaml' })
  const url = window.URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'schedule.yaml'
  anchor.click()
  window.URL.revokeObjectURL(url)
}
