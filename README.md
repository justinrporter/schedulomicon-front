# Schedulomicon Front

Schedulomicon Front is a static React app for building [Schedulomicon](./schedulomicon/) YAML without hand-authoring the full solver configuration.

It is aimed at residency schedulers who need a safer way to define blocks, rotations, residents, and basic assignment prohibitions, then export solver-ready YAML for the Python scheduler.

The frontend is built with React, TypeScript, Vite, and Tailwind CSS.

## Why This Exists

The underlying Schedulomicon solver is flexible, but writing the YAML by hand isn't a technique that is commonly known to clinicians. The purpose of this this frontend is to lowers that barrier with a browser-based form, live validation, and a live YAML preview. It is _not_ to exhausively cover all the features and advanced techniques that are possible with the configuration file, just a way to get started.

Everything runs locally in the browser:

- no backend
- no database
- no account system
- drafts persist in `localStorage`

## Example Output

```yaml
blocks:
  July:
    groups:
      - summer
rotations:
  ICU:
    coverage:
      - 1
      - 2
    groups:
      - critical
    rot_count:
      sr:
        - 1
        - 2
residents:
  Alice:
    groups:
      - sr
    prohibit:
      - ICU
  Bob:
    groups:
      - sr
```

## Repo Layout

```text
.
├── schedulomicon-front/   # React + TypeScript + Vite app
├── schedulomicon/         # Python solver submodule
└── react-frontend-plan.md # original implementation notes
```

The frontend app lives in `schedulomicon-front/`. Most commands below should be run from that directory.

## Getting Started

### Prerequisites

- a recent Node.js + npm setup
- Python 3, only if you want to run the parser compatibility test

### Clone The Repo

```bash
git clone <repo-url>
cd <repo-root>
git submodule update --init --recursive
```

Note: the solver is included as a git submodule in `schedulomicon/`.

### Run The Frontend

```bash
cd schedulomicon-front
npm install
npm run dev
```

Then open the local Vite URL shown in the terminal.

## Quality Checks

From `schedulomicon-front/`:

```bash
npm run lint
npm test
npm run build
npm run test:hosting
```

Notes:

- `npm test` includes the parser compatibility suite described below, so it requires the Python setup in the next section.
- `npm run test:hosting` is intended to run after `npm run build` and verifies that the generated `dist/` artifact stays compatible with generic static hosts such as GitHub Pages.

## Parser Compatibility Test

The repo includes a parser sanity check that generates YAML from the frontend and verifies that the current Python parser accepts it.

From `schedulomicon-front/`:

```bash
python3 -m venv .venv
./.venv/bin/python -m pip install --upgrade pip
./.venv/bin/pip install numpy pandas pyyaml pyparsing
npm run test:parser
```

Why this setup is a little unusual:

- the solver submodule currently declares `python_requires <3.11`
- the parser test avoids `pip install -e ../schedulomicon`
- instead, it installs only lightweight parsing dependencies and imports the submodule directly via `PYTHONPATH`

If you already have a suitable interpreter elsewhere, set `SCHEDULOMICON_PYTHON=/path/to/python` before running `npm run test:parser`.

## Deployment

This is a static app with no backend. A production build is created with:

```bash
cd schedulomicon-front
npm run build
npm run test:hosting
```

The generated assets land in `schedulomicon-front/dist/` and can be hosted on GitHub Pages, Netlify, Vercel, or any other static host. The Vite `base` is configured as `./` to support generic static hosting and GitHub Pages project-site URLs.

### GitHub Pages

The repository now includes a GitHub Actions workflow at `.github/workflows/deploy-pages.yml`.

Deployment behavior:

- pull requests to `main` run lint, the full test suite, a production build, and the static-hosting artifact check
- pushes to `main` run the same validation, then publish `schedulomicon-front/dist/` to GitHub Pages
- manual redeploys are available through `workflow_dispatch`

The workflow creates `schedulomicon-front/.venv` in CI so the parser compatibility tests run in the same isolated style recommended for local development.

One-time repo setup on GitHub:

- in `Settings -> Pages`, set `Source` to `GitHub Actions`

## Notes For Contributors

- Keep YAML generation and validation logic pure and testable.
- If you change emitted YAML shape or validation behavior, run `npm test`. Use `npm run test:parser` when you want to target the parser compatibility check directly.
- Generated `groups` should always remain YAML arrays, even for a single group, to avoid parser compatibility issues in the current solver.
- The `schedulomicon/` submodule may have its own in-progress work; do not assume it is safe to reset.

## Roadmap

Likely next additions:

- YAML import
- expert-mode editing for advanced solver fields
- vacation and backup UI
- saved-state import/export
- tighter solver-backed workflows
