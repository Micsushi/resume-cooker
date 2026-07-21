# Generator

Local resume build and preview workflow.

## Commands

From the repo root:

```bash
npm run check:tools
npm run format:check
npm run lint
npm test
npm run ci
npm run build:pdf
npm run preview
```

`npm run check:tools` is nonfatal by default and prints what is available on the machine. Docker is
reported as usable only when the daemon responds. To make missing PDF build engines fail
explicitly, run:

```bash
npm run check:tools -- --require-pdf-engine
```

## PDF Build

`npm run build:pdf` compiles `resume/source/current.tex` into `resume/output/current.pdf`.

The build helper tries these engines:

1. `latexmk`
2. `pdflatex`
3. Docker with `texlive/texlive`

You can choose explicitly:

```bash
npm run build:pdf -- --engine latexmk
npm run build:pdf -- --engine pdflatex
npm run build:pdf -- --engine docker
```

You can also point at a different source or output folder:

```bash
npm run build:pdf -- --source resume/source/current.tex --out-dir resume/output
```

## Preview

`npm run preview` starts a local browser preview at:

```text
http://127.0.0.1:4177
```

The preview server:

- reads the LaTeX source
- compiles a temporary PDF into `.runtime/preview`
- serves that PDF in an iframe
- watches the source timestamp and rebuilds when it changes
- keeps preview artifacts out of Git

This still creates a temporary PDF because browsers need a rendered artifact to display. The important difference is that the PDF is not treated as a saved resume output and is not committed.

## Root Checks

Stage 1 root checks are deliberately small:

- Prettier checks root-owned docs, JSON, YAML, HTML, and JavaScript.
- ESLint checks root-owned JavaScript and ESM scripts.
- Node's built-in test runner executes focused generator tests under `generator/scripts/`.
- `testers/` is treated as vendored reference material and is not included in default root checks.

GitHub Actions runs `npm ci` and `npm run ci` on pushes and pull requests to `main`. It does not
install TeX, build private PDFs, or upload PDF/log artifacts.

## Toolchain Notes

This repo currently does not vendor a TeX distribution. Install one of:

- TeX Live or MiKTeX with `latexmk`
- a minimal `pdflatex` setup that supports the resume packages
- Docker with the daemon running, so the generator can use the `texlive/texlive` image

The current Docker image tags are not pinned. Reproducibility and macOS end-to-end verification are
tracked in [`RC-002`](../docs/tasks/RC-002-macos-pdf-pipeline.md); truthful Docker readiness is
tracked in [`RC-001`](../docs/tasks/RC-001-toolchain-detection.md).
