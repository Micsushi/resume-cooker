import { createReadStream, statSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, resolve } from "node:path";
import { buildPdf, getRepoRoot, parseArgs } from "./build-lib.mjs";

const args = parseArgs(process.argv.slice(2));
const repoRoot = getRepoRoot();
const source = args.source || "resume/source/current.tex";
const port = Number(args.port || 4177);
const previewDir = resolve(repoRoot, ".runtime/preview");
const previewPdf = join(previewDir, "current.pdf");

let lastBuild = {
  ok: false,
  message: "Not built yet.",
  pdfUrl: "",
  builtAt: null
};

async function compilePreview() {
  try {
    const result = await buildPdf({
      source,
      outDir: previewDir,
      engine: args.engine || "auto",
      clean: true
    });
    lastBuild = {
      ok: true,
      message: `Built with ${result.engine}.`,
      pdfUrl: `/preview.pdf?t=${Date.now()}`,
      builtAt: new Date().toISOString()
    };
  } catch (error) {
    lastBuild = {
      ok: false,
      message: error.message,
      pdfUrl: "",
      builtAt: new Date().toISOString()
    };
  }
  return lastBuild;
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host}`);

  if (url.pathname === "/") {
    return sendFile(res, join(repoRoot, "generator/public/index.html"), "text/html");
  }

  if (url.pathname === "/api/status") {
    return sendJson(res, lastBuild);
  }

  if (url.pathname === "/api/source") {
    const fullSource = resolve(repoRoot, source);
    const text = await readFile(fullSource, "utf8");
    return sendJson(res, {
      source,
      mtimeMs: statSync(fullSource).mtimeMs,
      text
    });
  }

  if (url.pathname === "/api/compile" && req.method === "POST") {
    const result = await compilePreview();
    return sendJson(res, result, result.ok ? 200 : 500);
  }

  if (url.pathname === "/preview.pdf") {
    return sendFile(res, previewPdf, "application/pdf");
  }

  res.writeHead(404);
  res.end("Not found");
});

await compilePreview();
server.listen(port, "127.0.0.1", () => {
  console.log(`Resume Cooker preview: http://127.0.0.1:${port}`);
  console.log(`Source: ${source}`);
});

function sendJson(res, body, status = 200) {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(body, null, 2));
}

function sendFile(res, path, contentType) {
  const stream = createReadStream(path);
  stream.on("error", () => {
    if (res.headersSent) {
      res.destroy();
      return;
    }
    res.writeHead(404);
    res.end("Not found");
  });
  stream.once("open", () => {
    res.writeHead(200, {
      "content-type": contentType || contentTypeFor(path),
      "cache-control": "no-store"
    });
    stream.pipe(res);
  });
}

function contentTypeFor(path) {
  if (extname(path) === ".html") return "text/html";
  if (extname(path) === ".pdf") return "application/pdf";
  return "application/octet-stream";
}
