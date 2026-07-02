import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { getRepoRoot } from "../../generator/scripts/build-lib.mjs";

const severityWeight = {
  low: 1,
  medium: 2,
  high: 3,
  blocker: 4
};

export function createCheck({
  id,
  category,
  severity = "low",
  status = "pass",
  suite = "local",
  evidence = "",
  suggestedFix = "",
  provider = "deterministic",
  model = null,
  contentLeftMachine = false,
  metadata = {}
}) {
  return {
    id,
    suite,
    category,
    severity,
    status,
    evidence,
    suggested_fix: suggestedFix,
    provider,
    model,
    content_left_machine: contentLeftMachine,
    metadata
  };
}

export function summarizeChecks(checks) {
  const failing = checks.filter((check) => check.status === "fail");
  if (failing.some((check) => check.severity === "blocker")) return "fail";
  if (failing.length > 0 || checks.some((check) => check.status === "warning")) {
    return "pass_with_warnings";
  }
  return "pass";
}

export function highestSeverity(checks) {
  return checks.reduce((highest, check) => {
    return severityWeight[check.severity] > severityWeight[highest] ? check.severity : highest;
  }, "low");
}

export function createReport({
  stage,
  suite = "local",
  checks = [],
  resume = {},
  artifacts = {},
  summary = "",
  contentLeftMachine = false
}) {
  const status = summarizeChecks(checks);
  return {
    status,
    stage,
    suite,
    summary: summary || defaultSummary(status, checks),
    generated_at: new Date().toISOString(),
    content_left_machine: contentLeftMachine,
    resume,
    artifacts,
    checks
  };
}

export async function writeReport(report, outPath) {
  if (!outPath) return null;
  const fullPath = resolve(getRepoRoot(), outPath);
  await mkdir(dirname(fullPath), { recursive: true });
  await writeFile(fullPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  return fullPath;
}

export function mergeReports({ stage, suite, reports, resume = {}, artifacts = {} }) {
  const checks = reports.flatMap((report) => report.checks || []);
  const flaggedChecks = checks.filter((check) => check.status !== "pass");
  return createReport({
    stage,
    suite,
    resume,
    artifacts,
    checks,
    contentLeftMachine: reports.some((report) => report.content_left_machine),
    summary:
      flaggedChecks.length === 0
        ? `Combined ${reports.length} report(s); no active findings.`
        : `Combined ${reports.length} report(s); highest active severity ${highestSeverity(flaggedChecks)}.`
  });
}

function defaultSummary(status, checks) {
  if (status === "pass") return "All configured checks passed.";
  const flagged = checks.filter((check) => check.status !== "pass").length;
  return `${flagged} check(s) need review.`;
}
