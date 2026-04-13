// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import {
  cleanup,
  render,
  screen,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'

import App from './App'
import { STORAGE_KEY } from './hooks/usePersistedState'

afterEach(() => {
  cleanup()

  if (typeof window.localStorage?.clear === 'function') {
    window.localStorage.clear()
    return
  }

  if (typeof window.localStorage?.removeItem === 'function') {
    window.localStorage.removeItem(STORAGE_KEY)
  }
})

describe('App validation UI', () => {
  it('keeps a new blank block inert until it has meaningful content', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.click(screen.getByRole('button', { name: /add block/i }))

    const blockRow = screen.getByRole('group', { name: /untitled block/i })
    const blockNameInput = within(blockRow).getByLabelText(/block name/i)

    expect(blockNameInput).not.toHaveAttribute('aria-invalid')
    expect(screen.queryByText('Name is required.')).not.toBeInTheDocument()

    const parameterSelect = within(blockRow).getByRole('combobox')
    await user.selectOptions(parameterSelect, 'groups')

    const groupsInput = within(blockRow).getByPlaceholderText(
      'Early Block, Senior Call',
    )
    await user.type(groupsInput, 'sr{enter}')

    const previewHeading = screen.getByRole('heading', { name: /yaml preview/i })
    const previewPanel = previewHeading.closest('.panel-shell')

    expect(previewPanel).not.toBeNull()
    expect(
      await within(previewPanel as HTMLElement).findByText('Name is required.', {
        selector: 'p',
      }),
    ).toBeInTheDocument()
    expect(within(previewPanel as HTMLElement).getByText('Blocks · Untitled block')).toBeInTheDocument()
    expect(blockNameInput).toHaveAttribute('aria-invalid', 'true')
    expect(screen.queryAllByText('Name is required.', { selector: 'p' })).toHaveLength(1)
  })

  it('starts new resident, block, and rotation rows expanded and preserves values across collapse', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.click(screen.getByRole('button', { name: /add resident/i }))
    await user.click(screen.getByRole('button', { name: /add block/i }))
    await user.click(screen.getByRole('button', { name: /add rotation/i }))

    const untitledResidentRow = screen.getByRole('group', { name: /untitled resident/i })
    const untitledBlockRow = screen.getByRole('group', { name: /untitled block/i })
    const untitledRotationRow = screen.getByRole('group', { name: /untitled rotation/i })

    expect(within(untitledResidentRow).getByLabelText(/resident name/i)).toBeInTheDocument()
    expect(within(untitledBlockRow).getByLabelText(/block name/i)).toBeInTheDocument()
    expect(within(untitledRotationRow).getByLabelText(/rotation name/i)).toBeInTheDocument()

    await user.type(within(untitledResidentRow).getByLabelText(/resident name/i), 'Dr. Avery Taylor')
    await user.type(within(untitledBlockRow).getByLabelText(/block name/i), 'July')
    await user.type(within(untitledRotationRow).getByLabelText(/rotation name/i), 'ICU')

    await user.selectOptions(within(untitledResidentRow).getByRole('combobox'), 'groups')
    await user.type(
      within(untitledResidentRow).getByPlaceholderText('sr, jr, night-float'),
      'sr{enter}',
    )

    await user.selectOptions(within(untitledBlockRow).getByRole('combobox'), 'groups')
    await user.type(
      within(untitledBlockRow).getByPlaceholderText('Early Block, Senior Call'),
      'early{enter}',
    )

    await user.selectOptions(within(untitledRotationRow).getByRole('combobox'), 'coverage')
    await user.type(within(untitledRotationRow).getByRole('spinbutton', { name: /min/i }), '1')
    await user.type(within(untitledRotationRow).getByRole('spinbutton', { name: /max/i }), '2')

    const residentRow = screen.getByRole('group', { name: /dr\. avery taylor/i })
    const blockRow = screen.getByRole('group', { name: /july/i })
    const rotationRow = screen.getByRole('group', { name: /icu/i })

    await user.click(within(residentRow).getByRole('button', { name: /dr\. avery taylor/i }))
    await user.click(within(blockRow).getByRole('button', { name: /july/i }))
    await user.click(within(rotationRow).getByRole('button', { name: /icu/i }))

    expect(within(residentRow).queryByLabelText(/resident name/i)).not.toBeInTheDocument()
    expect(within(blockRow).queryByLabelText(/block name/i)).not.toBeInTheDocument()
    expect(within(rotationRow).queryByLabelText(/rotation name/i)).not.toBeInTheDocument()

    await user.click(within(residentRow).getByRole('button', { name: /dr\. avery taylor/i }))
    await user.click(within(blockRow).getByRole('button', { name: /july/i }))
    await user.click(within(rotationRow).getByRole('button', { name: /icu/i }))

    expect(within(residentRow).getByLabelText(/resident name/i)).toHaveValue('Dr. Avery Taylor')
    expect(within(residentRow).getByText('sr')).toBeInTheDocument()
    expect(within(blockRow).getByLabelText(/block name/i)).toHaveValue('July')
    expect(within(blockRow).getByText('early')).toBeInTheDocument()
    expect(within(rotationRow).getByLabelText(/rotation name/i)).toHaveValue('ICU')
    expect(within(rotationRow).getByRole('spinbutton', { name: /min/i })).toHaveValue(1)
    expect(within(rotationRow).getByRole('spinbutton', { name: /max/i })).toHaveValue(2)
  })

  it('deletes a collapsed row directly from the header', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.click(screen.getByRole('button', { name: /add resident/i }))

    const residentRow = screen.getByRole('group', { name: /untitled resident/i })

    await user.type(within(residentRow).getByLabelText(/resident name/i), 'Dr. Delete Me')

    const namedResidentRow = screen.getByRole('group', { name: /dr\. delete me/i })

    await user.click(within(namedResidentRow).getByRole('button', { name: /dr\. delete me/i }))

    expect(within(namedResidentRow).queryByLabelText(/resident name/i)).not.toBeInTheDocument()

    await user.click(within(namedResidentRow).getByRole('button', { name: /delete row/i }))

    expect(screen.queryByRole('group', { name: /dr\. delete me/i })).not.toBeInTheDocument()
  })
})
