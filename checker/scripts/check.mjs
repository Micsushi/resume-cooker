import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildPdf, getRepoRoot, parseArgs } from "../../generator/scripts/build-lib.mjs";
import { checkAtsCheckerAgreement } from "./ats-checker.mjs";
import { createApiReport } from "./api-analysis.mjs";
import { analyzeJobDescription } from "./jd-analysis.mjs";
import { createReport, mergeReports, writeReport } from "./report-lib.mjs";
import { analyzeLatexSource } from "./source-analysis.mjs";
import { checkTesterSnapshots } from "./tester-wrapper.mjs";
import { analyzeExtractedText, checkPdfPageLimit, extractPdfText } from "./text-layer.mjs";

const defaultCriticalTerms = [
  "Kubernetes",
  "Terraform",
  "PostgreSQL",
  "Kotlin",
  "TypeScript",
  "DynamoDB"
];

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

export async function runCheck(options = {}) {
  const suite = options.suite || "local";
  if (suite === "api") {
    const { resumeText, jdText } = await readReviewInputs(options);
    return createApiReport({ suite: "api", stage: "preflight", resumeText, jdText });
  }
  if (suite === "full") {
    const [local, review] = await Promise.all([
      runLocalCheck(options),
      readReviewInputs(options).then(({ resumeText, jdText }) =>
        createApiReport({ suite: "api", stage: "preflight", resumeText, jdText })
      )
    ]);
    return mergeReports({
      stage: "preflight",
      suite: "full",
      reports: [local, review],
      resume: local.resume,
      artifacts: local.artifacts
    });
  }
  return runLocalCheck(options);
}

async function readReviewInputs(options) {
  const resume = options.resume || "resume/source/current.tex";
  let resumeText = "";
  let jdText = "";
  try {
    resumeText = await readFile(resolve(getRepoRoot(), resume), "utf8");
  } catch {
    resumeText = "";
  }
  if (options.jd) {
    try {
      jdText = await readFile(resolve(getRepoRoot(), options.jd), "utf8");
    } catch {
      jdText = "";
    }
  }
  return { resumeText, jdText };
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
    checks.push(
      await checkPdfPageLimit({
        pdf: pdfPath,
        maxPages: Number(options["max-pages"] || 1)
      })
    );
    const extracted = await extractPdfText({
      pdf: pdfPath,
      out: options["text-out"] || "resume/output/current.txt"
    });
    artifacts.extracted_text = extracted.path;
    resumeText = extracted.text;
    checks.push(
      ...analyzeExtractedText(extracted.text, {
        criticalTerms: defaultCriticalTerms
      })
    );
    checks.push(
      ...(await checkAtsCheckerAgreement({ pdf: pdfPath, baselineText: extracted.text }))
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
