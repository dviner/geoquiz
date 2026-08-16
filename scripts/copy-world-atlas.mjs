import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const src = path.join(root, "node_modules/world-atlas/countries-50m.json");
const destDir = path.join(root, "public");
const dest = path.join(destDir, "countries-50m.json");

if (!existsSync(src)) {
  console.warn("world-atlas countries-50m.json not found; skipping copy.");
  process.exit(0);
}

mkdirSync(destDir, { recursive: true });
copyFileSync(src, dest);
console.log(`Copied world-atlas map data to ${path.relative(root, dest)}`);
