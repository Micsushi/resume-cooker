import assert from "node:assert/strict";
import { test } from "node:test";
import { analyzeExtractedText, checkPdfPageLimit } from "./text-layer.mjs";

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

test("checkPdfPageLimit passes at one page", async () => {
  const check = await checkPdfPageLimit({
    pdf: "resume/output/current.pdf",
    commandExistsImpl: async (command) => command === "pdfinfo",
    runCommandImpl: async () => ({ stdout: "Title: Resume\nPages: 1\n" })
  });

  assert.equal(check.status, "pass");
  assert.equal(check.metadata.pages, 1);
});

test("checkPdfPageLimit hard fails over one page", async () => {
  const check = await checkPdfPageLimit({
    pdf: "resume/output/current.pdf",
    commandExistsImpl: async (command) => command === "pdfinfo",
    runCommandImpl: async () => ({ stdout: "Pages: 2\n" })
  });

  assert.equal(check.status, "fail");
  assert.equal(check.severity, "blocker");
});

test("checkPdfPageLimit warns when no page counter is available", async () => {
  const check = await checkPdfPageLimit({
    pdf: "resume/output/current.pdf",
    commandExistsImpl: async () => false
  });

  assert.equal(check.id, "pdf_page_count_unavailable");
  assert.equal(check.status, "warning");
});
