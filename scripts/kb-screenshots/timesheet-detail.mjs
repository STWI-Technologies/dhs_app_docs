/**
 * Knowledge base screenshots, one timesheet and the Add Time panel inside it.
 *
 * The list figures come from section.mjs; these two need a record open, and the
 * record cannot be just any row: **an approved timesheet has no Add Time
 * button** (the header hides its actions once the timesheet is approved), so
 * the subject is picked by status rather than by position.
 *
 * Run:
 *   set -a; . ~/dhs_qa_workspace/.env; set +a
 *   node scripts/kb-screenshots/timesheet-detail.mjs
 *
 * READ-ONLY. The Add Time panel is opened, photographed and cancelled. No time
 * entry is created and no timesheet changes state.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const OUT_DIR = resolve(ROOT, "public/images/timesheets");
const BASE = process.env.KB_BASE_URL || "https://app-staging.directhomeservice.com";
const VIEWPORT = { width: 1440, height: 900 };
const SCALE = 2;
const PANEL = "div.relative.transform.overflow-hidden.shadow-xl";

const email = process.env.KB_EMAIL || process.env.STAGING_SP_LOGIN_EMAIL;
const password = process.env.KB_PASSWORD || process.env.STAGING_SP_LOGIN_PASSWORD;
if (!email || !password) {
  console.error("Missing STAGING_SP_LOGIN_EMAIL / STAGING_SP_LOGIN_PASSWORD (or KB_EMAIL / KB_PASSWORD).");
  process.exit(1);
}

mkdirSync(OUT_DIR, { recursive: true });
const results = [];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: VIEWPORT, deviceScaleFactor: SCALE });

/** The onboarding dock and the support launcher belong to neither figure. */
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
    const cancel = page.locator('button:has-text("Cancel"), button:has-text("Close")').last();
    if (await cancel.count()) await cancel.click({ timeout: 5000 }).catch(() => {});
    await page.keyboard.press("Escape").catch(() => {});
    await page.waitForTimeout(900);
  }
}

async function figure(name, fn) {
  try {
    await fn();
    results.push({ name, status: "ok" });
    console.log(`    ✓ ${name}.png`);
  } catch (err) {
    const lines = err.message.split("\n").map((l) => l.trim()).filter(Boolean);
    const cause = lines.find((l) => /intercept|not visible|not stable|resolved to|waiting for/i.test(l));
    results.push({ name, status: "failed", reason: cause ? `${lines[0]}, ${cause}` : lines[0] });
    console.log(`    ✗ ${name}, ${cause || lines[0]}`);
  } finally {
    await dismissAnyPanel();
  }
}

await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
await page.fill("#email", email);
await page.fill("#password", password);
await page.click('button:has-text("Sign In")');
await page.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 45000 });
await page.waitForTimeout(3500);
await hideAccountChrome();

await page.locator('button:has-text("Timesheets"), a:has-text("Timesheets")').first().click();
await page.waitForSelector('[data-tour="timesheets-page"]', { timeout: 30000 });
await page.waitForTimeout(4000);
await hideAccountChrome();
const tip = page.locator(".react-joyride__tooltip");
if (await tip.count()) {
  await page.locator('button:has-text("Skip")').first().click({ timeout: 4000 }).catch(() => {});
  await page.waitForTimeout(1200);
}

// Pick the subject by STATUS. An approved timesheet is a payroll record: its
// header drops Add Time, so it can show the detail but never the panel.
const rows = page.locator('[data-tour="timesheets-list"] table tbody tr');
await rows.first().waitFor({ state: "visible", timeout: 30000 });
const count = await rows.count();
let subjectRow = null;
let subjectLabel = "";
for (let i = 0; i < count; i++) {
  const row = rows.nth(i);
  const text = (await row.innerText()).replace(/\s+/g, " ").trim();
  if (/approved/i.test(text)) continue;
  subjectRow = row;
  subjectLabel = text.split(" ").slice(0, 2).join(" ");
  break;
}
if (!subjectRow) {
  console.error("every timesheet on this account is approved, so Add Time cannot be photographed here");
  await browser.close();
  process.exit(1);
}
console.log(`\ntimesheet subject: ${subjectLabel}`);

await subjectRow.locator("button").first().click();
await page.waitForURL(/\/timesheets\//, { timeout: 30000 });
// A detail page needs its data before the header paints its actions; the same
// wait the estimate and invoice figures needed.
await page.waitForTimeout(9500);
await hideAccountChrome();

await figure("04-timesheet-detail", async () => {
  await page.screenshot({ path: resolve(OUT_DIR, "04-timesheet-detail.png") });
});

await figure("05-add-time-panel", async () => {
  await page.locator('button:has-text("Add time")').first().click({ timeout: 15000 });
  const drawer = page.locator(PANEL).last();
  await drawer.waitFor({ state: "visible", timeout: 20000 });
  await page.waitForTimeout(2000);
  await drawer.screenshot({ path: resolve(OUT_DIR, "05-add-time-panel.png") });
});

await browser.close();

console.log("\n, summary ,");
for (const r of results) console.log(`${r.status.padEnd(8)} ${r.name}${r.reason ? ` (${r.reason})` : ""}`);
const ok = results.filter((r) => r.status === "ok").length;
console.log(`\n${ok} figure(s) captured, ${results.length - ok} failed`);
process.exit(results.some((r) => r.status === "failed") ? 1 : 0);
