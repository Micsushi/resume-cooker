# RC-005: Safe Live API Provider Validation

## Objective

Prove the OpenRouter and Anthropic adapters against live provider endpoints using public synthetic
data, bounded cost, explicit consent, and sanitized evidence. Unit mocks already prove request and
response mechanics; this task proves real authentication, model compatibility, timeout behavior,
and output parsing.

## Current State

- API review stays disabled unless `RESUME_COOKER_ALLOW_API=true`.
- OpenRouter is the default enabled provider.
- Anthropic is selectable explicitly.
- Input length and output token caps exist.
- Reports mark whether content left the machine.
- Provider, timeout, malformed response, and error cases have unit coverage.

Live authorization, provider availability, request counts, spend, and latest smoke evidence belong
in the private project handoff.

## Scope

### In Scope

- Use only public synthetic resume and JD fixtures.
- Establish a written per-run spend and request-count ceiling.
- Validate authentication and one successful review for each authorized provider.
- Validate model names currently configured by default or replace stale defaults.
- Validate response parsing against actual provider output.
- Validate non-2xx, timeout, and malformed-output handling where safely reproducible.
- Confirm report privacy metadata and sanitized logs.
- Document a repeatable manual smoke procedure that does not expose keys.
- Add provider-contract tests using recorded sanitized shapes if useful and license/privacy-safe.

### Out Of Scope

- Sending a private resume or private job description.
- Storing API keys in the repository, shell history examples, reports, or screenshots.
- Load testing, benchmarking many models, or tuning for maximum score quality.
- Automatically retrying billable requests without a bounded policy.
- Enabling API review by default.
- Selecting a long-term provider for Hunt/Fletcher.

## Dependencies

### Blocked By

- Explicit authorization to make live API calls.
- Disposable or scoped API credentials supplied through the environment.
- A per-provider spend/request limit.
- Network access.
- Public synthetic fixture confirmation.

Do not infer authorization from a key already present in the environment. The opt-in flag protects
runtime behavior; the contributor still needs task-level authorization for live billable calls.

### Blocks

- Claiming API mode is production-ready.
- API-backed option in RC-008.
- Confidence in default provider/model names.

It does not block local-only CLI packaging or local-only Hunt integration.

## Privacy And Cost Guardrails

- Verify fixtures contain no real names, contact values, employers, schools, or unique private
  claims.
- Set `RESUME_COOKER_API_MAX_INPUT_CHARS` deliberately.
- Set `RESUME_COOKER_API_MAX_TOKENS` deliberately.
- Set `RESUME_COOKER_API_TIMEOUT_MS` deliberately.
- Make at most the approved request count.
- Disable shell tracing.
- Do not paste keys into command history or docs.
- Inspect generated reports before sharing them.
- Record provider, model, input character counts, output token limit, and content-left-machine flag;
  do not record raw prompts or responses unless they are fully synthetic and intentionally retained.

## Live Validation Matrix

For each authorized provider:

1. API disabled, key present: no request and `content_left_machine: false`.
2. API enabled, key missing: configuration warning and no request.
3. API enabled, valid key, valid model: one successful review.
4. Oversized synthetic input: rejected locally before request.
5. Invalid model or controlled provider error: warning with sanitized evidence.
6. Very short timeout, if authorized: timeout handled without crash.
7. Model returns valid JSON findings: normalized checks preserve provider/model metadata.
8. Model returns prose or fenced JSON: document actual parsing behavior and improve only if needed.

Avoid intentionally invalid authentication if it creates security alerts or unnecessary provider
traffic; mocked coverage may remain sufficient for that row.

## Acceptance Criteria

- Each authorized provider completes at least one live synthetic-data review.
- Default model identifiers are confirmed current or updated.
- Report says `content_left_machine: true` only after a request is attempted through a configured
  client.
- Disabled and locally rejected paths remain `content_left_machine: false`.
- No secret appears in Git diff, reports, console excerpts, screenshots, or documentation.
- Actual output parses into normalized checks, or the adapter is fixed and retested within budget.
- Timeouts and provider errors do not crash the full suite.
- The manual smoke procedure names exact environment variables and cleanup steps without embedding
  credentials.
- Root unit tests remain network-free.

## Suggested Smoke Procedure

Use environment injection that avoids committed files. Exact secret-loading commands depend on the
user's secret manager and must not be prescribed with a literal key.

```bash
RESUME_COOKER_ALLOW_API=true \
RESUME_COOKER_API_PROVIDER=openrouter \
RESUME_COOKER_API_MODEL=<approved-model> \
RESUME_COOKER_API_TIMEOUT_MS=30000 \
RESUME_COOKER_API_MAX_INPUT_CHARS=12000 \
RESUME_COOKER_API_MAX_TOKENS=600 \
npm run check:api
```

The command uses repository sample fixtures through the current package script. Confirm those
fixtures remain synthetic before running.

## Failure Modes To Guard

- Key exists and API runs without explicit opt-in.
- Private default source is used accidentally.
- Provider changes the response envelope.
- Default model no longer exists.
- Error body contains request data and is copied into evidence.
- Retry behavior exceeds the approved spend.
- `content_left_machine` remains false after a request attempt.
- Fenced or partial JSON creates misleading empty success.
- A live test becomes part of default CI.

## Handoff Evidence

- Explicit authorization scope and request ceiling.
- Providers and models tested.
- Request count and approximate cost if available.
- Synthetic fixture confirmation.
- Sanitized report status and check counts.
- Secret-leak checks performed.
- Untested provider/error paths.
- Whether API mode is ready for RC-008 or remains experimental.
