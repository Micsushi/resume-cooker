# RC-001: Reliable Tool And Engine Detection

**Planning level:** Epic. Execute through these bounded work packages:

- [RC-001.1](RC-001.1-capability-probe-contract.md): shared structured capability probes.
- [RC-001.2](RC-001.2-pdf-engine-selection.md): capability-aware build-engine selection.
- [RC-001.3](RC-001.3-pdf-tool-fallbacks.md): truthful extraction and page-count fallbacks.
- [RC-001.4](RC-001.4-toolchain-smoke-and-docs.md): real runtime smoke and documentation.

Current evidence: tool inventory distinguishes Docker availability from usability, but automatic
build/extraction paths do not yet consume one shared capability contract. Treat epic as partial.

## Objective

Make every tool probe and automatic engine choice report actual usability, not merely executable
presence. A command that selects Docker must know whether the daemon can run containers before it
claims the PDF pipeline is available.

## Why This Exists

Some Docker CLI versions can return exit code zero from a formatted `docker info` request while
writing a daemon connection failure to stderr. A probe that trusts only exit code can therefore mark
Docker usable before a subsequent `docker run` fails.

There are two separate consistency defects:

1. The Docker probe trusts only exit code.
2. `detectEngine()` checks whether the Docker executable exists, not whether the daemon is usable.

The same distinction matters for stale native tools: a command can exist on `PATH` but fail when
invoked.

Keep dated reproduction evidence and current machine state in the private project handoff, not this
durable task contract.

## Current Implementation Surface

- `generator/scripts/check-tools.mjs`
  - Probes executable availability.
  - Uses formatted `docker info` for daemon availability.
- `generator/scripts/build-lib.mjs`
  - `commandExists()` checks `PATH`.
  - `detectEngine()` chooses `latexmk`, `pdflatex`, then Docker using executable presence.
  - `buildPdf()` executes the selected engine.
- `generator/scripts/build-lib.test.mjs`
  - Tests engine preference and missing-engine behavior.
- `checker/scripts/text-layer.mjs`
  - Falls back to Docker when Poppler executables are absent or fail.
  - Also checks only Docker executable presence before the fallback.

## Scope

### In Scope

- Introduce one reusable capability probe for Docker daemon usability.
- Make the probe reject:
  - nonzero exit codes;
  - known daemon connection errors on stdout or stderr;
  - empty or malformed server information when a server response is required.
- Make automatic PDF engine selection consider capability, not only command presence.
- Make Docker-backed PDF extraction and page counting use the same capability logic.
- Keep explicit `--engine docker` behavior clear:
  - either validate before execution; or
  - execute once and return a normalized actionable failure.
    The selected behavior must be documented and tested.
- Separate `available` from `usable` in the tool inventory.
- Add unit tests for installed-but-unusable Docker and stale native executable cases.
- Ensure error messages name the unavailable capability and next action.

### Out Of Scope

- Starting Docker Desktop automatically.
- Installing Docker, TeX, or Poppler.
- Pinning container images.
- Changing PDF content or LaTeX templates.
- Making PDF generation part of default GitHub CI.

## Dependencies

### Blocked By

None. This task can be implemented with injected command runners and deterministic fixtures.

### Blocks

- RC-002: macOS end-to-end PDF verification needs trustworthy readiness checks.
- RC-007: the CLI must expose stable tool and error semantics.
- RC-009: the UI needs accurate capability state and actionable recovery messages.
- Reliable Docker fallbacks in RC-003 and RC-004.

## Required Design

Prefer capability-specific functions over a single overloaded `commandExists()` function. A
reasonable shape is:

```js
probeCommand("docker");
probeDockerDaemon();
probePdfBuildEngines();
probePdfTextTools();
```

Each probe should return structured data rather than only a boolean:

```json
{
  "available": true,
  "usable": false,
  "reason": "Docker CLI is installed, but the daemon is not reachable."
}
```

Keep user-facing evidence free of raw environment paths where possible. Internal metadata may
contain tool names and exit codes, but not resume data.

Automatic selection must follow this rule:

1. Select usable `latexmk`.
2. Otherwise select usable `pdflatex`.
3. Otherwise select usable Docker.
4. Otherwise return `missing` with all candidate reasons.

Executable presence alone is insufficient for the Docker branch.

## Implementation Slices

1. Extract Docker probing into an exported, injected, unit-testable function.
2. Add fixtures for:
   - CLI absent;
   - daemon healthy;
   - nonzero daemon error;
   - zero exit with connection error on stderr;
   - zero exit with empty server version.
3. Change `check-tools.mjs` to consume the structured probe.
4. Change `detectEngine()` to consume capability probes.
5. Apply the same Docker capability gate to `extractPdfText()` and `countPdfPages()`.
6. Normalize build and extraction errors.
7. Update generator and compatibility documentation.

## Acceptance Criteria

- With no Docker CLI, tool output shows `available: false`, `usable: false`.
- With Docker CLI installed and daemon stopped, tool output shows `available: true`,
  `usable: false`.
- A zero-exit `docker info` response containing a daemon connection error is unusable.
- Automatic engine selection never selects an unusable Docker daemon.
- `npm run check:tools -- --require-pdf-engine` exits nonzero when no usable TeX engine or Docker
  daemon exists.
- `npm run build:pdf` fails before attempting `docker run` when automatic selection has already
  proven Docker unusable.
- Explicit Docker requests return one concise actionable error and preserve a nonzero exit status.
- PDF text and page-count fallbacks do not claim Docker is available when its daemon is not.
- Existing engine preference remains `latexmk`, `pdflatex`, Docker.
- All root tests pass on Node 22.

## Required Tests

- Unit: Docker healthy response.
- Unit: Docker nonzero connection failure.
- Unit: Docker zero-exit connection failure in stderr.
- Unit: Docker malformed or empty server response.
- Unit: engine selection skips unusable Docker.
- Unit: explicit engine behavior.
- Unit: extraction fallback reports unavailable capability cleanly.
- Integration smoke: daemon stopped.
- Integration smoke: daemon running, if available on the contributor machine.

Do not require Docker in default CI. Integration smoke evidence belongs in the handoff.

## Verification

```bash
npm run format:check
npm run lint
npm test
npm run check:tools
npm run check:tools -- --require-pdf-engine
```

Run the last command once with no usable engine and once with a usable engine when possible.

## Failure Modes To Guard

- Probe succeeds because the CLI accepted flags but did not contact the daemon.
- Probe hangs while Docker Desktop starts.
- Probe prints a machine-local socket path into stable public output.
- Automatic selection changes from a working native engine to Docker.
- Extraction and build paths use different definitions of Docker usability.
- A missing optional capability makes lightweight CI fail.

## Handoff Evidence

- Tool table with daemon stopped.
- Tool table with daemon running, if available.
- Engine-selection test output.
- Exact error from an explicit unavailable Docker request.
- Statement that no PDF or resume content left the machine.
