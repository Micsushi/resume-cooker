# Resume Cooker

Public sample project for resume PDF generation, local checks, and ATS parsing experiments.

## Layout

- `resume/source/` stores sample LaTeX resume sources. Keep personal resume files outside Git.
- `resume/output/` is reserved for generated PDFs and extracted text outputs.
- `generator/` stores the local LaTeX-to-PDF build and preview workflow.
- `checker/` stores staged local/API/preflight/postflight report code.
- `testers/` stores local snapshots of ATS/resume testing tools.
- `fixtures/` stores sample job descriptions and extracted resume text used by tests.
- `docs/` stores notes about ATS testing methods and repo decisions.

## Planning Docs

- `docs/roadmap.md`: staged roadmap from local foundation through future integration.
- `docs/resume-quality-criteria.md`: criteria list for parseability, ATS safety, evidence quality, keyword coverage, and post-tailoring regressions.
- `docs/hunt-c2-integration-notes.md`: notes on how Resume Cooker can later run before and after Hunt C2/Fletcher.
- `docs/evaluation-suites.md`: planned separation between local-only checks, optional API checks, and full checks.
- `docs/ats-testing-methods.md`: practical ATS testing approaches.
- `docs/tester-sources.md`: provenance for copied tester snapshots.

## Current State

The repo now preserves sample resume content, tester projects, and a lightweight generator/preview workflow without redesigning the LaTeX.

Current implementation focus:

1. Keep Stage 1 local foundation healthy: preview behavior, root formatting, linting, tests, lightweight CI, and docs.
2. Expand deterministic local checks for source quality, PDF text layers, JD matching, and post-tailoring regressions.
3. Keep external API/model review explicit opt-in because resume and JD content may be private.

## Requirements

Works on Linux, macOS, and Windows.

- **Node.js 22+ and npm**: required for all `npm` scripts, tests, and deterministic checks.
- **Optional, only for PDF generation and PDF-based checks** (`build:pdf`, `check:local:ats`,
  `check:testers`): a TeX engine plus Poppler tools. On Debian/Ubuntu:
  ```bash
  sudo apt install texlive-latex-base texlive-latex-extra latexmk poppler-utils
  ```
  On macOS: `brew install --cask mactex-no-gui` (or `basictex`) and `brew install poppler`.
  `npm run check:tools` reports which engines are present; the non-PDF checks and the
  test suite run without any TeX tooling.

## Quick Commands

```bash
npm ci
npm run check:tools
npm run format:check
npm run lint
npm test
npm run ci
npm run check:local
npm run check:local:ats
npm run check:api
npm run check:full
npm run check:testers
npm run compare
npm run build:pdf
npm run build:pdf:ats
npm run preview
```

## Stage 1 Local Foundation

Stage 1 keeps the repo locally usable and CI-checkable before adding ATS scoring, text
extraction, job-description matching, or tester wrappers.

- `npm run preview` starts the local browser preview and builds a temporary PDF under
  `.runtime/preview/`.
- `npm run build:pdf` is the intentional saved-PDF command and writes to `resume/output/`.
- `npm run build:pdf:ats` builds the single-column ATS-safe source at `resume/source/ats.tex`.
- `npm run check:tools` prints available local tools and whether Docker is usable. It is a probe,
  so missing TeX tools do not fail the command unless you pass `-- --require-pdf-engine`.
- `npm run format`, `npm run format:check`, `npm run lint`, and `npm test` cover root-owned
  project files and generator code.
- `npm run ci` runs the lightweight root checks used by GitHub Actions.
- Vendored tester snapshots under `testers/` are excluded from default root formatting, linting,
  tests, and CI until later stages wrap them intentionally.

Generated files stay out of Git: saved PDFs belong under `resume/output/`, and preview artifacts
belong under `.runtime/preview/`.

## Staged Checks

The staged commands produce stable reports under `.runtime/reports/` by default:

- `npm run check:local` runs deterministic local preflight checks against the current source and
  sample JD.
- `npm run check:local:ats` builds and checks the ATS-safe variant, including the one-page hard
  gate when a PDF is produced.
- `npm run check:api` runs only when API review is explicitly enabled; otherwise it reports that
  content stayed local.
- `npm run check:full` combines local and API reports.
- `npm run check:testers` explicitly attempts tester integrations and writes normalized skip/pass
  results. Tester dependencies are not installed by default, so missing tools report warnings
  instead of running in CI.
- `npm run compare` runs postflight regression checks against a before/after resume pair.

Reports are written under `.runtime/reports/` by default and stay private/ignored. The stable status
values are `pass`, `pass_with_warnings`, and `fail`.

API review requires both the API suite and explicit environment configuration. Supported providers:

```bash
RESUME_COOKER_ALLOW_API=true OPENROUTER_API_KEY=... npm run check:api
RESUME_COOKER_ALLOW_API=true RESUME_COOKER_API_PROVIDER=anthropic ANTHROPIC_API_KEY=... npm run check:api
```

Optional API settings:

- `RESUME_COOKER_API_PROVIDER`: defaults to `openrouter` when API review is explicitly enabled.
- `RESUME_COOKER_API_MODEL`: provider model name.
- `RESUME_COOKER_API_TIMEOUT_MS`: request timeout in milliseconds.
- `RESUME_COOKER_API_MAX_INPUT_CHARS`: privacy/cost guardrail; defaults to `24000`.
- `RESUME_COOKER_API_MAX_TOKENS`: provider output cap; defaults to `1024`.
- `OPENROUTER_SITE_URL` and `OPENROUTER_SITE_NAME`: optional OpenRouter app attribution headers.

Current non-blockers that remain warning-level until later answers are final:

- Exact contact-value validation versus parseable contact-field validation in every report context.
- Full tester apps require their own dependency installation before `npm run check:testers` can run
  more than smoke/parser checks.
