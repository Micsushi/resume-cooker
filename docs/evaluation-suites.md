# Evaluation Suites

Resume Cooker can use both local checks and API-backed checks. The key boundary is that Resume Cooker owns this evaluation work; Hunt C2/Fletcher should stay local-model-first unless explicitly changed later.

## Principles

- Local checks must be able to run offline.
- API checks must be opt-in.
- Reports must say whether resume or JD content left the machine.
- Local and API results should be comparable but not mixed silently.
- A full run may execute both suites, ideally in parallel once implemented.
- C2 should consume Resume Cooker results later, not inherit Resume Cooker's provider dependencies.

## Suite Types

### Local Suite

Purpose: deterministic checks and checks that can run with local tools or local models.

Examples:

- Build LaTeX to PDF.
- Extract PDF text.
- Verify critical keywords are not broken.
- Verify section order.
- Verify dates stay attached to entries.
- Compare original and generated resume facts.
- Run open-source parser tools from `testers/`.
- Run a local LLM evaluator when configured.

Expected command shape:

```bash
resume-cooker check --suite local --resume resume/source/current.tex
```

### API Suite

Purpose: checks that benefit from stronger external models or provider-specific evaluation.

Examples:

- Resume clarity review.
- ATS-style classification review.
- JD/resume semantic match scoring.
- Claim credibility and unsupported-term detection.
- Comparison between local evaluator and stronger API evaluator.

Expected command shape:

```bash
resume-cooker check --suite api --resume resume/source/current.tex --jd fixtures/software_engineering_intern_jd.txt
```

### Full Suite

Purpose: run local and API checks together when the user explicitly wants the broadest signal.

Expected command shape:

```bash
resume-cooker check --suite full --resume resume/source/current.tex --jd fixtures/software_engineering_intern_jd.txt
```

Future implementation should run independent checks in parallel where possible:

- PDF extraction can run alongside local parser setup checks.
- Local model review can run alongside API review.
- Multiple API rubric checks can run concurrently when rate limits allow.

## Provider Configuration

Future provider config should support:

- `none`: no model calls.
- `local`: local model only.
- `openai`, `anthropic`, `gemini`, or other API providers.
- Per-provider model names.
- Per-provider timeout and retry policy.
- Explicit confirmation that private resume/JD content may leave the machine.

API checks should require explicit configuration. They should not run just because an API key exists in the environment.

## Report Metadata

Every check should report execution source:

```json
{
  "id": "semantic_jd_match",
  "suite": "api",
  "provider": "openai",
  "model": "example-model",
  "content_left_machine": true,
  "status": "warning",
  "severity": "medium"
}
```

Local-model checks should also label themselves clearly:

```json
{
  "id": "local_resume_review",
  "suite": "local",
  "provider": "ollama",
  "model": "local-model-name",
  "content_left_machine": false,
  "status": "pass"
}
```

## Relationship To Hunt C2

Hunt C2 can continue using local models for resume tailoring. Resume Cooker may use API calls for evaluation because it is a separate, explicit quality gate.

Later integration should look like:

```text
Resume Cooker local preflight
Optional Resume Cooker API preflight
Hunt C2 local tailoring
Resume Cooker local postflight
Optional Resume Cooker API postflight
```

If API checks are unavailable, local checks should still provide useful pass/fail and warnings.
