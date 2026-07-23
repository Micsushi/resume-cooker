# RC-003: Complete Tester Integrations

**Planning level:** Epic. Execute through these bounded work packages:

- [RC-003.1](RC-003.1-tester-adapter-contract.md): common adapter and outcome contract.
- [RC-003.2](RC-003.2-ats-checker-integration.md): ATS-Checker parser agreement.
- [RC-003.3](RC-003.3-resume-parser-integration.md): ResumeParser structural evidence.
- [RC-003.4](RC-003.4-ats-screener-integration.md): ats-screener local scoring.
- [RC-003.5](RC-003.5-resume-matcher-operation.md): bounded Resume-Matcher proof or deferral.
- [RC-003.6](RC-003.6-tester-profiles.md): normal/strict profiles and cross-parser summary.

[D5](../product-decisions.md#d5-tester-priority-and-requiredness) fixes tester order and strict
requiredness. Current wrappers are partial; no skip counts or smoke claims imply completion.

## Objective

Turn the vendored tester snapshots into explicit, reproducible, normalized local integrations. A
contributor should be able to run selected tools against a generated sample artifact, distinguish
pass from skip or failure, and understand parser disagreement without bringing tester dependencies
into default root CI.

## Current State

Four snapshots exist:

- ATS-Checker
- ats-screener
- Resume-Matcher
- ResumeParser

Current wrapper behavior:

- ATS-Checker has a Python extraction helper and parser-agreement normalization.
- ats-screener can invoke its local scoring script when dependencies and extracted text exist.
- ResumeParser can invoke its profile mode when Python dependencies and a PDF exist.
- Resume-Matcher performs an import smoke check.
- Missing artifacts or dependencies become low-severity warnings/skips.

Actual execution and skip counts belong in the private project handoff because installed
dependencies and generated artifacts vary by machine.

## Scope

### In Scope

- Select an explicit integration order and document it.
- Make dependency setup reproducible without tracking virtual environments or `node_modules`.
- Run each selected tool against public sample artifacts.
- Normalize each outcome as executed-pass, executed-warning/failure, or skipped-with-reason.
- Capture useful structured metadata without leaking resume content.
- Define parser-agreement thresholds and what disagreement means.
- Add tests for command construction, path handling, missing dependencies, timeouts, malformed
  output, and nonzero exits.
- Document supported versions or snapshot commits where discoverable.
- Keep tester execution outside default `npm run ci`.

### Out Of Scope

- Maintaining forks of all upstream tester projects indefinitely.
- Uploading resumes to hosted tester services.
- Treating a single third-party score as authoritative.
- Installing tester dependencies during default root install.
- Rewriting candidate content based on tester output.

## Dependencies

### Blocked By

- RC-002 for a real PDF and extracted text.
- A documented dependency strategy for each selected tester.
- RC-006.1 publishes D5. ATS-Checker is the accepted first full integration and strict-profile
  requirement; ResumeParser and ats-screener follow, while Resume-Matcher remains optional pending
  RC-003.5.

### Blocks

- Strong parser evidence for RC-008 Hunt/Fletcher gating.
- Claims that Stage 3 tester integration is complete.
- Confidence that the ATS-safe source works across independent parsers.

## Recommended Integration Order

1. ATS-Checker: finish and prove the existing parser comparison.
2. ResumeParser: obtain structured contact, education, and experience evidence.
3. ats-screener: obtain local JD/keyword scoring evidence.
4. Resume-Matcher: move beyond import smoke only if its backend can run locally with bounded setup.

Each tool should be a separately mergeable slice. Do not block one working integration on all four.

## Per-Tool Contract

Each adapter must define:

- required inputs;
- required runtime and dependency setup;
- exact invoked command;
- timeout;
- expected output shape;
- how output is sanitized;
- normalized checks emitted;
- skip conditions;
- failure conditions;
- cleanup behavior;
- supported operating systems.

The normalized report must distinguish:

- `pass`: tool actually executed and its configured check passed;
- `warning`: tool executed but found disagreement, or could not execute in an explicitly optional
  context;
- `fail`: tool executed or was explicitly required and found a blocker-level defect;
- skip evidence: represented as a warning today, with a stable `*_skipped` ID and exact reason.

RC-006 may revise skip semantics, but adapters must never report a skip as an executed pass.

## Implementation Slices

### ATS-Checker

- Create a documented Python environment setup.
- Verify the helper loads the snapshot without patching private content into it.
- Compare baseline `pdftotext` output with ATS-Checker extraction.
- Define token normalization and similarity threshold behavior.
- Record token counts and similarity metadata, not raw content.
- Test empty output, parser crash, Python absence, and disagreement.

### ResumeParser

- Define supported Python version and isolated install command.
- Confirm profile mode accepts the generated ATS PDF.
- Normalize presence of contact, education, experience, and skills without printing private values.
- Treat import errors and missing model/data assets distinctly.
- Add POSIX and Windows virtualenv path tests.

### ats-screener

- Use the vendored lockfile and explicit install command.
- Run only the local scoring entrypoint.
- Define the expected output schema and validate it.
- Record score components and missing-term counts without raw resume text.
- Test missing `tsx`, malformed JSON, nonzero exit, and timeout.

### Resume-Matcher

- Decide whether import smoke is sufficient for the current stage.
- If not, define the smallest local backend operation that provides useful evidence without a
  database, network service, or persistent state.
- Normalize startup/configuration failures separately from resume-quality findings.

## Acceptance Criteria

- At least ATS-Checker executes against `resume/output/ats.pdf` and produces parser-agreement
  evidence.
- Every integrated tool has a reproducible setup command and clean teardown story.
- `npm run check:testers` states which tools executed and which skipped.
- Missing optional dependencies do not break root CI.
- An explicitly requested single tool exits or reports according to documented required-tool
  semantics.
- No adapter prints raw resume text, contact values, or JD content in stable reports.
- All child processes have bounded execution time or a documented reason they do not.
- Tool output is schema-checked before being trusted.
- Test coverage includes success, skip, malformed output, timeout, and failure.
- `testers/` remains excluded from default root format, lint, tests, and CI except through explicit
  wrapper tests owned by the root project.

## Verification Commands

```bash
npm run build:pdf:ats
npm run check:local:ats
npm run check:testers
node checker/scripts/tester-runner.mjs --tool ats-checker --pdf resume/output/ats.pdf
node checker/scripts/tester-runner.mjs --tool resume-parser --pdf resume/output/ats.pdf
node checker/scripts/tester-runner.mjs --tool ats-screener --text resume/output/ats.txt --jd fixtures/software_engineering_intern_jd.txt
npm run ci
```

Run only commands for installed tools. The handoff must name skipped commands and reasons.

## Failure Modes To Guard

- Dependency installation modifies vendored source unexpectedly.
- Adapter depends on a globally installed package without documenting it.
- Tool emits private content into stdout captured by reports.
- A tool update changes output and the adapter silently misparses it.
- Tool failure is mislabeled as resume failure.
- Skip is mislabeled as pass.
- Multiple parsers disagree but report aggregation hides the disagreement.
- Tester dependencies expand default CI time or attack surface.

## Handoff Evidence

- Per-tool environment and versions.
- Executed, warning/failure, and skipped counts.
- Normalized sample report with public fixtures.
- Parser-agreement metric and threshold.
- Dependency cleanup confirmation.
- Explicit list of integrations still at smoke-only status.
