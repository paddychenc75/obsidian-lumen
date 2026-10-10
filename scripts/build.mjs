import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const srcDir = resolve(root, "src");
const outFile = resolve(root, "theme.css");

const banner = "/* Lumen Glass. GENERATED FILE: edit src/*.css, then run `npm run build`. */\n";

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
 *
 * Indentation and blank lines go the same way: 1.2.0 drew that warning again
 * at 111 KB while 1.1.1 at 103 KB had not. Each rule keeps its own line, so
 * the directory's lint still reports a line number that names one rule;
 * declarations, selector lists, and multi-line values are joined, the last
 * declaration loses its semicolon, and decimals lose their leading zero.
 * Declarations had a line each until 1.4.0, which cost a byte apiece — about
 * 1.9 KB — for a line number finer than anyone had needed.
 *
 * Selectors lose the spaces around `>`, `+`, and `~`, at-rule conditions the
 * space after their colon, and a colour like #aabbcc is written #abc. The
 * Style Settings block is YAML, where only the relative depth of the
 * indentation carries meaning, so each four-space level becomes one space.
 *
 * `body.theme-light X, body.theme-dark X` is how the source outranks a core
 * rule written against one appearance class. `body:is(.theme-light,
 * .theme-dark) X` matches the same elements with the same specificity and
 * spells X once.
 */
function splitSelectors(list) {
  const parts = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < list.length; i++) {
    if (list[i] === "(") depth++;
    else if (list[i] === ")") depth--;
    else if (list[i] === "," && depth === 0) {
      parts.push(list.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(list.slice(start));
  return parts;
}

function foldAppearancePairs(line) {
  if (line.startsWith("@") || !line.includes("body.theme-light ")) return line;
  const parts = splitSelectors(line.slice(0, -1));
  const dark = new Set(parts.filter((part) => part.startsWith("body.theme-dark ")).map((part) => part.slice(15)));
  const folded = [];
  for (const part of parts) {
    const rest = part.startsWith("body.theme-light ") ? part.slice(16) : null;
    if (rest !== null && dark.has(rest)) folded.push(`body:is(.theme-light,.theme-dark)${rest}`);
    else if (part.startsWith("body.theme-dark ") && parts.includes(`body.theme-light${part.slice(15)}`)) continue;
    else folded.push(part);
  }
  return `${folded.join(",")}{`;
}

function tightenSelector(line) {
  if (line.startsWith("@")) return line.replace(/: /g, ":");
  return line.replace(/ ([>+~]) /g, "$1").replace(/^([>+~]) /, "$1");
}

function tightenSettings(block) {
  return block.replace(/^(?: {4})+/gm, (indent) => " ".repeat(indent.length / 4)).replace(/\n{2,}/g, "\n");
}

function stripAuthorComments(css) {
  const kept = [];
  const masked = css.replace(/\/\*\s*@settings[\s\S]*?\*\//g, (block) => {
    kept.push(tightenSettings(block.trim()));
    return `\u0000K${kept.length - 1}\u0000`;
  });

  return masked
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/[ \t]+$/gm, "")
    .replace(/^[ \t]+/gm, "")
    .replace(/\n{2,}/g, "\n")
    .replace(/^(-{0,2}[a-z][a-z0-9-]*): /gm, "$1:")
    .replace(/ \{$/gm, "{")
    .replace(/^[^"'\n]*$/gm, (line) => line.replace(/, /g, ",").replace(/(?<![\w.#])0\.(?=\d)/g, "."))
    .replace(/([,(])\n/g, "$1")
    .replace(/\n\)/g, ")")
    .replace(/;\n}/g, "}")
    .replace(/^.*\{$/gm, tightenSelector)
    .replace(/^.*\{$/gm, foldAppearancePairs)
    .replace(/^[>+~] .*$/gm, tightenSelector)
    .replace(/^[^"'\n]*$/gm, (line) => line.replace(/#([\da-f])\1([\da-f])\2([\da-f])\3(?![\da-f])/gi, "#$1$2$3"))
    .replace(/;\n/g, ";")
    .replace(/^([^@\n]*\{)\n/gm, "$1")
    .replace(/^\n+/, "")
    .replace(/\n+$/, "\n")
    .replace(/\u0000K(\d+)\u0000/g, (match, index) => `${kept[Number(index)]}\n`);
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
