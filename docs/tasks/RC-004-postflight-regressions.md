# RC-004: Complete Postflight Regression Checks

**Planning level:** Epic. Execute through these bounded work packages:

- [RC-004.1](RC-004.1-compare-fixtures-and-facts.md): fixtures and normalized facts.
- [RC-004.2](RC-004.2-immutable-fact-comparison.md): immutable fact comparison.
- [RC-004.3](RC-004.3-strength-retention.md): protected strengths and intentional omissions.
- [RC-004.4](RC-004.4-jd-grounding.md): grounded and ungrounded additions.
- [RC-004.5](RC-004.5-postflight-pdf-checks.md): real PDF/text inspection.
- [RC-004.6](RC-004.6-postflight-report-contract.md): versioned aggregate report.

[D4](../product-decisions.md#d4-postflight-inputs) fixes input precedence. Current contact/term
comparison is partial and supplied PDFs are not yet inspected.

## Objective

Make `compare` a credible post-tailoring safety gate. It must detect factual changes, PDF and text
regressions, lost source strengths, and ungrounded JD additions while explaining which evidence was
checked and which checks could not run.

## Current State

`checker/scripts/compare-lib.mjs` currently checks:

- email and phone patterns are preserved;
- a narrow list of prominent technical terms is retained.

`checker/scripts/compare.mjs` accepts `--pdf` in the report metadata, but does not inspect the PDF.
The documented future contract also includes a JD, but current comparison logic does not use one.
Comparing `current.tex` to itself passes, which proves the scaffold but not a real tailoring case.

The roadmap expects more:

- identity, education, employers, titles, dates, and locations remain stable;
- generated PDF compiles and fits the page limit;
- extracted text remains parseable;
- JD-specific additions are grounded in source facts;
- important strengths are not accidentally removed.

## Scope

### In Scope

- Define a normalized source-fact representation.
- Compare immutable fields without logging their raw values.
- Compare source and tailored resume structure.
- Inspect an optional generated PDF and extracted text.
- Apply the page-limit and text-layer checks already used by local preflight.
- Compare JD-specific additions to grounded source evidence.
- Add public before/after fixtures for passing and failing cases.
- Produce stable categorized checks and exit behavior.
- Preserve the distinction between source defects and tailoring regressions.

### Out Of Scope

- Automatically rewriting the tailored resume.
- Proving real-world truth beyond the provided source profile.
- Inferring private facts from external services.
- Replacing Fletcher's structured schema validation.
- Applying Hunt enforcement or overrides; D3 assigns that responsibility to Hunt.

## Dependencies

### Blocked By

- RC-006.1 publication of accepted D3/D4 comparison and enforcement contracts.
- RC-002 for real PDF, extraction, and page-count acceptance testing.

Independent work can begin on fixtures, fact normalization, source-to-source comparison, and report
contracts before RC-002 completes.

### Blocks

- RC-007 CLI contract and exit semantics.
- RC-008 post-Fletcher quality gate.
- Safe automatic readiness recommendations for C3.

## Required Input Contract

The resolved contract should support:

- required source resume;
- required tailored resume source or structured representation;
- optional but strongly recommended tailored PDF;
- optional JD;
- optional Fletcher structured JSON and concern flags.

Per D4, structured JSON is authoritative for normalized facts when supplied, source/LaTeX governs
preservation, and PDF/text governs artifact checks. Implementation uses a layered design:

1. extract normalized facts from each supported input;
2. compare normalized facts;
3. run artifact checks independently;
4. aggregate results into one report.

## Required Check Families

### Immutable Identity And Contact

- Name presence and stable normalized representation.
- Email equality without printing values.
- Phone equality after formatting normalization.
- Configured location equality after case/whitespace and common region-abbreviation normalization;
  ambiguous equivalence warns.

### Education

- Institution.
- Degree or program.
- Graduation date or expected date.
- Optional location.

### Experience

- Employer.
- Role title.
- Start and end dates.
- Location when treated as immutable.
- Entry count and matching confidence.

### Source Strength Retention

- Technical skills and tools.
- Projects or experience entries selected as prominent.
- High-value claims explicitly marked for retention.
- Intentional omission mechanism so tailoring can remove irrelevant content without permanent
  warnings.

### Grounding Of Additions

- Identify material terms present only after tailoring.
- Match them against source resume facts, approved profile facts, or structured Fletcher evidence.
- Classify ambiguous synonyms separately from clearly ungrounded additions.
- Never treat JD presence alone as proof the candidate possesses a skill.

### PDF And Text Layer

- PDF exists and is non-empty.
- Page count is available and within the configured limit.
- Extracted text is non-empty.
- Standard sections are present and ordered.
- Important source terms are not split or corrupted.
- Parser agreement runs when available.

## Matching Rules

- Normalize case, punctuation, whitespace, common phone formatting, and LaTeX escaping.
- Do not use approximate matching for immutable contact values.
- Use explicit confidence levels when matching education or experience entries.
- A low-confidence match must produce review evidence, not silently pair two records.
- Do not include raw private values in report evidence. Use field type, entry index, hashes, counts,
  or boolean change indicators.
- Keep deterministic comparisons deterministic. Optional model review belongs to RC-005/API mode.

## Report Requirements

Each finding must include:

- stable ID;
- `post_tailoring_regression` or narrower category;
- severity;
- status;
- sanitized evidence;
- suggested fix direction;
- metadata showing input source and match confidence where useful.

The report summary must distinguish:

- source input unavailable or unparseable;
- tailored artifact unavailable or unparseable;
- confirmed factual regression;
- potential regression requiring review;
- optional check skipped.

## Fixture Matrix

Create public synthetic fixtures for:

- identical content with formatting-only contact changes;
- changed email;
- changed phone;
- changed employer;
- changed role title;
- changed date;
- removed technical strength;
- intentionally removed irrelevant strength;
- grounded JD term addition;
- ungrounded JD term addition;
- reformatted but equivalent education entry;
- one-page valid PDF;
- over-limit PDF or mocked page-count result;
- empty or corrupted extracted text.

Fixtures must contain no real personal data.

## Acceptance Criteria

- Real before/after fixtures exercise more than self-comparison.
- Confirmed immutable field changes are blocker failures.
- Formatting-only differences do not fail.
- Ambiguous entry matching produces a review warning with confidence metadata.
- A supplied PDF is actually inspected.
- A supplied JD influences only grounding/match checks, never factual truth by itself.
- An ungrounded material addition is flagged.
- Intentional source-strength removal can be acknowledged through a documented mechanism.
- All report evidence is sanitized.
- Missing optional tools produce explicit incomplete-check warnings.
- Exit code and report status match the RC-006 enforcement contract.

## Verification Commands

```bash
npm test
node checker/scripts/compare.mjs --before fixtures/compare/source.tex --after fixtures/compare/tailored-valid.tex --pdf fixtures/compare/tailored-valid.pdf --jd fixtures/software_engineering_intern_jd.txt --out .runtime/reports/compare-valid.json
node checker/scripts/compare.mjs --before fixtures/compare/source.tex --after fixtures/compare/tailored-fact-change.tex --out .runtime/reports/compare-fail.json
npm run format:check
npm run lint
```

Exact fixture paths may change, but both passing and failing real commands are required.

## Failure Modes To Guard

- Regex extracts a LaTeX command instead of visible text.
- Similar employers or titles are paired incorrectly.
- Missing input is reported as no regression.
- JD terms are treated as candidate facts.
- Report evidence exposes names, emails, phone numbers, or addresses.
- A supplied PDF path is recorded but never read.
- A parser limitation becomes a blocker-level factual accusation.
- Intentional tailoring always triggers noisy strength-loss warnings.

## Handoff Evidence

- Input contract and decision reference.
- Fixture matrix results.
- Sanitized passing and failing reports.
- Exact immutable fields covered.
- PDF checks exercised.
- Known matching limitations and confidence behavior.
- Downstream exit/status semantics for RC-007 and RC-008.
