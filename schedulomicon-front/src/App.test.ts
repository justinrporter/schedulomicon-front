import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  buildConstraintOptions,
  downloadYaml,
  withWarningPrefix,
} from './appHelpers'

const originalWindow = globalThis.window
const originalDocument = globalThis.document

afterEach(() => {
  globalThis.window = originalWindow
  globalThis.document = originalDocument
  vi.restoreAllMocks()
})

describe('App helpers', () => {
  it('prefixes preview YAML only when there are blocking errors', () => {
    expect(withWarningPrefix('blocks: {}\n', 2, false)).toBe('blocks: {}\n')
    expect(withWarningPrefix('blocks: {}\n', 1, true)).toBe(
      '# WARNING: 1 issue — review before running solver\nblocks: {}\n',
    )
    expect(withWarningPrefix('blocks: {}\n', 3, true)).toBe(
      '# WARNING: 3 issues — review before running solver\nblocks: {}\n',
    )
  })

  it('labels duplicate and deleted constraint options distinctly', () => {
    expect(
      buildConstraintOptions(
        [{ name: ' ICU ' }, { name: 'ICU' }, { name: 'Ward' }, { name: '   ' }],
        'Deleted Rotation',
      ),
    ).toEqual([
      {
        value: 'Deleted Rotation',
        label: '[Deleted: Deleted Rotation]',
        tone: 'danger',
      },
      {
        value: 'ICU',
        label: 'ICU (duplicate name)',
        tone: 'warning',
      },
      {
        value: 'Ward',
        label: 'Ward',
        tone: 'default',
      },
    ])
  })

  it('downloads raw YAML with the expected filename', async () => {
    let capturedBlob: Blob | undefined

    const createObjectURL = vi.fn((blob: Blob) => {
      capturedBlob = blob
      return 'blob:yaml'
    })
    const revokeObjectURL = vi.fn()
    const anchor = {
      href: '',
      download: '',
      click: vi.fn(),
    }

    globalThis.window = {
      URL: {
        createObjectURL,
        revokeObjectURL,
      },
    } as unknown as Window & typeof globalThis
    globalThis.document = {
      createElement: vi.fn(() => anchor),
    } as unknown as Document

    downloadYaml("blocks:\n  July: ''\n")

    expect(createObjectURL).toHaveBeenCalledOnce()
    expect(anchor.href).toBe('blob:yaml')
    expect(anchor.download).toBe('schedule.yaml')
    expect(anchor.click).toHaveBeenCalledOnce()
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:yaml')
    expect(await capturedBlob?.text()).toBe("blocks:\n  July: ''\n")
  })
})
