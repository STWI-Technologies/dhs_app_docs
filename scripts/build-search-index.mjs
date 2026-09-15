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
 * Spanish bodies are indexed under `<id>:es`, alongside the English body at
 * `<id>`. SearchBar picks the key for the language being read and falls back to
 * English when an article has no Spanish file yet. Keeping the English keys
 * exactly where they were is deliberate: it keeps this file's diffs small.
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

/** One language of one article: read the file, flatten it, report the change. */
function indexFile(key, path) {
  let html;
  try {
    html = readFileSync(path, "utf8");
  } catch {
    return false;
  }
  const before = index[key]?.length ?? 0;
  index[key] = flatten(html);
  console.log(`  ${key}: ${before} -> ${index[key].length} chars`);
  return true;
}

for (const id of targets) {
  // A ":es" target names a key, not an article. Rebuild the pair either way.
  const articleId = id.replace(/:es$/, "");

  if (!indexFile(articleId, resolve(ROOT, `public/content/${articleId}.html`))) {
    console.error(`  ! ${articleId}: no public/content/${articleId}.html — skipped`);
    continue;
  }

  // Spanish is optional: an article without a -es.html simply has no :es key,
  // and SearchBar falls back to the English body for it.
  indexFile(`${articleId}:es`, resolve(ROOT, `public/content/${articleId}-es.html`));
}

// Written minified, the way the file already is — pretty-printing it here would
// reformat all 18 entries as a side effect of touching one.
writeFileSync(INDEX, JSON.stringify(index));
console.log(`\nwrote ${INDEX}`);
