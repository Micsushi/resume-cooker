# RC-006: Resolve Contracts And Align Documentation

**Planning level:** Documentation and contract epic. Execute through these bounded work packages:

- [RC-006.1](RC-006.1-publish-product-decisions.md): publish accepted D1-D8 decisions.
- [RC-006.2](RC-006.2-documentation-contract-audit.md): align public documentation.
- [RC-006.3](RC-006.3-release-dependency-gates.md): validate package and stage readiness gates.

Accepted contracts live in [`docs/product-decisions.md`](../product-decisions.md). Product selection
is complete; publication alignment and dependency validation remain.

## Objective

Publish the approved product and integration contracts, then make roadmap, README, compatibility,
task, tester, UI, and Hunt documentation describe the same current and planned behavior.

## Why This Exists

Implementation has advanced faster than some planning language. Examples:

- Code hard-fails PDFs over the page limit, while one Hunt integration section still says page
  limits warn for now.
- An ATS-safe source exists, but documentation still asks whether Resume Cooker should generate or
  merely verify an ATS-safe variant.
- `compare` accepts a PDF path in metadata but does not inspect it.
- Skip, warning, and hard-block policy for downstream Hunt/Fletcher was previously unresolved and is
  now fixed by D3/D5/D7.
- The tester priority and model-review scope remain open.

These are contract questions, not wording-only cleanup. Downstream tasks must not infer answers.

## Scope

### In Scope

- Publish every approved decision listed below.
- Record decision, rationale, consequences, implementation follow-ups, and revisit trigger.
- Update all public docs to match current implementation and chosen target behavior.
- Mark behavior as current, planned, or deferred explicitly.
- Define report and exit-code semantics used by RC-004, RC-007, and RC-008.
- Define privacy and artifact-handling invariants.
- Remove stale contradictions and ambiguous future tense.

### Out Of Scope

- Implementing the decisions beyond small documentation or naming corrections.
- Changing resume content.
- Building the CLI, Hunt integration, or UI.
- Selecting private infrastructure or credentials.

## Dependencies

### Blocked By

Product answers were approved 2026-07-22. Completion now depends on publishing the records, auditing
documentation, and validating downstream package gates.

### Blocks

- RC-004 comparison architecture and severity behavior.
- RC-007 CLI inputs, output schema, and exit codes.
- RC-008 preflight/postflight enforcement.
- RC-009 ownership of resume generation and edit behavior.
- Final tester and API scope claims.

## Accepted Decisions

- [D1](../product-decisions.md#d1-ats-variant-ownership): hybrid ATS ownership; caller source is
  authoritative.
- [D2](../product-decisions.md#d2-page-limit-severity): measurable ATS over-limit is a blocker;
  unavailable count differs between normal and strict profiles.
- [D3](../product-decisions.md#d3-pre-c2-enforcement): Hunt owns enforcement; fail blocks by default
  with audited override.
- [D4](../product-decisions.md#d4-postflight-inputs): structured facts, source preservation, and PDF
  artifact checks have explicit precedence.
- [D5](../product-decisions.md#d5-tester-priority-and-requiredness): ATS-Checker is first and strict-
  profile required; normal local tester dependencies remain optional.
- [D6](../product-decisions.md#d6-api-review-scope): OpenRouter/Anthropic review is explicit,
  bounded, advisory, and privacy-labeled.
- [D7](../product-decisions.md#d7-cli-and-report-compatibility): stable commands, schema versions,
  streams, and exit codes are fixed.
- [D8](../product-decisions.md#d8-ui-ownership-boundary): UI v1 edits approved raw-LaTeX files and
  does not own structured data or rewriting.

Decision history must remain in the public record. Changes require rationale, compatibility impact,
follow-up task IDs, and a revisit trigger; chat or private handoff alone is insufficient.

## Documentation Audit Matrix

At minimum, inspect and align:

- `README.md`
- `docs/roadmap.md`
- `docs/resume-quality-criteria.md`
- `docs/evaluation-suites.md`
- `docs/hunt-c2-integration-notes.md`
- `docs/ats-testing-methods.md`
- `generator/README.md`
- `MACOS_COMPATIBILITY.md`
- `LINUX_COMPATIBILITY.md`
- all task pages in `docs/tasks/`

For each behavior, use one of these labels:

- **Implemented:** code exists and has verification evidence.
- **Partially implemented:** scaffold exists but acceptance is incomplete.
- **Planned:** approved target with no complete implementation.
- **Deferred:** intentionally excluded for now.

## Acceptance Criteria

- All eight required decisions are accepted or explicitly deferred with a revisit trigger.
- Page-limit behavior is consistent across code-facing docs.
- ATS variant ownership is unambiguous.
- Pre-C2 and post-C2 enforcement responsibility is explicit.
- Compare input precedence is explicit.
- Tester skip/required behavior is explicit.
- API review cannot be mistaken for default behavior.
- CLI/report compatibility requirements are written before RC-007 begins.
- Future UI source ownership is bounded.
- No doc claims a smoke-only or mocked feature is fully verified.
- Task dependency statements are updated after decisions.

## Verification

```bash
rg -n -i "warn only|hard fail|open question|future|not yet|planned|deferred|ATS-safe|page limit" README.md docs generator/README.md MACOS_COMPATIBILITY.md LINUX_COMPATIBILITY.md
npm run format:check
npm run lint
```

Search results are review input, not an automatic failure. Every apparent contradiction must be
resolved or explained.

## Failure Modes To Guard

- Wording cleanup hides an unresolved behavioral fork.
- Decision exists only in an issue or chat unavailable to future contributors.
- Documentation declares code complete without a real smoke test.
- A global rule prevents caller-specific page or enforcement policy where that flexibility is
  required.
- API privacy language omits content retention or provider logging implications.
- Exit codes change without schema/version notes.

## Handoff Evidence

- Decision record links for D1-D8.
- Documentation audit matrix with changed files.
- List of implementation follow-ups created from accepted decisions.
- Explicit remaining deferrals and revisit triggers.
- Downstream tasks moved from blocked to ready where applicable.
