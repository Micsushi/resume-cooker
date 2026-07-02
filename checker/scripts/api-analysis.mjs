import { createProviderClient } from "./api-providers.mjs";
import { createCheck, createReport } from "./report-lib.mjs";

// Produces the API-suite report. Stays opt-in: with no explicit provider and
// RESUME_COOKER_ALLOW_API != "true" it returns a warning and sends nothing.
// When enabled it runs the configured provider adapter and records that content
// left the machine. clientFactory/env are injectable so tests never hit network.
export async function createApiReport({
  suite = "api",
  stage = "api_review",
  resumeText = "",
  jdText = "",
  env = process.env,
  clientFactory = createProviderClient
} = {}) {
  const allowApi = env.RESUME_COOKER_ALLOW_API === "true";
  const provider = allowApi ? env.RESUME_COOKER_API_PROVIDER || "openrouter" : "none";
  const maxInputChars = Number(env.RESUME_COOKER_API_MAX_INPUT_CHARS || 24000);

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
          evidence: "API/model review is available but not enabled.",
          suggestedFix:
            "Set RESUME_COOKER_ALLOW_API=true and RESUME_COOKER_API_PROVIDER before enabling API-backed review."
        })
      ],
      summary: "API checks are opt-in and did not send resume or JD content anywhere."
    });
  }

  if (resumeText.length + jdText.length > maxInputChars) {
    return createReport({
      stage,
      suite,
      contentLeftMachine: false,
      checks: [
        createCheck({
          id: "api_input_too_large",
          suite,
          category: "api_review",
          severity: "medium",
          status: "warning",
          provider,
          contentLeftMachine: false,
          evidence: `API review input exceeded ${maxInputChars} character(s); no content was sent.`,
          suggestedFix:
            "Raise RESUME_COOKER_API_MAX_INPUT_CHARS intentionally or shorten the resume/JD input."
        })
      ]
    });
  }

  let client;
  try {
    client = clientFactory({ provider, env });
  } catch (error) {
    return createReport({
      stage,
      suite,
      contentLeftMachine: false,
      checks: [
        createCheck({
          id: "api_provider_unavailable",
          suite,
          category: "api_review",
          severity: "medium",
          status: "warning",
          provider,
          contentLeftMachine: false,
          evidence: error.message,
          suggestedFix: "Fix provider configuration or credentials before running API review."
        })
      ]
    });
  }

  try {
    const checks = await client.review({ resumeText, jdText });
    return createReport({
      stage,
      suite,
      contentLeftMachine: true,
      checks,
      summary: `API review ran via ${provider} (${client.model || "unknown model"}). Content left the machine.`
    });
  } catch (error) {
    return createReport({
      stage,
      suite,
      contentLeftMachine: true,
      checks: [
        createCheck({
          id: "api_review_failed",
          suite,
          category: "api_review",
          severity: "medium",
          status: "warning",
          provider,
          model: client.model || null,
          contentLeftMachine: true,
          evidence: error.message,
          suggestedFix: "Retry later or check provider status, rate limits, and timeout settings."
        })
      ]
    });
  }
}

// Backward-compatible alias for callers/tests that used the scaffold name.
export const createApiScaffoldReport = createApiReport;
