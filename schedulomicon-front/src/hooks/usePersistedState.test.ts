import { describe, expect, it, vi } from 'vitest'

import { INITIAL_STATE } from '../state/initialState'
import type { ScheduleState } from '../types'
import {
  readPersistedState,
  STORAGE_KEY,
  writePersistedState,
} from './usePersistedState'

describe('usePersistedState helpers', () => {
  it('returns the initial state when storage is unavailable or invalid', () => {
    expect(readPersistedState()).toEqual(INITIAL_STATE)

    const badStorage = {
      getItem: vi.fn(() => '{not json'),
    }

    expect(readPersistedState(badStorage)).toEqual(INITIAL_STATE)
  })

  it('rehydrates persisted schedule state from storage', () => {
    const persisted: ScheduleState = {
      blocks: [{ id: 'b1', name: 'July', parameters: [{ id: 'p1', kind: 'groups', values: ['summer'] }] }],
      rotations: [],
      residents: [{ id: 'res1', name: 'Alice', parameters: [] }],
    }

    const storage = {
      getItem: vi.fn(() => JSON.stringify(persisted)),
    }

    expect(readPersistedState(storage)).toEqual(persisted)
  })

  it('writes the state to local storage and ignores storage failures', () => {
    const state: ScheduleState = {
      blocks: [],
      rotations: [],
      residents: [{ id: 'res1', name: 'Alice', parameters: [] }],
    }

    const storage = {
      setItem: vi.fn(),
    }

    writePersistedState(state, storage)

    expect(storage.setItem).toHaveBeenCalledWith(STORAGE_KEY, JSON.stringify(state))

    const throwingStorage = {
      setItem: vi.fn(() => {
        throw new Error('quota exceeded')
      }),
    }

    expect(() => writePersistedState(state, throwingStorage)).not.toThrow()
  })
})
