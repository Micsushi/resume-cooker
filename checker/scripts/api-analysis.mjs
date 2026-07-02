import { createCheck, createReport } from "./report-lib.mjs";

export function createApiScaffoldReport({ suite = "api", stage = "api_review" } = {}) {
  const allowApi = process.env.RESUME_COOKER_ALLOW_API === "true";
  const provider = process.env.RESUME_COOKER_API_PROVIDER || "none";

  if (!allowApi || provider === "none") {
    return createReport({
      stage,
      suite,
      contentLeftMachine: false,
      checks: [
        createCheck({
          id: "api_review_not_configured",
          suite,
          category: "api_review",
          severity: "low",
          status: "warning",
          provider,
          contentLeftMachine: false,
          evidence: "API/model review is scaffolded but not enabled.",
          suggestedFix:
            "Set explicit provider, privacy, and cost controls before enabling API-backed review."
        })
      ],
      summary: "API checks are opt-in and did not send resume or JD content anywhere."
    });
  }

  return createReport({
    stage,
    suite,
    contentLeftMachine: false,
    checks: [
      createCheck({
        id: "api_review_requires_adapter",
        suite,
        category: "api_review",
        severity: "medium",
        status: "warning",
        provider,
        contentLeftMachine: false,
        evidence: `Provider ${provider} was requested, but no provider adapter is implemented yet.`,
        suggestedFix:
          "Add an explicit provider adapter with timeout, retry, redaction, and logging policy."
      })
    ]
  });
}
