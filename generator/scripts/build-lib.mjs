import { spawn } from "node:child_process";
import { mkdir, rm } from "node:fs/promises";
import { basename, dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

export function getRepoRoot() {
  return repoRoot;
}

export function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const item = argv[i];
    if (!item.startsWith("--")) continue;
    const key = item.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      args[key] = "true";
    } else {
      args[key] = next;
      i += 1;
    }
  }
  return args;
}

export function commandExists(command) {
  const probe = process.platform === "win32" ? "where.exe" : "sh";
  const probeArgs = process.platform === "win32" ? [command] : ["-lc", `command -v ${command}`];
  return runCommand(probe, probeArgs, { quiet: true })
    .then(() => true)
    .catch(() => false);
}

export function runCommand(command, args, options = {}) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd || repoRoot,
      shell: options.shell || false,
      env: { ...process.env, ...(options.env || {}) }
    });

    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
      if (!options.quiet) safeWrite(process.stdout, chunk);
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
      if (!options.quiet) safeWrite(process.stderr, chunk);
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolvePromise({ code, stdout, stderr });
      } else {
        const error = new Error(`${command} exited with code ${code}`);
        error.code = code;
        error.stdout = stdout;
        error.stderr = stderr;
        reject(error);
      }
    });
  });
}

function safeWrite(stream, chunk) {
  try {
    stream.write(chunk);
  } catch (error) {
    if (error.code !== "EPIPE") throw error;
  }
}

export async function detectEngine(requested, commandExistsImpl = commandExists) {
  if (requested && requested !== "auto") return requested;
  if (await commandExistsImpl("latexmk")) return "latexmk";
  if (await commandExistsImpl("pdflatex")) return "pdflatex";
  if (await commandExistsImpl("docker")) return "docker";
  return "missing";
}

export async function buildPdf(options = {}) {
  const source = resolve(repoRoot, options.source || "resume/source/current.tex");
  const outDir = resolve(repoRoot, options.outDir || "resume/output");
  const runCommandImpl = options.runCommand || runCommand;
  const engine = await detectEngine(
    options.engine || "auto",
    options.commandExists || commandExists
  );
  const jobName = basename(source, extname(source));
  const pdfPath = join(outDir, `${jobName}.pdf`);

  await mkdir(outDir, { recursive: true });
  if (options.clean) {
    await rm(outDir, { recursive: true, force: true });
    await mkdir(outDir, { recursive: true });
  }

  if (engine === "latexmk") {
    await runCommandImpl("latexmk", [
      "-pdf",
      "-interaction=nonstopmode",
      "-halt-on-error",
      `-outdir=${outDir}`,
      source
    ]);
  } else if (engine === "pdflatex") {
    await runCommandImpl("pdflatex", [
      "-interaction=nonstopmode",
      "-halt-on-error",
      `-output-directory=${outDir}`,
      source
    ]);
  } else if (engine === "docker") {
    await runCommandImpl("docker", [
      "run",
      "--rm",
      "-v",
      `${repoRoot.replaceAll("\\", "/")}:/workdir`,
      "-w",
      "/workdir",
      "texlive/texlive",
      "latexmk",
      "-pdf",
      "-interaction=nonstopmode",
      "-halt-on-error",
      `-outdir=${relativeForDocker(outDir)}`,
      relativeForDocker(source)
    ]);
  } else {
    throw new Error("No LaTeX engine found. Install latexmk/pdflatex or Docker.");
  }

  return {
    engine,
    source,
    outDir,
    pdfPath
  };
}

function relativeForDocker(absPath) {
  const normalizedRoot = repoRoot.replaceAll("\\", "/");
  const normalizedPath = absPath.replaceAll("\\", "/");
  if (normalizedPath.startsWith(normalizedRoot)) {
    return normalizedPath.slice(normalizedRoot.length + 1);
  }
  return normalizedPath;
}
