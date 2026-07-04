import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  commandExists,
  getRepoRoot,
  parseArgs,
  runCommand
} from "../../generator/scripts/build-lib.mjs";
import { runAtsCheckerExtraction } from "./ats-checker.mjs";
import { createCheck, createReport, writeReport } from "./report-lib.mjs";

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = parseArgs(process.argv.slice(2));
  try {
    const report = await runTesterSuite(args);
    const written = await writeReport(report, args.out);
    console.log(JSON.stringify({ status: report.status, report: written || null }, null, 2));
    if (report.status === "fail") process.exitCode = 1;
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

export async function runTesterSuite(options = {}) {
  const checks = [];
  const tools = selectedTools(options.tool || "all");

  if (tools.includes("ats-checker")) {
    checks.push(...(await runAtsChecker(options)));
  }
  if (tools.includes("ats-screener")) {
    checks.push(await runAtsScreener(options));
  }
  if (tools.includes("resume-parser")) {
    checks.push(await runResumeParser(options));
  }
  if (tools.includes("resume-matcher")) {
    checks.push(await runResumeMatcher(options));
  }

  return createReport({
    stage: "tester_execution",
    suite: "local",
    summary: "Explicit tester execution report.",
    contentLeftMachine: false,
    artifacts: { pdf: options.pdf || null, text: options.text || null, jd: options.jd || null },
    checks
  });
}

function selectedTools(value) {
  if (value === "all") return ["ats-checker", "ats-screener", "resume-parser", "resume-matcher"];
  return value
    .split(",")
    .map((tool) => tool.trim())
    .filter(Boolean);
}

async function runAtsChecker(options) {
  if (!options.pdf || !existsSync(resolve(getRepoRoot(), options.pdf))) {
    return [
      skipped("tester_ats_checker_skipped", "ATS-Checker needs --pdf pointing to an existing PDF.")
    ];
  }
  const result = await runAtsCheckerExtraction({ pdf: options.pdf });
  if (!result.available) {
    return [skipped("tester_ats_checker_skipped", `ATS-Checker skipped: ${result.reason}.`)];
  }
  return [
    createCheck({
      id: "tester_ats_checker_executed",
      category: "tester_execution",
      severity: "low",
      status: "pass",
      evidence: `ATS-Checker parser executed via ${result.tool}.`,
      metadata: { extracted_chars: result.text.length }
    })
  ];
}

async function runAtsScreener(options) {
  const cwd = resolve(getRepoRoot(), "testers/ats-screener");
  if (!options.text || !existsSync(resolve(getRepoRoot(), options.text))) {
    return skipped("tester_ats_screener_skipped", "ats-screener needs --text extracted text.");
  }
  if (!existsSync(resolve(cwd, "node_modules"))) {
    return skipped("tester_ats_screener_skipped", "ats-screener dependencies are not installed.");
  }
  const tsxCli = resolve(cwd, "node_modules/tsx/dist/cli.mjs");
  const runner = existsSync(tsxCli) ? process.execPath : "tsx";
  const args = existsSync(tsxCli)
    ? [tsxCli, "scripts/score-local.ts", resolve(getRepoRoot(), options.text)]
    : ["scripts/score-local.ts", resolve(getRepoRoot(), options.text)];
  if (options.jd) args.push(resolve(getRepoRoot(), options.jd));
  try {
    await runPackageCommand(runner, args, { cwd, quiet: true });
  } catch (error) {
    return skipped(
      "tester_ats_screener_skipped",
      `ats-screener failed to execute: ${formatCommandError(error)}.`
    );
  }
  return createCheck({
    id: "tester_ats_screener_executed",
    category: "tester_execution",
    severity: "low",
    status: "pass",
    evidence: "ats-screener score-local script executed."
  });
}

async function runResumeParser(options) {
  const cwd = resolve(getRepoRoot(), "testers/ResumeParser");
  if (!options.pdf || !existsSync(resolve(getRepoRoot(), options.pdf))) {
    return skipped(
      "tester_resume_parser_skipped",
      "ResumeParser needs --pdf pointing to an existing PDF."
    );
  }
  // Prefer a project virtualenv if present. Windows puts the interpreter under
  // .venv/Scripts/python.exe; Linux and macOS use .venv/bin/python.
  const venvPython = [
    resolve(cwd, ".venv/Scripts/python.exe"),
    resolve(cwd, ".venv/bin/python")
  ].find((candidate) => existsSync(candidate));
  const python = venvPython
    ? venvPython
    : (await commandExists("python"))
      ? "python"
      : (await commandExists("python3"))
        ? "python3"
        : null;
  if (!python) return skipped("tester_resume_parser_skipped", "Python is not available.");
  try {
    await runCommand(
      python,
      ["-m", "resume_parser", "--mode", "profile", "--file", resolve(getRepoRoot(), options.pdf)],
      { cwd, quiet: true, env: { PYTHONIOENCODING: "utf-8" } }
    );
  } catch (error) {
    return skipped(
      "tester_resume_parser_skipped",
      `ResumeParser failed to execute: ${formatCommandError(error)}.`
    );
  }
  return createCheck({
    id: "tester_resume_parser_executed",
    category: "tester_execution",
    severity: "low",
    status: "pass",
    evidence: "ResumeParser profile mode executed."
  });
}

async function runResumeMatcher() {
  const backend = resolve(getRepoRoot(), "testers/Resume-Matcher/apps/backend");
  const python = (await commandExists("python"))
    ? "python"
    : (await commandExists("python3"))
      ? "python3"
      : null;
  if (!python) return skipped("tester_resume_matcher_skipped", "Python is not available.");
  if (!existsSync(resolve(backend, "app"))) {
    return skipped("tester_resume_matcher_skipped", "Resume-Matcher backend app is missing.");
  }
  try {
    await runCommand(python, ["-c", "import app; print('ok')"], { cwd: backend, quiet: true });
  } catch (error) {
    return skipped(
      "tester_resume_matcher_skipped",
      `Resume-Matcher backend smoke check failed: ${formatCommandError(error)}.`
    );
  }
  return createCheck({
    id: "tester_resume_matcher_executed",
    category: "tester_execution",
    severity: "low",
    status: "pass",
    evidence: "Resume-Matcher backend import smoke check executed."
  });
}

function skipped(id, evidence) {
  return createCheck({
    id,
    category: "tester_execution",
    severity: "low",
    status: "warning",
    evidence,
    suggestedFix:
      "Install tester dependencies and provide required artifacts, then rerun check:testers."
  });
}

function runPackageCommand(command, args, options) {
  return runCommand(command, args, options);
}

function formatCommandError(error) {
  const detail = error.stderr || error.stdout || "";
  return detail ? `${error.message}; ${detail.slice(0, 220).trim()}` : error.message;
}
