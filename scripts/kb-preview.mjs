/**
 * Builds a standalone, openable preview of a knowledge base article.
 *
 * The files in public/content are FRAGMENTS, not pages: the app fetches one and
 * injects doc-content.css around it, and image paths are absolute site paths
 * (/images/...). Opening a fragment straight from disk therefore shows unstyled
 * serif text with broken images — nothing is wrong with the article.
 *
 * This wraps a fragment into a single self-contained file: the site's real CSS
 * inlined, every image embedded as a data URI, and the title and category drawn
 * the way ArticleView draws them. It opens anywhere, including from a phone.
 *
 *   node scripts/kb-preview.mjs crews-management
 *   node scripts/kb-preview.mjs clients-management ~/Desktop
 *
 * For the full thing — lightbox, sidebar contents, language switch — run the app
 * itself with `npm start` and open the article there.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const id = process.argv[2];
if (!id) {
  console.error("usage: node scripts/kb-preview.mjs <article-id> [output-dir]");
  process.exit(1);
}
const outDir = process.argv[3]
  ? resolve(process.argv[3].replace(/^~/, homedir()))
  : resolve(homedir(), "dhs_qa_workspace/notes");

const articlePath = resolve(ROOT, `public/content/${id}.html`);
if (!existsSync(articlePath)) {
  console.error(`no such article: public/content/${id}.html`);
  process.exit(1);
}

const css = readFileSync(resolve(ROOT, "src/styles/doc-content.css"), "utf8");
let article = readFileSync(articlePath, "utf8");

const MIME = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", gif: "image/gif", svg: "image/svg+xml" };

let embedded = 0;
const missing = [];
article = article.replace(/src="(\/images\/[^"]+)"/g, (match, sitePath) => {
  const file = resolve(ROOT, `public${sitePath}`);
  if (!existsSync(file)) {
    missing.push(sitePath);
    return match;
  }
  const ext = sitePath.split(".").pop().toLowerCase();
  const b64 = readFileSync(file).toString("base64");
  embedded++;
  return `src="data:${MIME[ext] || "application/octet-stream"};base64,${b64}"`;
});

// The title and category come from articles.js, which ArticleView renders above
// the fragment — and it hides the fragment's own h1. Mirrored here so the
// preview matches what a reader sees.
const articles = readFileSync(resolve(ROOT, "src/data/articles.js"), "utf8");
const block = articles.slice(articles.indexOf(`id: '${id}'`));
const title = /title:\s*'([^']+)'/.exec(block)?.[1] ?? id;
const category = /category:\s*'([^']+)'/.exec(block)?.[1] ?? "";

const html = `<!doctype html><meta charset="utf-8"><title>${title} — KB preview</title>
<style>
body{margin:0;background:#f6f7f9;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}
.banner{max-width:860px;margin:0 auto;background:#1a1a2e;color:#fff;font-size:13px;padding:10px 48px;line-height:1.5}
.banner b{color:#9fa8ff}
.page{max-width:860px;margin:0 auto;background:#fff;padding:40px 48px 64px;box-shadow:0 0 24px rgba(0,0,0,.06)}
h1.kb-title{color:#1a1a2e;font-size:30px;margin:0 0 6px}
.kb-category{color:#2E3192;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.4px;display:block;margin-bottom:30px}
${css}
</style>
<div class="banner">Local preview of <b>public/content/${id}.html</b> — the site's own CSS, ${embedded} image${embedded === 1 ? "" : "s"} embedded.${missing.length ? ` <b>${missing.length} missing:</b> ${missing.join(", ")}` : ""}</div>
<div class="page">
<h1 class="kb-title">${title}</h1><span class="kb-category">${category}</span>
<div class="doc-content">${article}</div>
</div>`;

const out = resolve(outDir, `${id}-kb-preview.html`);
writeFileSync(out, html);
console.log(`${out}`);
console.log(`  ${(html.length / 1024 / 1024).toFixed(2)} MB · ${embedded} images embedded${missing.length ? ` · MISSING: ${missing.join(", ")}` : ""}`);
