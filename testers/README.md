# Testers

This folder contains local snapshots of the ATS/resume testing tools that were previously collected under `resume-ats-tools`.

Copied tool snapshots:

- `ATS-Checker`
- `ats-screener`
- `Resume-Matcher`
- `ResumeParser`

See `manifest.json` for the machine-readable tool inventory.

The copies intentionally exclude nested `.git` directories, virtual environments, dependency folders, caches, and build outputs. Source files and local working changes are preserved where they existed.

## Current Tester Roles

| Tool | Role In Resume Cooker |
| --- | --- |
| `ATS-Checker` | Simple parser/scorer reference implementation. Useful for quick smoke checks. |
| `ats-screener` | Richer local ATS scoring engine and platform-oriented scoring ideas. Includes the local `scripts/score-local.ts` change copied from the previous workspace. |
| `Resume-Matcher` | Resume/JD matching and parser/comparison reference app. Useful for ideas and possible parser comparison. |
| `ResumeParser` | Python resume parser reference. Useful for extracting structured fields from PDFs/text. |

## Dependency Policy

Dependencies are intentionally not committed. Install them inside each tester only when working on that tester.

Keep excluding:

- `.git`
- `node_modules`
- `.venv` / `venv`
- caches
- generated build output

## Future Orchestration

Resume Cooker should eventually wrap these tools from a top-level command instead of requiring manual navigation into each folder. The wrapper should normalize output into the report format described in `docs/resume-quality-criteria.md`.
