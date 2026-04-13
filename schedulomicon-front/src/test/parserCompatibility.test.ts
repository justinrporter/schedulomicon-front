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
        blocks: [
          {
            id: 'b1',
            name: 'July',
            parameters: [{ id: 'gp1', kind: 'groups', values: ['summer'] }],
          },
        ],
        rotations: [
          {
            id: 'r1',
            name: 'ICU',
            parameters: [
              { id: 'gp2', kind: 'groups',   values: ['critical'] },
              { id: 'cp1', kind: 'coverage', min: 1, max: 2 },
              {
                id: 'rp1',
                kind: 'rot_count_per_group',
                entries: [{ id: 'pg1', group: 'sr', min: 1, max: 2 }],
              },
            ],
          },
        ],
        residents: [
          {
            id: 'res1',
            name: 'Alice',
            parameters: [
              { id: 'gp3', kind: 'groups',      values: ['sr'] },
              { id: 's1',  kind: 'sum_gt_zero',  selector: 'ICU' },
            ],
          },
          {
            id: 'res2',
            name: 'Bob',
            parameters: [
              { id: 'gp4', kind: 'groups', values: ['sr'] },
            ],
          },
        ],
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
        blocks: [{ id: 'b1', name: 'July', parameters: [] }],
        rotations: [
          {
            id: 'r1',
            name: 'Clinic',
            parameters: [{ id: 'rf1', kind: 'rot_count_flat', min: 2, max: 4 }],
          },
        ],
        residents: [{ id: 'res1', name: 'Alice', parameters: [] }],
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
