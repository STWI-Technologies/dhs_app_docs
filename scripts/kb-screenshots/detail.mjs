/**
 * Knowledge base screenshots — detail views and the panels inside them.
 *
 * These need a SUBJECT, not "the first row": the figure carries a real record's
 * name, client and totals into the published help centre, and a thin record
 * teaches nothing. The subjects below were picked from a data audit of staging —
 * an estimate with 14 line items, an invoice with 13 and a payment against it —
 * so the figures show a populated record rather than an empty shell.
 *
 * Run:
 *   set -a; . ~/dhs_qa_workspace/.env; set +a
 *   node scripts/kb-screenshots/detail.mjs estimates invoices
 *
 * READ-ONLY. Submit, convert, send and payment panels are opened, photographed
 * and CANCELLED. Nothing is submitted, converted, sent or paid.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const BASE = process.env.KB_BASE_URL || "https://app-staging.directhomeservice.com";
const VIEWPORT = { width: 1440, height: 900 };
const SCALE = 2;
const PANEL = "div.relative.transform.overflow-hidden.shadow-xl";

const SECTIONS = {
  estimates: {
    nav: "Estimates",
    tour: "estimates",
    // 14 line items and APPROVED, so the detail shows a full bill and the
    // Convert to job action is available on the same record.
    subject: process.env.KB_ESTIMATE || "Standard House Cleaning",
    figures: [
      { name: "05-estimate-detail", kind: "page" },
      // Convert to job needs an APPROVED estimate THAT HAS NOT BEEN CONVERTED:
      // once it has, the header offers View Job instead. Seven of the eight
      // approved estimates on staging are already converted, including the two
      // richest, so this figure gets the only one left rather than the fullest.
      { name: "07-convert-to-job", kind: "action", button: "Convert to job",
        subject: process.env.KB_ESTIMATE_APPROVED || "EST-1019" },
      { name: "06-submit-estimate", kind: "action", button: "Submit estimate", subject: process.env.KB_ESTIMATE_DRAFT || "Deep Cleaning Service" },
      // Duplicate, Download Pdf and Delete all live in the same menu. One
      // figure of the menu open covers all three; a figure per item would be
      // three pictures of the same dropdown.
      { name: "08-more-actions", kind: "menu" },
    ],
  },
  invoices: {
    nav: "Invoices",
    tour: "invoices",
    // 13 line items and one payment recorded.
    subject: process.env.KB_INVOICE || "INV-2026-1042",
    figures: [
      { name: "03-invoice-detail", kind: "page" },
      // Send and Add Payment are offered by STATUS, and the richest invoice on
      // staging is PAID — which offers neither. Each figure therefore picks a
      // subject whose status actually exposes its action: a draft to send, and
      // a sent-but-unpaid one to record a payment against.
      { name: "04-send-invoice", kind: "action", button: "Send Invoice",
        subject: process.env.KB_INVOICE_DRAFT || "INV-2026-1049" },
      // Add Payment is NOT in the header: it lives inside the Payments tab.
      { name: "05-add-payment", kind: "action", button: "Add Payment", tab: "Payments",
        subject: process.env.KB_INVOICE_SENT || "INV-2026-1021" },
      { name: "06-more-actions", kind: "menu" },
    ],
  },
};

const email = process.env.KB_EMAIL || process.env.STAGING_SP_LOGIN_EMAIL;
const password = process.env.KB_PASSWORD || process.env.STAGING_SP_LOGIN_PASSWORD;
if (!email || !password) {
  console.error("Missing STAGING_SP_LOGIN_EMAIL / STAGING_SP_LOGIN_PASSWORD (or KB_EMAIL / KB_PASSWORD).");
  process.exit(1);
}

const targets = process.argv.slice(2).filter((a) => !a.startsWith("-"));
const keys = targets.length ? targets : Object.keys(SECTIONS);
const unknown = keys.filter((k) => !SECTIONS[k]);
if (unknown.length) {
  console.error(`Unknown section(s): ${unknown.join(", ")}\nKnown: ${Object.keys(SECTIONS).join(", ")}`);
  process.exit(1);
}

const results = [];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: VIEWPORT, deviceScaleFactor: SCALE });

async function hideAccountChrome() {
  await page.evaluate(() => {
    document.querySelectorAll(".onboarding-widget").forEach((el) => { el.style.display = "none"; });
    for (const el of document.querySelectorAll("body *")) {
      if (getComputedStyle(el).position !== "fixed") continue;
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height || r.width > 160) continue;
      if (r.right > window.innerWidth - 140 && r.bottom > window.innerHeight - 160) el.style.display = "none";
    }
  });
}

async function dismissAnyPanel() {
  for (let i = 0; i < 4; i++) {
    if (!(await page.locator(PANEL).count())) return;
    const cancel = page.locator('button:has-text("Cancel"), button:has-text("Back"), button:has-text("Close")').last();
    if (await cancel.count()) await cancel.click({ timeout: 5000 }).catch(() => {});
    await page.keyboard.press("Escape").catch(() => {});
    await page.waitForTimeout(900);
  }
}

async function shoot(dir, name, target, opts = {}) {
  await page.waitForTimeout(opts.settle ?? 1000);
  const path = resolve(ROOT, `public/images/${dir}/${name}.png`);
  if (target) {
    await target.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await target.screenshot({ path });
  } else {
    await page.screenshot({ path });
  }
  results.push({ name: `${dir}/${name}`, status: "ok" });
  console.log(`    ✓ ${name}.png`);
}

async function figure(label, fn) {
  try {
    await fn();
  } catch (err) {
    const lines = err.message.split("\n").map((l) => l.trim()).filter(Boolean);
    const cause = lines.find((l) => /intercept|not visible|not stable|resolved to|waiting for/i.test(l));
    results.push({ name: label, status: "failed", reason: cause ? `${lines[0]} — ${cause}` : lines[0] });
    console.log(`    ✗ ${label} — ${cause || lines[0]}`);
  } finally {
    await dismissAnyPanel();
  }
}

/**
 * Resolve a subject by NAME to its id through the API, then open it by URL.
 *
 * The list's search box is word-based: searching "Standard House Cleaning"
 * returns four rows headed by "Deep Cleaning Consultation". That cannot
 * guarantee which record gets photographed, and these figures publish a real
 * record's name and totals — so the subject has to be exact.
 */
async function resolveId(kind, subject) {
  return page.evaluate(async ({ kind, subject }) => {
    const t = localStorage.getItem("accessToken");
    const api = window.__KB_GQL;
    const q =
      kind === "estimates"
        ? `{getEstimates(data:{page:1,limitPerPage:200}){... on GetEstimates{estimates{id name}}}}`
        : `{getInvoices(data:{page:1,limitPerPage:200}){... on GetInvoices{invoices{id invoiceNumber}}}}`;
    const r = await fetch(api, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${t}` },
      body: JSON.stringify({ query: q }),
    }).then((x) => x.json());
    const list = Object.values(r?.data || {})[0];
    const rows = list?.estimates || list?.invoices || [];
    const hit = rows.find((x) => (x.name || x.invoiceNumber) === subject);
    return hit ? hit.id : null;
  }, { kind, subject });
}

/** Search the list for a named record and open it. */
async function openSubject(s, subject) {
  await page.locator(`button:has-text("${s.nav}")`).first().click().catch(() => {});
  await page.waitForSelector(`[data-tour="${s.tour}-page"]`, { timeout: 30000 });
  await page.waitForTimeout(3000);
  await hideAccountChrome();
  const tip = page.locator(".react-joyride__tooltip");
  if (await tip.count()) {
    await page.locator('button:has-text("Skip")').first().click({ timeout: 4000 }).catch(() => {});
    await page.waitForTimeout(1000);
  }
  const search = page.locator(`[data-tour="${s.tour}-search"] input`).first();
  if (await search.count()) {
    await search.fill(subject);
    await page.waitForTimeout(3500);
  }
  const row = page
    .locator(`[data-tour="${s.tour}-list"] table tbody tr`)
    .filter({ hasText: subject })
    .first();
  if (!(await row.count())) throw new Error(`no record matching "${subject}" — set the env override to one that exists`);
  // The first cell opens the record in these sections; the eye does too.
  await row.locator("button").first().click();
  await page.waitForTimeout(5000);
  await hideAccountChrome();
}

// The API host isn't in the bundle as a constant we can read, so it is taken
// from the first GraphQL request the app makes and stashed on window.
let gqlUrl = null;
page.on("request", (r) => {
  if (!gqlUrl && /\/graphql$/.test(r.url())) gqlUrl = r.url();
});

await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
await page.fill("#email", email);
await page.fill("#password", password);
await page.click('button:has-text("Sign In")');
await page.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 45000 });
await page.waitForTimeout(3500);
await hideAccountChrome();
if (!gqlUrl) { console.error("never saw a GraphQL request; cannot resolve subjects"); process.exit(1); }
await page.addInitScript((u) => { window.__KB_GQL = u; }, gqlUrl);
await page.evaluate((u) => { window.__KB_GQL = u; }, gqlUrl);

for (const key of keys) {
  const s = SECTIONS[key];
  console.log(`\n${key}`);
  mkdirSync(resolve(ROOT, `public/images/${key}`), { recursive: true });

  let openedFor = null;
  for (const f of s.figures) {
    const subject = f.subject || s.subject;
    await figure(`${key}/${f.name}`, async () => {
      if (openedFor !== subject) {
        const id = await resolveId(key, subject);
        if (!id) throw new Error(`no ${key.replace(/s$/, "")} named "${subject}" exists — check the audit or override with the env var`);
        await page.goto(`${BASE}/${key}/${id}`, { waitUntil: "domcontentloaded" });
        // A detail page needs ~9s on staging before its action bar is painted;
        // at 6s the header renders with only the status badge and every button
        // lookup fails for the wrong reason.
        await page.waitForTimeout(9500);
        const notFound = await page.locator('text=/not found/i').count();
        if (notFound) throw new Error(`the app answers "not found" for this ${key.replace(/s$/, "")} id, though the list returns it`);
        await hideAccountChrome();
        openedFor = subject;
      }
      if (f.kind === "page") {
        await shoot(key, f.name, null, { settle: 1500 });
        return;
      }
      if (f.kind === "menu") {
        // Found by its accessible name, not by position: "the last icon-only
        // button on the page" picked something else entirely. The menu
        // component sets triggerAriaLabel to the moreActions string.
        const trigger = page.getByRole("button", { name: /more actions/i }).first();
        if (!(await trigger.count())) throw new Error('no button labelled "More Actions" on this record');
        await trigger.click();
        await page.waitForTimeout(1500);
        await shoot(key, f.name, null);
        return;
      }
      if (f.tab) {
        await page.locator(`button:has-text("${f.tab}")`).first().click();
        await page.waitForTimeout(2500);
      }
      const btn = page.locator(`button:has-text("${f.button}")`).first();
      if (!(await btn.count())) throw new Error(`no "${f.button}" button on this record — its status may not offer it`);
      await btn.click();
      const panel = page.locator(PANEL).last();
      await panel.waitFor({ state: "visible", timeout: 20000 });
      await page.waitForTimeout(1800);
      await shoot(key, f.name, panel);
    });
    // An action step leaves the record open; a different subject needs a fresh
    // navigation, which openSubject handles on the next iteration.
    if (f.subject) openedFor = subject;
  }
}

await browser.close();

console.log("\n— summary —");
const ok = results.filter((r) => r.status === "ok").length;
for (const r of results) console.log(`${r.status.padEnd(8)} ${r.name}${r.reason ? ` (${r.reason})` : ""}`);
console.log(`\n${ok} captured, ${results.length - ok} failed`);
process.exit(results.some((r) => r.status === "failed") ? 1 : 0);
