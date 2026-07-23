# UI Design

## Status

Resume Cooker has no product application UI yet. Current user-facing surfaces
are command output, generated reports, and the local PDF preview workflow.

UI v1 is planned through [RC-009.1 through RC-009.8](docs/tasks/README.md#rc-009-local-editing-and-review-ui).
[D8](docs/product-decisions.md#d8-ui-ownership-boundary) fixes the v1 boundary: edit approved raw
LaTeX locally, run stable backend operations, display reports, and keep preview separate from saved
output. Structured authoring, automatic rewriting, cloud features, and native packaging are deferred.

## Principles

- Keep reports evidence-first: pass/fail state, reason, source, and next action.
- Preserve resume privacy; external review remains explicit opt-in.
- Keep PDF preview behavior separate from saved output.
- Avoid implying that optional external tester interfaces are Resume Cooker's
  own product UI.
- Bind to loopback, restrict file access to approved roots, and protect mutating requests.
- Model dirty, conflict, running, failed, cancelled, last-good, and stale states explicitly.
- Keep backend report status authoritative; skipped checks never appear as passes.
- Support keyboard operation for edit, save, build, check, findings, and saved output.

## Sources

- Preview workflow: `generator/`
- Checks and reports: `checker/`
- Product decisions: `docs/`

If a first-party UI is added, update this file with its implemented flows,
accessibility rules, tokens, and source paths.

Detailed source/save/security/state contracts belong to RC-009.1 and the planned `docs/ui-contract.md`;
this file remains the product-level design summary until implementation begins.
