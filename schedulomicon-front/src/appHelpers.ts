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
