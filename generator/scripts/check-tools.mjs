import { commandExists, parseArgs, runCommand } from "./build-lib.mjs";

const args = parseArgs(process.argv.slice(2));

const tools = ["latexmk", "pdflatex", "xelatex", "pdftotext", "docker", "node", "npm"];
const rows = [];

for (const tool of tools) {
  const available = await commandExists(tool);
  rows.push({
    tool,
    available,
    usable: tool === "docker" && available ? await dockerDaemonAvailable() : available
  });
}

console.table(rows);

if (!rows.some((row) => ["latexmk", "pdflatex", "docker"].includes(row.tool) && row.usable)) {
  console.error("No usable PDF build engine found. Install latexmk/pdflatex or start Docker.");
  if (args["require-pdf-engine"] === "true") {
    process.exitCode = 1;
  }
}

async function dockerDaemonAvailable() {
  try {
    await runCommand("docker", ["info", "--format", "{{.ServerVersion}}"], { quiet: true });
    return true;
  } catch {
    return false;
  }
}
