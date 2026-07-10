# RC-006: Resolve Contracts And Align Documentation

## Objective

Resolve the remaining product and integration forks, record decisions in one durable place, and
make roadmap, README, compatibility, and Hunt integration documentation describe the same current
behavior.

## Why This Exists

Implementation has advanced faster than some planning language. Examples:

- Code hard-fails PDFs over the page limit, while one Hunt integration section still says page
  limits warn for now.
- An ATS-safe source exists, but documentation still asks whether Resume Cooker should generate or
  merely verify an ATS-safe variant.
- `compare` accepts a PDF path in metadata but does not inspect it.
- Skip, warning, and hard-block policy for downstream Hunt/Fletcher remains unresolved.
- The tester priority and model-review scope remain open.

These are contract questions, not wording-only cleanup. Downstream tasks must not infer answers.

## Scope

### In Scope

- Decide every question listed below.
- Record decision, rationale, alternatives, consequences, and revisit trigger.
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

The task is implementation-ready, but final completion requires a product owner answer for each
decision below. Research and concrete recommendations can proceed first.

### Blocks

- RC-004 comparison architecture and severity behavior.
- RC-007 CLI inputs, output schema, and exit codes.
- RC-008 preflight/postflight enforcement.
- RC-009 ownership of resume generation and edit behavior.
- Final tester and API scope claims.

## Required Decisions

### D1: ATS Variant Ownership

Choose one:

- Resume Cooker owns and may generate/maintain an ATS-safe variant.
- Resume Cooker only validates a caller-provided ATS-safe variant.
- Hybrid: it ships a sample/optional generator but treats caller input as authoritative.

Define source of truth, artifact naming, whether generation may alter content, and how divergence
from the visual resume is detected.

### D2: Page-Limit Severity

Choose whether exceeding configured pages is:

- blocker failure;
- warning by default with strict mode;
- policy supplied by the caller.

Define behavior when page count is unavailable. Update code or create a follow-up implementation
task; do not leave docs inconsistent.

### D3: Pre-C2 Enforcement

Choose whether preflight `fail`:

- hard-blocks Fletcher;
- warns and allows an override;
- only advises while Hunt owns enforcement.

Define override ownership, audit evidence, and what happens to `pass_with_warnings`.

### D4: Postflight Comparison Inputs

Choose authoritative inputs:

- raw LaTeX;
- parsed structured resume JSON;
- both, with defined precedence.

Define how PDFs, JDs, profile facts, and Fletcher concern flags supplement the comparison.

### D5: Tester Priority And Requiredness

Choose the first full integration and whether any tester becomes required for a release-quality
local run. Define skip semantics when optional dependencies are absent.

### D6: API Review Scope

Define:

- supported providers and model policy;
- allowed review categories;
- whether dynamic text-integrity review belongs in API mode;
- default character/token/cost limits;
- whether API findings can ever hard-block;
- retention and logging policy.

### D7: CLI And Report Compatibility

Define:

- stable command names;
- schema versioning;
- stdout versus stderr contract;
- JSON output mode;
- exit codes for pass, warnings, fail, invalid input, and missing optional tools;
- path representation and cross-platform guarantees.

### D8: UI Ownership Boundary

Define whether the future UI:

- edits raw LaTeX;
- edits structured resume data;
- only previews and runs checks;
- owns generated ATS variants.

This prevents RC-009 from coupling itself to an unstable source model.

## Decision Record Template

```markdown
### D#: Title

- Status: accepted | rejected | deferred
- Date:
- Decision:
- Context:
- Alternatives considered:
- Consequences:
- Required implementation follow-ups:
- Documentation updated:
- Revisit when:
```

Store durable decisions in a repository document intended for contributors. Do not rely only on a
chat or machine-local handoff.

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
