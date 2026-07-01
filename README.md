# Resume Cooker

Private source-of-truth repo for Michael Shi's resume, local PDF generation, and ATS parsing experiments.

## Layout

- `resume/source/` stores the current LaTeX resume source.
- `resume/output/` is reserved for generated PDFs and extracted text outputs.
- `generator/` is reserved for the future local LaTeX-to-PDF build workflow.
- `testers/` stores local snapshots of ATS/resume testing tools.
- `fixtures/` stores sample job descriptions and extracted resume text used for tests.
- `docs/` stores notes about ATS testing methods and repo decisions.

## Current State

This first commit intentionally preserves the current resume content and tester projects without redesigning the LaTeX or wiring up a generator yet. The next good steps are:

1. Add a reproducible local PDF build command.
2. Add an ATS-safe LaTeX variant.
3. Add scripted text extraction checks.
4. Compare parser output across the tools in `testers/`.
