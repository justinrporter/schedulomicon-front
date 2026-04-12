# Schedulomicon Front Repo Guide

## Overview

This repository has two parts:

- `schedulomicon-front/`: the React + TypeScript static frontend for building Schedulomicon YAML files.
- `schedulomicon/`: the Python solver repository, included as a git submodule.

The frontend exists to help non-technical schedulers generate valid YAML without hand-editing the full solver config.

## Current Frontend Scope

The frontend currently supports:

- Blocks: name, optional groups
- Rotations: name, coverage `[min, max]`, optional groups, optional `rot_count`
- Residents: name, optional groups
- Constraints: resident-to-rotation prohibitions
- Live YAML preview
- Copy/download YAML
- Local draft persistence in `localStorage`

The frontend intentionally does not expose the full solver schema yet. Advanced solver features such as vacation, backup, cooldowns, prerequisites, group constraints, and selector DSL authoring are still manual YAML edits after download.

## Repo Layout

Top level:

- `react-frontend-plan.md`: original implementation plan for the frontend
- `AGENTS.md`: this file
- `schedulomicon-front/`: Vite app
- `schedulomicon/`: Python solver submodule

Important frontend paths:

- `schedulomicon-front/src/App.tsx`: root state wiring and section composition
- `schedulomicon-front/src/types.ts`: state and warning contracts
- `schedulomicon-front/src/yaml/generateYaml.ts`: pure YAML generation
- `schedulomicon-front/src/validation/validate.ts`: pure validation
- `schedulomicon-front/src/hooks/usePersistedState.ts`: localStorage persistence
- `schedulomicon-front/src/components/`: UI sections and shared controls
- `schedulomicon-front/src/test/parserCompatibility.test.ts`: Python parser sanity check

## Frontend Architecture

State is centralized in `App.tsx` with plain React state.

Derived values:

- warnings from `validate(state)`
- YAML from `generateYaml(state)`
- known groups from `deriveGroups(state)`

Key implementation rules:

- Numeric inputs use `number | ""` in state so cleared fields stay empty instead of turning into `0`.
- Names and group tags are trimmed before validation and serialization, but case is preserved.
- `rotCountMode` is explicit state and should not be inferred from nested data.
- Prohibitions are edited in a separate UI section but serialize under each resident as `prohibit:`.
- Incomplete or invalid coverage / `rot_count` values are omitted from YAML instead of emitting bad data.

## Solver Compatibility Notes

The current Python solver code is more fragile than some docs imply.

Important compatibility rule:

- Always emit `groups` as YAML arrays, never scalar strings.

Reason:

- `schedulomicon/schedulomicon/io.py` iterates `params.get('groups', [])`.
- If `groups` is emitted as a scalar string, the solver can treat it like an iterable of characters.

The frontend is intentionally standardized on array-form `groups` for blocks, rotations, and residents.

## Local Environment

Frontend isolation:

- Node dependencies live only in `schedulomicon-front/node_modules`.

Python isolation:

- Use `schedulomicon-front/.venv` for Python-side compatibility checks.
- Do not install solver dependencies globally from this repo.

Parser compatibility:

- The submodule currently declares `python_requires <3.11` in `schedulomicon/setup.py`.
- On machines with newer Python, do not rely on `pip install -e ../schedulomicon`.
- The current parser compatibility test works by installing only lightweight parsing dependencies into `.venv` and importing the submodule directly via `PYTHONPATH`.

## Commands

Run from `schedulomicon-front/` unless noted otherwise.

Development:

- `npm install`
- `npm run dev`

Quality checks:

- `npm run lint`
- `npm test`
- `npm run build`
- `npm run test:parser`

Python compatibility environment setup:

```bash
cd schedulomicon-front
python3 -m venv .venv
./.venv/bin/python -m pip install --upgrade pip
./.venv/bin/pip install numpy pandas pyyaml pyparsing
```

## Testing Expectations

When changing YAML or validation behavior, run:

- `npm test`
- `npm run test:parser`

When changing UI, run at minimum:

- `npm run lint`
- `npm run build`

If you change emitted YAML shape, verify both:

- the Vitest unit cases still pass
- the generated YAML is still accepted by the Python parser check

## Editing Guidance

Prefer changing the pure logic first, then updating the UI.

Areas with highest regression risk:

- `generateYaml.ts`
- `validate.ts`
- rotation `rot_count` editing
- prohibition serialization
- any logic that touches group normalization or duplicate-name handling

Be careful with the submodule:

- `schedulomicon/` may already have user changes
- do not reset or overwrite submodule work unless explicitly requested

## Current UI Sections

Implemented sections:

- `BlocksSection`
- `RotationsSection`
- `ResidentsSection`
- `ConstraintsSection`
- `YamlPreviewPanel`
- `ValidationBanner`

Shared controls:

- `SectionPanel`
- `GroupTagsInput`
- `MinMaxInput`
- `ConfirmDialog`

## Build / Deploy Assumptions

The frontend is configured as a static app:

- Vite `base` is set to `./`
- No backend is required
- Intended targets are generic static hosts such as GitHub Pages, Netlify, or Vercel

## Future Work

Likely next additions:

- YAML import
- advanced constraints / expert mode
- vacation and backup UI
- export/import saved app state
- solver-backed submission flow
