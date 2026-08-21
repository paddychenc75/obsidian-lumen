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
 * A plugin adaptation is opt-out rather than opt-in: the gate is a class the
 * reader adds to turn the adaptation off. Gating on a positive class would leave
 * the adaptation dark for everyone who never installs Style Settings, since the
 * class only ever appears when that plugin is there to add it.
 *
 * The gate is applied here instead of being written into the module so the
 * source stays legible at one selector per rule, and so a rule added later
 * cannot forget it.
 */
const gatedModules = new Map([["15-claudian.css", "lumen-claudian-plain"]]);

/*
 * `body` and `.theme-light` sit on the same element as the gate, so those have
 * to compound rather than nest — a descendant combinator would ask for a
 * `.theme-light` inside `body`, which never matches.
 */
function gateSelector(selector, className, indent) {
  const guard = `body:not(.${className})`;

  return selector
    .split(",")
    .map((part) => {
      const trimmed = part.trim();
      if (!trimmed) return trimmed;
      if (trimmed === "body" || trimmed.startsWith("body ") || trimmed.startsWith("body.")) {
        return guard + trimmed.slice("body".length);
      }
      if (trimmed.startsWith(".theme-")) return guard + trimmed;
      return `${guard} ${trimmed}`;
    })
    .filter(Boolean)
    .join(`,\n${indent}`);
}

/*
 * Comments are lifted out before the selectors are matched so that a rule
 * preceded by a section comment is still seen, and so braces inside prose can
 * never be read as a rule boundary. The placeholder is a NUL, which is excluded
 * from the selector pattern and therefore acts as a hard barrier.
 */
function gate(css, className) {
  const comments = [];
  const masked = css.replace(/\/\*[\s\S]*?\*\//g, (comment) => {
    comments.push(comment);
    return `\u0000${comments.length - 1}\u0000`;
  });

  const gated = masked.replace(
    /(^|[{}]|\u0000)(\s*)([^{}@;\u0000]+?)(\s*)\{/g,
    (match, boundary, before, selector, after) => {
      const indent = /\n([ \t]*)$/.exec(before)?.[1] ?? "";
      return `${boundary}${before}${gateSelector(selector, className, indent)}${after}{`;
    },
  );

  return gated.replace(/\u0000(\d+)\u0000/g, (match, index) => comments[Number(index)]);
}

function compose() {
  const parts = sources().map((name) => {
    const css = readFileSync(resolve(srcDir, name), "utf8");
    const className = gatedModules.get(name);
    return className ? gate(css, className) : css;
  });

  return banner + parts.join("");
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

  console.log(`theme.css is in sync with ${sources().length} source modules.`);
} else {
  writeFileSync(outFile, composed);
  const lines = composed.split("\n").length - 1;
  console.log(`Built theme.css from ${sources().length} source modules (${lines} lines).`);
}
