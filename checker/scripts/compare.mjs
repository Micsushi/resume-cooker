import { fileURLToPath } from "node:url";
import { parseArgs } from "../../generator/scripts/build-lib.mjs";
import { compareResumeFiles } from "./compare-lib.mjs";
import { createReport, writeReport } from "./report-lib.mjs";

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = parseArgs(process.argv.slice(2));

  try {
    const report = await runCompare(args);
    const written = await writeReport(report, args.out);
    console.log(JSON.stringify({ status: report.status, report: written || null }, null, 2));
    if (report.status === "fail") process.exitCode = 1;
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

export async function runCompare(options = {}) {
  if (!options.before || !options.after) {
    throw new Error("compare requires --before and --after paths.");
  }
  const checks = await compareResumeFiles({
    before: options.before,
    after: options.after
  });
  return createReport({
    stage: "postflight",
    suite: "local",
    resume: {
      source: options.before,
      compared_to: options.after,
      pdf: options.pdf || null
    },
    checks,
    contentLeftMachine: false
  });
}
