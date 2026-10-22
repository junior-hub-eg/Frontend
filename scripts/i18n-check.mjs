// Lists the texts passed to t() / tk() that have no Arabic translation yet,
// and Arabic entries whose {placeholders} differ from the English key.
// Run: node scripts/i18n-check.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const files = [];
for (const d of ["app", "components", "lib"]) {
  (function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (/\.tsx?$/.test(e.name) && !p.includes(`${path.sep}i18n${path.sep}`)) files.push(p);
    }
  })(path.join(root, d));
}

const unescape = (s) => s.replace(/\\(["'`\\])/g, "$1").replace(/\\n/g, "\n");
const keys = new Map();
const re = /(?:\b(?:t|tk|tNow)\(|\berrorMessage\([^,()]*(?:\([^()]*\))?[^,()]*,)\s*(?:"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'|`((?:[^`\\$]|\\.)*)`)/g;
for (const f of files) {
  const src = fs.readFileSync(f, "utf8");
  for (const m of src.matchAll(re)) {
    const k = unescape(m[1] ?? m[2] ?? m[3]);
    if (!keys.has(k)) keys.set(k, path.relative(root, f));
  }
}

// Read the dictionaries as text so this script needs no TypeScript build.
const dict = new Map();
const dictDir = path.join(root, "lib", "i18n", "ar");
for (const f of fs.readdirSync(dictDir)) {
  const src = fs.readFileSync(path.join(dictDir, f), "utf8");
  for (const m of src.matchAll(/^\s*("(?:[^"\\]|\\.)*")\s*:\s*("(?:[^"\\]|\\.)*")\s*,?\s*$/gm)) {
    const k = JSON.parse(m[1]);
    if (dict.has(k)) console.log(`duplicate: ${k} (${f})`);
    dict.set(k, JSON.parse(m[2]));
  }
}

const missing = [...keys].filter(([k]) => !dict.has(k));
const ph = (s) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(",");
const badPh = [...dict].filter(([k, v]) => ph(k) !== ph(v));
for (const [k, f] of missing) console.log(`missing: ${JSON.stringify(k)}  (${f})`);
for (const [k] of badPh) console.log(`placeholders differ: ${JSON.stringify(k)}`);
console.log(`${keys.size} texts, ${missing.length} missing, ${badPh.length} placeholder mismatches`);
process.exitCode = missing.length || badPh.length ? 1 : 0;
