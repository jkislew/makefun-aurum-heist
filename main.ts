// AURUM — The Clockwork Heist: hand-in program (Node 22, stdlib only).
// The game itself is the static bundle under game/ (index.html plus ES
// modules, no library, no network). This program copies game/ and
// screenshots/ into the output directory and writes dossier.json with
// the vendored make.fun library, exactly as the scorer recomputes it.
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Serve locally with: node serve.ts  (then open http://localhost:8080)

import { cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-game.ts";

const rootDir = fileURLToPath(new URL(".", import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

mkdirSync(outputDir, { recursive: true });
cpSync(join(rootDir, "game"), join(outputDir, "game"), { recursive: true });
mkdirSync(join(outputDir, "screenshots"), { recursive: true });
const shotsDir = join(rootDir, "screenshots");
if (existsSync(shotsDir)) {
  cpSync(shotsDir, join(outputDir, "screenshots"), { recursive: true });
}

const dossierCaps = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};
writeFileSync(join(outputDir, "dossier.json"), buildDossier(outputDir, dossierCaps));
