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
| `ATS-Checker` | First complete integration; required only for strict release validation. |
| `ResumeParser` | Second integration; sanitized structured-presence evidence. |
| `ats-screener` | Third integration; isolated local JD/component scoring only. |
| `Resume-Matcher` | Optional until RC-003.5 proves one useful bounded local operation. |

## Dependency Policy

Dependencies are intentionally not committed. Install them inside each tester only when working on that tester.

Keep excluding:

- `.git`
- `node_modules`
- `.venv` / `venv`
- caches
- generated build output

## Top-Level Orchestration

Run tester integrations from the repo root with:

```bash
npm run check:testers
```

The wrapper normalizes output into the report format described in
`docs/resume-quality-criteria.md`. Tester dependencies are intentionally not installed by default;
missing dependencies or missing PDFs/text files report warnings instead of joining default CI.

Normal profile treats every adapter as optional. Strict release profile requires ATS-Checker to
execute; unavailable required capability exits `69`. Skips retain stable IDs and reasons and never
appear as passes. See [D5](../docs/product-decisions.md#d5-tester-priority-and-requiredness) and
[RC-003.1 through RC-003.6](../docs/tasks/README.md#rc-003-tester-integrations).
