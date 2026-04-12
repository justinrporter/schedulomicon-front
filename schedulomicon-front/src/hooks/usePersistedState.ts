import { useEffect, useState } from 'react'

import type { ScheduleState } from '../types'
import { INITIAL_STATE } from '../state/initialState'

const STORAGE_KEY = 'schedulomicon_front_v1'

export function usePersistedState() {
  const [state, setState] = useState<ScheduleState>(() => {
    if (typeof window === 'undefined') {
      return INITIAL_STATE
    }

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)

      if (raw) {
        return JSON.parse(raw) as ScheduleState
      }
    } catch {
      return INITIAL_STATE
    }

    return INITIAL_STATE
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // Ignore storage failures and keep the in-memory state usable.
    }
  }, [state])

  return [state, setState] as const
}
