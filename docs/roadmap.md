# Resume Cooker Roadmap

Resume Cooker stays standalone first. Its job is to make a resume locally visible, reproducible, and objectively testable before any downstream tailoring system changes it.

Detailed remaining work lives in [`docs/tasks/README.md`](tasks/README.md). The task backlog is the
source of truth for durable scope, architectural dependencies, acceptance criteria, and handoff
requirements. Live readiness, priorities, dated blockers, and assignments remain outside the public
repository. This roadmap remains the higher-level product sequence.

This roadmap is intentionally grouped into four implementation stages. Older long-range ideas are folded into these stages so each stage is large enough to test meaningfully without turning the project into many tiny milestones.

## Stage 1: Local Foundation

Goal: make the repo usable and maintainable before adding resume scoring logic.

Deliverables:

- Local browser preview for the current LaTeX resume.
- Temporary preview PDF generation under `.runtime/preview`, not `resume/output/`.
- Explicit saved PDF generation only through the build command.
- Root formatting, linting, and unit test setup.
- Root GitHub Actions workflow for lightweight checks.
- Documentation that explains command behavior and generated artifact locations.

Acceptance criteria:

- `npm run preview` lets a user view the resume locally without creating saved resume artifacts.
- `npm run build:pdf` remains the intentional command for saved PDFs under `resume/output/`.
- Generated preview and build artifacts stay out of Git.
- Root checks cover the project scaffold and generator code.
- Default CI runs lightweight root checks only.
- Third-party tester snapshots under `testers/` are not part of default root CI.

Non-goals:

- No resume content edits.
- No ATS-safe rewrite yet.
- No text extraction gate yet.
- No API calls.
- No tester project integration.
- No Hunt/C2 integration code.

## Stage 2: Build And Text-Layer Validation

Goal: prove generated PDFs are machine-readable before deeper ATS scoring.

Current implementation:

- PDF text extraction helper can use local `pdftotext` or Docker-backed `pdftotext`.
- Extracted text checks cover non-empty text, section presence/order, optional configured terms, and encoding noise.
- Page-limit behavior is a hard one-page failure when a PDF page count is available.
- Docker-backed text extraction is supported when Docker is running.
- The local suite runs text-layer checks when a PDF is provided or built.

Deliverables:

- Scripted PDF text extraction.
- Extracted text saved under ignored output or runtime paths.
- Critical keyword checks.
- Basic section order checks.
- Actionable console output and machine-readable check results.

Acceptance criteria:

- Important keywords such as `Kubernetes`, `Terraform`, `PostgreSQL`, `Kotlin`, `TypeScript`, and `DynamoDB` appear unbroken in extracted text.
- Name, contact, education, experience, projects, and skills appear in a readable order.
- Failures explain what broke and where to inspect generated artifacts.
- Missing optional tools produce clear messages.

## Stage 3: ATS And Job Description Evaluation

Goal: evaluate resume quality and JD fit without rewriting content by default.

Current implementation:

- Local preflight report checks source integrity, ATS layout risks, standard sections, parseable contact fields, JD signal coverage, and tester snapshot presence.
- API/model review supports explicit opt-in OpenRouter and Anthropic adapters.
- ATS-Checker parser comparison is wrapped for PDF parser-agreement checks; full tester applications remain reference snapshots until intentionally enabled.
- `npm run check:testers` explicitly attempts tester execution and reports pass/skip results outside default CI.

Deliverables:

- Local resume quality report using the criteria in `docs/resume-quality-criteria.md`.
- JD keyword coverage report using sample or provided job descriptions.
- Separation between deterministic local checks and optional API-backed checks.
- Initial wrapper for selected tester tools under `testers/`.
- Normalized report output that makes parser disagreement visible.

Acceptance criteria:

- Reports separate global resume quality from job-specific matching.
- API-backed checks never run accidentally.
- Unavailable tester tools warn or skip without breaking unrelated local checks.
- Findings include category, severity, evidence, and suggested fix direction.

## Stage 4: Integration Contract

Goal: expose stable commands and reports that Hunt/C2 can call later without coupling to this repo's internals.

Current implementation:

- `npm run check:local`, `npm run check:api`, and `npm run check:full` produce preflight reports.
- `npm run compare` produces a postflight comparison report.
- Reports use stable `pass`, `pass_with_warnings`, and `fail` status values and record whether content left the machine.

Deliverables:

- Stable CLI or npm command contract for preflight checks.
- Post-tailoring regression checks for generated resumes.
- Immutable fact checks for identity, education, employers, titles, dates, and locations.
- Stable JSON status values: `pass`, `pass_with_warnings`, and `fail`.
- Documentation for how external tools should consume reports.

Acceptance criteria:

- Resume Cooker can run independently from Hunt.
- Hunt can call Resume Cooker later through commands or reports, not imports.
- Preflight and postflight results separate source-resume issues from tailoring regressions.
- Reports identify whether content stayed local or left the machine.

## Future UI Direction

Stage 1 should not build the full editing UI, but it should avoid choices that block one later. The intended direction is a local app where a user can view the resume, edit LaTeX, click generate, and see or download the resulting PDF.
