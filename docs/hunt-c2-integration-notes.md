# Hunt C2 Integration Notes

Resume Cooker should remain a standalone project for now. Later, Hunt can call it before and after C2/Fletcher tailoring.

## What Hunt C2 Does Today

Based on the current Hunt docs and code:

- C2 is called Fletcher.
- Fletcher parses a source resume from `.tex` or a text-based `.pdf`.
- It classifies the role family and job level.
- It extracts JD keywords and concern flags.
- It generates structured resume output constrained by schemas.
- It compiles TeX/PDF artifacts.
- It writes attempt metadata, flags, logs, and review packages.
- It exposes a review workspace for manual edits and recompilation.
- C3 receives selected resume paths and a readiness flag through the coordinator apply context.

Important current C2 contracts:

- `fletcher/prompts/pass1_keyword_extraction.md` extracts JD hiring signals before rewriting.
- `fletcher/prompts/pass2_resume_rewrite.md` rewrites only from grounded facts and preserves immutable identity fields.
- `fletcher/schemas/tailored_resume.schema.json` constrains role family, job level, section order, entries, skills, and concern flags.
- `coordinator/apply_prep.py` blocks C3 when `selected_resume_ready_for_c3` is false or `selected_resume_pdf_path` is missing.
- Fletcher already logs source resume structure and compiles starting resume artifacts during ad-hoc flows.

## Desired Placement

Resume Cooker should eventually run in two places:

1. Pre-C2: validate the source resume before Fletcher tailors it.
2. Post-C2: validate Fletcher's generated resume before C3 uses it for applications.

This creates a quality loop:

```text
User resume
  -> Resume Cooker preflight
  -> Hunt C2 / Fletcher tailoring
  -> Resume Cooker postflight
  -> C3 application filling
```

## Pre-C2 Gate

Purpose: make sure Fletcher receives a good base resume.

Inputs:

- Source resume `.tex` or `.pdf`.
- Optional target JD.
- Optional target role family.

Checks:

- Source exists and is parseable.
- PDF text layer extracts cleanly if a PDF is provided or generated.
- Critical keywords are not broken.
- Resume structure is clear enough for tailoring.
- Role target is not too broad.
- Skills and experience are strong enough for downstream matching.

Outputs:

- `pass`: resume is ready for C2.
- `pass_with_warnings`: C2 can run, but user should review issues.
- `fail`: C2 should not run until blockers are fixed.

Example blocker reasons:

- text extraction fails
- important keywords split in extracted text
- resume has no parseable experience section
- immutable fields cannot be detected

## Post-C2 Gate

Purpose: make sure Fletcher's output is still ATS-safe and truthful.

Inputs:

- Original source resume.
- Fletcher generated `.tex`.
- Fletcher generated `.pdf`.
- Optional JD and Fletcher keyword output.
- Optional Fletcher structured output and concern flags.

Checks:

- Generated PDF compiles and exists.
- Generated PDF text extracts cleanly.
- Immutable facts match the source resume.
- JD-specific terms are grounded in the source facts or known profile.
- Important source strengths were not dropped accidentally.
- Page limit still passes.
- C2 concern flags are preserved or translated into Resume Cooker warnings.

Outputs:

- A postflight report.
- A readiness recommendation for C3.
- Optional normalized flags that Hunt can later store as `latest_resume_flags`.

## Standalone Boundary

Resume Cooker should not import Hunt internals at first.

Preferred integration boundary:

```bash
resume-cooker check --resume path/to/resume.tex --jd path/to/job.txt --out report.json
resume-cooker compare --before source.tex --after tailored.tex --pdf tailored.pdf --jd job.txt --out postflight.json
```

Current npm commands:

```bash
npm run check:local
npm run check:full
npm run compare
```

These commands emit the current `pass`, `pass_with_warnings`, and `fail` shape under
`.runtime/reports/`. They are partial scaffolds, not yet a packaged `resume-cooker` binary or the
schema-v1 integration boundary defined by D7.

Hunt can later shell out to those commands or call a tiny HTTP service. That keeps Resume Cooker testable independently and avoids coupling it to Hunt's DB schema.

## Model And API Boundary

Hunt C2 can remain local-model-first. Resume Cooker may use API-backed evaluation separately.

Recommended split:

- C2/Fletcher: local model or deterministic tailoring, with current provider policy unchanged.
- Resume Cooker local suite: deterministic checks, local parsers, local model review when configured.
- Resume Cooker API suite: optional external model evaluation for harder judgment tasks.

This means C2 does not need API access to tailor resumes. API calls, when useful, live in Resume Cooker as explicit preflight or postflight checks.

Future Hunt integration should be able to choose:

- Run only Resume Cooker local checks before/after C2.
- Run only Resume Cooker API checks for deeper review.
- Run a full check that includes both suites.

Any API-backed report passed back to Hunt should clearly mark that external evaluation was used.

## Candidate Report Contract

Future JSON should be stable enough for Hunt to consume:

```json
{
  "status": "pass_with_warnings",
  "stage": "pre_c2",
  "summary": "Resume is parseable but has multi-column layout risk.",
  "flags": [
    {
      "id": "multi_column_layout_risk",
      "severity": "medium",
      "category": "ats_structure",
      "evidence": "Source uses paracol-based two-column entries.",
      "suggested_fix": "Generate an ATS-safe single-column variant."
    }
  ],
  "artifacts": {
    "extracted_text": "resume/output/current.txt"
  }
}
```

## Relationship To C2 Flags

Fletcher already has concern flags such as:

- `weak_description`
- `low_confidence_match`
- `page_limit_failed`
- `insufficient_source_facts`
- `manual_review_recommended`

Resume Cooker should add lower-level resume quality flags, such as:

- `pdf_text_empty`
- `keyword_broken_in_pdf_text`
- `section_order_unstable`
- `multi_column_layout_risk`
- `identity_field_changed`
- `post_c2_parse_regression`
- `post_c2_ungrounded_addition`

When integrated later, Hunt can keep Fletcher flags and Resume Cooker flags separate. Fletcher flags explain tailoring confidence. Resume Cooker flags explain resume artifact quality.

## Accepted Integration Contracts

Durable decisions live in [`docs/product-decisions.md`](product-decisions.md):

- Private PDFs are never uploaded as GitHub Action artifacts. CI stays lightweight and never publishes private resume content.
- Reports and extracted text are ignored/private, stored only under runtime output (`.runtime/`), not committed.
- There is no static global must-preserve keyword list as the primary integrity mechanism. Callers
  may provide protected-strength IDs; deterministic extraction checks cover empty text, encoding,
  sections, and configured terms. Optional external review remains advisory.
- ATS profile hard-fails a known page count over one by default. Unknown count is an incomplete
  warning in normal mode and unavailable required capability in strict mode. Caller policy may be
  versioned.
- Current source preflight reports contact presence/parseability without printing values. Postflight
  comparison currently checks normalized email and phone preservation. RC-004.1 through RC-004.6
  add structured facts, broader immutable fields, protected strengths, grounding, and PDF inspection.
- ATS ownership is hybrid: caller source is authoritative; Resume Cooker may provide an optional
  variant but cannot invent claims.
- Hunt owns enforcement. Preflight `fail` blocks Fletcher by default, warnings proceed visibly, and
  overrides require approver, reason, report identity, and timestamp.
- Structured JSON is authoritative for facts when present; source/LaTeX governs preservation and the
  final PDF/text governs artifact quality.
- ATS-Checker integrates first and is strict-profile required. Other tester dependencies remain
  optional for normal local use.
- OpenRouter and Anthropic review remains explicit, bounded, advisory, and cannot be the sole hard
  blocker.

## Planned Integration Packages

No Hunt integration code exists yet. Execute in order:

1. [RC-008.1](tasks/RC-008.1-hunt-surface-inventory.md): inspect current Hunt paths and freeze
   fixtures; revalidate older path notes above.
2. [RC-008.2](tasks/RC-008.2-hunt-process-adapter.md): validated CLI process boundary.
3. [RC-008.3](tasks/RC-008.3-hunt-preflight-policy.md): preflight and audited override.
4. [RC-008.4](tasks/RC-008.4-hunt-postflight.md): post-Fletcher comparison.
5. [RC-008.5](tasks/RC-008.5-hunt-readiness-mapping.md): namespaced flags and C3 readiness.
6. [RC-008.6](tasks/RC-008.6-hunt-end-to-end-rollout.md): enabled, failure, and rollback proof.
