# Resume Cooker Task System Implementation Plan

> REQUIRED SUB-SKILL: Use superpowers:executing-plans for implementation.

**Goal:** Convert Resume Cooker's nine epic backlog pages into a durable, internally consistent
catalog of 46 bounded work packages with accepted product contracts and current private execution
state.

**Architecture:** Keep `RC-001` through `RC-009` as public epic contracts and add one Markdown page
per `RC-00X.Y` work package. Public docs hold durable behavior and dependencies; agentsvault holds
live status, blockers, verification, and next command. Automated reference checks validate package
IDs, links, formatting, and policy consistency.

**Tech Stack:** Markdown, Mermaid, PowerShell, ripgrep, Prettier, Node.js root lint/tests.

Git commits are intentionally omitted because repository policy requires explicit user authorization
before committing.

## Task 1: Publish Product Decisions

**Files:**

- Create: `docs/product-decisions.md`
- Modify: `docs/tasks/RC-006-contract-decisions.md`

- [ ] Write accepted D1-D8 records with rationale, consequences, follow-ups, and revisit triggers.
- [ ] Replace decision-choice language in RC-006 with links to accepted records and remaining audit
      work.
- [ ] Run `npx prettier --check docs/product-decisions.md docs/tasks/RC-006-contract-decisions.md`;
      expect both files formatted.
- [ ] Run `rg -n "Choose one|must define|unresolved" docs/product-decisions.md
docs/tasks/RC-006-contract-decisions.md`; expect no unresolved contract instruction outside
      historical context.

## Task 2: Create RC-001 And RC-002 Work Packages

**Files:**

- Create: `docs/tasks/RC-001.1-capability-probe-contract.md`
- Create: `docs/tasks/RC-001.2-pdf-engine-selection.md`
- Create: `docs/tasks/RC-001.3-pdf-tool-fallbacks.md`
- Create: `docs/tasks/RC-001.4-toolchain-smoke-and-docs.md`
- Create: `docs/tasks/RC-002.1-macos-runtime.md`
- Create: `docs/tasks/RC-002.2-ats-pdf-pipeline.md`
- Create: `docs/tasks/RC-002.3-preview-and-artifact-smoke.md`
- Modify: `docs/tasks/RC-001-toolchain-detection.md`
- Modify: `docs/tasks/RC-002-macos-pdf-pipeline.md`

- [ ] Give every page one outcome, dependency gate, owned surfaces, inputs/outputs, scope,
      implementation sequence, acceptance criteria, verification, failure/privacy rules, and handoff
      evidence.
- [ ] Link epic pages to children and replace whole-epic blockers with package-level dependencies.
- [ ] Confirm capability unit work can proceed without Docker or TeX while smoke packages name their
      external runtime requirement.

## Task 3: Create RC-003 Tester Work Packages

**Files:**

- Create `docs/tasks/RC-003.1-tester-adapter-contract.md` through
  `docs/tasks/RC-003.6-tester-profiles.md` using names from the approved design.
- Modify: `docs/tasks/RC-003-tester-integrations.md`

- [ ] Separate common adapter behavior from ATS-Checker, ResumeParser, ats-screener, and
      Resume-Matcher work.
- [ ] Make ATS-Checker the first integration and strict-profile requirement.
- [ ] Preserve explicit skips and keep all tester installs outside root CI.
- [ ] Add per-adapter setup, command, output, timeout, sanitization, and platform evidence.

## Task 4: Create RC-004 Postflight Work Packages

**Files:**

- Create `docs/tasks/RC-004.1-compare-fixtures-and-facts.md` through
  `docs/tasks/RC-004.6-postflight-report-contract.md` using names from the approved design.
- Modify: `docs/tasks/RC-004-postflight-regressions.md`

- [ ] Split fixtures/fact extraction, immutable comparisons, strength retention, JD grounding,
      PDF/text inspection, and report aggregation.
- [ ] Record structured JSON precedence and lower-confidence source-only behavior.
- [ ] Ensure no task treats JD presence as candidate truth or emits raw private values.
- [ ] Give every package deterministic passing and failing verification fixtures.

## Task 5: Create RC-005 And RC-006 Work Packages

**Files:**

- Create `docs/tasks/RC-005.1-api-smoke-guardrails.md` through
  `docs/tasks/RC-005.4-provider-readiness.md` using names from the approved design.
- Create `docs/tasks/RC-006.1-publish-product-decisions.md`.
- Create `docs/tasks/RC-006.2-documentation-contract-audit.md`.
- Create `docs/tasks/RC-006.3-release-dependency-gates.md`.
- Modify: `docs/tasks/RC-005-api-validation.md`
- Modify: `docs/tasks/RC-006-contract-decisions.md`

- [ ] Keep every live request task blocked on explicit authorization, scoped key, synthetic fixture
      approval, and request budget.
- [ ] Separate provider validation so one provider never blocks local-only work.
- [ ] Define provider-ready versus experimental evidence without making API findings hard blockers.
- [ ] Make contract publication and documentation audit independently verifiable.

## Task 6: Create RC-007 CLI Work Packages

**Files:**

- Create `docs/tasks/RC-007.1-cli-schema-contract.md` through
  `docs/tasks/RC-007.6-cli-package-verification.md` using names from the approved design.
- Modify: `docs/tasks/RC-007-packaged-cli.md`

- [ ] Separate contract fixtures, binary dispatch, core commands, report commands, output/error
      behavior, and package verification.
- [ ] Freeze exit codes `0`, `2`, `64`, `69`, and `70` with `pass_with_warnings` returning `0`.
- [ ] Preserve current npm aliases until documented migration.
- [ ] Require Windows, Linux, and macOS path evidence without bundling optional runtimes.

## Task 7: Create RC-008 Hunt Work Packages

**Files:**

- Create `docs/tasks/RC-008.1-hunt-surface-inventory.md` through
  `docs/tasks/RC-008.6-hunt-end-to-end-rollout.md` using names from the approved design.
- Modify: `docs/tasks/RC-008-hunt-integration.md`

- [ ] Make repository-surface inventory the first bounded task; do not invent external file paths.
- [ ] Separate process adapter, preflight enforcement, postflight, flag/readiness mapping, and
      end-to-end rollout.
- [ ] Preserve Fletcher and Resume Cooker flag namespaces and audited overrides.
- [ ] Require enabled, unavailable, malformed, timeout, override, and rollback evidence.

## Task 8: Create RC-009 UI Work Packages

**Files:**

- Create `docs/tasks/RC-009.1-ui-v1-contract.md` through
  `docs/tasks/RC-009.8-ui-hardening.md` using names from the approved design.
- Modify: `docs/tasks/RC-009-local-editing-ui.md`
- Modify: `ui-design.md`

- [ ] Freeze raw-LaTeX v1 ownership before server changes.
- [ ] Separate service refactor, safe files, build state, reports, editor, findings/output, and
      hardening.
- [ ] Require loopback binding, approved roots, CSRF controls, sanitized rendering, explicit API
      confirmation, keyboard operation, and stale-response protection.
- [ ] Keep native packaging and structured resume editing deferred.

## Task 9: Rebuild Task Registry And Roadmap

**Files:**

- Modify: `docs/tasks/README.md`
- Modify: `docs/roadmap.md`
- Modify: `README.md`

- [ ] Replace epic-only index with grouped epic/work-package registry.
- [ ] Add package-level critical path and external-condition notation.
- [ ] Add stage entry conditions, exit evidence, contributing packages, and honest current state.
- [ ] Add product-decision and task-system links to README.
- [ ] Document that public pages are durable contracts while private handoff owns live status.

## Task 10: Align Supporting Contracts

**Files:**

- Modify: `docs/evaluation-suites.md`
- Modify: `docs/resume-quality-criteria.md`
- Modify: `docs/hunt-c2-integration-notes.md`
- Modify: `docs/ats-testing-methods.md`
- Modify: `generator/README.md`
- Modify: `MACOS_COMPATIBILITY.md`
- Modify: `LINUX_COMPATIBILITY.md`
- Modify: `testers/README.md`

- [ ] Align ATS ownership, page policy, tester profiles, API advisory behavior, CLI boundary,
      postflight inputs, and Hunt enforcement with D1-D8.
- [ ] Mark each described behavior implemented, partial, planned, or deferred.
- [ ] Replace stale whole-epic references with relevant work-package IDs.
- [ ] Preserve existing operational instructions that remain accurate.

## Task 11: Create Live Private Handoff

**Files:**

- Create:
  `C:\Users\sushi\Documents\agentsvault\Wiki\Projects\resume-cooker\current-handoff.md`
- Modify:
  `C:\Users\sushi\Documents\agentsvault\Wiki\Projects\resume-cooker\resume-cooker_index.md`

- [ ] Record current branch/worktree, verification results, capability state, and absent features.
- [ ] Assign reconstructed package statuses only where evidence supports them.
- [ ] Record critical path: formatting recovery, RC-001 capability fixes, then RC-002 proof.
- [ ] Name exact next command and keep private content, keys, and generated artifacts absent.

## Task 12: Validate Complete Documentation System

**Files:** all modified documentation.

- [ ] Run a PowerShell reference check that extracts every `RC-00X.Y` identifier from the registry
      and confirms one matching page exists.
- [ ] Check Markdown links under `docs/tasks/` resolve to existing local files.
- [ ] Run `rg -n -i "choose one|open question|warn only|hard fail|API.*default|TBD|TODO" README.md
docs generator/README.md MACOS_COMPATIBILITY.md LINUX_COMPATIBILITY.md ui-design.md` and
      review every result for accepted-policy consistency.
- [ ] Run `npx prettier --write` only on modified public docs, then `npx prettier --check` on the same
      set.
- [ ] Run `git diff --check`.
- [ ] Run `npm run lint`; expect exit `0`.
- [ ] Run `npm test`; expect all root tests pass.
- [ ] Run `git status --short` and confirm no generated PDF, extracted text, report, log, credential,
      or agent-config directory is tracked.
- [ ] Report any pre-existing repository-wide formatting failure separately from formatting of
      changed files.
