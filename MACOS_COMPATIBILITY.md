# macOS Compatibility Notes

Audit date: 2026-07-04

## Status

Compatible for root Node scripts on macOS. PDF generation can use native TeX
tools or Docker on macOS.

## What Was Checked

- Native macOS root Node checks.
- Static scan of PDF build scripts and tool detection.
- Linux audit ran Node 22 container checks:
  - `npm ci`
  - `npm test`
  - `npm run check:tools`
- Result from that audit: 40 tests passed.

## What Should Work On macOS

- Root tests after Node/npm install.
- Local deterministic checks that do not require PDF generation.
- PDF generation with MacTeX/BasicTeX or Docker.
- Poppler-backed text extraction after installing Poppler.

## Changes Made (2026-07-04)

- **Code fix:** the tester runner (`checker/scripts/tester-runner.mjs`) now detects
  the POSIX virtualenv interpreter `.venv/bin/python` (used on macOS and Linux) in
  addition to the Windows path. Native root checks pass; a real ResumeParser run still
  requires its optional environment and a generated PDF.
- **Docs:** README Requirements section documents Node 22+ and the optional
  Homebrew TeX/Poppler tooling (`brew install --cask mactex-no-gui`,
  `brew install poppler`).

## Remaining (environmental, not code)

- Host needs Node 22+ and npm.
- PDF build needs `latexmk`/`pdflatex` (MacTeX/BasicTeX) or Docker with `texlive/texlive`.
- PDF text/page checks need Poppler (`pdftotext`, `pdfinfo`).
- Native macOS root checks passed in this audit. PDF checks still depend on the
  optional host tools above.

## Suggested macOS Smoke Path

```bash
npm ci
npm test
npm run check:tools
npm run check:local
```

Run `npm run build:pdf` only after TeX or Docker is available.
