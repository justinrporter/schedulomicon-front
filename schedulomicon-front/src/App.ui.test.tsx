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

function getSectionPanel(title: string) {
  const panel = screen.getByText(title).closest('.panel-shell')

  expect(panel).not.toBeNull()

  return panel as HTMLElement
}

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
  it('uses Read the Docs info links for resident constraint helpers', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.click(screen.getByRole('button', { name: /add resident/i }))

    const residentRow = screen.getByRole('group', { name: /untitled resident/i })
    const parameterSelect = within(residentRow).getByRole('combobox')

    await user.selectOptions(parameterSelect, 'sum_gt_zero')
    await user.selectOptions(parameterSelect, 'sum_eq_zero')
    await user.selectOptions(parameterSelect, 'sum_eq_count')

    expect(within(residentRow).queryByText(/^docs$/i)).not.toBeInTheDocument()
    expect(
      within(residentRow).getByRole('link', {
        name: /open true somewhere constraint documentation/i,
      }),
    ).toHaveAttribute(
      'href',
      'https://schedulomicon.readthedocs.io/en/latest/constraints.html',
    )
    expect(
      within(residentRow).getByRole('link', {
        name: /open never true constraint documentation/i,
      }),
    ).toHaveAttribute(
      'href',
      'https://schedulomicon.readthedocs.io/en/latest/constraints.html',
    )
    expect(
      within(residentRow).getByRole('link', {
        name: /open count constraint documentation/i,
      }),
    ).toHaveAttribute(
      'href',
      'https://schedulomicon.readthedocs.io/en/latest/constraints.html',
    )
  })

  it('shows the advanced docs link only when the YAML preview is clean', async () => {
    const user = userEvent.setup()

    render(<App />)

    const previewHeading = screen.getByRole('heading', { name: /yaml preview/i })
    const previewPanel = previewHeading.closest('.panel-shell')

    expect(previewPanel).not.toBeNull()
    expect(
      within(previewPanel as HTMLElement).getByRole('link', {
        name: /configuration guide on read the docs/i,
      }),
    ).toHaveAttribute(
      'href',
      'https://schedulomicon.readthedocs.io/en/latest/configuration_files.html',
    )

    await user.click(screen.getByRole('button', { name: /add block/i }))

    const blockRow = screen.getByRole('group', { name: /untitled block/i })
    await user.selectOptions(within(blockRow).getByRole('combobox'), 'groups')
    await user.type(
      within(blockRow).getByPlaceholderText('Early Block, Senior Call'),
      'sr{enter}',
    )

    expect(
      await within(previewPanel as HTMLElement).findByText('1 issue currently flagged'),
    ).toBeInTheDocument()
    expect(
      within(previewPanel as HTMLElement).queryByRole('link', {
        name: /configuration guide on read the docs/i,
      }),
    ).not.toBeInTheDocument()
  })

  it('shows resident-style add controls in empty blocks and rotations sections', () => {
    render(<App />)

    const blocksPanel = getSectionPanel('Blocks')
    const rotationsPanel = getSectionPanel('Rotations')

    expect(within(blocksPanel).getByRole('button', { name: /^add multiple$/i })).toBeInTheDocument()
    expect(within(rotationsPanel).getByRole('button', { name: /^add multiple$/i })).toBeInTheDocument()

    const blockAddButtons = within(blocksPanel).getAllByRole('button', {
      name: /^add block$/i,
    })
    const rotationAddButtons = within(rotationsPanel).getAllByRole('button', {
      name: /^add rotation$/i,
    })

    expect(blockAddButtons).toHaveLength(1)
    expect(rotationAddButtons).toHaveLength(1)
    expect(blockAddButtons[0]).toHaveClass('footer-add-button')
    expect(rotationAddButtons[0]).toHaveClass('footer-add-button')
  })

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

  it('bulk-adds blocks from trimmed non-blank lines', async () => {
    const user = userEvent.setup()

    render(<App />)

    const blocksPanel = getSectionPanel('Blocks')

    await user.click(within(blocksPanel).getByRole('button', { name: /^add multiple$/i }))
    await user.type(
      screen.getByLabelText('Blocks'),
      ' July {enter}{enter}August{enter} Block 1 ',
    )
    await user.click(screen.getByRole('button', { name: /add blocks/i }))

    expect(screen.getByRole('group', { name: /^july$/i })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: /^august$/i })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: /^block 1$/i })).toBeInTheDocument()
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

  it('appends bulk-added rotations and leaves optional fields empty', async () => {
    const user = userEvent.setup()

    render(<App />)

    const rotationsPanel = getSectionPanel('Rotations')

    await user.click(within(rotationsPanel).getByRole('button', { name: /^add rotation$/i }))
    const existingRotationRow = screen.getByRole('group', { name: /untitled rotation/i })
    await user.type(
      within(existingRotationRow).getByLabelText(/rotation name/i),
      'ED',
    )

    await user.click(within(rotationsPanel).getByRole('button', { name: /^add multiple$/i }))
    await user.type(screen.getByLabelText('Rotations'), ' ICU {enter}{enter} Clinic ')
    await user.click(screen.getByRole('button', { name: /add rotations/i }))

    expect(screen.getByRole('group', { name: /^ed$/i })).toBeInTheDocument()

    const icuRow = screen.getByRole('group', { name: /^icu$/i })
    const clinicRow = screen.getByRole('group', { name: /^clinic$/i })

    expect(icuRow).toBeInTheDocument()
    expect(clinicRow).toBeInTheDocument()
    expect(within(icuRow).queryByRole('spinbutton', { name: /min/i })).not.toBeInTheDocument()
    expect(within(clinicRow).queryByRole('spinbutton', { name: /min/i })).not.toBeInTheDocument()
  })
})
