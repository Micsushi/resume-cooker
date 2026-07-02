import assert from "node:assert/strict";
import { test } from "node:test";
import { createCheck, createReport, mergeReports, summarizeChecks } from "./report-lib.mjs";

test("summarizeChecks maps blockers to fail and warnings to pass_with_warnings", () => {
  assert.equal(summarizeChecks([createCheck({ id: "ok", category: "test" })]), "pass");
  assert.equal(
    summarizeChecks([createCheck({ id: "warn", category: "test", status: "warning" })]),
    "pass_with_warnings"
  );
  assert.equal(
    summarizeChecks([
      createCheck({ id: "fail", category: "test", severity: "blocker", status: "fail" })
    ]),
    "fail"
  );
});

test("mergeReports preserves content-left-machine metadata", () => {
  const local = createReport({
    stage: "preflight",
    suite: "local",
    checks: [createCheck({ id: "local_ok", category: "test" })]
  });
  const api = createReport({
    stage: "preflight",
    suite: "api",
    contentLeftMachine: true,
    checks: [createCheck({ id: "api_warn", category: "test", status: "warning" })]
  });

  const merged = mergeReports({
    stage: "preflight",
    suite: "full",
    reports: [local, api]
  });

  assert.equal(merged.status, "pass_with_warnings");
  assert.equal(merged.content_left_machine, true);
  assert.equal(merged.checks.length, 2);
});
