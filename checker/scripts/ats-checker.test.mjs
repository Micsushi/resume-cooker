import assert from "node:assert/strict";
import { test } from "node:test";
import { checkAtsCheckerAgreement, compareParserExtractions } from "./ats-checker.mjs";

test("compareParserExtractions passes when extractions largely agree", () => {
  const check = compareParserExtractions(
    "Kubernetes Terraform PostgreSQL TypeScript backend engineer",
    "Kubernetes Terraform PostgreSQL TypeScript backend engineer"
  );

  assert.equal(check.status, "pass");
  assert.ok(check.metadata.agreement >= 0.6);
});

test("compareParserExtractions warns when extractions disagree", () => {
  const check = compareParserExtractions(
    "Kubernetes Terraform PostgreSQL TypeScript backend engineer",
    "totally different words here nothing shared alpha beta gamma delta"
  );

  assert.equal(check.status, "warning");
});

test("compareParserExtractions warns when one side has no tokens", () => {
  const check = compareParserExtractions("Kubernetes Terraform", "");

  assert.equal(check.status, "warning");
  assert.equal(check.metadata.ats_tokens, 0);
});

test("checkAtsCheckerAgreement skips gracefully when python is absent", async () => {
  const checks = await checkAtsCheckerAgreement({
    pdf: "resume/output/current.pdf",
    baselineText: "Kubernetes",
    commandExistsImpl: async () => false
  });

  assert.equal(checks.length, 1);
  assert.equal(checks[0].id, "tester_ats_checker_skipped");
});

test("checkAtsCheckerAgreement reports a ran check when the helper succeeds", async () => {
  const checks = await checkAtsCheckerAgreement({
    pdf: "resume/output/current.pdf",
    baselineText: "Kubernetes Terraform PostgreSQL",
    commandExistsImpl: async (cmd) => cmd === "python",
    runCommandImpl: async () => ({
      stdout: JSON.stringify({
        ok: true,
        library: "pypdf",
        text: "Kubernetes Terraform PostgreSQL"
      })
    })
  });

  assert.equal(checks[0].id, "tester_ats_checker_ran");
  assert.equal(checks[1].id, "parser_extraction_agreement");
  assert.equal(checks[1].status, "pass");
});
