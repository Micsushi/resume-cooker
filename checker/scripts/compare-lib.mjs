import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { getRepoRoot } from "../../generator/scripts/build-lib.mjs";
import { createCheck } from "./report-lib.mjs";

const immutablePatterns = [
  {
    id: "email",
    pattern: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,
    normalize: (value) => value.toLowerCase()
  },
  {
    id: "phone",
    pattern: /(?:\+?1[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}/g,
    normalize: (value) => value.replace(/\D/g, "")
  }
];

const knownTechTerms = [
  "DynamoDB",
  "Kotlin",
  "Kubernetes",
  "PostgreSQL",
  "React",
  "Terraform",
  "TypeScript"
];

export async function compareResumeFiles({ before, after }) {
  const [beforeText, afterText] = await Promise.all([
    readFile(resolve(getRepoRoot(), before), "utf8"),
    readFile(resolve(getRepoRoot(), after), "utf8")
  ]);
  return compareResumeText(beforeText, afterText);
}

export function compareResumeText(beforeText, afterText) {
  const checks = [];
  checks.push(compareImmutablePatterns(beforeText, afterText));
  checks.push(compareStrengthRetention(beforeText, afterText));
  return checks;
}

function compareImmutablePatterns(beforeText, afterText) {
  const changed = [];
  for (const item of immutablePatterns) {
    const beforeValues = uniqueMatches(beforeText, item.pattern, item.normalize);
    const afterValues = uniqueMatches(afterText, item.pattern, item.normalize);
    if (!sameSet(beforeValues, afterValues)) changed.push(item.id);
  }

  return createCheck({
    id: "immutable_contact_fields_preserved",
    category: "post_tailoring_regression",
    severity: "blocker",
    status: changed.length === 0 ? "pass" : "fail",
    evidence:
      changed.length === 0
        ? "Detected immutable contact patterns are preserved."
        : `Detected changed immutable contact pattern(s): ${changed.join(", ")}.`,
    suggestedFix:
      changed.length === 0
        ? ""
        : "Review tailored output manually before using it downstream. Do not print private values in logs."
  });
}

function compareStrengthRetention(beforeText, afterText) {
  const beforeTerms = extractUppercaseTechTerms(beforeText);
  const afterLower = afterText.toLowerCase();
  const missing = beforeTerms
    .filter((term) => !afterLower.includes(term.toLowerCase()))
    .slice(0, 15);
  return createCheck({
    id: "source_strengths_retained",
    category: "post_tailoring_regression",
    severity: "medium",
    status: missing.length === 0 ? "pass" : "warning",
    evidence:
      missing.length === 0
        ? "Prominent source technical terms are retained."
        : `Prominent source technical term(s) missing from after text: ${missing.join(", ")}.`,
    suggestedFix:
      missing.length === 0
        ? ""
        : "Confirm whether omitted source strengths were intentionally removed for the target JD.",
    metadata: { missing_terms: missing }
  });
}

function extractUppercaseTechTerms(text) {
  const matches = text.match(/\b[A-Z][A-Za-z0-9+#.-]{2,}\b/g) || [];
  return [...new Set(matches)]
    .filter((term) => knownTechTerms.includes(term) || !/^[A-Z][a-z]+$/.test(term))
    .slice(0, 50);
}

function uniqueMatches(text, pattern, normalize = (value) => value) {
  return [...new Set((text.match(pattern) || []).map(normalize))].sort();
}

function sameSet(a, b) {
  return a.length === b.length && a.every((item, index) => item === b[index]);
}
