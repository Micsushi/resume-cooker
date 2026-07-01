# Generator

Local resume build and preview workflow.

## Commands

From the repo root:

```bash
npm run check:tools
npm run build:pdf
npm run preview
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

## Toolchain Notes

This repo currently does not vendor a TeX distribution. Install one of:

- TeX Live or MiKTeX with `latexmk`
- a minimal `pdflatex` setup that supports the resume packages
- Docker, so the generator can use the `texlive/texlive` image

Future work can add a pinned Docker image or dev container for fully reproducible builds.
