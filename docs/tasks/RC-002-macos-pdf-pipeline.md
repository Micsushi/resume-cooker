# RC-002: End-To-End macOS PDF Pipeline

**Planning level:** Epic. Execute through these bounded work packages:

- [RC-002.1](RC-002.1-macos-runtime.md): establish one reproducible macOS runtime.
- [RC-002.2](RC-002.2-ats-pdf-pipeline.md): prove build, page, extraction, and parser path.
- [RC-002.3](RC-002.3-preview-and-artifact-smoke.md): prove preview and artifact separation.

Current evidence: Node-only scaffolds exist; complete macOS artifact evidence is not current. Treat
epic as blocked on RC-001 and a usable host runtime.

## Objective

Establish and document one repeatable macOS path that builds the ATS-safe PDF, extracts its text,
counts pages, serves a preview, and produces complete local-check evidence without committing
private or generated artifacts.

## Why This Exists

Node-only checks cannot prove that TeX, PDF extraction, page counting, browser preview, and parser
integration work together on macOS. At least one complete native or Docker-backed artifact path must
be demonstrated separately from the lightweight root gate.

Keep the currently installed tools, daemon state, and latest smoke results in the private project
handoff.

## Current Implementation Surface

- `resume/source/current.tex`: visual/current source with known ATS layout warnings.
- `resume/source/ats.tex`: single-column ATS-safe variant.
- `generator/scripts/build-lib.mjs`: native and Docker PDF builds.
- `generator/scripts/preview-server.mjs`: temporary preview under `.runtime/preview`.
- `checker/scripts/text-layer.mjs`: Poppler or Docker extraction and page counting.
- `checker/scripts/check.mjs`: local build, extraction, page, parser, and JD pipeline.
- `package.json`: `build:pdf`, `build:pdf:ats`, `preview`, and `check:local:ats`.
- `MACOS_COMPATIBILITY.md`: host setup guidance.

## Scope

### In Scope

- Choose and prove at least one supported macOS runtime:
  - native TeX plus Poppler; or
  - Docker Desktop with the existing container fallbacks.
- Verify the ATS source compiles.
- Verify a one-page result or record a real page-limit failure.
- Extract text and inspect all deterministic text-layer checks.
- Run ATS-Checker parser agreement when its Python requirements permit.
- Start the preview server, verify status and PDF endpoints, and stop it cleanly.
- Verify saved outputs and preview outputs remain separate.
- Improve setup or troubleshooting docs based on observed failures.
- Record tool versions and container image identifiers used by the smoke run.

### Out Of Scope

- Editing resume claims or private content.
- Redesigning the LaTeX layout unless compilation itself is broken by a repository defect.
- Installing every tester dependency; that belongs to RC-003.
- Pinning container images; document observed tags and open a follow-up if reproducibility requires
  a pin.
- Adding TeX or private PDF artifacts to GitHub Actions.

## Dependencies

### Blocked By

- RC-001, because automatic engine and Docker readiness must be truthful.
- One usable runtime:
  - Docker daemon running; or
  - native TeX installed.
- Text/page validation additionally needs native Poppler or usable Docker.

### Blocks

- RC-003: most tester tools require a real PDF or extracted text.
- PDF-dependent acceptance in RC-004.
- RC-009 preview and compile behavior.
- Confidence in the full local preflight path.

## Runtime Choice

The contributor must record which path was chosen and why.

### Native Path

Expected components:

- `latexmk` or `pdflatex` from MacTeX/BasicTeX.
- `pdftotext` and `pdfinfo` from Poppler.

Advantages: faster repeated builds, no daemon dependency. Risks: larger install, package drift, shell
`PATH` differences between terminal and GUI apps.

### Docker Path

Expected components:

- Docker CLI and reachable Docker Desktop daemon.
- Existing `texlive/texlive` and `minidocks/poppler` images.

Advantages: fewer native packages. Risks: first-run downloads, unpinned image drift, daemon startup,
filesystem sharing, Apple Silicon compatibility, and slower builds.

Proving one path completes this task. Proving both is preferred but not required.

## Implementation And Verification Slices

1. Record baseline versions and capability output.
2. Build `resume/source/ats.tex` into ignored `resume/output/ats.pdf`.
3. Confirm the build command verifies the expected PDF exists and is non-empty.
4. Run `check:local:ats` and inspect every check in the JSON report.
5. Confirm extracted text exists, is non-empty, and contains ordered standard sections.
6. Confirm all configured critical terms are either present or produce intentional, explained
   warnings.
7. Confirm page count is available and the one-page hard gate behaves as documented.
8. Start preview against the ATS source on an unused local port.
9. Verify `/api/status`, `/api/source`, `/api/compile`, and `/preview.pdf` behavior.
10. Stop preview and confirm no stale server remains.
11. Remove or retain ignored artifacts intentionally; never stage them.
12. Update `MACOS_COMPATIBILITY.md` with exact tested paths and troubleshooting.

## Acceptance Criteria

- `npm run check:tools` accurately reports the selected toolchain.
- `npm run build:pdf:ats` exits zero and creates a non-empty ignored PDF.
- `npm run check:local:ats` writes a JSON report rather than terminating on an unclassified tool
  error.
- PDF page count is known.
- The one-page gate matches the resolved RC-006 contract.
- Extracted text is non-empty and its standard sections appear in readable order.
- Encoding-noise check does not find Unicode replacement characters, or the task documents and
  fixes the source/tool defect.
- Preview serves a current PDF and reports build failures through `/api/status`.
- Saved PDF lives under `resume/output/`; preview PDF lives under `.runtime/preview`.
- `git status` shows no generated PDF, extracted text, logs, or runtime reports.
- macOS instructions are sufficient for a second contributor to reproduce the smoke path.

## Manual Inspection Checklist

- PDF opens and displays one complete resume.
- Text is selectable.
- Copy/paste reading order matches visible order.
- Name and contact line are readable without exposing their values in the handoff.
- Education, experience, projects, and skills remain grouped correctly.
- Dates stay attached to the correct entry.
- Links render and extract meaningfully.
- No clipped text, missing glyphs, blank pages, or overlapping sections.

## Verification Commands

```bash
npm run check:tools
npm run build:pdf:ats
npm run check:local:ats
npm run check:testers
npm run preview -- --source resume/source/ats.tex
npm run ci
git status --short
```

Use `curl` or a browser to inspect preview endpoints. Do not leave the preview process running after
handoff.

## Expected Artifacts

All must remain ignored:

- `resume/output/ats.pdf`
- `resume/output/ats.txt`
- `.runtime/reports/local-ats-check.json`
- `.runtime/preview/ats.pdf` or the preview server's chosen job name
- TeX auxiliary files, if any

## Failure Modes To Guard

- Docker is selected while its daemon is stopped.
- Container volume mounts fail because the repository is not shared.
- Apple Silicon pulls an incompatible image.
- BasicTeX lacks a package used by the source.
- GUI-launched processes cannot find Homebrew or TeX paths.
- Preview says the build succeeded but serves a stale or missing PDF.
- Page counting silently warns when the acceptance path requires a hard result.
- Generated personal artifacts appear in Git status.

## Handoff Evidence

- Selected runtime and exact versions.
- Full command result summary.
- Report status and check counts without private values.
- Page count and extraction tool.
- Preview endpoint results.
- Paths of ignored artifacts.
- Any untested alternative runtime.
