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
import {
  buildConstraintOptions,
  downloadYaml,
  withWarningPrefix,
} from './appHelpers'
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
