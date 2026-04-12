# Schedulomicon Frontend — Implementation Document

## Context

Schedulomicon is a constraint-based medical resident rotation scheduler. Users write YAML config files, then run a Python CLI solver to generate optimal schedules. The barrier to adoption is constructing the YAML by hand — it has a rich but complex schema. This frontend removes that barrier with a web UI that generates valid YAML for download.

**Target users:** Program directors — non-technical physician schedulers  
**Goal:** Generate a YAML config file, download it, and either run the CLI themselves or submit it to the developer  
**Hosting:** Static site on GitHub Pages / Netlify / Vercel — no server required

---

## Tech Stack

| Concern | Choice | Reason |
|---|---|---|
| Build tooling | **Vite + React + TypeScript** | CRA is unmaintained; Vite is faster, smaller output |
| Styling | **Tailwind CSS + @tailwindcss/forms** | Forms plugin normalizes inputs cross-browser |
| Collapsible sections | **@headlessui/react** (Disclosure) | Accessible, zero styling opinion |
| Icons | **@heroicons/react** | Same team as Tailwind; covers all needed icons |
| YAML serialization | **js-yaml** | Battle-tested; `dump()` with `lineWidth: -1` prevents wrapping |
| State | Plain `useState` in App.tsx | No async, no complexity — Redux/Zustand are overkill |
| Routing | None | Single-page tool |

**Install commands:**
```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install js-yaml @headlessui/react @heroicons/react
npm install -D tailwindcss @tailwindcss/forms autoprefixer postcss @types/js-yaml
npx tailwindcss init -p
```

---

## Feature Scope (v1)

**Included (core YAML sections):**
- Blocks — name, optional groups
- Rotations — name, coverage [min, max], optional groups, optional rot_count (flat or per-group)
- Residents — name, optional groups
- Constraints — prohibit (resident cannot be assigned to rotation)

**Excluded from UI (hand-edit after download):**
- Vacation pools, backup, group_constraints
- Cooldowns, prerequisites, must_be_followed_by, consecutive_count
- Boolean selector DSL (sum > N, sum == N, sum <= N)
- Per-block coverage arrays

---

## App Layout

```
┌────────────────────────────────────────────────────────────┐
│  Schedulomicon  [subtitle]  [Reset]  [Download YAML ▼ 3⚠]  │  ← sticky header
├────────────────────────────────┬───────────────────────────┤
│  FORM COLUMN (scrollable, 55%) │  YAML PREVIEW (sticky)    │
│                                │                           │
│  [▼] Blocks                    │  blocks:                  │
│       Block 1: [ July ]        │    July: {}               │
│       + Add Block              │  rotations:               │
│                                │    Wards:                 │
│  [▼] Rotations ⚠ 1            │      coverage: [2, 4]     │
│       ...                      │  ...                      │
│  [▼] Residents                 │                           │
│  [▼] Constraints               │  [Copy to clipboard]      │
└────────────────────────────────┴───────────────────────────┘
```

- Right panel: `position: sticky; top: 0; height: 100vh; overflow-y: auto`
- Mobile (<768px): stack vertically; YAML preview collapses to a toggleable bottom panel
- Download button shows warning count badge when issues exist

---

## Global State Shape

```typescript
// src/types.ts

export interface BlockDef {
  id: string;           // nanoid — React key, never shown to user
  name: string;
  groups: string[];
}

export interface RotCountEntry {
  group: string;
  min: number | "";
  max: number | "";
}

export interface RotationDef {
  id: string;
  name: string;
  coverageMin: number | "";
  coverageMax: number | "";
  groups: string[];
  rotCountMode: "none" | "flat" | "per-group";
  rotCountFlat: { min: number | ""; max: number | "" };
  rotCountPerGroup: RotCountEntry[];
}

export interface ResidentDef {
  id: string;
  name: string;
  groups: string[];
}

export interface ProhibitDef {
  id: string;
  residentName: string;
  rotationName: string;
}

export interface ScheduleState {
  blocks: BlockDef[];
  rotations: RotationDef[];
  residents: ResidentDef[];
  prohibitions: ProhibitDef[];
}

export interface ValidationWarning {
  id: string;
  section: "blocks" | "rotations" | "residents" | "constraints" | "global";
  itemId?: string;
  message: string;
  severity: "warning" | "error";
}
```

**Key design notes:**
- `number | ""` for numeric fields — empty string means user cleared the field; avoids forcing a default 0 that looks like valid input
- `rotCountMode` is explicit state — do not infer from data presence, causes flickering
- `id` uses `nanoid()` — never use array index as key (causes React reconciliation bugs on delete)
- `knownGroups` is **derived**, not stored — `deriveKnownGroups(state)` collects all groups from rotations + blocks, deduplicates, sorts

---

## localStorage Persistence

```typescript
// src/hooks/usePersistedState.ts
const STORAGE_KEY = "schedulomicon_v1";  // bump version on breaking state shape changes

export function usePersistedState() {
  const [state, setState] = useState<ScheduleState>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as ScheduleState;
    } catch { /* corrupt storage — start fresh */ }
    return INITIAL_STATE;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  return [state, setState] as const;
}
```

---

## YAML Generation (`src/yaml/generateYaml.ts`)

Pure function — no React, no hooks. `(state: ScheduleState) => string`

**Key behaviors:**
- Blocks/residents with no groups serialize as `Name:` (null in js-yaml = correct empty YAML map)
- Rotations with incomplete coverage (one field blank) are included but will trigger a validation warning
- `rot_count` omitted entirely when mode is "none"
- `rot_count: [min, max]` for flat mode; `rot_count: { groupName: [min, max], ... }` for per-group mode
- Empty state returns `# Fill in the form to generate YAML\n`
- Called via `useMemo` in App.tsx

**js-yaml options:**
```typescript
yaml.dump(doc, { lineWidth: -1, quotingType: "'", forceQuotes: false, indent: 2 })
```

---

## Validation (`src/validation/validate.ts`)

Pure function — `(state: ScheduleState) => ValidationWarning[]`

| Check | Severity |
|---|---|
| Block/rotation/resident name is empty | error |
| Duplicate names within a section | error |
| Coverage min > max | error |
| rot_count min > max | error |
| Coverage partially filled (one field blank) | warning |
| rot_count references group not in knownGroups | warning |
| Prohibition references deleted resident/rotation | error |
| Duplicate prohibition (same resident + rotation pair) | warning |

**Display strategy:**
- `ValidationBanner` at top of form column — collapsible, shows all warnings
- Section headers show orange badge with count: `Rotations ⚠ 2`
- Individual rows show orange/red icon with tooltip
- YAML preview prepends `# WARNING: N issues — review before running solver` when errors exist

---

## Component Tree

```
App                              ← all state lives here
├── Header                       ← download + reset buttons
├── ValidationBanner             ← collapsible warning list
├── MainLayout
│   ├── FormColumn
│   │   ├── BlocksSection        ← SectionPanel wrapper
│   │   │   └── BlockRow ×N      ← name + optional groups toggle
│   │   ├── RotationsSection     ← SectionPanel wrapper
│   │   │   └── RotationRow ×N   ← expandable card
│   │   │       ├── CoverageInput
│   │   │       ├── RotCountEditor  ← none/flat/per-group toggle
│   │   │       └── GroupTagsInput
│   │   ├── ResidentsSection     ← SectionPanel wrapper
│   │   │   ├── BulkAddResidents ← paste a roster (textarea modal)
│   │   │   └── ResidentRow ×N   ← name + group checkboxes
│   │   └── ConstraintsSection   ← SectionPanel wrapper
│   │       └── ProhibitRow ×N   ← resident dropdown + rotation dropdown
│   └── YamlPreviewPanel         ← sticky; pre block + copy button
```

**Shared components:** `SectionPanel`, `GroupTagsInput`, `GroupCheckboxes`, `MinMaxInput`, `AddItemButton`, `DeleteRowButton`, `WarningIcon`, `ConfirmDialog`

---

## Section-by-Section UX

### Blocks
Simple name + optional groups. Groups field hidden behind "Add groups (optional)" toggle to reduce visual noise. Empty state shows explanatory placeholder card.

### Rotations
Each rotation is a collapsible card. Collapsed view shows summary: `Wards — coverage [2, 4] — rot_count: senior [2,3]`. Expanded shows:
1. Name input
2. Coverage [min]–[max] pair (MinMaxInput)
3. Groups tag input (optional)
4. Rot Count — 3-way toggle: None / Same for all / Per group. "Per group" mode shows a dynamic list of group→[min,max] rows; group dropdown is populated from knownGroups and disabled with tooltip if no groups are defined.

### Residents
Name input + group checkboxes (not free-text tags — residents must use group names defined elsewhere; checkboxes prevent typos). "Add multiple residents" button opens a textarea where users paste a line-per-name roster — bulk-creates ResidentDef rows.

### Constraints (Prohibit)
Two dropdowns per row: resident name + rotation name. Both populated from currently-defined names. If a referenced name is deleted, show `[Deleted: OldName]` in red.

---

## Download

```typescript
function downloadYaml(yamlString: string) {
  const blob = new Blob([yamlString], { type: 'text/yaml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'schedule.yaml';
  a.click();
  URL.revokeObjectURL(url);
}
```

---

## File Structure

```
frontend/
├── index.html
├── vite.config.ts           # base: './' for static hosting subdirectory support
├── tsconfig.json
├── postcss.config.js
├── tailwind.config.js
├── package.json
└── src/
    ├── main.tsx
    ├── App.tsx              # root; all state; useMemo for yaml + warnings
    ├── types.ts
    ├── hooks/
    │   └── usePersistedState.ts
    ├── state/
    │   └── initialState.ts
    ├── yaml/
    │   └── generateYaml.ts  # pure: ScheduleState → string
    ├── validation/
    │   └── validate.ts      # pure: ScheduleState → ValidationWarning[]
    ├── utils/
    │   ├── nanoid.ts
    │   └── deriveGroups.ts  # deriveKnownGroups(state) → string[]
    └── components/
        ├── layout/
        │   ├── Header.tsx
        │   ├── MainLayout.tsx
        │   ├── FormColumn.tsx
        │   └── YamlPreviewPanel.tsx
        ├── shared/
        │   ├── SectionPanel.tsx      # Headless UI Disclosure wrapper
        │   ├── GroupTagsInput.tsx
        │   ├── GroupCheckboxes.tsx
        │   ├── MinMaxInput.tsx
        │   ├── AddItemButton.tsx
        │   ├── DeleteRowButton.tsx
        │   ├── WarningIcon.tsx
        │   ├── ValidationBanner.tsx
        │   └── ConfirmDialog.tsx
        ├── blocks/
        │   ├── BlocksSection.tsx
        │   └── BlockRow.tsx
        ├── rotations/
        │   ├── RotationsSection.tsx
        │   ├── RotationRow.tsx
        │   ├── RotationFields.tsx
        │   ├── RotCountEditor.tsx
        │   └── GroupRotCountRow.tsx
        ├── residents/
        │   ├── ResidentsSection.tsx
        │   ├── ResidentRow.tsx
        │   └── BulkAddResidents.tsx
        └── constraints/
            ├── ConstraintsSection.tsx
            └── ProhibitRow.tsx
```

---

## Deployment

**Vite config:**
```typescript
export default defineConfig({
  plugins: [react()],
  base: './',  // relative base — works on GitHub Pages subdirectories
});
```

**GitHub Pages:** Add `gh-pages` dev dep; `"deploy": "npm run build && gh-pages -d dist"` script. Set `base` to `/repo-name/` if using project pages.

**Netlify/Vercel:** Connect repo, set root directory to `frontend`, build command `npm run build`, publish directory `dist`. Zero additional config.

---

## Implementation Sequence

1. Scaffold Vite + configure Tailwind — blank page renders
2. Define `types.ts` and `initialState.ts`
3. Write `generateYaml.ts` (pure, verify independently)
4. Write `validate.ts` (pure, verify independently)
5. Build `usePersistedState.ts`
6. Layout shell: Header, MainLayout, YamlPreviewPanel (static)
7. Wire App.tsx — state → useMemo for yaml and warnings → verify live preview
8. **BlocksSection** end-to-end (establishes the pattern)
9. **ResidentsSection** (introduces GroupCheckboxes + BulkAdd)
10. **RotationsSection** (introduces RotCountEditor complexity)
11. **ConstraintsSection**
12. ValidationBanner + warning badges on section headers
13. Polish: empty states, mobile layout, copy-to-clipboard, deployment config

---

## Critical Files to Modify

- `frontend/src/types.ts` — state shape contracts
- `frontend/src/App.tsx` — root, state, derived values, callbacks (~120 lines)
- `frontend/src/yaml/generateYaml.ts` — YAML output correctness
- `frontend/src/validation/validate.ts` — warning rules

---

## Future / v2 Considerations

- YAML import (upload existing config to edit) — state is already structured for this
- Solve server — Flask/FastAPI endpoint that accepts YAML, runs solver, returns CSV
- Advanced constraints panel (vacation, cooldowns, prerequisites) behind an "Expert mode" toggle
- Export/import app state as JSON for sharing between devices
