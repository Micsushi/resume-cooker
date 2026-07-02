import assert from "node:assert/strict";
import { test } from "node:test";
import { compareResumeText } from "./compare-lib.mjs";

test("compareResumeText fails when immutable contact patterns change", () => {
  const checks = compareResumeText("A a@example.com 555-111-2222", "A b@example.com 555-111-2222");
  const immutable = checks.find((check) => check.id === "immutable_contact_fields_preserved");

  assert.equal(immutable.status, "fail");
});

test("compareResumeText treats a reformatted but identical contact value as unchanged", () => {
  const checks = compareResumeText(
    "A (555) 111-2222 a@Example.com",
    "A 555-111-2222 a@example.com"
  );
  const immutable = checks.find((check) => check.id === "immutable_contact_fields_preserved");

  assert.equal(immutable.status, "pass");
});

test("compareResumeText warns when prominent source terms disappear", () => {
  const checks = compareResumeText("Built Kubernetes and PostgreSQL systems", "Built systems");
  const retained = checks.find((check) => check.id === "source_strengths_retained");

  assert.equal(retained.status, "warning");
  assert.ok(retained.metadata.missing_terms.includes("Kubernetes"));
});
