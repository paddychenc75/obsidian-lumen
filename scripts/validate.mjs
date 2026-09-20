import { existsSync, readFileSync, statSync } from "node:fs";
import { extname, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const errors = [];
const warnings = [];

function fail(message) {
  errors.push(message);
}

function warn(message) {
  warnings.push(message);
}

function read(path) {
  return readFileSync(resolve(root, path), "utf8");
}

function readJson(path) {
  try {
    return JSON.parse(read(path));
  } catch (error) {
    fail(`${path} is not valid JSON: ${error.message}`);
    return {};
  }
}

function checkBalancedCss(css) {
  let braces = 0;
  let quote = "";
  let inComment = false;

  for (let index = 0; index < css.length; index += 1) {
    const char = css[index];
    const next = css[index + 1];

    if (inComment) {
      if (char === "*" && next === "/") {
        inComment = false;
        index += 1;
      }
      continue;
    }

    if (!quote && char === "/" && next === "*") {
      inComment = true;
      index += 1;
      continue;
    }

    if (quote) {
      if (char === "\\") {
        index += 1;
      } else if (char === quote) {
        quote = "";
      }
      continue;
    }

    if (char === '"' || char === "'") {
      quote = char;
    } else if (char === "{") {
      braces += 1;
    } else if (char === "}") {
      braces -= 1;
      if (braces < 0) {
        fail("theme.css contains an unmatched closing brace");
        return;
      }
    }
  }

  if (inComment) fail("theme.css contains an unclosed comment");
  if (quote) fail("theme.css contains an unclosed string");
  if (braces !== 0) fail(`theme.css has ${braces} unclosed block(s)`);
}

/*
 * Only the theme's own namespaces are audited. Obsidian's variables are
 * declared by the app, so a `var(--text-muted)` with no local declaration is
 * expected, and a `--callout-radius` the theme sets for the app to read is not
 * dead just because the theme never reads it back.
 */
const ownedPrefixes = ["--lg-", "--lumen-"];

function isOwned(name) {
  return ownedPrefixes.some((prefix) => name.startsWith(prefix));
}

function checkTokenGraph(css) {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const declared = new Set();
  const referenced = new Set();

  for (const match of withoutComments.matchAll(/(--[a-z0-9-]+)\s*:/g)) {
    if (isOwned(match[1])) declared.add(match[1]);
  }
  for (const match of withoutComments.matchAll(/var\(\s*(--[a-z0-9-]+)/g)) {
    referenced.add(match[1]);
  }

  const dangling = [...referenced].filter((name) => isOwned(name) && !declared.has(name));
  if (dangling.length > 0) {
    fail(`theme.css references undeclared tokens: ${dangling.sort().join(", ")}`);
  }

  const unused = [...declared].filter((name) => !referenced.has(name));
  if (unused.length > 0) {
    warn(`theme.css declares unused tokens: ${unused.sort().join(", ")}`);
  }
}

const radiusScale = new Set(["0", "0px", "50%", "999px", "inherit"]);

function checkRadiusScale(css) {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const offScale = new Set();

  for (const match of withoutComments.matchAll(/border(?:-[a-z-]+)?-radius: *([^;]+);/g)) {
    const value = match[1].trim();
    if (value.includes("var(") || value.includes("calc(")) continue;
    for (const part of value.split(/\s+/)) {
      if (!radiusScale.has(part)) offScale.add(part);
    }
  }

  if (offScale.size > 0) {
    warn(`theme.css hardcodes off-scale radii: ${[...offScale].sort().join(", ")}`);
  }
}

function checkMarkdownLinks(markdown) {
  const links = markdown.matchAll(/!?\[[^\]]*]\(([^)]+)\)/g);

  for (const match of links) {
    const rawTarget = match[1].trim().split(/\s+["']/)[0];
    if (/^(?:https?:|mailto:|#)/i.test(rawTarget)) continue;

    const target = decodeURIComponent(rawTarget.split("#")[0]);
    if (target && !existsSync(resolve(root, target))) {
      fail(`README.md links to missing file: ${target}`);
    }
  }
}

function checkPng(path) {
  const file = resolve(root, path);
  const buffer = readFileSync(file);
  const signature = buffer.subarray(0, 8).toString("hex");

  if (signature !== "89504e470d0a1a0a") {
    fail(`${path} is not a valid PNG file`);
    return;
  }

  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  if (width * 9 !== height * 16) {
    fail(`${path} must use a 16:9 aspect ratio; received ${width}x${height}`);
  }
  if (width < 512 || height < 288) {
    fail(`${path} must be at least 512x288; received ${width}x${height}`);
  }
  if (statSync(file).size > 1_000_000) {
    warn(`${path} is larger than 1 MB`);
  }
}

const requiredFiles = [
  "manifest.json",
  "theme.css",
  "README.md",
  "LICENSE",
  "CHANGELOG.md",
  "assets/screenshot.png",
];

for (const file of requiredFiles) {
  if (!existsSync(resolve(root, file))) fail(`Missing required file: ${file}`);
}

const manifest = readJson("manifest.json");
const pkg = readJson("package.json");
const releaseVersion = /^\d+\.\d+\.\d+$/;
const expectedThemeName = "Lumen Glass";

for (const key of ["name", "version", "minAppVersion", "author"]) {
  if (typeof manifest[key] !== "string" || !manifest[key].trim()) {
    fail(`manifest.json must define a non-empty ${key}`);
  }
}

if (!releaseVersion.test(manifest.version ?? "")) {
  fail(`manifest version must use the x.y.z release format: ${manifest.version}`);
}
if (!releaseVersion.test(manifest.minAppVersion ?? "")) {
  fail(`manifest minAppVersion must use the x.y.z format: ${manifest.minAppVersion}`);
}
if (pkg.version !== manifest.version) {
  fail(`package.json version ${pkg.version} does not match manifest ${manifest.version}`);
}
if (manifest.name !== expectedThemeName) {
  fail(`manifest name must be ${expectedThemeName}; received ${manifest.name}`);
}
if (!/^[\x20-\x7E]+$/.test(manifest.name ?? "")) {
  fail("manifest name must use Basic Latin characters only");
}
if (/\b(?:obsidian|theme)\b/i.test(manifest.name ?? "")) {
  fail("manifest name must not contain Obsidian or Theme");
}
if (manifest.authorUrl && !/^https:\/\/github\.com\/[^/]+\/?$/.test(manifest.authorUrl)) {
  fail("manifest authorUrl must be an HTTPS GitHub profile URL");
}

const releaseTag =
  process.env.RELEASE_TAG ??
  (process.env.GITHUB_REF_TYPE === "tag" ? process.env.GITHUB_REF_NAME : "");
if (releaseTag && releaseTag !== manifest.version) {
  fail(`release tag ${releaseTag} does not match manifest version ${manifest.version}`);
}

const css = read("theme.css");
const cssBytes = Buffer.byteLength(css);
/*
 * Official theme docs do not publish a numeric ceiling. The community
 * directory RELEASES check warns "Theme CSS file is larger than recommended"
 * (a warning, not a blocking error). 1.0.7 at 135632 bytes drew that
 * warning, so the working budget is 128 KiB — the first power-of-two below
 * the flagged file. A 100 KiB bar is unreachable here without dropping
 * features: even a fully minified sheet still sits around 110 KB.
 */
const recommendedCssBytes = 128 * 1024;
if (cssBytes > recommendedCssBytes) {
  warn(
    `theme.css is ${cssBytes} bytes (${(cssBytes / 1024).toFixed(1)} KiB); ` +
      `keep it at or under ${recommendedCssBytes / 1024} KiB to stay below the size that 1.0.7 was flagged for`,
  );
}

if (!css.includes("/* @settings")) {
  fail("theme.css is missing the Style Settings metadata block");
}
if (!css.includes(`name: ${expectedThemeName}`) || !css.includes(`title: ${expectedThemeName}`)) {
  fail("theme.css Style Settings metadata must match the manifest name");
}
checkBalancedCss(css);
checkTokenGraph(css);
checkRadiusScale(css);

const cssWithoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
if (/(?:^|[\s{;])(?:break-inside|break-after|break-before)\s*:/.test(cssWithoutComments)) {
  fail(
    "theme.css uses CSS Fragmentation break-* properties; community lint maps them to multicolumn. Use page-break-* for print.",
  );
}
if (/@import\s+(?:url\()?["']?https?:/i.test(cssWithoutComments)) {
  fail("theme.css must not import remote stylesheets");
}
if (/url\(\s*["']?https?:/i.test(cssWithoutComments)) {
  fail("theme.css must not load remote assets");
}

const importantCount = (cssWithoutComments.match(/!important/g) ?? []).length;
if (importantCount > 30) {
  warn(`theme.css uses !important ${importantCount} times; review specificity`);
}

const readme = read("README.md");
checkMarkdownLinks(readme);
if (/\/Users\/|[A-Z]:\\Users\\/i.test(readme)) {
  fail("README.md contains a machine-specific absolute path");
}

checkPng("assets/screenshot.png");

for (const warning of warnings) console.warn(`WARN: ${warning}`);
if (errors.length > 0) {
  for (const error of errors) console.error(`ERROR: ${error}`);
  process.exit(1);
}

console.log(
  `Validated ${expectedThemeName} ${manifest.version}: ${requiredFiles.length} required files, ` +
    `${cssBytes} bytes, ${importantCount} !important declarations, no remote theme assets.`,
);
