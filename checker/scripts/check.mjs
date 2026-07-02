import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildPdf, getRepoRoot, parseArgs } from "../../generator/scripts/build-lib.mjs";
import { createApiScaffoldReport } from "./api-analysis.mjs";
import { analyzeJobDescription } from "./jd-analysis.mjs";
import { createReport, mergeReports, writeReport } from "./report-lib.mjs";
import { analyzeLatexSource } from "./source-analysis.mjs";
import { checkTesterSnapshots } from "./tester-wrapper.mjs";
import { analyzeExtractedText, extractPdfText } from "./text-layer.mjs";

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = parseArgs(process.argv.slice(2));

  try {
    const report = await runCheck(args);
    const written = await writeReport(report, args.out);
    console.log(JSON.stringify({ status: report.status, report: written || null }, null, 2));
    if (report.status === "fail") process.exitCode = 1;
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

const defaultCriticalTerms = [
  "Kubernetes",
  "Terraform",
  "PostgreSQL",
  "Kotlin",
  "TypeScript",
  "DynamoDB"
];

export async function runCheck(options = {}) {
  const suite = options.suite || "local";
  if (suite === "api") return createApiScaffoldReport({ suite: "api", stage: "preflight" });
  if (suite === "full") {
    const local = await runLocalCheck(options);
    const api = createApiScaffoldReport({ suite: "api", stage: "preflight" });
    return mergeReports({
      stage: "preflight",
      suite: "full",
      reports: [local, api],
      resume: local.resume,
      artifacts: local.artifacts
    });
  }
  return runLocalCheck(options);
}

async function runLocalCheck(options) {
  const resume = options.resume || "resume/source/current.tex";
  const checks = [];
  const artifacts = {};
  let resumeText = "";
  let pdfPath = options.pdf;

  if (extname(resume).toLowerCase() === ".tex") {
    checks.push(...(await analyzeLatexSource(resume)));
    resumeText = await readFile(resolve(getRepoRoot(), resume), "utf8");
    if (options.build === "true") {
      const result = await buildPdf({
        source: resume,
        outDir: options["out-dir"] || "resume/output",
        engine: options.engine || "auto"
      });
      pdfPath = result.pdfPath;
      artifacts.pdf = pdfPath;
    }
  }

  // Fall back to an already-built PDF so text-layer checks run without forcing a build.
  if (!pdfPath) {
    const defaultPdf = "resume/output/current.pdf";
    if (existsSync(resolve(getRepoRoot(), defaultPdf))) pdfPath = defaultPdf;
  }

  if (pdfPath && existsSync(resolve(getRepoRoot(), pdfPath))) {
    const extracted = await extractPdfText({
      pdf: pdfPath,
      out: options["text-out"] || "resume/output/current.txt"
    });
    artifacts.extracted_text = extracted.path;
    resumeText = extracted.text;
    checks.push(
      ...analyzeExtractedText(extracted.text, {
        warnPageLimit: true,
        criticalTerms: defaultCriticalTerms
      })
    );
  }

  checks.push(...(await analyzeJobDescription({ jdPath: options.jd, resumeText })));
  checks.push(...(await checkTesterSnapshots()));

  return createReport({
    stage: "preflight",
    suite: "local",
    resume: {
      source: resume,
      pdf: pdfPath || null,
      extracted_text: artifacts.extracted_text || null
    },
    artifacts,
    checks,
    contentLeftMachine: false
  });
}
