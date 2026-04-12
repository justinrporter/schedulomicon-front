import { useEffect, useState } from 'react'

import type { ScheduleState } from '../types'
import { INITIAL_STATE } from '../state/initialState'

export const STORAGE_KEY = 'schedulomicon_front_v1'

type ReadStorage = Pick<Storage, 'getItem'>
type WriteStorage = Pick<Storage, 'setItem'>

export function readPersistedState(storage?: ReadStorage) {
  if (!storage) {
    return INITIAL_STATE
  }

  try {
    const raw = storage.getItem(STORAGE_KEY)

    if (raw) {
      return JSON.parse(raw) as ScheduleState
    }
  } catch {
    return INITIAL_STATE
  }

  return INITIAL_STATE
}

export function writePersistedState(state: ScheduleState, storage?: WriteStorage) {
  if (!storage) {
    return
  }

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Ignore storage failures and keep the in-memory state usable.
  }
}

export function usePersistedState() {
  const [state, setState] = useState<ScheduleState>(() => {
    return readPersistedState(typeof window === 'undefined' ? undefined : window.localStorage)
  })

  useEffect(() => {
    writePersistedState(
      state,
      typeof window === 'undefined' ? undefined : window.localStorage,
    )
  }, [state])

  return [state, setState] as const
}
