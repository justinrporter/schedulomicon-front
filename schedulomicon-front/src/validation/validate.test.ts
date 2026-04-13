import { describe, expect, it } from 'vitest'

import type { ScheduleState } from '../types'
import { validate } from './validate'

describe('validate', () => {
  it('ignores untouched blank entity rows', () => {
    const state: ScheduleState = {
      blocks: [
        {
          id: 'b1',
          name: '   ',
          parameters: [{ id: 'bg1', kind: 'groups', values: [] }],
        },
      ],
      rotations: [
        {
          id: 'r1',
          name: '',
          parameters: [
            { id: 'cp1', kind: 'coverage', min: '', max: '' },
            {
              id: 'rp1',
              kind: 'rot_count_per_group',
              entries: [{ id: 'pg1', group: '', min: '', max: '' }],
            },
          ],
        },
      ],
      residents: [
        {
          id: 'res1',
          name: '',
          parameters: [
            { id: 'gp1', kind: 'groups', values: [] },
            { id: 's1', kind: 'sum_eq_count', selector: '', count: '' },
          ],
        },
      ],
    }

    expect(validate(state)).toEqual([])
  })

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

  it('flags partial coverage, invalid flat rot_count, and duplicate rotation name', () => {
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

    expect(
      warnings.some((w) => w.message.includes('Coverage is partially filled and will be omitted')),
    ).toBe(true)
    expect(
      warnings.some((w) => w.message.includes('Rotation count minimum cannot be greater than maximum')),
    ).toBe(true)
    expect(warnings.some((w) => w.message.includes('Duplicate name "ICU"'))).toBe(true)
    expect(warnings.some((w) => w.message.includes('Duplicate name "Alice"'))).toBe(true)
  })

  it('flags blank names once the row contains meaningful content', () => {
    const state: ScheduleState = {
      blocks: [
        {
          id: 'b1',
          name: '',
          parameters: [{ id: 'bg1', kind: 'groups', values: ['sr'] }],
        },
      ],
      rotations: [
        {
          id: 'r1',
          name: ' ',
          parameters: [{ id: 'cp1', kind: 'coverage', min: 1, max: '' }],
        },
      ],
      residents: [
        {
          id: 'res1',
          name: '',
          parameters: [{ id: 's1', kind: 'sum_gt_zero', selector: 'ICU' }],
        },
      ],
    }

    const warnings = validate(state)
    const nameWarnings = warnings.filter((warning) => warning.message === 'Name is required.')

    expect(nameWarnings).toHaveLength(3)
    expect(nameWarnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ itemId: 'b1', field: 'name' }),
        expect.objectContaining({ itemId: 'r1', field: 'name' }),
        expect.objectContaining({ itemId: 'res1', field: 'name' }),
      ]),
    )
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

    const duplicateWarnings = warnings.filter((w) =>
      w.message.includes('Duplicate parameter "groups"'),
    )

    expect(duplicateWarnings).toHaveLength(2)
    expect(duplicateWarnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ itemId: 'res1', paramId: 'gp1' }),
        expect.objectContaining({ itemId: 'res1', paramId: 'gp2' }),
      ]),
    )
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
    expect(warnings.find((w) => w.message.includes('Selector is blank'))).toMatchObject({
      itemId: 'res1',
      paramId: 's1',
      field: 'selector',
    })
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
    expect(warnings.find((w) => w.paramId === 's1')).toMatchObject({
      itemId: 'res1',
      field: 'count',
    })
    expect(warnings.find((w) => w.paramId === 's2')).toMatchObject({
      itemId: 'res1',
      field: 'selector',
    })
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

    expect(
      warnings.filter((w) => w.message.includes('Duplicate parameter "coverage"')),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ itemId: 'r1', paramId: 'cp1' }),
        expect.objectContaining({ itemId: 'r1', paramId: 'cp2' }),
      ]),
    )
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

  it('targets range and group warnings to the affected rotation controls', () => {
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
                { id: 'pg1', group: 'sr', min: 2, max: 1 },
                { id: 'pg2', group: 'sr', min: 1, max: 2 },
                { id: 'pg3', group: 'missing', min: 0, max: 1 },
              ],
            },
          ],
        },
      ],
      residents: [{ id: 'res1', name: 'Alice', parameters: [{ id: 'gp1', kind: 'groups', values: ['sr'] }] }],
    }

    const warnings = validate(state)

    expect(warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          itemId: 'r1',
          paramId: 'cp1',
          field: 'range',
          message: 'Coverage minimum cannot be greater than coverage maximum.',
        }),
        expect.objectContaining({
          itemId: 'r1',
          paramId: 'rp1',
          entryId: 'pg1',
          field: 'range',
        }),
        expect.objectContaining({
          itemId: 'r1',
          paramId: 'rp1',
          entryId: 'pg1',
          field: 'group',
          message: 'Rotation count repeats resident group "sr".',
        }),
        expect.objectContaining({
          itemId: 'r1',
          paramId: 'rp1',
          entryId: 'pg2',
          field: 'group',
          message: 'Rotation count repeats resident group "sr".',
        }),
        expect.objectContaining({
          itemId: 'r1',
          paramId: 'rp1',
          entryId: 'pg3',
          field: 'group',
          message: 'Rotation count references resident group "missing" that is not currently defined.',
        }),
      ]),
    )
  })
})
