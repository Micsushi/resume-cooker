# RC-009: Local Editing And Review UI

## Objective

Build a local interface where a user can inspect the source, edit through the approved source model,
generate or refresh a PDF, view checks, and save or download an intentional output without weakening
privacy, toolchain, or CLI contracts.

## Current State

The preview server provides:

- a browser page;
- source text retrieval;
- compile status;
- an explicit compile endpoint;
- a PDF preview endpoint;
- temporary artifacts under `.runtime/preview`.

It does not provide a full editor, persistence model, report dashboard, safe file selection,
concurrent edit handling, or packaged application experience.

## Scope

### In Scope

- Local-only UI served on loopback by default.
- Display source, rendered PDF, build status, and report findings.
- Edit according to the source ownership decision from RC-006.
- Explicit save and explicit generated-output actions.
- Run local checks and show categorized findings.
- Show tool readiness and actionable setup errors.
- Preserve temporary preview versus saved output distinction.
- Provide safe cancellation and stale-build handling.
- Add accessibility, keyboard, error, and privacy behavior.
- Reuse the stable CLI/report contract as the backend boundary.

### Out Of Scope

- Cloud hosting, accounts, synchronization, or multi-user collaboration.
- Sending resume content to APIs by default.
- Rich word-processing layout editing.
- Automatic resume rewriting.
- Hunt integration UI.
- Native desktop packaging unless separately scoped after the browser-local UI works.

## Dependencies

### Blocked By

- RC-001 for accurate capability reporting.
- RC-002 for a proven build, extraction, page, and preview pipeline.
- RC-006 for source ownership, ATS variant behavior, save semantics, and API policy.
- RC-007 for stable commands and versioned reports.

### Blocks

No current backend task. This is the final product-surface layer and should not define backend
contracts by accident.

## Required User Flows

### Open And Inspect

- Start local server on loopback.
- Open an approved source path.
- Display source name, unsaved state, last build state, and selected toolchain.
- Render the latest successful preview without pretending a failed build succeeded.

### Edit And Save

- Make an edit.
- Mark the source dirty.
- Save explicitly.
- Handle file changed on disk since load.
- Avoid exposing arbitrary filesystem paths outside the approved workspace.

### Build Preview

- Trigger build.
- Show running, success, failure, and cancelled states.
- Keep last successful PDF visibly labeled as stale when a newer build fails.
- Show concise sanitized error plus access to local detailed logs.

### Run Checks

- Choose local preflight.
- Display overall status and findings by severity/category.
- Link findings to relevant source or artifact context where possible.
- Show skipped/incomplete checks distinctly from pass.
- Never send content externally unless an explicit API flow includes confirmation.

### Save Output

- Preview remains temporary.
- User explicitly chooses saved PDF generation/download.
- Output path and overwrite behavior are visible.
- Generated files remain ignored by default.

## Security And Privacy Requirements

- Bind to `127.0.0.1`, not all interfaces, unless the user explicitly opts in.
- Reject path traversal and arbitrary file reads.
- Restrict source and output paths to approved roots or explicit user selections.
- Add CSRF protections appropriate to local mutating endpoints.
- Do not render untrusted source or tool output as raw HTML.
- Never place API keys in browser storage or responses.
- Require an explicit confirmation step before API review.
- Show whether content stayed local in every report view.
- Avoid persisting raw report content beyond configured local storage.

## Architecture Boundary

The UI should orchestrate stable backend operations, not duplicate them. Preferred direction:

```text
Browser UI
  -> local UI server
  -> stable Resume Cooker service/CLI adapter
  -> build/check/compare modules
  -> versioned reports and ignored artifacts
```

The local server may call modules directly if RC-006 explicitly approves an internal API, but the
external behavior must remain compatible with RC-007 and RC-008.

## State Model

At minimum model:

- source load state;
- dirty/saved state;
- build idle/running/success/fail/cancelled state;
- last successful artifact and whether it is stale;
- check idle/running/complete/fail state;
- tool capability state;
- content-left-machine state;
- active source variant;
- output-save state.

Do not derive all UI state from the existence of files. Explicit operation IDs and timestamps are
needed to prevent stale responses from overwriting newer state.

## Implementation Slices

1. Write approved UI source and save contract.
2. Refactor preview server into testable request handlers and operation services.
3. Add safe source selection/load/save endpoints.
4. Add cancellable build operations with unique IDs.
5. Add report execution and display.
6. Add tool readiness panel and recovery guidance.
7. Add explicit saved-output workflow.
8. Add API confirmation flow only after RC-005 and RC-006 permit it.
9. Add accessibility, concurrency, privacy, and path-security tests.
10. Add packaging or launcher only as a separate final slice.

## Acceptance Criteria

- Server binds to loopback by default.
- User can load an approved source, edit it, save explicitly, and rebuild.
- Failed builds never masquerade as current successful previews.
- Preview artifacts and saved outputs remain separate.
- Local reports show pass, warning, fail, and skipped states distinctly.
- Tool unavailability produces actionable UI guidance.
- Path traversal and unapproved file access are rejected.
- Concurrent or stale build responses cannot overwrite current state.
- Keyboard-only workflow covers edit, save, build, check, and findings navigation.
- No API call occurs without explicit user confirmation.
- UI shows whether content left the machine.
- Generated/private artifacts remain untracked.

## Test Matrix

- Initial load with working and unavailable toolchains.
- Source read success, missing file, unsupported path, and traversal attempt.
- Edit, dirty state, save, reload, and external modification conflict.
- Build success, failure, timeout, cancellation, and stale response.
- Preview PDF missing or stale.
- Local check pass, warning, fail, and skip.
- API disabled, confirmation declined, and authorized synthetic flow.
- Output save and overwrite confirmation.
- Keyboard navigation and screen-reader labels.
- Server shutdown and child-process cleanup.

## Verification

- Root unit and integration tests.
- Browser automation against public fixtures.
- Manual macOS smoke with the toolchain proven in RC-002.
- Security tests for paths, HTML injection, and local mutating requests.
- Accessibility audit.
- `git status` inspection for generated artifacts.

Exact commands depend on the UI framework chosen after RC-006. Framework selection must not
silently introduce cloud services or a second source of truth.

## Failure Modes To Guard

- Browser can read arbitrary local files.
- UI binds to the LAN.
- Last good PDF appears current after a failed edit build.
- Save and build race, producing a PDF for different source text than shown.
- API key or resume content enters browser logs or persistent storage.
- A skipped check appears green.
- UI duplicates report rules and drifts from CLI output.
- Automatic save overwrites external edits.
- Server or TeX child process remains after the UI closes.

## Handoff Evidence

- Approved source/save architecture.
- User-flow screenshots or recordings using synthetic data.
- Browser and backend test results.
- Path-security and privacy evidence.
- Toolchain used for manual smoke.
- Accessibility results.
- Generated artifact locations and cleanup.
- Explicit list of deferred native packaging or API features.
