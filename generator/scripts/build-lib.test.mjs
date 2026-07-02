import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, test } from "node:test";
import { buildPdf, detectEngine, getRepoRoot, parseArgs } from "./build-lib.mjs";

const tempDirs = [];

afterEach(async () => {
  await Promise.all(tempDirs.map((dir) => rm(dir, { recursive: true, force: true })));
  tempDirs.length = 0;
});

test("parseArgs reads flag values and boolean flags", () => {
  assert.deepEqual(
    parseArgs(["--source", "resume/source/current.tex", "--clean", "--engine", "pdflatex"]),
    {
      source: "resume/source/current.tex",
      clean: "true",
      engine: "pdflatex"
    }
  );
});

test("detectEngine prefers latexmk, then pdflatex, then docker", async () => {
  assert.equal(await detectEngine("auto", async (command) => command === "latexmk"), "latexmk");
  assert.equal(await detectEngine("auto", async (command) => command === "pdflatex"), "pdflatex");
  assert.equal(await detectEngine("auto", async (command) => command === "docker"), "docker");
  assert.equal(await detectEngine("auto", async () => false), "missing");
});

test("detectEngine returns an explicit engine without probing tools", async () => {
  let probed = false;
  const engine = await detectEngine("pdflatex", async () => {
    probed = true;
    return false;
  });

  assert.equal(engine, "pdflatex");
  assert.equal(probed, false);
});

test("buildPdf resolves source, output directory, and pdf path without real TeX", async () => {
  const outDir = await mkdtemp(join(tmpdir(), "resume-cooker-build-"));
  tempDirs.push(outDir);

  const calls = [];
  const result = await buildPdf({
    source: "resume/source/current.tex",
    outDir,
    engine: "pdflatex",
    runCommand: async (command, args) => {
      calls.push({ command, args });
      return { code: 0, stdout: "", stderr: "" };
    }
  });

  assert.equal(result.engine, "pdflatex");
  assert.equal(result.source, resolve(getRepoRoot(), "resume/source/current.tex"));
  assert.equal(result.outDir, outDir);
  assert.equal(result.pdfPath, join(outDir, "current.pdf"));
  assert.deepEqual(calls, [
    {
      command: "pdflatex",
      args: [
        "-interaction=nonstopmode",
        "-halt-on-error",
        `-output-directory=${outDir}`,
        resolve(getRepoRoot(), "resume/source/current.tex")
      ]
    }
  ]);
});

test("buildPdf reports a missing build engine before running a command", async () => {
  const outDir = await mkdtemp(join(tmpdir(), "resume-cooker-missing-engine-"));
  tempDirs.push(outDir);

  let ranCommand = false;
  await assert.rejects(
    buildPdf({
      outDir,
      commandExists: async () => false,
      runCommand: async () => {
        ranCommand = true;
      }
    }),
    /No LaTeX engine found/
  );
  assert.equal(ranCommand, false);
});
