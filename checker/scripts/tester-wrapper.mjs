import { access } from "node:fs/promises";
import { join } from "node:path";
import { getRepoRoot } from "../../generator/scripts/build-lib.mjs";
import { createCheck } from "./report-lib.mjs";

const testerFolders = ["ATS-Checker", "ats-screener", "Resume-Matcher", "ResumeParser"];

export async function checkTesterSnapshots() {
  const checks = [];
  for (const folder of testerFolders) {
    checks.push(await checkTesterFolder(folder));
  }
  checks.push(
    createCheck({
      id: "tester_wrappers_not_default",
      category: "tester_integration",
      severity: "low",
      status: "warning",
      evidence: "Tester snapshots are present only as reference material in default checks.",
      suggestedFix: "Choose a first tester wrapper before enabling installed tester execution."
    })
  );
  return checks;
}

async function checkTesterFolder(folder) {
  const path = join(getRepoRoot(), "testers", folder);
  try {
    await access(path);
    return createCheck({
      id: "tester_snapshot_present",
      category: "tester_integration",
      severity: "low",
      status: "pass",
      evidence: `Found tester snapshot ${folder}.`,
      metadata: { folder }
    });
  } catch {
    return createCheck({
      id: "tester_snapshot_missing",
      category: "tester_integration",
      severity: "medium",
      status: "warning",
      evidence: `Missing tester snapshot ${folder}.`,
      suggestedFix: "Restore the snapshot or update docs/tester-sources.md.",
      metadata: { folder }
    });
  }
}
