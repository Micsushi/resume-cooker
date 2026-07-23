# Linux Compatibility Notes

Audit date: 2026-07-03

## Status

Mostly compatible. Node tests pass in a Linux container. PDF generation needs TeX/Poppler tools on the host or Docker access inside the runtime environment.

**Evidence status:** results below describe the dated 2026-07-03/04 audit. They do not prove current
repository-wide formatting or a real Linux PDF path. Package-level Linux capability smoke belongs to
RC-001.4; macOS is the required Stage 2 artifact host under RC-002.1.

## What Was Tested

Disposable Node 22 Docker test:

```bash
npm ci
npm test
npm run check:tools
```

Result:

- 40 tests passed.
- `check:tools` ran.
- In the container, Node and npm were available.
- TeX engines and Poppler tools were not available.
- Docker was not available inside that container.

Host caveat: Node and npm are not installed on this Ubuntu machine.

## What Should Work On Linux

- Root tests.
- Local deterministic checks that do not require PDF generation.
- Preview/build scripts after Node install.
- API checks when explicitly enabled with API keys.

## Changes Made (2026-07-04)

- **Code fix:** `checker/scripts/tester-runner.mjs` now detects the POSIX virtualenv
  interpreter (`.venv/bin/python`) as well as the Windows one
  (`.venv/Scripts/python.exe`), falling back to global `python`/`python3`.
- **Docs:** README now has a Requirements section documenting Node 22+ and the
  optional TeX/Poppler tooling for PDF steps (`apt install texlive-* latexmk
poppler-utils`, or `mactex`/`poppler` on macOS).

Verified on Linux (node:22 container): `npm ci`, `npm run format:check`,
`npm run lint`, `npm test` (**40 passed**), and `npm run check:tools` all succeed.

## Remaining (environmental, not code)

- PDF build still needs a TeX engine (`latexmk`/`pdflatex`) or Docker with a TeX image.
- PDF text/page checks still need Poppler (`pdftotext`, `pdfinfo`).
  These are optional host tools; the test suite and non-PDF checks run without them.

## Suggested Ubuntu Smoke Path

```bash
npm ci
npm test
npm run check:tools
npm run check:local
```

Run `npm run build:pdf` only after a PDF engine is present.

When testing PDF behavior, also require usable extraction/page tools and run
`npm run check:local:ats`. Missing optional tools remain acceptable for ordinary root tests; strict
release validation treats missing required page/ATS-Checker capability as exit `69`.
