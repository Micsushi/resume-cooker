# RC-007: Package The Standalone CLI

## Objective

Expose Resume Cooker's stable behavior through one documented command-line interface that works
from a fresh checkout or package install, emits machine-consumable results, uses predictable exit
codes, and does not require callers to know internal script paths.

## Current State

The repository exposes npm scripts and internal ESM entrypoints:

- local, API, and full preflight checks;
- postflight comparison;
- PDF build and preview;
- tester execution;
- tool inventory.

Reports already use `pass`, `pass_with_warnings`, and `fail`, but there is no packaged
`resume-cooker` binary. Argument parsing is minimal, validation is distributed, human console
output and machine output are not yet a formal compatibility contract, and report schemas are not
versioned.

## Scope

### In Scope

- Add a package binary entrypoint.
- Define stable subcommands and options.
- Validate required inputs before doing work.
- Normalize paths across Windows, Linux, and macOS.
- Define stdout, stderr, JSON, report-file, and exit-code behavior.
- Add schema version metadata to reports or document a deliberate alternative.
- Preserve explicit API consent and private artifact rules.
- Add command-level tests with public fixtures.
- Document source-checkout and package-consumer usage.
- Keep existing npm scripts as thin aliases where useful.

### Out Of Scope

- Publishing to npm unless separately authorized.
- Hunt-specific imports or database access.
- Building the local UI.
- Bundling TeX, Poppler, Docker, or tester dependencies.
- Changing comparison behavior beyond what RC-004 defines.

## Dependencies

### Blocked By

- RC-001 for truthful tool readiness and stable capability failures.
- RC-004 for complete postflight inputs and outcomes.
- RC-006 for command names, schema, warnings, exit codes, and compatibility policy.

### Blocks

- RC-008 Hunt/Fletcher integration.
- RC-009 UI backend boundary.
- External use without repository-internal knowledge.

## Proposed Command Surface

Exact names require RC-006 approval. A candidate surface is:

```text
resume-cooker tools
resume-cooker build --resume <path> [--out-dir <path>] [--engine <name>]
resume-cooker preview --resume <path> [--port <number>]
resume-cooker check --suite local|api|full --resume <path> [--pdf <path>] [--jd <path>]
resume-cooker compare --before <path> --after <path> [--pdf <path>] [--jd <path>]
resume-cooker testers --pdf <path> --text <path> [--jd <path>] [--tool <list>]
```

Every command should support help and version output. Commands producing reports should support an
explicit output path and a machine-readable stdout mode.

## Contract Requirements

### Input Validation

- Required paths exist and have supported extensions.
- Input and output paths are resolved predictably.
- Invalid numeric limits fail before work starts.
- API suite requires explicit opt-in even when a key exists.
- Output directories are created only after validation.

### Output Streams

- Machine JSON mode writes only JSON to stdout.
- Human progress and diagnostics go to stderr when JSON mode is active.
- Secrets and raw private content never appear in either stream.
- Report-file output and stdout report describe the same run.

### Exit Codes

RC-006 must approve exact numbers. At minimum distinguish:

- successful pass;
- successful execution with findings/warnings, if warnings are nonzero by policy;
- quality-gate fail;
- invalid usage or missing required input;
- unavailable required capability;
- internal/unexpected error.

Avoid forcing shell callers to parse prose.

### Report Versioning

- Include a schema version.
- Define required and optional fields.
- Preserve stable check IDs.
- Document additive versus breaking changes.
- Do not expose machine-local absolute paths unless the contract explicitly allows them.

## Implementation Slices

1. Define CLI and report contract in docs and fixtures.
2. Add a thin dispatcher around existing modules.
3. Replace or wrap minimal argument parsing with validated subcommand parsing.
4. Add global JSON, output, help, and version behavior.
5. Normalize errors into stable categories and exit codes.
6. Add end-to-end command tests using injected tool runners where possible.
7. Add package binary metadata and verify fresh-checkout invocation.
8. Convert npm scripts to call the stable entrypoint or retain compatibility wrappers.
9. Update README and Hunt integration examples.

## Acceptance Criteria

- A fresh `npm ci` checkout can invoke the CLI without global installation.
- Help describes every stable subcommand and privacy-sensitive option.
- Local check, API-safe check, full check, compare, build, tools, and tester commands map to existing
  behavior.
- Invalid input returns a documented nonzero exit before external work.
- Machine mode emits parseable JSON only.
- Reports include schema version and stable status.
- External API calls remain impossible without explicit opt-in.
- Paths work on Windows, Linux, and macOS unit or smoke environments.
- Existing npm commands remain functional or have documented migration.
- No optional tool becomes a mandatory root install.
- Package contents exclude private/runtime/generated artifacts.

## Test Matrix

- Help and version.
- Unknown command and option.
- Missing required path.
- Unsupported extension.
- Local check pass/warnings/fail fixture.
- API disabled with key present.
- Compare pass and fact-regression fail.
- Required PDF engine unavailable.
- JSON stdout parsing.
- Report output path creation.
- Windows-style and POSIX path handling.
- Signal/interrupt cleanup for preview or child processes.

## Verification Commands

```bash
npm ci
npx resume-cooker --help
npx resume-cooker tools --json
npx resume-cooker check --suite local --resume resume/source/current.tex --jd fixtures/software_engineering_intern_jd.txt --out .runtime/reports/cli-local.json --json
npx resume-cooker compare --before <public-before-fixture> --after <public-after-fixture> --json
npm run ci
npm pack --dry-run
```

The actual invocation may use `npm exec` or `node` until package metadata is finalized. Verify the
same documented path a downstream consumer will use.

## Failure Modes To Guard

- Human logs corrupt JSON stdout.
- Warning exit semantics surprise shell callers.
- CLI resolves paths relative to an internal module instead of caller working directory.
- API keys trigger calls without explicit consent.
- Absolute local paths become persistent cross-machine contract data.
- Package includes generated PDFs or `.runtime` reports.
- CLI duplicates core logic and drifts from npm scripts.
- Preview child process remains alive after interruption.

## Handoff Evidence

- Approved command and exit-code contract.
- Help output.
- Passing command-level matrix.
- Example versioned reports.
- `npm pack --dry-run` file list.
- Cross-platform evidence and untested platforms.
- Migration notes for existing npm scripts.
- Confirmation that RC-008 can consume the CLI without internal imports.
