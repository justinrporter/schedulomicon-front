import { useMemo, useState } from 'react'

import { BlocksSection } from './components/blocks/BlocksSection'
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
  createResident,
  createRotation,
} from './state/factories'
import { INITIAL_STATE } from './state/initialState'
import {
  downloadYaml,
  withWarningPrefix,
} from './appHelpers'
import type {
  BlockDef,
  ResidentDef,
  RotationDef,
} from './types'
import { deriveGroups } from './utils/deriveGroups'
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
