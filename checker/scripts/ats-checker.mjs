import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { commandExists, getRepoRoot, runCommand } from "../../generator/scripts/build-lib.mjs";
import { createCheck } from "./report-lib.mjs";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const extractScript = resolve(scriptDir, "ats_checker_extract.py");

// Runs the ATS-Checker style PDF text extraction via a small Python helper.
// Returns a structured result instead of throwing so callers can skip cleanly
// when Python or a PDF reader library is unavailable.
export async function runAtsCheckerExtraction({
  pdf,
  commandExistsImpl = commandExists,
  runCommandImpl = runCommand
} = {}) {
  const python = await detectPython(commandExistsImpl);
  if (!python) {
    return { available: false, reason: "python not found" };
  }

  const pdfPath = resolve(getRepoRoot(), pdf);
  let stdout = "";
  try {
    const result = await runCommandImpl(python, [extractScript, pdfPath], { quiet: true });
    stdout = result.stdout || "";
  } catch (error) {
    // The helper prints a JSON error payload before exiting non-zero.
    stdout = error.stdout || "";
    if (!stdout) return { available: false, reason: error.message };
  }

  let parsed;
  try {
    parsed = JSON.parse(stdout);
  } catch {
    return { available: false, reason: "could not parse extractor output" };
  }

  if (!parsed.ok) return { available: false, reason: parsed.error || "extractor failed" };
  return { available: true, tool: `ats-checker:${parsed.library}`, text: parsed.text || "" };
}

async function detectPython(commandExistsImpl) {
  if (await commandExistsImpl("python")) return "python";
  if (await commandExistsImpl("python3")) return "python3";
  return null;
}

// Pure, testable comparison of two extracted-text bodies. Surfaces parser
// disagreement (Stage 3 goal) without depending on Python being installed.
export function compareParserExtractions(baselineText, atsText) {
  const baseline = tokenSet(baselineText);
  const ats = tokenSet(atsText);

  if (baseline.size === 0 || ats.size === 0) {
    return createCheck({
      id: "parser_extraction_agreement",
      category: "tester_integration",
      severity: "medium",
      status: "warning",
      evidence: "One or both extractors produced no comparable tokens.",
      suggestedFix: "Confirm the PDF has a selectable text layer before trusting parser output.",
      metadata: { baseline_tokens: baseline.size, ats_tokens: ats.size }
    });
  }

  const shared = [...baseline].filter((token) => ats.has(token));
  const union = new Set([...baseline, ...ats]);
  const agreement = shared.length / union.size;
  const onlyInBaseline = [...baseline].filter((token) => !ats.has(token)).slice(0, 20);
  const onlyInAts = [...ats].filter((token) => !baseline.has(token)).slice(0, 20);
  const ok = agreement >= 0.6;

  return createCheck({
    id: "parser_extraction_agreement",
    category: "tester_integration",
    severity: "medium",
    status: ok ? "pass" : "warning",
    evidence: ok
      ? `Baseline and ATS-Checker extractions agree on ${(agreement * 100).toFixed(0)}% of tokens.`
      : `Baseline and ATS-Checker extractions agree on only ${(agreement * 100).toFixed(0)}% of tokens.`,
    suggestedFix: ok
      ? ""
      : "Inspect layout/encoding: parser disagreement can mean an ATS reads the resume differently.",
    metadata: {
      agreement: Number(agreement.toFixed(3)),
      only_in_baseline: onlyInBaseline,
      only_in_ats: onlyInAts
    }
  });
}

// Convenience for the local suite: run the wrapper and turn the result into checks.
export async function checkAtsCheckerAgreement({ pdf, baselineText, ...deps } = {}) {
  const extraction = await runAtsCheckerExtraction({ pdf, ...deps });
  if (!extraction.available) {
    return [
      createCheck({
        id: "tester_ats_checker_skipped",
        category: "tester_integration",
        severity: "low",
        status: "warning",
        evidence: `ATS-Checker wrapper skipped: ${extraction.reason}.`,
        suggestedFix: "Install Python with PyPDF2 or pypdf to enable ATS-Checker parser comparison."
      })
    ];
  }

  return [
    createCheck({
      id: "tester_ats_checker_ran",
      category: "tester_integration",
      severity: "low",
      status: "pass",
      evidence: `ATS-Checker extraction ran via ${extraction.tool}.`,
      metadata: { tool: extraction.tool }
    }),
    compareParserExtractions(baselineText || "", extraction.text)
  ];
}

function tokenSet(text) {
  return new Set(
    (text || "")
      .toLowerCase()
      .match(/[a-z0-9][a-z0-9+#.-]{1,}/g)
      ?.filter((token) => token.length >= 3) || []
  );
}
