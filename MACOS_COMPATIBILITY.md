# macOS Compatibility Notes

Audit date: 2026-07-03

## Status

Likely compatible. The root Node scripts are mostly platform-neutral, and PDF generation can use native TeX tools or Docker on macOS.

This was audited from Ubuntu, so no native macOS run was executed.

## What Was Checked

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

## macOS Blockers

- Host needs Node 22+ and npm.
- PDF build needs one of:
  - `latexmk`
  - `pdflatex`
  - Docker with `texlive/texlive`
- PDF text/page checks need Poppler tools:
  - `pdftotext`
  - `pdfinfo`
- Tester runner should detect POSIX venv paths like `.venv/bin/python`.

## Likely Changes Needed

- Add macOS quickstart:

```bash
npm ci
npm test
npm run check:tools
```

- Document optional Homebrew tools:

```bash
brew install --cask mactex-no-gui
brew install poppler
```

or a lighter BasicTeX path if preferred.

- Update tester runner to detect:

```text
testers/ResumeParser/.venv/bin/python
```

## Suggested macOS Smoke Path

```bash
npm ci
npm test
npm run check:tools
npm run check:local
```

Run `npm run build:pdf` only after TeX or Docker is available.
