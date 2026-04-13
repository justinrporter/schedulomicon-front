// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import {
  cleanup,
  render,
  screen,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { BulkAddNamesButton } from './BulkAddNamesButton'

afterEach(() => {
  cleanup()
})

describe('BulkAddNamesButton', () => {
  it('trims names, ignores blank lines, and submits the parsed list', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()

    render(
      <BulkAddNamesButton
        dialogTitle="Bulk Add Residents"
        description="Paste one resident name per line."
        textareaLabel="Roster"
        placeholder={'Taylor, Avery\nPatel, Maya'}
        itemLabelSingular="resident"
        itemLabelPlural="residents"
        submitLabel="Add Residents"
        onAdd={onAdd}
      />,
    )

    await user.click(screen.getByRole('button', { name: /^add multiple$/i }))
    await user.type(
      screen.getByLabelText('Roster'),
      ' Taylor, Avery {enter}{enter}Patel, Maya{enter} Chen, Jordan ',
    )

    expect(screen.getByText('3 residents ready to add')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /add residents/i }))

    expect(onAdd).toHaveBeenCalledWith([
      'Taylor, Avery',
      'Patel, Maya',
      'Chen, Jordan',
    ])
    expect(onAdd).toHaveBeenCalledTimes(1)
    expect(screen.queryByText('3 residents ready to add')).not.toBeInTheDocument()
  })
})
