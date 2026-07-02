import assert from "node:assert/strict";
import { test } from "node:test";
import { analyzeExtractedText } from "./text-layer.mjs";

test("analyzeExtractedText passes non-empty ordered sections", () => {
  const checks = analyzeExtractedText(
    "Education\nUniversity\nExperience\nBuilt APIs\nProjects\nCompiler\nSkills\nTypeScript"
  );
  const byId = Object.fromEntries(checks.map((check) => [check.id, check]));

  assert.equal(byId.pdf_text_non_empty.status, "pass");
  assert.equal(byId.section_headings_present.status, "pass");
  assert.equal(byId.section_order_readable.status, "pass");
});

test("analyzeExtractedText warns on missing sections and configured terms", () => {
  const checks = analyzeExtractedText("Experience\nBuilt distributed systems", {
    criticalTerms: ["Kubernetes"]
  });

  assert.equal(checks.find((check) => check.id === "section_headings_present").status, "warning");
  assert.equal(checks.find((check) => check.metadata.term === "Kubernetes").status, "warning");
});
