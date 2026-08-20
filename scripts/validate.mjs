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
if (!css.includes("/* @settings")) {
  fail("theme.css is missing the Style Settings metadata block");
}
if (!css.includes(`name: ${expectedThemeName}`) || !css.includes(`title: ${expectedThemeName}`)) {
  fail("theme.css Style Settings metadata must match the manifest name");
}
checkBalancedCss(css);

const cssWithoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
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
    `${importantCount} !important declarations, no remote theme assets.`,
);
