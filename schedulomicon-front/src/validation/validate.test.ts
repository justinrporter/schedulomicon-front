import { describe, expect, it } from 'vitest'

import type { ScheduleState } from '../types'
import { validate } from './validate'

describe('validate', () => {
  it('flags trimmed duplicate names and invalid coverage', () => {
    const state: ScheduleState = {
      blocks: [
        { id: 'b1', name: ' July ', parameters: [] },
        { id: 'b2', name: 'July',   parameters: [] },
      ],
      rotations: [
        {
          id: 'r1',
          name: 'ICU',
          parameters: [{ id: 'cp1', kind: 'coverage', min: 3, max: 1 }],
        },
      ],
      residents: [],
    }

    const warnings = validate(state)

    expect(warnings.some((w) => w.message.includes('Duplicate name "July"'))).toBe(true)
    expect(warnings.some((w) => w.message.includes('Coverage minimum cannot be greater'))).toBe(true)
  })

  it('flags duplicate rot_count groups and unknown resident groups', () => {
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
                { id: 'pg1', group: 'sr',      min: 0, max: 1 },
                { id: 'pg2', group: 'sr',      min: 1, max: 2 },
                { id: 'pg3', group: 'missing', min: 1, max: 1 },
              ],
            },
          ],
        },
      ],
      residents: [{ id: 'res1', name: 'Alice', parameters: [{ id: 'gp1', kind: 'groups', values: ['sr'] }] }],
    }

    const warnings = validate(state)

    expect(warnings.some((w) => w.message.includes('repeats resident group "sr"'))).toBe(true)
    expect(
      warnings.some((w) => w.message.includes('resident group "missing" that is not currently defined')),
    ).toBe(true)
  })

  it('flags missing names, partial coverage, invalid flat rot_count, and duplicate rotation name', () => {
    const state: ScheduleState = {
      blocks: [{ id: 'b1', name: '   ', parameters: [] }],
      rotations: [
        {
          id: 'r1',
          name: ' ICU ',
          parameters: [
            { id: 'cp1', kind: 'coverage',       min: 1, max: '' },
            { id: 'rf1', kind: 'rot_count_flat',  min: 5, max: 2 },
          ],
        },
        {
          id: 'r2',
          name: 'ICU',
          parameters: [],
        },
      ],
      residents: [
        { id: 'res1', name: 'Alice', parameters: [] },
        { id: 'res2', name: 'Alice', parameters: [] },
        { id: 'res3', name: '',      parameters: [] },
      ],
    }

    const warnings = validate(state)

    expect(warnings.some((w) => w.message.includes('Name is required.'))).toBe(true)
    expect(
      warnings.some((w) => w.message.includes('Coverage is partially filled and will be omitted')),
    ).toBe(true)
    expect(
      warnings.some((w) => w.message.includes('Rotation count minimum cannot be greater than maximum')),
    ).toBe(true)
    expect(warnings.some((w) => w.message.includes('Duplicate name "ICU"'))).toBe(true)
    expect(warnings.some((w) => w.message.includes('Duplicate name "Alice"'))).toBe(true)
  })

  // ---------------------------------------------------------------------------
  // New: parameter-level validation
  // ---------------------------------------------------------------------------

  it('flags duplicate groups param on a resident', () => {
    const state: ScheduleState = {
      blocks: [],
      rotations: [],
      residents: [
        {
          id: 'res1',
          name: 'Alice',
          parameters: [
            { id: 'gp1', kind: 'groups', values: ['sr'] },
            { id: 'gp2', kind: 'groups', values: ['jr'] },
          ],
        },
      ],
    }

    const warnings = validate(state)

    expect(warnings.some((w) => w.message.includes('Duplicate parameter "groups"'))).toBe(true)
  })

  it('flags blank sum_gt_zero selector as warning', () => {
    const state: ScheduleState = {
      blocks: [],
      rotations: [],
      residents: [
        {
          id: 'res1',
          name: 'Alice',
          parameters: [{ id: 's1', kind: 'sum_gt_zero', selector: '' }],
        },
      ],
    }

    const warnings = validate(state)

    expect(warnings.some((w) => w.message.includes('Selector is blank and will be omitted'))).toBe(true)
    expect(warnings.find((w) => w.message.includes('Selector is blank'))?.severity).toBe('warning')
  })

  it('flags blank sum_eq_zero selector as warning', () => {
    const state: ScheduleState = {
      blocks: [],
      rotations: [],
      residents: [
        {
          id: 'res1',
          name: 'Alice',
          parameters: [{ id: 's1', kind: 'sum_eq_zero', selector: '  ' }],
        },
      ],
    }

    const warnings = validate(state)

    expect(warnings.some((w) => w.message.includes('Selector is blank and will be omitted'))).toBe(true)
  })

  it('flags incomplete sum_eq_count row as warning', () => {
    const state: ScheduleState = {
      blocks: [],
      rotations: [],
      residents: [
        {
          id: 'res1',
          name: 'Alice',
          parameters: [
            { id: 's1', kind: 'sum_eq_count', selector: 'ICU',    count: '' },
            { id: 's2', kind: 'sum_eq_count', selector: '',        count: 2 },
          ],
        },
      ],
    }

    const warnings = validate(state)

    // Both incomplete rows should generate a warning each
    expect(
      warnings.filter((w) => w.message.includes('Count row is incomplete')).length,
    ).toBeGreaterThanOrEqual(2)
  })

  it('flags duplicate coverage param on a rotation', () => {
    const state: ScheduleState = {
      blocks: [],
      rotations: [
        {
          id: 'r1',
          name: 'ICU',
          parameters: [
            { id: 'cp1', kind: 'coverage', min: 1, max: 2 },
            { id: 'cp2', kind: 'coverage', min: 1, max: 3 },
          ],
        },
      ],
      residents: [],
    }

    const warnings = validate(state)

    expect(warnings.some((w) => w.message.includes('Duplicate parameter "coverage"'))).toBe(true)
  })

  it('flags duplicate rot_count_flat param on a rotation', () => {
    const state: ScheduleState = {
      blocks: [],
      rotations: [
        {
          id: 'r1',
          name: 'ICU',
          parameters: [
            { id: 'rf1', kind: 'rot_count_flat', min: 1, max: 2 },
            { id: 'rf2', kind: 'rot_count_flat', min: 2, max: 4 },
          ],
        },
      ],
      residents: [],
    }

    const warnings = validate(state)

    expect(warnings.some((w) => w.message.includes('Duplicate parameter "rot_count_flat"'))).toBe(true)
  })

  it('flags duplicate rot_count_per_group param on a rotation', () => {
    const state: ScheduleState = {
      blocks: [],
      rotations: [
        {
          id: 'r1',
          name: 'ICU',
          parameters: [
            { id: 'rp1', kind: 'rot_count_per_group', entries: [] },
            { id: 'rp2', kind: 'rot_count_per_group', entries: [] },
          ],
        },
      ],
      residents: [],
    }

    const warnings = validate(state)

    expect(warnings.some((w) => w.message.includes('Duplicate parameter "rot_count_per_group"'))).toBe(true)
  })
})
