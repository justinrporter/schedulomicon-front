// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import {
  cleanup,
  render,
  screen,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { CollapsibleEntryCard } from './CollapsibleEntryCard'

afterEach(() => {
  cleanup()
})

describe('CollapsibleEntryCard', () => {
  it('starts open and toggles its body from the header button', async () => {
    const user = userEvent.setup()

    render(
      <CollapsibleEntryCard title="ICU" onDelete={() => {}}>
        <label>
          <span>Name</span>
          <input aria-label="Entry Name" />
        </label>
      </CollapsibleEntryCard>,
    )

    const row = screen.getByRole('group', { name: /icu/i })

    expect(screen.getByLabelText('Entry Name')).toBeInTheDocument()

    await user.click(within(row).getByRole('button', { name: /icu/i }))
    expect(within(row).queryByLabelText('Entry Name')).not.toBeInTheDocument()

    await user.click(within(row).getByRole('button', { name: /icu/i }))
    expect(within(row).getByLabelText('Entry Name')).toBeInTheDocument()
  })

  it('keeps delete independent from the disclosure toggle and preserves validation styling', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()

    render(
      <CollapsibleEntryCard
        title="Wards"
        validationState="warning"
        onDelete={onDelete}
      >
        <label>
          <span>Name</span>
          <input aria-label="Entry Name" />
        </label>
      </CollapsibleEntryCard>,
    )

    const row = screen.getByRole('group', { name: /wards/i })

    expect(row).toHaveClass('validation-card-warning')

    await user.click(within(row).getByRole('button', { name: /delete row/i }))

    expect(onDelete).toHaveBeenCalledTimes(1)
    expect(within(row).getByLabelText('Entry Name')).toBeInTheDocument()
  })
})
