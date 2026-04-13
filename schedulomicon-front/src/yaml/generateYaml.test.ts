import yaml from 'js-yaml'
import { describe, expect, it } from 'vitest'

import { INITIAL_STATE } from '../state/initialState'
import type { ScheduleState } from '../types'
import { generateYaml } from './generateYaml'

describe('generateYaml', () => {
  it('returns a helper comment for a completely empty state', () => {
    expect(generateYaml(INITIAL_STATE)).toBe('# Fill in the form to generate YAML\n')
  })

  it('renders entity parameter values inline while keeping entity mappings block-style', () => {
    const state: ScheduleState = {
      blocks: [
        {
          id: 'b1',
          name: ' July ',
          parameters: [{ id: 'gp1', kind: 'groups', values: [' summer ', 'summer'] }],
        },
      ],
      rotations: [
        {
          id: 'r1',
          name: 'ICU',
          parameters: [
            { id: 'gp2', kind: 'groups', values: ['critical'] },
            { id: 'cp1', kind: 'coverage', min: 1, max: 2 },
            { id: 'rf1', kind: 'rot_count_flat', min: 2, max: 4 },
          ],
        },
        {
          id: 'r2',
          name: 'Night Float',
          parameters: [
            {
              id: 'rp1',
              kind: 'rot_count_per_group',
              entries: [
                { id: 'pg1', group: 'sr', min: 1, max: 2 },
                { id: 'pg2', group: 'jr', min: 0, max: 1 },
              ],
            },
          ],
        },
      ],
      residents: [
        {
          id: 'res1',
          name: 'Alice',
          parameters: [
            { id: 'gp3', kind: 'groups', values: ['sr'] },
          ],
        },
        {
          id: 'res2',
          name: 'Bob',
          parameters: [
            { id: 'gp4', kind: 'groups', values: ['jr'] },
          ],
        },
      ],
    }

    const output = generateYaml(state)

    expect(output).toContain('blocks:\n  July:\n')
    expect(output).toContain('rotations:\n  ICU:\n')
    expect(output).toContain('groups: [summer]')
    expect(output).toContain('groups: [critical]')
    expect(output).toContain('coverage: [1, 2]')
    expect(output).toContain('rot_count: [2, 4]')
    expect(output).toContain('rot_count: {sr: [1, 2], jr: [0, 1]}')
    expect(output).toContain('groups: [sr]')
    expect(output).not.toContain('prohibit')
    expect(output).not.toContain('groups:\n      - summer')
    expect(output).not.toContain('coverage:\n      - 1\n      - 2')
    expect(output).not.toContain('rot_count:\n      - 2\n      - 4')
    expect(output).not.toContain('rot_count:\n      sr:')
  })

  it('serializes groups as arrays for blocks, rotations, and residents', () => {
    const state: ScheduleState = {
      blocks: [
        {
          id: 'b1',
          name: ' July ',
          parameters: [{ id: 'gp1', kind: 'groups', values: [' summer ', 'summer'] }],
        },
      ],
      rotations: [
        {
          id: 'r1',
          name: 'ICU',
          parameters: [
            { id: 'gp2', kind: 'groups', values: ['critical'] },
            { id: 'cp1', kind: 'coverage', min: 1, max: 2 },
            {
              id: 'rp1',
              kind: 'rot_count_per_group',
              entries: [{ id: 'rc1', group: 'sr', min: 1, max: 2 }],
            },
          ],
        },
      ],
      residents: [
        { id: 'res1', name: 'Alice', parameters: [{ id: 'gp3', kind: 'groups', values: ['sr'] }] },
        { id: 'res2', name: 'Bob',   parameters: [{ id: 'gp4', kind: 'groups', values: ['sr'] }] },
      ],
    }

    const output = generateYaml(state)
    const parsed = yaml.load(output) as {
      blocks: Record<string, { groups?: string[] }>
      rotations: Record<string, { rot_count?: Record<string, [number, number]> }>
      residents: Record<string, { groups?: string[] }>
    }

    expect(output).toContain('July:')
    expect(output).toContain('groups: [summer]')
    expect(output).toContain('rot_count:')
    expect(output).toContain('rot_count: {sr: [1, 2]}')
    expect(output).not.toContain('prohibit')
    expect(parsed.blocks.July.groups).toEqual(['summer'])
    expect(parsed.rotations.ICU.rot_count).toEqual({ sr: [1, 2] })
    expect(parsed.residents.Alice.groups).toEqual(['sr'])
  })

  it('serializes valid flat rot_count ranges', () => {
    const state: ScheduleState = {
      blocks: [],
      rotations: [
        {
          id: 'r1',
          name: 'Clinic',
          parameters: [{ id: 'rf1', kind: 'rot_count_flat', min: 2, max: 4 }],
        },
      ],
      residents: [],
    }

    const output = yaml.load(generateYaml(state)) as {
      rotations: Record<string, { rot_count?: [number, number] }>
    }

    expect(output.rotations.Clinic.rot_count).toEqual([2, 4])
  })

  it('keeps only valid unique per-group rot_count rows for known resident groups', () => {
    const state: ScheduleState = {
      blocks: [],
      rotations: [
        {
          id: 'r1',
          name: 'Night Float',
          parameters: [
            {
              id: 'rp1',
              kind: 'rot_count_per_group',
              entries: [
                { id: 'pg1', group: ' ',       min: 1, max: 2 },
                { id: 'pg2', group: 'sr',      min: 1, max: 2 },
                { id: 'pg3', group: 'sr',      min: 9, max: 9 },
                { id: 'pg4', group: 'jr',      min: 0, max: 1 },
                { id: 'pg5', group: 'missing', min: 3, max: 4 },
                { id: 'pg6', group: 'jr',      min: 4, max: 1 },
              ],
            },
          ],
        },
      ],
      residents: [
        { id: 'res1', name: 'Alice', parameters: [{ id: 'gp1', kind: 'groups', values: ['sr'] }] },
        { id: 'res2', name: 'Bob',   parameters: [{ id: 'gp2', kind: 'groups', values: ['jr'] }] },
      ],
    }

    const output = yaml.load(generateYaml(state)) as {
      rotations: Record<string, { rot_count?: Record<string, [number, number]> }>
    }

    expect(output.rotations['Night Float'].rot_count).toEqual({
      sr: [1, 2],
      jr: [0, 1],
    })
  })

  it('omits invalid ranges and unknown rot_count groups', () => {
    const state: ScheduleState = {
      blocks: [],
      rotations: [
        {
          id: 'r1',
          name: 'Night Float',
          parameters: [
            { id: 'cp1', kind: 'coverage', min: 4, max: 2 },
            {
              id: 'rp1',
              kind: 'rot_count_per_group',
              entries: [
                { id: 'pg1', group: 'missing', min: 1, max: 2 },
                { id: 'pg2', group: 'sr',      min: 3, max: 1 },
              ],
            },
          ],
        },
      ],
      residents: [{ id: 'res1', name: 'Alice', parameters: [{ id: 'gp1', kind: 'groups', values: ['sr'] }] }],
    }

    const output = generateYaml(state)

    expect(output).not.toContain('coverage:')
    expect(output).not.toContain('rot_count:')
    expect(output).not.toContain('prohibit:')
  })

  // ---------------------------------------------------------------------------
  // New: sum > 0 / sum == 0 / sum == N resident keys
  // ---------------------------------------------------------------------------

  it('emits sum > 0 for sum_gt_zero params', () => {
    const state: ScheduleState = {
      blocks: [],
      rotations: [],
      residents: [
        {
          id: 'res1',
          name: 'Alice',
          parameters: [{ id: 's1', kind: 'sum_gt_zero', selector: 'ICU' }],
        },
      ],
    }

    const output = yaml.load(generateYaml(state)) as {
      residents: Record<string, Record<string, string[]>>
    }

    expect(output.residents.Alice['sum > 0']).toEqual(['ICU'])
  })

  it('emits sum == 0 for sum_eq_zero params', () => {
    const state: ScheduleState = {
      blocks: [],
      rotations: [],
      residents: [
        {
          id: 'res1',
          name: 'Alice',
          parameters: [{ id: 's1', kind: 'sum_eq_zero', selector: 'Night Float' }],
        },
      ],
    }

    const output = yaml.load(generateYaml(state)) as {
      residents: Record<string, Record<string, string[]>>
    }

    expect(output.residents.Alice['sum == 0']).toEqual(['Night Float'])
  })

  it('emits sum == N for sum_eq_count params', () => {
    const state: ScheduleState = {
      blocks: [],
      rotations: [],
      residents: [
        {
          id: 'res1',
          name: 'Alice',
          parameters: [{ id: 's1', kind: 'sum_eq_count', selector: 'Clinic', count: 3 }],
        },
      ],
    }

    const output = yaml.load(generateYaml(state)) as {
      residents: Record<string, Record<string, string[]>>
    }

    expect(output.residents.Alice['sum == 3']).toEqual(['Clinic'])
  })

  it('groups multiple sum_eq_count rows with the same count under one key', () => {
    const state: ScheduleState = {
      blocks: [],
      rotations: [],
      residents: [
        {
          id: 'res1',
          name: 'Alice',
          parameters: [
            { id: 's1', kind: 'sum_eq_count', selector: 'Clinic',  count: 2 },
            { id: 's2', kind: 'sum_eq_count', selector: 'ICU',     count: 2 },
          ],
        },
      ],
    }

    const output = yaml.load(generateYaml(state)) as {
      residents: Record<string, Record<string, string[]>>
    }

    expect(output.residents.Alice['sum == 2']).toEqual(['Clinic', 'ICU'])
  })

  it('emits separate sum == N keys for different count values', () => {
    const state: ScheduleState = {
      blocks: [],
      rotations: [],
      residents: [
        {
          id: 'res1',
          name: 'Alice',
          parameters: [
            { id: 's1', kind: 'sum_eq_count', selector: 'Clinic', count: 1 },
            { id: 's2', kind: 'sum_eq_count', selector: 'ICU',    count: 3 },
          ],
        },
      ],
    }

    const output = yaml.load(generateYaml(state)) as {
      residents: Record<string, Record<string, string[]>>
    }

    expect(output.residents.Alice['sum == 1']).toEqual(['Clinic'])
    expect(output.residents.Alice['sum == 3']).toEqual(['ICU'])
  })

  it('omits blank selector rows and sum_eq_count rows with blank counts', () => {
    const state: ScheduleState = {
      blocks: [],
      rotations: [],
      residents: [
        {
          id: 'res1',
          name: 'Alice',
          parameters: [
            { id: 's1', kind: 'sum_gt_zero',  selector: '' },
            { id: 's2', kind: 'sum_eq_zero',  selector: '   ' },
            { id: 's3', kind: 'sum_eq_count', selector: 'Clinic', count: '' },
            { id: 's4', kind: 'sum_eq_count', selector: '',        count: 2 },
          ],
        },
      ],
    }

    const output = generateYaml(state)

    expect(output).not.toContain('sum >')
    expect(output).not.toContain('sum ==')
  })

  it('never emits a prohibit key', () => {
    const state: ScheduleState = {
      blocks: [],
      rotations: [{ id: 'r1', name: 'ICU', parameters: [] }],
      residents: [{ id: 'res1', name: 'Alice', parameters: [] }],
    }

    expect(generateYaml(state)).not.toContain('prohibit')
  })
})
