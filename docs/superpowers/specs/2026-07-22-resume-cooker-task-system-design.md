# Resume Cooker Task System Design

## Purpose

Replace the current epic-level backlog with a complete planning system that distinguishes product
stages, durable contracts, execution-ready work packages, and live coordination state. A
contributor should be able to select one ready task, understand its boundaries without reconstructing
project history, verify it, and hand it off without silently deciding downstream product behavior.

This design changes documentation only. It does not implement Resume Cooker features.

## Current Problem

The repository already has useful planning material:

- four roadmap stages;
- nine `RC-00X` task pages;
- dependency and status models;
- detailed scope, acceptance, test, risk, and handoff sections.

Those nine pages are mostly epics. Several contain four to ten independently mergeable slices,
depend on unresolved product contracts, or require another repository. The public backlog also
intentionally excludes live state, but the private `current-handoff.md` file that should hold that
state is missing. Result: feature intent is documented, but work is not fully decomposed or reliably
tracked.

## Approved Direction

Retain `RC-001` through `RC-009` as durable epics. Add numbered work packages beneath each epic,
using identifiers such as `RC-003.2`. Epic pages explain product outcomes and shared constraints;
work-package pages define one bounded implementation result.

Avoid code-level implementation plans for every future package. Exact code snippets written too
early would become stale. Each work package will instead contain exact owned surfaces, inputs,
outputs, dependency gates, acceptance criteria, verification commands, and handoff evidence.
Feature-specific implementation plans can be written when a package is selected for execution.

## Documentation Architecture

### Public Repository Documents

Public documents contain durable, contributor-facing truth:

- `README.md`: project entry point, current capability summary, and links.
- `docs/roadmap.md`: product stages, stage exit gates, and feature sequencing.
- `docs/product-decisions.md`: accepted contracts, rationale, consequences, and revisit triggers.
- `docs/tasks/README.md`: status model, dependency graph, task registry, pickup rules, and invariants.
- `docs/tasks/RC-00X-*.md`: epic contracts.
- `docs/tasks/RC-00X.Y-*.md`: execution-ready work packages.
- Existing quality, evaluation, compatibility, tester, and Hunt documents: aligned supporting
  contracts, not alternate roadmaps.

Public documents must label behavior as `implemented`, `partial`, `planned`, or `deferred`. They
must not contain assignments, dated machine state, credentials, private artifacts, or claims based
only on historical verification.

### Private Coordination Documents

`C:\Users\sushi\Documents\agentsvault\Wiki\Projects\resume-cooker\current-handoff.md` contains
live state:

- active task and owner;
- reconstructed task statuses;
- latest verification and environment;
- blockers and decisions awaiting action;
- generated ignored artifacts;
- exact next command.

The existing private project router and `decisions.md` remain concise pointers and historical
defaults. Durable product contracts move into the repository so external contributors can implement
against them.

## Work-Package Contract

Every `RC-00X.Y` page must contain:

1. **Outcome**: one externally observable result.
2. **Status gate**: whether it is ready, blocked, or deferred and the exact condition.
3. **Context**: only information needed to understand this package.
4. **Owned surfaces**: files or repositories the task may create or modify.
5. **Inputs and outputs**: artifacts, schemas, commands, or evidence crossing the boundary.
6. **In scope and out of scope**: explicit change boundaries.
7. **Dependencies**: prerequisite package IDs and external capabilities.
8. **Implementation sequence**: bounded steps in required order.
9. **Acceptance criteria**: observable completion checks.
10. **Verification**: exact commands plus expected pass, warning, failure, or skip behavior.
11. **Failure and privacy constraints**: regressions the package must prevent.
12. **Handoff evidence**: concrete artifacts and results required before `done`.

A package is small enough when it has one primary outcome, can normally be reviewed independently,
and does not require an unrecorded product decision. Large mechanical edits may remain one package
when splitting would create artificial coordination overhead.

## Approved Product Contracts

### D1: ATS Variant Ownership

Use a hybrid model. Caller-provided source remains authoritative. Resume Cooker may ship and
maintain an optional ATS-safe variant or generator, but generation cannot invent or rewrite claims.
Divergence checks compare facts and protected strengths across variants.

### D2: Page-Limit Severity

ATS profile defaults to a one-page blocker when page count is measurable. An unavailable page count
is an explicit incomplete warning in ordinary local runs and an unavailable-required-capability
error in strict release validation. Callers may supply a different versioned policy.

### D3: Pre-C2 Enforcement

Hunt owns orchestration policy. Default policy blocks Fletcher after a preflight `fail`, allows
`pass_with_warnings` with visible flags, and permits only explicit audited overrides. Resume Cooker
reports evidence and recommendation; it does not silently launch or block Fletcher itself.

### D4: Postflight Inputs

Structured resume JSON is authoritative for normalized candidate facts when supplied. Source text
or LaTeX remains authoritative for source-preservation checks, and generated PDF/text remains
authoritative for artifact checks. When structured JSON is absent, deterministic source extraction
may produce lower-confidence findings rather than silently claiming equivalent certainty.

### D5: Tester Priority

ATS-Checker is the first full integration and is required only by the strict release-validation
profile. Tester dependencies remain optional for normal local checks. ResumeParser follows;
ats-screener follows ResumeParser; Resume-Matcher remains optional until a bounded local operation
is proven useful. Every skip is explicit and never reported as an executed pass.

### D6: API Review Scope

OpenRouter and Anthropic remain supported opt-in providers. API review is advisory, uses bounded
input/output/time limits, records whether content left the machine, and cannot be the sole hard
blocker. No key enables a call without explicit runtime consent. Logs and retained reports exclude
raw private content by default.

### D7: CLI And Report Compatibility

CLI exposes `tools`, `build`, `preview`, `check`, `compare`, and `testers`. Reports use a versioned
schema and stable check IDs. JSON mode writes only JSON to stdout; diagnostics go to stderr. Exit
codes distinguish successful execution, quality failure, invalid input, unavailable required
capability, and internal error. `pass_with_warnings` remains successful execution; callers enforce
policy from report status.

Initial exit-code allocation:

| Code | Meaning                                                     |
| ---- | ----------------------------------------------------------- |
| `0`  | Command completed; report is `pass` or `pass_with_warnings` |
| `2`  | Command completed; quality result is `fail`                 |
| `64` | Invalid usage or required input                             |
| `69` | Required local or external capability unavailable           |
| `70` | Internal or unexpected error                                |

### D8: UI Ownership Boundary

UI v1 edits raw LaTeX within approved workspace roots, runs backend operations, displays reports,
and separates temporary preview from intentional saved output. It does not introduce structured
resume editing, automatic content rewriting, or automatic ATS-variant ownership. Those require a
new decision record.

## Planned Work-Package Decomposition

### RC-001: Truthful Capability Detection

- `RC-001.1`: define and test shared structured capability probes.
- `RC-001.2`: make automatic and explicit PDF engine selection consume capability results.
- `RC-001.3`: make PDF text extraction and page counting consume the same Docker capability gate.
- `RC-001.4`: verify unavailable and usable runtime smoke paths; align compatibility docs.

### RC-002: Proven PDF Pipeline

- `RC-002.1`: record and reproduce one supported macOS runtime.
- `RC-002.2`: prove ATS PDF build, page gate, extraction, and parser agreement.
- `RC-002.3`: prove preview endpoints, artifact separation, cleanup, and manual PDF quality.

### RC-003: Tester Integrations

- `RC-003.1`: define common adapter, timeout, sanitization, and normalized outcome contract.
- `RC-003.2`: complete ATS-Checker integration.
- `RC-003.3`: complete ResumeParser integration.
- `RC-003.4`: complete ats-screener integration.
- `RC-003.5`: prove or defer a bounded Resume-Matcher operation.
- `RC-003.6`: assemble normal and strict tester profiles with cross-parser summary evidence.

### RC-004: Postflight Regression Gate

- `RC-004.1`: create synthetic before/after fixtures and normalized fact extraction.
- `RC-004.2`: compare immutable identity, education, and experience facts.
- `RC-004.3`: compare protected strengths and support intentional omissions.
- `RC-004.4`: detect and classify grounded versus ungrounded JD additions.
- `RC-004.5`: inspect supplied PDF, page count, text layer, and parser agreement.
- `RC-004.6`: aggregate sanitized findings into versioned postflight status and exit behavior.

### RC-005: Live API Validation

- `RC-005.1`: freeze synthetic fixtures, authorization checklist, request budget, and secret audit.
- `RC-005.2`: validate OpenRouter live behavior within approved budget.
- `RC-005.3`: validate Anthropic live behavior within approved budget.
- `RC-005.4`: publish sanitized provider-readiness evidence and experimental/ready classification.

### RC-006: Product Contracts

- `RC-006.1`: publish D1-D8 decision records and implementation consequences.
- `RC-006.2`: audit README, roadmap, quality, evaluation, compatibility, tester, and Hunt documents
  against accepted decisions.
- `RC-006.3`: update dependency gates and mark newly ready packages.

### RC-007: Standalone CLI

- `RC-007.1`: define schema-v1 fixtures, command grammar, streams, and exit-code tests.
- `RC-007.2`: implement package binary dispatch, global help/version, and input validation.
- `RC-007.3`: expose `tools`, `build`, and `preview` through the stable boundary.
- `RC-007.4`: expose `check`, `compare`, and `testers` through the stable boundary.
- `RC-007.5`: implement JSON-only stdout, normalized errors, report output, and interruption cleanup.
- `RC-007.6`: verify package contents, fresh-checkout invocation, compatibility aliases, and
  cross-platform behavior.

### RC-008: Hunt And Fletcher Integration

- `RC-008.1`: inventory current Hunt/Fletcher coordination surfaces and freeze integration fixtures.
- `RC-008.2`: implement process adapter, timeout, cancellation, and report-schema validation.
- `RC-008.3`: run preflight before Fletcher and enforce default/override policy.
- `RC-008.4`: run postflight after Fletcher and preserve original/tailored artifact references.
- `RC-008.5`: map namespaced flags and readiness into C3 without losing source evidence.
- `RC-008.6`: prove end-to-end enabled, overridden, unavailable, and rollback paths.

### RC-009: Local Editing And Review UI

- `RC-009.1`: freeze v1 source/save/security/state contracts and browser fixture flows.
- `RC-009.2`: refactor preview server into operation and request-handler services.
- `RC-009.3`: add safe source load/save with approved roots and conflict detection.
- `RC-009.4`: add cancellable build operations, stale-result protection, and preview state.
- `RC-009.5`: add local report execution and sanitized result endpoints.
- `RC-009.6`: build editor, PDF preview, dirty/save/build state, and keyboard workflow.
- `RC-009.7`: build findings, tool-readiness, privacy, and saved-output workflows.
- `RC-009.8`: harden paths, CSRF, HTML rendering, shutdown, accessibility, and browser automation.

## Stage Model

Stages remain product checkpoints, not task containers:

1. **Foundation healthy**: capability truth, formatting/lint/test gate, build/preview scaffold.
2. **PDF pipeline proven**: real build, page, extraction, parser, preview, and artifact evidence.
3. **Evaluation credible**: deterministic preflight, strict tester profile, optional API validation,
   and credible postflight regression detection.
4. **Stable product boundary**: packaged CLI, Hunt integration, and local UI built against versioned
   contracts.

Each stage will list entry conditions, exit evidence, and packages that contribute to it. A stage
cannot be called complete because code exists; its exit evidence must be current and reproducible.

## Dependency Rules

- Child packages may depend on other child packages, not only whole epics.
- A blocked package names one exact prerequisite or external condition.
- Environment-specific smoke packages can remain blocked without preventing independent unit-test
  packages.
- Live API tasks remain blocked until explicit authorization, credentials, and request budget exist.
- Hunt tasks remain blocked until its repository surfaces are inventoried.
- UI implementation starts only after CLI/report schema and source/save contracts are frozen.

## Status Reconstruction

Initial live status will be reconstructed from repository behavior rather than commit messages:

- lint passes;
- 40 root unit tests pass;
- formatting gate currently fails on committed files;
- Docker CLI is present but daemon capability is unusable;
- local check currently attempts Docker and fails;
- worktree is clean;
- no packaged CLI, Hunt integration, or full UI exists.

Historical verification remains context, not proof of current completion. Each package starts as
`done` only when its own acceptance and evidence requirements can be demonstrated; otherwise it is
`partial`, `ready`, `blocked`, or `deferred` in the private handoff.

## Documentation Update Flow

1. Publish accepted D1-D8 records.
2. Create child task pages and registry entries.
3. Replace epic-only dependency graph with package-level critical path and grouped views.
4. Add stage entry/exit evidence to the roadmap.
5. Align supporting docs with accepted contracts and task IDs.
6. Create private current handoff with live state and next command.
7. Run formatting, link, contradiction, and task-reference checks.
8. Record remaining external blockers without claiming feature completion.

## Validation

Documentation work is complete when:

- every listed package has one page and one primary outcome;
- all package IDs referenced by docs exist;
- every dependency points to an existing package or named external condition;
- D1-D8 appear in a durable public decision record;
- README, roadmap, evaluation, quality, compatibility, Hunt, and task docs use consistent policy;
- no `TBD`, unowned open question, or contradictory page-limit/skip/API statement remains;
- private handoff contains current state but no private resume content or credentials;
- Prettier passes for all modified documentation;
- root lint and tests still pass;
- `git status` contains no generated resume, PDF, report, log, or secret artifact.

## Non-Goals

- Implementing any RC feature.
- Publishing a package or calling live APIs.
- Installing TeX, Docker dependencies, or tester environments.
- Editing resume claims.
- Inventing Hunt file paths before its repository is inspected.
- Committing or pushing without explicit user authorization.
