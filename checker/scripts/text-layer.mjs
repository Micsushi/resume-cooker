import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { commandExists, getRepoRoot, runCommand } from "../../generator/scripts/build-lib.mjs";
import { createCheck } from "./report-lib.mjs";

export const defaultSections = ["Education", "Experience", "Projects", "Skills"];

export async function extractPdfText({
  pdf,
  out,
  commandExistsImpl = commandExists,
  runCommandImpl = runCommand
}) {
  const pdfPath = resolve(getRepoRoot(), pdf);
  const outPath = resolve(getRepoRoot(), out || ".runtime/reports/extracted.txt");
  await mkdir(dirname(outPath), { recursive: true });

  if (await commandExistsImpl("pdftotext")) {
    await runCommandImpl("pdftotext", ["-layout", pdfPath, outPath], { quiet: true });
    return {
      tool: "pdftotext",
      path: outPath,
      text: await readFile(outPath, "utf8"),
      contentLeftMachine: false
    };
  }

  if (await commandExistsImpl("docker")) {
    const repoRoot = getRepoRoot().replaceAll("\\", "/");
    const dockerPdf = pdfPath.replaceAll("\\", "/").replace(repoRoot, "/workdir");
    const dockerOut = outPath.replaceAll("\\", "/").replace(repoRoot, "/workdir");
    await runCommandImpl(
      "docker",
      [
        "run",
        "--rm",
        "-v",
        `${repoRoot}:/workdir`,
        "-w",
        "/workdir",
        "minidocks/poppler",
        "pdftotext",
        "-layout",
        dockerPdf,
        dockerOut
      ],
      { quiet: true }
    );
    return {
      tool: "docker:pdftotext",
      path: outPath,
      text: await readFile(outPath, "utf8"),
      contentLeftMachine: false
    };
  }

  throw new Error("No PDF text extractor found. Install pdftotext/poppler or Docker.");
}

export async function analyzeExtractedTextFile(path, options = {}) {
  const fullPath = resolve(getRepoRoot(), path);
  return analyzeExtractedText(await readFile(fullPath, "utf8"), options);
}

export function analyzeExtractedText(text, options = {}) {
  const checks = [];
  const normalized = normalizeText(text);
  const sections = options.sections || defaultSections;
  const criticalTerms = options.criticalTerms || [];

  checks.push(checkNonEmptyText(normalized));
  checks.push(...checkSectionPresenceAndOrder(normalized, sections));
  checks.push(...checkCriticalTerms(normalized, criticalTerms));
  checks.push(checkEncodingNoise(normalized));

  if (options.warnPageLimit) {
    checks.push(
      createCheck({
        id: "page_limit_warning_only",
        category: "pdf_text_layer",
        severity: "low",
        status: "warning",
        evidence: "Page-limit enforcement is warning-only until report semantics are finalized.",
        suggestedFix: "Decide later whether page count should fail Stage 2 or Stage 3/4 checks."
      })
    );
  }

  return checks;
}

export async function saveExtractedText(text, out) {
  const outPath = resolve(getRepoRoot(), out);
  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, text, "utf8");
  return outPath;
}

function checkNonEmptyText(text) {
  const ok = text.trim().length > 0;
  return createCheck({
    id: "pdf_text_non_empty",
    category: "pdf_text_layer",
    severity: "blocker",
    status: ok ? "pass" : "fail",
    evidence: ok ? "Extracted text is non-empty." : "Extracted text is empty.",
    suggestedFix: ok ? "" : "Rebuild the PDF and inspect whether the PDF text layer is selectable."
  });
}

function checkSectionPresenceAndOrder(text, sections) {
  const positions = sections.map((section) => ({
    section,
    index: text.search(new RegExp(`\\b${escapeRegExp(section)}\\b`, "i"))
  }));

  const missing = positions.filter((position) => position.index === -1);
  const present = positions.filter((position) => position.index !== -1);
  const ordered = present.every((position, index) => {
    if (index === 0) return true;
    return position.index >= present[index - 1].index;
  });

  return [
    createCheck({
      id: "section_headings_present",
      category: "pdf_text_layer",
      severity: "high",
      status: missing.length === 0 ? "pass" : "warning",
      evidence:
        missing.length === 0
          ? `Found expected sections: ${sections.join(", ")}.`
          : `Missing expected section heading(s): ${missing.map((item) => item.section).join(", ")}.`,
      suggestedFix:
        missing.length === 0 ? "" : "Confirm whether the resume uses standard section headings."
    }),
    createCheck({
      id: "section_order_readable",
      category: "pdf_text_layer",
      severity: "medium",
      status: ordered ? "pass" : "warning",
      evidence: ordered
        ? "Detected sections appear in expected order."
        : "Detected sections appear out of expected order.",
      suggestedFix: ordered
        ? ""
        : "Inspect extracted text order before adding stricter ATS or postflight gates."
    })
  ];
}

function checkCriticalTerms(text, terms) {
  return terms.map((term) => {
    const found = text.toLowerCase().includes(term.toLowerCase());
    return createCheck({
      id: "critical_term_present",
      category: "pdf_text_layer",
      severity: "medium",
      status: found ? "pass" : "warning",
      evidence: found
        ? `Configured term "${term}" appears in extracted text.`
        : `Configured term "${term}" was not found exactly in extracted text.`,
      suggestedFix: found
        ? ""
        : "Check whether the term is absent intentionally or split/corrupted in the PDF text layer.",
      metadata: { term }
    });
  });
}

function checkEncodingNoise(text) {
  const replacementCount = (text.match(/\uFFFD/g) || []).length;
  return createCheck({
    id: "encoding_noise_low",
    category: "pdf_text_layer",
    severity: "high",
    status: replacementCount === 0 ? "pass" : "warning",
    evidence:
      replacementCount === 0
        ? "No Unicode replacement characters found."
        : `Found ${replacementCount} Unicode replacement character(s).`,
    suggestedFix:
      replacementCount === 0
        ? ""
        : "Inspect LaTeX font encoding, glyph commands, or the extraction tool output."
  });
}

function normalizeText(text) {
  return text.replace(/\r\n/g, "\n");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
