import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import type { ScheduleState } from '../types'
import { generateYaml } from '../yaml/generateYaml'

const appRoot = join(fileURLToPath(new URL('..', import.meta.url)), '..')
const venvPython = join(appRoot, '.venv', 'bin', 'python')

const resolvePythonExecutable = (): string => {
  const configuredPython = process.env.SCHEDULOMICON_PYTHON?.trim()

  if (configuredPython) {
    if (!existsSync(configuredPython)) {
      throw new Error(
        `Parser compatibility test expected SCHEDULOMICON_PYTHON to exist, but it was not found: ${configuredPython}`,
      )
    }

    return configuredPython
  }

  if (existsSync(venvPython)) {
    return venvPython
  }

  throw new Error(
    `Parser compatibility test requires a Python interpreter with parser dependencies installed. Expected ${venvPython} or set SCHEDULOMICON_PYTHON.`,
  )
}

describe('parser compatibility', () => {
  it(
    'generates YAML accepted by the schedulomicon parser',
    () => {
      const pythonExecutable = resolvePythonExecutable()

      const state: ScheduleState = {
        blocks: [{ id: 'b1', name: 'July', groups: ['summer'] }],
        rotations: [
          {
            id: 'r1',
            name: 'ICU',
            coverageMin: 1,
            coverageMax: 2,
            groups: ['critical'],
            rotCountMode: 'per-group',
            rotCountFlat: { min: '', max: '' },
            rotCountPerGroup: [{ id: 'pg1', group: 'sr', min: 1, max: 2 }],
          },
        ],
        residents: [
          { id: 'res1', name: 'Alice', groups: ['sr'] },
          { id: 'res2', name: 'Bob', groups: ['sr'] },
        ],
        prohibitions: [{ id: 'p1', residentName: 'Alice', rotationName: 'ICU' }],
      }

      const script = `
import os
import sys
import yaml

repo_root = os.path.abspath(os.path.join(os.getcwd(), '..'))
sys.path.insert(0, os.path.join(repo_root, 'schedulomicon'))

from schedulomicon.io import process_config

config = yaml.safe_load(sys.stdin.read())
process_config(config)
`

      expect(() =>
        execFileSync(pythonExecutable, ['-c', script], {
          cwd: appRoot,
          input: generateYaml(state),
          stdio: ['pipe', 'pipe', 'pipe'],
        }),
      ).not.toThrow()
    },
    20000,
  )

  it(
    'accepts valid flat rot_count YAML',
    () => {
      const pythonExecutable = resolvePythonExecutable()

      const state: ScheduleState = {
        blocks: [{ id: 'b1', name: 'July', groups: [] }],
        rotations: [
          {
            id: 'r1',
            name: 'Clinic',
            coverageMin: '',
            coverageMax: '',
            groups: [],
            rotCountMode: 'flat',
            rotCountFlat: { min: 2, max: 4 },
            rotCountPerGroup: [],
          },
        ],
        residents: [{ id: 'res1', name: 'Alice', groups: [] }],
        prohibitions: [],
      }

      const script = `
import os
import sys
import yaml

repo_root = os.path.abspath(os.path.join(os.getcwd(), '..'))
sys.path.insert(0, os.path.join(repo_root, 'schedulomicon'))

from schedulomicon.io import process_config

config = yaml.safe_load(sys.stdin.read())
process_config(config)
`

      expect(() =>
        execFileSync(pythonExecutable, ['-c', script], {
          cwd: appRoot,
          input: generateYaml(state),
          stdio: ['pipe', 'pipe', 'pipe'],
        }),
      ).not.toThrow()
    },
    20000,
  )
})
