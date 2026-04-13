# Schedulomicon Frontend

This directory contains the static React + TypeScript frontend for building Schedulomicon YAML.

## Local development

```bash
npm install
npm run dev
```

## Checks

```bash
npm run lint
npm test
npm run build
npm run test:hosting
```

Notes:

- `npm test` includes the Python parser compatibility test, so set up `.venv` first if you want the full suite locally.
- `npm run test:hosting` verifies that the built `dist/` artifact is safe to publish to generic static hosts such as GitHub Pages.

## GitHub Pages deployment

The repo root contains `.github/workflows/deploy-pages.yml`.

That workflow:

- validates pull requests to `main`
- deploys pushes to `main` to GitHub Pages
- publishes `dist/` from this directory

The Vite `base` value is `./`, so the build stays compatible with GitHub Pages project-site URLs and other subpath static hosts.

One-time repo setup on GitHub:

- in `Settings -> Pages`, set `Source` to `GitHub Actions`

See the repo root [`README.md`](../README.md) for fuller project context and Python test setup.
