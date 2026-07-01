# Resume Cooker

Private source-of-truth repo for Michael Shi's resume, local PDF generation, and ATS parsing experiments.

## Layout

- `resume/source/` stores the current LaTeX resume source.
- `resume/output/` is reserved for generated PDFs and extracted text outputs.
- `generator/` stores the local LaTeX-to-PDF build and preview workflow.
- `testers/` stores local snapshots of ATS/resume testing tools.
- `fixtures/` stores sample job descriptions and extracted resume text used for tests.
- `docs/` stores notes about ATS testing methods and repo decisions.

## Planning Docs

- `docs/roadmap.md`: staged implementation plan from source-control baseline through Hunt integration.
- `docs/resume-quality-criteria.md`: criteria list for parseability, ATS safety, evidence quality, keyword coverage, and post-tailoring regressions.
- `docs/hunt-c2-integration-notes.md`: notes on how Resume Cooker can later run before and after Hunt C2/Fletcher.
- `docs/evaluation-suites.md`: planned separation between local-only checks, optional API checks, and full checks.
- `docs/ats-testing-methods.md`: practical ATS testing approaches.
- `docs/tester-sources.md`: provenance for copied tester snapshots.

## Current State

The repo now preserves the current resume content, tester projects, and a lightweight generator/preview scaffold without redesigning the LaTeX. The next good steps are:

1. Install or pin the LaTeX build toolchain.
2. Add an ATS-safe LaTeX variant.
3. Add scripted text extraction checks.
4. Compare parser output across the tools in `testers/`.

## Quick Commands

```bash
npm run check:tools
npm run build:pdf
npm run preview
```
