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

Hunt can later shell out to those commands or call a tiny HTTP service. That keeps Resume Cooker testable independently and avoids coupling it to Hunt's DB schema.

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

## Open Design Questions

- Should Resume Cooker generate the ATS-safe resume, or only verify one exists?
- Should pre-C2 failure block C2 automatically, or only warn?
- What exact critical keyword list should be global versus role-specific?
- Should post-C2 compare against raw LaTeX, parsed structured resume JSON, or both?
- Should private PDFs ever be uploaded as GitHub Action artifacts?
- Should reports be committed, ignored, or stored only in runtime output?
