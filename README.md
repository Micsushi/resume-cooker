# Resume Cooker

Private source-of-truth repo for Michael Shi's resume, local PDF generation, and ATS parsing experiments.

## Layout

- `resume/source/` stores the current LaTeX resume source.
- `resume/output/` is reserved for generated PDFs and extracted text outputs.
- `generator/` stores the local LaTeX-to-PDF build and preview workflow.
- `checker/` stores staged local/API/preflight/postflight report scaffolding.
- `testers/` stores local snapshots of ATS/resume testing tools.
- `fixtures/` stores sample job descriptions and extracted resume text used for tests.
- `docs/` stores notes about ATS testing methods and repo decisions.

## Planning Docs

- `docs/roadmap.md`: four-stage public roadmap from local foundation through future integration.
- `docs/resume-quality-criteria.md`: criteria list for parseability, ATS safety, evidence quality, keyword coverage, and post-tailoring regressions.
- `docs/hunt-c2-integration-notes.md`: notes on how Resume Cooker can later run before and after Hunt C2/Fletcher.
- `docs/evaluation-suites.md`: planned separation between local-only checks, optional API checks, and full checks.
- `docs/ats-testing-methods.md`: practical ATS testing approaches.
- `docs/tester-sources.md`: provenance for copied tester snapshots.

## Current State

The repo now preserves the current resume content, tester projects, and a lightweight generator/preview scaffold without redesigning the LaTeX.

Current implementation focus:

1. Finish Stage 1 local foundation: preview behavior, root formatting, linting, tests, lightweight CI, and docs.
2. Keep third-party tester snapshots out of default root checks until later stages wrap them intentionally.
3. Preserve a future path toward a local UI that can edit LaTeX, generate PDFs, and display or download results.

## Quick Commands

```bash
npm ci
npm run check:tools
npm run format:check
npm run lint
npm test
npm run ci
npm run check:local
npm run check:api
npm run check:full
npm run compare
npm run build:pdf
npm run preview
```

## Stage 1 Local Foundation

Stage 1 keeps the repo locally usable and CI-checkable before adding ATS scoring, text
extraction, job-description matching, or tester wrappers.

- `npm run preview` starts the local browser preview and builds a temporary PDF under
  `.runtime/preview/`.
- `npm run build:pdf` is the intentional saved-PDF command and writes to `resume/output/`.
- `npm run check:tools` prints available local tools. It is a probe, so missing TeX tools do not
  fail the command unless you pass `-- --require-pdf-engine`.
- `npm run format`, `npm run format:check`, `npm run lint`, and `npm test` cover root-owned
  project files and generator code.
- `npm run ci` runs the lightweight root checks used by GitHub Actions.
- Vendored tester snapshots under `testers/` are excluded from default root formatting, linting,
  tests, and CI until later stages wrap them intentionally.

Generated files stay out of Git: saved PDFs belong under `resume/output/`, and preview artifacts
belong under `.runtime/preview/`.

## Staged Check Scaffolding

The later-stage command skeletons are present so future decisions can attach to stable reports:

- `npm run check:local` runs deterministic local preflight checks against the current source and
  sample JD.
- `npm run check:api` writes an opt-in API/model-review placeholder report without sending content
  anywhere.
- `npm run check:full` combines local and API scaffold reports.
- `npm run compare` runs the postflight comparison scaffold against the current source as both
  before and after input.

Reports are written under `.runtime/reports/` by default and stay private/ignored. The stable status
values are `pass`, `pass_with_warnings`, and `fail`.

Current non-blockers that remain warning-level until later answers are final:

- API/model review provider, privacy, and cost controls.
- Whether page-limit checks warn or fail.
- Exact contact-value validation versus parseable contact-field validation.
- Which vendored tester should be wrapped first.
