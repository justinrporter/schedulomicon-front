import { describe, expect, it } from 'vitest'

import { INITIAL_STATE } from '../state/initialState'
import type { ScheduleState } from '../types'
import { generateYaml } from './generateYaml'

describe('generateYaml', () => {
  it('returns a helper comment for a completely empty state', () => {
    expect(generateYaml(INITIAL_STATE)).toBe('# Fill in the form to generate YAML\n')
  })

  it('serializes groups as arrays and nests prohibitions under residents', () => {
    const state: ScheduleState = {
      blocks: [{ id: 'b1', name: ' July ', groups: [' summer ', 'summer'] }],
      rotations: [
        {
          id: 'r1',
          name: 'ICU',
          coverageMin: 1,
          coverageMax: 2,
          groups: ['critical'],
          rotCountMode: 'per-group',
          rotCountFlat: { min: '', max: '' },
          rotCountPerGroup: [{ id: 'rc1', group: 'sr', min: 1, max: 2 }],
        },
      ],
      residents: [
        { id: 'res1', name: 'Alice', groups: ['sr'] },
        { id: 'res2', name: 'Bob', groups: ['sr'] },
      ],
      prohibitions: [{ id: 'p1', residentName: 'Alice', rotationName: 'ICU' }],
    }

    const output = generateYaml(state)

    expect(output).toContain('July:')
    expect(output).toContain('- summer')
    expect(output).toContain('rot_count:')
    expect(output).toContain('sr:')
    expect(output).toContain('prohibit:')
    expect(output).toContain('- ICU')
  })

  it('omits invalid ranges, stale prohibitions, and unknown rot_count groups', () => {
    const state: ScheduleState = {
      blocks: [],
      rotations: [
        {
          id: 'r1',
          name: 'Night Float',
          coverageMin: 4,
          coverageMax: 2,
          groups: [],
          rotCountMode: 'per-group',
          rotCountFlat: { min: '', max: '' },
          rotCountPerGroup: [
            { id: 'pg1', group: 'missing', min: 1, max: 2 },
            { id: 'pg2', group: 'sr', min: 3, max: 1 },
          ],
        },
      ],
      residents: [{ id: 'res1', name: 'Alice', groups: ['sr'] }],
      prohibitions: [{ id: 'p1', residentName: 'Missing', rotationName: 'Night Float' }],
    }

    const output = generateYaml(state)

    expect(output).not.toContain('coverage:')
    expect(output).not.toContain('rot_count:')
    expect(output).not.toContain('prohibit:')
  })
})
