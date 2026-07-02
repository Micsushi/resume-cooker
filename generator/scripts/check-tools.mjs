import { commandExists, parseArgs } from "./build-lib.mjs";

const args = parseArgs(process.argv.slice(2));

const tools = ["latexmk", "pdflatex", "xelatex", "pdftotext", "docker", "node", "npm"];
const rows = [];

for (const tool of tools) {
  rows.push({
    tool,
    available: await commandExists(tool)
  });
}

console.table(rows);

if (!rows.some((row) => ["latexmk", "pdflatex", "docker"].includes(row.tool) && row.available)) {
  console.error("No PDF build engine found. Install latexmk/pdflatex or Docker.");
  if (args["require-pdf-engine"] === "true") {
    process.exitCode = 1;
  }
}
