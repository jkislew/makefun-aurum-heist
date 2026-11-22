// AURUM — local play-test server (Node 22, stdlib only).
// `node serve.ts [--port 8080]` serves game/ on http://localhost:8080 so
// the heist can be played and screenshotted without any build step.
// Paths are confined to game/; anything outside is refused.

import { createReadStream, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const gameRoot = resolve(fileURLToPath(new URL("./game", import.meta.url)));
const argv = process.argv.slice(2);
const portFlag = argv.indexOf("--port");
const wanted = portFlag === -1 ? 8080 : Number(argv[portFlag + 1]);
const listenPort = Number.isInteger(wanted) && wanted > 0 && wanted < 65536 ? wanted : 8080;

const CONTENT_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".wasm": "application/wasm",
};

createServer((req, res) => {
  let pathname: string;
  try {
    pathname = decodeURIComponent(new URL(req.url ?? "/", "http://localhost").pathname);
  } catch {
    res.writeHead(400).end("bad request");
    return;
  }
  if (pathname.endsWith("/")) pathname += "index.html";
  const target = resolve(join(gameRoot, normalize(pathname)));
  if (target !== gameRoot && !target.startsWith(gameRoot + sep)) {
    res.writeHead(403).end("forbidden");
    return;
  }
  let size: number;
  try {
    const info = statSync(target);
    if (!info.isFile()) throw new Error("not a file");
    size = info.size;
  } catch {
    res.writeHead(404).end("not found");
    return;
  }
  res.writeHead(200, {
    "content-type": CONTENT_TYPES[extname(target).toLowerCase()] ?? "application/octet-stream",
    "content-length": size,
    "cache-control": "no-store",
  });
  createReadStream(target).pipe(res);
}).listen(listenPort, "127.0.0.1", () => {
  console.log(`AURUM game/ is on http://localhost:${listenPort}`);
});
