# Resume Cooker Roadmap

Resume Cooker is a standalone local resume build and quality system. It makes source and generated
artifacts reproducible, checks them before and after tailoring, exposes a versioned process boundary,
and later supports Hunt/Fletcher and a local editing UI.

This roadmap defines product checkpoints. [`docs/tasks/README.md`](tasks/README.md) defines 46 bounded
execution packages. [`docs/product-decisions.md`](product-decisions.md) defines accepted contracts.
Current assignments, host state, and latest verification remain in private handoff.

## Capability Labels

- **Implemented:** code exists and current acceptance evidence is available.
- **Partial:** useful code or tests exist, but package/stage exit evidence is incomplete.
- **Planned:** accepted task contract exists; implementation is not complete.
- **Deferred:** excluded with explicit revisit condition.

## Current Snapshot

- Root lint and 40 unit tests pass on the current Windows host.
- Root CI is not healthy because committed documentation currently fails Prettier.
- Tool inventory sees Docker CLI but marks its daemon unusable.
- Local check still attempts Docker in one path and fails, confirming RC-001 remains partial.
- ATS-safe source, local/API report scaffolds, tester wrappers, and basic comparison exist.
- No complete macOS artifact proof, packaged CLI, Hunt integration, or product editing UI exists.

Historical “feature complete” commit messages do not override package acceptance evidence.

## Stage 1: Foundation Healthy

### Goal

Make root tooling, capability detection, build selection, preview scaffold, tests, and lightweight CI
truthful and reproducible.

### Entry Conditions

- Node.js 22+ and npm available.
- Public sample source present.
- No PDF runtime required for deterministic unit slices.

### Contributing Packages

- RC-001.1 through RC-001.4.
- Existing generator, preview, formatting, lint, unit-test, and CI scaffolds.

### Exit Evidence

- Root format check, lint, and unit tests pass.
- Docker installed-but-unusable and healthy cases are classified correctly.
- Automatic build/extraction paths never select known unusable capability.
- Preview stays temporary; intentional builds verify saved artifacts.
- Missing optional tools do not fail lightweight CI; strict requirements fail clearly.

### Current State

**Partial.** Scaffold exists and tests/lint pass. Formatting and capability-consumption defects prevent
stage completion.

## Stage 2: PDF Pipeline Proven

### Goal

Prove a real ATS-safe PDF can be built, counted, extracted, parsed, previewed, and cleaned without
tracking private/generated artifacts.

### Entry Conditions

- Stage 1 capability contracts complete.
- macOS host with either native TeX/Poppler or usable Docker runtime.

### Contributing Packages

- RC-002.1 through RC-002.3.
- RC-003.2 for strict independent parser evidence.

### Exit Evidence

- Reproducible macOS runtime and versions recorded.
- Public ATS source builds a non-empty PDF.
- Page count known and D2 one-page policy applied.
- Extracted text non-empty, ordered, readable, and free of encoding corruption.
- ATS-Checker actually executes for strict proof.
- Preview success/failure/current/stale behavior verified; server stops cleanly.
- Saved and temporary artifacts remain separate and ignored.

### Current State

**Partial and externally blocked.** Build/text/preview code exists. Current host lacks a usable PDF
runtime, and no complete macOS smoke evidence is current.

## Stage 3: Evaluation Credible

### Goal

Produce reliable deterministic preflight and postflight evidence, independent parser/tester results,
and optional advisory model review.

### Entry Conditions

- Public fixtures for source, JD, PDF, and before/after comparisons.
- Stage 2 artifact path for real PDF checks.
- Accepted D1-D6 contracts.

### Contributing Packages

- RC-003.1 through RC-003.6.
- RC-004.1 through RC-004.6.
- RC-005.1 through RC-005.4 for optional provider readiness.
- RC-006.1 through RC-006.3.

### Exit Evidence

- Normal and strict tester profiles distinguish execution, skip, failure, and capability absence.
- Immutable fact regressions, protected-strength loss, ungrounded additions, and PDF/text regressions
  have passing and failing public fixtures.
- Postflight reports use schema v1, sanitized evidence, and D7-compatible status/exit behavior.
- Local checks remain fully useful without provider credentials.
- Any provider called live has explicit authorization, bounded spend, synthetic inputs, and sanitized
  readiness evidence.

### Current State

**Partial.** Deterministic preflight, API adapters/mocks, tester scaffolds, and narrow contact/term
comparison exist. Full tester executions, normalized facts, actual postflight PDF inspection, and live
provider readiness are incomplete.

## Stage 4: Stable Product Boundary

### Goal

Expose versioned CLI/report behavior, integrate it around Hunt/Fletcher, and build a secure local
editing/review UI without duplicating backend policy.

### Entry Conditions

- Stage 3 report contracts complete.
- Accepted D7/D8 contracts.
- Hunt repository available for evidence-based inventory.

### Contributing Packages

- RC-007.1 through RC-007.6.
- RC-008.1 through RC-008.6.
- RC-009.1 through RC-009.8.

### Exit Evidence

- Fresh checkout invokes packaged CLI with versioned schema, stable streams, and exits.
- Hunt runs preflight before Fletcher and postflight before C3 readiness through process boundary.
- Overrides are explicit/audited; Resume Cooker and Fletcher flags remain namespaced.
- Enabled, failure, unavailable, override, disabled, and rollback paths have end-to-end fixtures.
- Local UI safely edits approved raw LaTeX, handles conflicts/races/cancellation, shows findings and
  privacy state, and separates preview from saved output.
- Browser security, accessibility, lifecycle, and platform evidence passes.

### Current State

**Planned.** npm scripts and preview page are useful scaffolds. Packaged CLI, Hunt coordination, and
product editing UI are not implemented.

## Recommended Execution Order

1. Restore formatting gate while implementing RC-006.1/RC-006.2 documentation alignment.
2. Complete RC-001.1 through RC-001.3; run RC-001.4 when a usable runtime exists.
3. Prove RC-002 and ATS-Checker path.
4. Build postflight facts/regression packages and tester profiles in parallel where dependencies
   allow.
5. Freeze and package CLI.
6. Inventory/integrate Hunt and build UI as separate consumers of the stable boundary.
7. Validate live APIs only with explicit authorization; never block local-only critical path on them.

## Deferred Beyond v1

- Cloud hosting, accounts, sync, and collaboration.
- Structured resume authoring or automatic claim rewriting.
- Native desktop packaging.
- Default or mandatory API review.
- Root installation of all third-party tester dependencies.
- npm publication without separate authorization and release plan.
