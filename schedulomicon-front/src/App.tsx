import { useMemo, useState } from 'react'

import { BlocksSection } from './components/blocks/BlocksSection'
import { ConstraintsSection } from './components/constraints/ConstraintsSection'
import type { ConstraintOption } from './components/constraints/ProhibitRow'
import { FormColumn } from './components/layout/FormColumn'
import { Header } from './components/layout/Header'
import { MainLayout } from './components/layout/MainLayout'
import { YamlPreviewPanel } from './components/layout/YamlPreviewPanel'
import { ResidentsSection } from './components/residents/ResidentsSection'
import { RotationsSection } from './components/rotations/RotationsSection'
import { ConfirmDialog } from './components/shared/ConfirmDialog'
import { ValidationBanner } from './components/shared/ValidationBanner'
import { usePersistedState } from './hooks/usePersistedState'
import {
  createBlock,
  createProhibition,
  createResident,
  createRotation,
} from './state/factories'
import { INITIAL_STATE } from './state/initialState'
import type {
  BlockDef,
  ProhibitDef,
  ResidentDef,
  RotationDef,
} from './types'
import { deriveGroups } from './utils/deriveGroups'
import { normalizeText } from './utils/strings'
import { hasErrorWarnings } from './utils/warnings'
import { validate } from './validation/validate'
import { generateYaml } from './yaml/generateYaml'

function buildConstraintOptions(
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

function withWarningPrefix(yamlString: string, issueCount: number, hasErrors: boolean) {
  if (!hasErrors) {
    return yamlString
  }

  return `# WARNING: ${issueCount} issue${
    issueCount === 1 ? '' : 's'
  } — review before running solver\n${yamlString}`
}

function downloadYaml(yamlString: string) {
  const blob = new Blob([yamlString], { type: 'text/yaml' })
  const url = window.URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'schedule.yaml'
  anchor.click()
  window.URL.revokeObjectURL(url)
}

export default function App() {
  const [state, setState] = usePersistedState()
  const [showResetDialog, setShowResetDialog] = useState(false)

  const derivedGroups = useMemo(() => deriveGroups(state), [state])
  const warnings = useMemo(() => validate(state), [state])
  const yamlString = useMemo(() => generateYaml(state), [state])
  const hasErrors = hasErrorWarnings(warnings)
  const previewYaml = useMemo(
    () => withWarningPrefix(yamlString, warnings.length, hasErrors),
    [hasErrors, warnings.length, yamlString],
  )

  const residentOptions = useMemo(() => {
    const staleValues = state.prohibitions
      .map((prohibition) => normalizeText(prohibition.residentName))
      .filter(Boolean)

    const options = new Map<string, ConstraintOption>()

    for (const staleValue of staleValues) {
      for (const option of buildConstraintOptions(state.residents, staleValue)) {
        options.set(option.label, option)
      }
    }

    if (options.size === 0) {
      for (const option of buildConstraintOptions(state.residents)) {
        options.set(option.label, option)
      }
    }

    return [...options.values()]
  }, [state.prohibitions, state.residents])

  const rotationOptions = useMemo(() => {
    const staleValues = state.prohibitions
      .map((prohibition) => normalizeText(prohibition.rotationName))
      .filter(Boolean)

    const options = new Map<string, ConstraintOption>()

    for (const staleValue of staleValues) {
      for (const option of buildConstraintOptions(state.rotations, staleValue)) {
        options.set(option.label, option)
      }
    }

    if (options.size === 0) {
      for (const option of buildConstraintOptions(state.rotations)) {
        options.set(option.label, option)
      }
    }

    return [...options.values()]
  }, [state.prohibitions, state.rotations])

  function updateBlocks(nextBlocks: BlockDef[]) {
    setState((currentState) => ({
      ...currentState,
      blocks: nextBlocks,
    }))
  }

  function updateRotations(nextRotations: RotationDef[]) {
    setState((currentState) => ({
      ...currentState,
      rotations: nextRotations,
    }))
  }

  function updateResidents(nextResidents: ResidentDef[]) {
    setState((currentState) => ({
      ...currentState,
      residents: nextResidents,
    }))
  }

  function updateProhibitions(nextProhibitions: ProhibitDef[]) {
    setState((currentState) => ({
      ...currentState,
      prohibitions: nextProhibitions,
    }))
  }

  return (
    <div className="min-h-screen">
      <Header
        warningCount={warnings.length}
        hasErrors={hasErrors}
        onDownload={() => downloadYaml(yamlString)}
        onReset={() => setShowResetDialog(true)}
      />

      <MainLayout
        formColumn={
          <FormColumn>
            <ValidationBanner warnings={warnings} />

            <BlocksSection
              blocks={state.blocks}
              warnings={warnings}
              onAdd={() => updateBlocks([...state.blocks, createBlock()])}
              onChange={(nextBlock) =>
                updateBlocks(
                  state.blocks.map((block) =>
                    block.id === nextBlock.id ? nextBlock : block,
                  ),
                )
              }
              onDelete={(blockId) =>
                updateBlocks(state.blocks.filter((block) => block.id !== blockId))
              }
            />

            <RotationsSection
              rotations={state.rotations}
              residentGroups={derivedGroups.residentGroups}
              warnings={warnings}
              onAdd={() => updateRotations([...state.rotations, createRotation()])}
              onChange={(nextRotation) =>
                updateRotations(
                  state.rotations.map((rotation) =>
                    rotation.id === nextRotation.id ? nextRotation : rotation,
                  ),
                )
              }
              onDelete={(rotationId) =>
                updateRotations(
                  state.rotations.filter((rotation) => rotation.id !== rotationId),
                )
              }
            />

            <ResidentsSection
              residents={state.residents}
              warnings={warnings}
              onAdd={() => updateResidents([...state.residents, createResident()])}
              onBulkAdd={(names) =>
                updateResidents([
                  ...state.residents,
                  ...names.map((name) => ({
                    ...createResident(),
                    name,
                  })),
                ])
              }
              onChange={(nextResident) =>
                updateResidents(
                  state.residents.map((resident) =>
                    resident.id === nextResident.id ? nextResident : resident,
                  ),
                )
              }
              onDelete={(residentId) =>
                updateResidents(
                  state.residents.filter((resident) => resident.id !== residentId),
                )
              }
            />

            <ConstraintsSection
              prohibitions={state.prohibitions}
              residentOptions={residentOptions}
              rotationOptions={rotationOptions}
              warnings={warnings}
              onAdd={() =>
                updateProhibitions([...state.prohibitions, createProhibition()])
              }
              onChange={(nextProhibition) =>
                updateProhibitions(
                  state.prohibitions.map((prohibition) =>
                    prohibition.id === nextProhibition.id
                      ? nextProhibition
                      : prohibition,
                  ),
                )
              }
              onDelete={(prohibitionId) =>
                updateProhibitions(
                  state.prohibitions.filter(
                    (prohibition) => prohibition.id !== prohibitionId,
                  ),
                )
              }
            />
          </FormColumn>
        }
        previewPanel={
          <YamlPreviewPanel
            displayValue={previewYaml}
            copyValue={yamlString}
            issueCount={warnings.length}
          />
        }
      />

      <ConfirmDialog
        open={showResetDialog}
        title="Reset the builder?"
        description="This clears the current form and the saved local draft in your browser for this version of the app."
        confirmLabel="Reset"
        onClose={() => setShowResetDialog(false)}
        onConfirm={() => {
          setState(INITIAL_STATE)
          setShowResetDialog(false)
        }}
      />
    </div>
  )
}
