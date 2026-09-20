import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const srcDir = resolve(root, "src");
const outFile = resolve(root, "theme.css");

const banner = `/* ============================================================================
   Lumen Glass — Obsidian theme

   GENERATED FILE — edit src/*.css instead, then run \`npm run build\`.
   ============================================================================ */
`;

function sources() {
  return readdirSync(srcDir)
    .filter((name) => name.endsWith(".css"))
    .sort();
}

/*
 * Author comments stay in src/. The published file keeps the Style Settings
 * block (the plugin reads the @settings comment) and a short generated-file
 * banner. Shipping the design notes was the cheapest 20KB on the community
 * "larger than recommended" warning, and they are not needed at install time.
 */
function stripAuthorComments(css) {
  const kept = [];
  const masked = css.replace(/\/\*\s*@settings[\s\S]*?\*\//g, (block) => {
    kept.push(block.trim());
    return `\u0000K${kept.length - 1}\u0000`;
  });

  return masked
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\u0000K(\d+)\u0000/g, (match, index) => kept[Number(index)])
    .replace(/[ \t]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/^\n+/, "")
    .replace(/\n+$/, "\n");
}

function compose() {
  const parts = sources().map((name) => readFileSync(resolve(srcDir, name), "utf8"));

  return banner + stripAuthorComments(parts.join(""));
}

function describe(css) {
  const bytes = Buffer.byteLength(css);
  const lines = css.split("\n").length - (css.endsWith("\n") ? 1 : 0);
  return `${sources().length} source modules, ${lines} lines, ${bytes} bytes`;
}

const composed = compose();
const checkOnly = process.argv.includes("--check");

if (checkOnly) {
  let current = "";
  try {
    current = readFileSync(outFile, "utf8");
  } catch {
    console.error("ERROR: theme.css is missing; run `npm run build`");
    process.exit(1);
  }

  if (current !== composed) {
    console.error("ERROR: theme.css is out of sync with src/; run `npm run build`");
    process.exit(1);
  }

  console.log(`theme.css is in sync with ${describe(composed)}.`);
} else {
  writeFileSync(outFile, composed);
  console.log(`Built theme.css from ${describe(composed)}.`);
}
