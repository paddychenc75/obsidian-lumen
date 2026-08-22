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
  const parts = sources().map((name) => {
    const css = readFileSync(resolve(srcDir, name), "utf8");
    const className = gatedModules.get(name);
    return className ? gate(css, className) : css;
  });

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
