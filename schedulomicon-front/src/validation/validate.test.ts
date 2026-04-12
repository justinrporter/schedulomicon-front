import { describe, expect, it } from 'vitest'

import type { ScheduleState } from '../types'
import { validate } from './validate'

describe('validate', () => {
  it('flags trimmed duplicate names and invalid coverage', () => {
    const state: ScheduleState = {
      blocks: [
        { id: 'b1', name: ' July ', groups: [] },
        { id: 'b2', name: 'July', groups: [] },
      ],
      rotations: [
        {
          id: 'r1',
          name: 'ICU',
          coverageMin: 3,
          coverageMax: 1,
          groups: [],
          rotCountMode: 'none',
          rotCountFlat: { min: '', max: '' },
          rotCountPerGroup: [],
        },
      ],
      residents: [],
      prohibitions: [],
    }

    const warnings = validate(state)

    expect(warnings.some((warning) => warning.message.includes('Duplicate name "July"'))).toBe(
      true,
    )
    expect(
      warnings.some((warning) =>
        warning.message.includes('Coverage minimum cannot be greater'),
      ),
    ).toBe(true)
  })

  it('flags stale prohibitions and duplicate constraint rows', () => {
    const state: ScheduleState = {
      blocks: [],
      rotations: [
        {
          id: 'r1',
          name: 'ICU',
          coverageMin: '',
          coverageMax: '',
          groups: [],
          rotCountMode: 'none',
          rotCountFlat: { min: '', max: '' },
          rotCountPerGroup: [],
        },
      ],
      residents: [{ id: 'res1', name: 'Alice', groups: ['sr'] }],
      prohibitions: [
        { id: 'p1', residentName: 'Alice', rotationName: 'ICU' },
        { id: 'p2', residentName: 'Alice', rotationName: 'ICU' },
        { id: 'p3', residentName: 'Deleted', rotationName: 'ICU' },
      ],
    }

    const warnings = validate(state)

    expect(
      warnings.some((warning) => warning.message.includes('Duplicate prohibition')),
    ).toBe(true)
    expect(
      warnings.some((warning) => warning.message.includes('deleted resident "Deleted"')),
    ).toBe(true)
  })

  it('flags duplicate rot_count groups and unknown resident groups', () => {
    const state: ScheduleState = {
      blocks: [],
      rotations: [
        {
          id: 'r1',
          name: 'Night Float',
          coverageMin: '',
          coverageMax: '',
          groups: [],
          rotCountMode: 'per-group',
          rotCountFlat: { min: '', max: '' },
          rotCountPerGroup: [
            { id: 'pg1', group: 'sr', min: 0, max: 1 },
            { id: 'pg2', group: 'sr', min: 1, max: 2 },
            { id: 'pg3', group: 'missing', min: 1, max: 1 },
          ],
        },
      ],
      residents: [{ id: 'res1', name: 'Alice', groups: ['sr'] }],
      prohibitions: [],
    }

    const warnings = validate(state)

    expect(
      warnings.some((warning) => warning.message.includes('repeats resident group "sr"')),
    ).toBe(true)
    expect(
      warnings.some((warning) =>
        warning.message.includes('resident group "missing" that is not currently defined'),
      ),
    ).toBe(true)
  })

  it('flags missing names, partial coverage, invalid flat rot_count, and bad rotation references', () => {
    const state: ScheduleState = {
      blocks: [{ id: 'b1', name: '   ', groups: [] }],
      rotations: [
        {
          id: 'r1',
          name: ' ICU ',
          coverageMin: 1,
          coverageMax: '',
          groups: [],
          rotCountMode: 'flat',
          rotCountFlat: { min: 5, max: 2 },
          rotCountPerGroup: [],
        },
        {
          id: 'r2',
          name: 'ICU',
          coverageMin: '',
          coverageMax: '',
          groups: [],
          rotCountMode: 'none',
          rotCountFlat: { min: '', max: '' },
          rotCountPerGroup: [],
        },
      ],
      residents: [
        { id: 'res1', name: 'Alice', groups: [] },
        { id: 'res2', name: 'Alice', groups: ['sr'] },
        { id: 'res3', name: '', groups: [] },
      ],
      prohibitions: [
        { id: 'p1', residentName: 'Alice', rotationName: 'ICU' },
        { id: 'p2', residentName: 'Alice', rotationName: 'Deleted' },
      ],
    }

    const warnings = validate(state)

    expect(warnings.some((warning) => warning.message.includes('Name is required.'))).toBe(
      true,
    )
    expect(
      warnings.some((warning) =>
        warning.message.includes('Coverage is partially filled and will be omitted'),
      ),
    ).toBe(true)
    expect(
      warnings.some((warning) =>
        warning.message.includes('Rotation count minimum cannot be greater than maximum'),
      ),
    ).toBe(true)
    expect(
      warnings.some((warning) =>
        warning.message.includes('duplicate rotation name "ICU"'),
      ),
    ).toBe(true)
    expect(
      warnings.some((warning) =>
        warning.message.includes('deleted rotation "Deleted"'),
      ),
    ).toBe(true)
    expect(
      warnings.some((warning) =>
        warning.message.includes('duplicate resident name "Alice"'),
      ),
    ).toBe(true)
  })
})
