import { XMarkIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'

import { normalizeText, uniqueTrimmedStrings } from '../../utils/strings'

interface GroupTagsInputProps {
  tags: string[]
  placeholder: string
  onChange: (nextTags: string[]) => void
}

export function GroupTagsInput({
  tags,
  placeholder,
  onChange,
}: GroupTagsInputProps) {
  const [draft, setDraft] = useState('')

  function commitDraft(rawValue: string) {
    const additions = rawValue
      .split(',')
      .map((value) => normalizeText(value))
      .filter(Boolean)

    if (additions.length === 0) {
      setDraft('')
      return
    }

    onChange(uniqueTrimmedStrings([...tags, ...additions]))
    setDraft('')
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {tags.length === 0 ? (
          <p className="text-sm text-[#7b6b52]">
            No groups yet. Use commas or Enter to add them.
          </p>
        ) : (
          tags.map((tag) => (
            <span key={tag} className="chip">
              {tag}
              <button
                type="button"
                className="rounded-full text-[#7f6d55] transition hover:text-rust"
                onClick={() =>
                  onChange(tags.filter((currentTag) => currentTag !== tag))
                }
              >
                <XMarkIcon className="h-4 w-4" />
                <span className="sr-only">Remove {tag}</span>
              </button>
            </span>
          ))
        )}
      </div>

      <input
        type="text"
        className="input-field"
        value={draft}
        placeholder={placeholder}
        onBlur={() => commitDraft(draft)}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ',') {
            event.preventDefault()
            commitDraft(draft)
          }
        }}
      />
    </div>
  )
}
