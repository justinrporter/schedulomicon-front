# Parameter-Row Refactor Using Red/Green TDD

## Summary

- Remove the standalone Constraints section and replace it with per-entity parameter rows on residents, rotations, and blocks.
- Residents gain parameter types `Groups`, `True somewhere` (`sum > 0`), `Never true` (`sum == 0`), and `Count` (`sum == N` with a user-entered integer).
- Rotations and blocks adopt the same parameter-row framework, but only expose current capabilities:
  - Rotations: `Groups`, `Coverage`, `Rotation count (same for all)`, `Rotation count (per group)`
  - Blocks: `Groups`
- Keep solver YAML compatibility unchanged where possible:
  - `groups` still serializes as YAML arrays
  - `coverage` and `rot_count` keep their current YAML shape
  - resident selector rows serialize into `sum ...` keys
  - `prohibit` is removed entirely
- Bump local draft storage to a new version and intentionally reset old saved drafts.

## TDD Execution Order

- Work strictly in red/green/refactor slices. For each slice:
  - write or update failing tests first
  - implement the smallest code change to pass
  - refactor only after tests are green
- Slice 1: state model and serialization
  - Red: replace current type-driven test fixtures so they describe parameter-array entities instead of fixed `groups` / `prohibitions` / rotation field properties.
  - Green: update types, factories, initial state, and persistence versioning to support the new parameter unions.
  - Refactor: add shared helpers for parameter creation and singleton-parameter lookup.
- Slice 2: YAML generation
  - Red: add failing tests for resident `sum > 0`, `sum == 0`, `sum == N`, grouped exact-count emission, removal of `prohibit`, and rotation/block serialization via parameter rows.
  - Green: update YAML generation to read parameter arrays and emit current solver-compatible YAML.
  - Refactor: centralize parameter-to-YAML helpers so residents/rotations/blocks do not each implement their own ad hoc traversal.
- Slice 3: derived groups and validation
  - Red: add failing tests for resident-group derivation from `Groups` rows, duplicate singleton parameters, blank selector rows, exact-count validation, and existing coverage / `rot_count` edge cases under the new model.
  - Green: update `deriveGroups` and `validate` to operate on parameter arrays.
  - Refactor: group validation by parameter kind instead of by entity field names.
- Slice 4: UI flow
  - Red: add failing component/app tests covering:
    - no Constraints section rendered
    - resident “Add parameter” flow for all 4 resident types
    - rotation/block “Add parameter” flow with only allowed types shown
    - docs link visible for selector-based resident rows
    - singleton parameter types disabled or hidden once already present
  - Green: replace fixed group/prohibition/coverage/rot_count UI with shared parameter-row editors.
  - Refactor: extract shared row shell and per-kind editor components.
- Slice 5: parser compatibility
  - Red: update parser compatibility tests to use resident field-sum rows instead of prohibitions.
  - Green: ensure generated YAML is still accepted by the Python parser.
  - Refactor: keep parser fixtures aligned with the new app model, not the old field layout.

## Key Changes

- State / public interfaces
  - `ResidentDef`, `RotationDef`, and `BlockDef` each become `{ id, name, parameters }`.
  - Remove top-level `prohibitions` from `ScheduleState`.
  - Remove `ProhibitDef`, `groups` on entities, rotation `coverageMin/coverageMax`, and `rotCountMode/rotCountFlat/rotCountPerGroup`.
  - Add discriminated parameter unions with shared `{ id, kind }` shape.
- Parameter kinds
  - Shared singleton parameter: `groups` with `values: string[]`
  - Resident repeatable parameters:
    - `sum_gt_zero` with `selector: string`
    - `sum_eq_zero` with `selector: string`
    - `sum_eq_count` with `selector: string`, `count: number | ''`
  - Rotation singleton parameters:
    - `coverage` with `min/max`
    - `rot_count_flat` with `min/max`
    - `rot_count_per_group` with `entries`
- YAML behavior
  - Resident parameters serialize as:
    - `sum > 0: [...]`
    - `sum == 0: [...]`
    - `sum == N: [...]`
  - Rotation and block parameter rows serialize back to the existing YAML keys.
  - `groups` always emits as array form.
  - `prohibit` is never emitted.
- UI behavior
  - Every entity row gets an “Add parameter” control and typed parameter rows.
  - Residents may add unlimited selector-based rows, but only one `Groups` row.
  - Rotations allow one total `rot_count` variant, one `Coverage`, one `Groups`.
  - Blocks allow one `Groups` row.
  - Selector-based resident rows show an inline docs link to `https://github.com/justinrporter/schedulomicon/blob/main/docs/source/constraints.rst`.
- Persistence
  - Change the localStorage key from `schedulomicon_front_v1` to a new versioned key and do not migrate old drafts.

## Test Plan

- Unit tests
  - YAML generation:
    - resident `True somewhere` emits `sum > 0`
    - resident `Never true` emits `sum == 0`
    - resident `Count` emits `sum == N`
    - multiple exact-count rows with same `N` group under one YAML key
    - groups remain arrays
    - no `prohibit` output
    - rotation `coverage` and both `rot_count` modes keep current YAML shape
  - Validation:
    - missing names still fail
    - invalid/partial ranges still warn or error exactly as today
    - duplicate singleton parameter rows fail
    - blank selector rows warn and are omitted from YAML
    - per-group `rot_count` still validates against derived resident groups
    - duplicate resident/rotation names still surface errors
  - Derived data:
    - `deriveGroups` reads only `Groups` parameter rows
    - rotation per-group rules resolve against resident group parameters
- Component/app tests
  - Constraints section is absent
  - Resident parameter dropdown shows `Groups`, `True somewhere`, `Never true`, `Count`
  - Rotation/block dropdowns only show allowed types
  - Docs link appears on selector rows
  - Adding/removing parameter rows updates form state and preview
- Compatibility checks
  - `npm test`
  - `npm run build`
  - `npm run test:parser`

## Assumptions / Defaults

- `Count` means exact count only and serializes as `sum == N`.
- The frontend does not attempt full parser-DSL validation; selectors are treated as freeform strings and only checked for blankness.
- `Never true` is the UX replacement for old prohibitions; users can express a former resident-to-rotation prohibition as `sum == 0` with a selector like `ICU`.
- The GitHub source URL is the docs link used in v1 because no published docs site is available from the repo.
