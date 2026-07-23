# RC-008: Integrate With Hunt And Fletcher

**Planning level:** Cross-repository epic. Execute through these bounded work packages:

- [RC-008.1](RC-008.1-hunt-surface-inventory.md): evidence-based Hunt/Fletcher inventory.
- [RC-008.2](RC-008.2-hunt-process-adapter.md): CLI process adapter.
- [RC-008.3](RC-008.3-hunt-preflight-policy.md): preflight and audited override.
- [RC-008.4](RC-008.4-hunt-postflight.md): post-Fletcher comparison.
- [RC-008.5](RC-008.5-hunt-readiness-mapping.md): namespaced flags and C3 readiness.
- [RC-008.6](RC-008.6-hunt-end-to-end-rollout.md): rollout, failure, override, and rollback proof.

[D3](../product-decisions.md#d3-pre-c2-enforcement) assigns policy to Hunt. Integration has not been
implemented; RC-008.1 prevents invented external file paths.

## Objective

Call Resume Cooker as a standalone preflight and postflight quality gate around Hunt C2/Fletcher,
then pass a clear readiness recommendation to C3 without importing Resume Cooker internals or
silently changing Hunt's provider policy.

## Intended Flow

```text
Source resume and optional JD
  -> Resume Cooker preflight
  -> policy decision or explicit override
  -> Fletcher tailoring
  -> Resume Cooker postflight
  -> readiness decision
  -> C3 application flow
```

## Current State

- Resume Cooker has npm-script preflight and comparison scaffolds.
- Hunt integration notes identify Fletcher inputs, outputs, and C3 readiness concepts.
- No packaged Resume Cooker CLI exists yet.
- No Hunt coordinator invokes Resume Cooker.
- Enforcement, override, and flag ownership are accepted in D3/D7; their implementation and Hunt
  retention surface remain incomplete.

## Scope

### In Scope

- Invoke Resume Cooker through its stable CLI or process boundary.
- Define preflight and postflight inputs.
- Store or reference versioned reports without copying private content unnecessarily.
- Translate outcome status into an explicit Hunt readiness decision.
- Keep Fletcher concern flags separate from Resume Cooker artifact-quality flags.
- Implement timeout, cancellation, unavailable-tool, and malformed-report behavior.
- Preserve local-only operation by default.
- Add integration fixtures and end-to-end coordinator tests.
- Document operator recovery and override behavior.

### Out Of Scope

- Importing Resume Cooker modules directly into Hunt.
- Moving Fletcher's tailoring logic into Resume Cooker.
- Enabling API evaluation by default.
- Replacing Hunt's schemas, database, or review workspace.
- Automatically fixing resume content.
- Sending private reports to CI or hosted storage without a separate policy decision.

## Dependencies

### Blocked By

- RC-003 for required parser/tester evidence defined by policy.
- RC-004 for complete postflight regression checks.
- RC-006 for enforcement, overrides, inputs, flags, and report retention.
- RC-007 for a stable standalone CLI.
- Access to the current Hunt/Fletcher repository and test harness.

RC-005 blocks API-backed integration only. Local-only integration can complete without it.

### Blocks

- Automated quality gating before C3 applications.
- Reliable distinction between source-resume defects and Fletcher regressions.

## Integration Contract

### Preflight Inputs

- Source resume path.
- Optional source PDF path.
- Optional target JD path.
- Optional role family or policy configuration.

### Preflight Outputs

- Versioned Resume Cooker report.
- `pass`, `pass_with_warnings`, or `fail`.
- Sanitized flags and artifact references.
- Content-left-machine metadata.
- Readiness recommendation interpreted under Hunt policy.

### Postflight Inputs

- Original source resume.
- Fletcher tailored source or structured resume.
- Fletcher generated PDF.
- Optional JD.
- Optional structured output and concern flags.

### Postflight Outputs

- Versioned comparison report.
- Factual, parsing, page, grounding, and strength-retention findings.
- Readiness recommendation for C3.
- Separate Resume Cooker and Fletcher flag namespaces.

## Enforcement Requirements

D3 and D7 define default enforcement and exits. Implementation must explicitly handle:

- preflight pass;
- preflight warnings;
- preflight fail;
- postflight pass;
- postflight warnings;
- postflight fail;
- Resume Cooker unavailable;
- timeout or cancellation;
- malformed report;
- required optional tool unavailable;
- user-approved override.

Every override must record who or what approved it, which report was overridden, and why. Do not
discard the original report.

## Flag Ownership

Keep namespaces separate:

- Fletcher flags explain tailoring confidence or source sufficiency.
- Resume Cooker flags explain source, PDF, parser, factual, and regression quality.
- Hunt policy decides readiness.

Do not collapse same-named flags without a documented mapping. Preserve stable IDs and schema
versions from both systems.

## Privacy And Artifact Rules

- Prefer paths or internal artifact references over embedding raw resume/JD content.
- Keep reports in local private runtime storage unless Hunt's retention policy explicitly says
  otherwise.
- Never upload PDFs or extracted text as CI artifacts.
- Preserve `content_left_machine` in Hunt-visible metadata.
- API review requires a separate explicit integration option and RC-005 readiness.
- Sanitize process errors before persistence.

## Implementation Slices

1. Freeze CLI and report fixtures from RC-007.
2. Add a Hunt-side process adapter with timeout, cancellation, and schema validation.
3. Add preflight call before Fletcher starts.
4. Implement enforcement and override policy.
5. Add postflight call after Fletcher produces source/PDF.
6. Translate reports into namespaced Hunt flags and readiness state.
7. Gate C3 using the approved policy.
8. Add operator UI/log visibility without exposing private content.
9. Add end-to-end tests for pass, warnings, fail, unavailable, timeout, and override.
10. Document rollout, rollback, and feature gating.

## Acceptance Criteria

- Hunt calls Resume Cooker through the standalone boundary, not imports.
- Preflight occurs before Fletcher consumes the source.
- Postflight occurs after Fletcher produces final artifacts and before C3 readiness.
- Malformed or missing reports cannot become implicit passes.
- Local-only mode requires no external provider.
- API mode remains separately explicit and records content leaving the machine.
- Fletcher and Resume Cooker flags remain distinguishable.
- Readiness and override behavior match RC-006.
- Timeouts and cancellations clean up child processes.
- Reports are schema-version checked.
- End-to-end fixtures prove source defect, tailoring regression, and successful flow separately.
- Integration can be disabled or rolled back without breaking Fletcher's existing path.

## Test Matrix

- Preflight pass -> Fletcher runs.
- Preflight warnings -> approved policy behavior.
- Preflight fail -> block or override according to policy.
- Fletcher failure -> no misleading postflight success.
- Postflight pass -> C3 ready.
- Postflight warnings -> approved policy behavior.
- Postflight fact regression -> C3 not ready unless explicit override is allowed.
- Resume Cooker executable missing.
- Resume Cooker timeout.
- Invalid JSON or unsupported schema version.
- Optional tester skipped.
- API mode disabled.
- API mode enabled with content-left-machine propagation.

## Verification

Verification commands live partly in the Hunt repository and must be recorded in the implementation
handoff. At minimum run:

- Resume Cooker root CI.
- Resume Cooker CLI contract tests.
- Hunt unit tests for process adapter and policy mapping.
- Hunt integration tests with public source/JD fixtures.
- One local end-to-end Fletcher run with preflight and postflight enabled.
- One rollback/feature-disabled run.

## Failure Modes To Guard

- C3 receives ready status when postflight did not run.
- Process exit code and report status disagree and Hunt trusts the wrong one.
- Absolute paths become invalid across workspaces or machines.
- Hunt logs raw Resume Cooker stderr containing private data.
- API mode is enabled by a key alone.
- Override loses the original blocker evidence.
- Resume Cooker and Fletcher flags overwrite each other.
- Integration couples to unversioned internal JSON.

## Handoff Evidence

- CLI/report versions consumed.
- Hunt-side files and policy mapping.
- Full test matrix results.
- Example namespaced flags with synthetic data.
- Readiness and override evidence.
- Local-only privacy confirmation.
- API mode status.
- Rollback instructions.
- Remaining constraints before enabling by default.
