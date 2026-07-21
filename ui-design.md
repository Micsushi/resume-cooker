# UI Design

## Status

Resume Cooker has no product application UI yet. Current user-facing surfaces
are command output, generated reports, and the local PDF preview workflow.

## Principles

- Keep reports evidence-first: pass/fail state, reason, source, and next action.
- Preserve resume privacy; external review remains explicit opt-in.
- Keep PDF preview behavior separate from saved output.
- Avoid implying that optional external tester interfaces are Resume Cooker's
  own product UI.

## Sources

- Preview workflow: `generator/`
- Checks and reports: `checker/`
- Product decisions: `docs/`

If a first-party UI is added, update this file with its implemented flows,
accessibility rules, tokens, and source paths.
