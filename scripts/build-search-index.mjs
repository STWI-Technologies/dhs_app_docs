/**
 * Rebuilds entries in public/content/search-index.json.
 *
 * The index is what SearchBar uses to search INSIDE article bodies
 * (src/components/SearchBar/SearchBar.jsx). It is a flat map of
 * { articleId: "the article's text, tags stripped" } and, until now, nothing
 * generated it — so rewriting an article silently left the index describing the
 * old one, and the KB kept returning hits for sentences no longer on the page.
 *
 * Run it for the articles you changed, so untouched entries stay byte-identical:
 *
 *   node scripts/build-search-index.mjs crews-management
 *
 * With no arguments it rebuilds every entry, which is a much bigger diff — the
 * remaining articles are Google Docs exports whose markup flattens differently
 * from this. Prefer naming the articles you touched.
 *
 * Note: the index is keyed by article id with no language dimension, so Spanish
 * bodies are not searchable at all. Fixing that needs a change in SearchBar too,
 * not just here.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const INDEX = resolve(ROOT, "public/content/search-index.json");

const ENTITIES = {
  "&nbsp;": " ", "&amp;": "&", "&quot;": '"', "&#39;": "'", "&rsquo;": "’",
  "&lsquo;": "‘", "&mdash;": "—", "&ndash;": "–", "&hellip;": "…",
  "&ldquo;": "“", "&rdquo;": "”", "&gt;": ">", "&lt;": "<",
};

/** HTML article -> the single line of plain text the index stores. */
function flatten(html) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z#0-9]+;/gi, (m) => ENTITIES[m] ?? " ")
    .replace(/\s+/g, " ")
    .trim();
}

const index = JSON.parse(readFileSync(INDEX, "utf8"));
const targets = process.argv.slice(2).length
  ? process.argv.slice(2)
  : Object.keys(index);

for (const id of targets) {
  const path = resolve(ROOT, `public/content/${id}.html`);
  let html;
  try {
    html = readFileSync(path, "utf8");
  } catch {
    console.error(`  ! ${id}: no public/content/${id}.html — skipped`);
    continue;
  }
  const before = index[id]?.length ?? 0;
  index[id] = flatten(html);
  console.log(`  ${id}: ${before} -> ${index[id].length} chars`);
}

// Written minified, the way the file already is — pretty-printing it here would
// reformat all 18 entries as a side effect of touching one.
writeFileSync(INDEX, JSON.stringify(index));
console.log(`\nwrote ${INDEX}`);
