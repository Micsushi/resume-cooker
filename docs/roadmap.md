# Resume Cooker Roadmap

Resume Cooker should stay standalone first. Its job is to make a resume objectively testable before any downstream tailoring system changes it.

## Stage 0: Source Control Baseline

Goal: preserve the current resume and tester snapshots without changing behavior.

Status: started.

Deliverables:

- Current LaTeX resume stored under `resume/source/current.tex`.
- Generated outputs kept out of Git under `resume/output/`.
- ATS/resume tester snapshots stored under `testers/`.
- Sample job description and extracted text stored under `fixtures/`.
- Documentation that explains future work before implementation starts.

Non-goals:

- No resume content edits.
- No LaTeX template changes.
- No C2/Hunt integration code.
- No automated pass/fail gates yet.

## Stage 1: Local PDF Generation

Goal: make resume builds reproducible locally, outside Overleaf.

Planned deliverables:

- A local build command for the current LaTeX resume.
- A predictable output path for generated PDFs.
- A documented dependency path, likely `latexmk` first and Docker second.
- Build logs saved outside source folders.

Acceptance criteria:

- A fresh checkout can generate a PDF with one documented command after dependencies are installed.
- Generated artifacts do not pollute Git status.
- The output PDF is byte-for-byte less important than repeatable, inspectable build steps.

## Stage 2: PDF Text-Layer Smoke Tests

Goal: prove the generated PDF text layer is machine-readable before deeper ATS scoring.

Planned deliverables:

- Extract text from generated PDFs.
- Save extracted text under `resume/output/`.
- Check critical terms for exact extraction.
- Check section order and obvious parser breakage.

Acceptance criteria:

- Important keywords like `Kubernetes`, `Terraform`, `PostgreSQL`, `Kotlin`, `TypeScript`, and `DynamoDB` appear unbroken in extracted text.
- Name, contact, education, experience, projects, and skills appear in a readable order.
- Dates stay close to the matching role or project.
- Failures produce actionable messages instead of silent pass/fail noise.

## Stage 3: ATS-Safe Resume Variant

Goal: create a conservative resume source optimized for parsing.

Planned deliverables:

- A separate ATS-safe LaTeX source file.
- Single-column layout.
- Plain contact text and links.
- Simple section headings.
- Standard bullets.
- Minimal custom layout packages.

Acceptance criteria:

- The ATS-safe PDF extracts cleanly with no broken important keywords.
- The ATS-safe version preserves factual content from the source resume.
- Differences between polished and ATS-safe variants are intentional and documented.

## Stage 4: Resume Quality Criteria Gate

Goal: evaluate resume quality before job-specific tailoring.

Planned deliverables:

- A criteria checklist for structure, ATS parsing, keyword coverage, evidence, clarity, and risk flags.
- A machine-readable report format.
- A human-readable report with suggested areas to improve.
- No automatic content rewrites by default.

Acceptance criteria:

- The report can say what is wrong without changing the resume.
- Each finding has a category, severity, evidence, and suggested fix direction.
- The report separates global resume quality from job-specific matching.

## Stage 5: Job Description Match Tests

Goal: compare a resume against a target JD before and after tailoring.

Planned deliverables:

- Must-have and nice-to-have keyword extraction from a JD.
- Resume/JD coverage report.
- Missing-term report.
- Risk report for ungrounded or suspicious matches.

Acceptance criteria:

- Exact JD terminology is preserved where useful.
- Missing terms are reported only when they are relevant and truthful to include.
- The report distinguishes "not present" from "present under a synonym".

## Stage 6: Multi-Parser Comparison

Goal: compare outputs from multiple parser/checker tools.

Planned deliverables:

- Documented setup for each tester under `testers/`.
- A normalized comparison report across parser outputs.
- Notes on parser disagreement.

Acceptance criteria:

- Contact, education, experience, projects, skills, dates, and links can be compared across tools.
- Parser failures are captured without blocking unrelated checks.
- The report makes disagreement visible rather than pretending one parser is the truth.

## Stage 7: Local And API Test Suites

Goal: separate checks that can run fully locally from checks that may benefit from API-backed evaluators.

Resume Cooker may use external APIs. Hunt C2 should not inherit that requirement. C2 can remain local-model-first while Resume Cooker owns optional API-based resume evaluation.

Planned deliverables:

- `local` suite for deterministic and local-model checks.
- `api` suite for checks that call external providers.
- `full` suite that runs both local and API checks.
- Provider configuration that is explicit and easy to disable.
- Clear report metadata showing which checks used local code, local models, or external APIs.

Local suite examples:

- PDF build.
- PDF text extraction.
- Critical keyword extraction checks.
- Section ordering checks.
- Local parser comparison.
- Local model evaluation when configured.
- Immutable fact comparison before and after tailoring.

API suite examples:

- Stronger LLM review of resume clarity and credibility.
- JD/resume semantic match review.
- ATS-style rubric scoring across multiple role families.
- Detection of suspicious or unsupported claims.
- Comparison between local-model and stronger-model judgments.

Acceptance criteria:

- API checks never run accidentally.
- Missing API keys skip API checks with a clear message.
- Local checks can run offline.
- Full checks can run local and API suites together.
- Parallel execution is supported later where checks are independent.
- Reports label provider, model, timestamp, prompt version, and whether resume/JD content left the machine.

## Stage 8: Hunt C2 Preflight And Postflight Contract

Goal: define how Resume Cooker can eventually run around Hunt C2 without being part of Hunt at first.

Planned deliverables:

- A CLI contract that accepts resume source/PDF plus optional JD.
- A pre-C2 report that says whether the base resume is ready for tailoring.
- A post-C2 report that verifies Fletcher did not damage parseability or core resume quality.
- A stable JSON result that Hunt can consume later.

Acceptance criteria:

- Resume Cooker can run independently from Hunt.
- Hunt can call Resume Cooker later without importing its internals.
- A C2-generated resume must pass the same text-layer and quality checks as the original.
- C2-specific issues are reported separately from source-resume issues.

## Stage 9: CI And Release Workflow

Goal: make resume quality checks easy to run before pushing or applying.

Planned deliverables:

- GitHub Actions or local-only equivalent for build and smoke checks.
- Optional private artifact upload for PDFs.
- Versioned reports.
- Clear docs for when to trust or ignore a warning.

Acceptance criteria:

- The repo can prove a resume build and basic ATS smoke pass from a clean environment.
- CI does not publish private resume artifacts unless explicitly configured.
- Reports remain useful for a human, not just machine pass/fail.
