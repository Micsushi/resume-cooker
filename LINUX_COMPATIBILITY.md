# Linux Compatibility Notes

Audit date: 2026-07-03

## Status

Mostly compatible. Node tests pass in a Linux container. PDF generation needs TeX/Poppler tools on the host or Docker access inside the runtime environment.

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

## Linux Blockers

- Host needs Node 22+ and npm.
- PDF build needs one of:
  - `latexmk`
  - `pdflatex`
  - Docker with a TeX image
- PDF text/page checks need Poppler tools such as `pdftotext` and `pdfinfo`.
- Tester runner currently checks Windows `.venv/Scripts/python.exe` before global Python; it should also check `.venv/bin/python`.

## Likely Changes Needed

- Add Ubuntu quickstart docs:

```bash
npm ci
npm test
npm run check:tools
```

- Document optional PDF tooling:

```bash
sudo apt install texlive-latex-base texlive-latex-extra latexmk poppler-utils
```

- Update tester runner to detect Linux virtualenv Python at:

```text
testers/ResumeParser/.venv/bin/python
```

## Suggested Ubuntu Smoke Path

```bash
npm ci
npm test
npm run check:tools
npm run check:local
```

Run `npm run build:pdf` only after a PDF engine is present.
