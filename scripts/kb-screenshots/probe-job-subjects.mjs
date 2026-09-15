/**
 * Read-only probe: is there a job on this account worth building the Jobs and
 * Invoices figures around?
 *
 * The published Jobs figures were shot against the previous staging account,
 * using one completed job ("Door Fitting") and the invoice raised from it. The
 * list figures have since moved to this account, so the two halves of those
 * articles no longer come from the same place. Re-shooting needs a subject
 * here, and a subject is not "any job": the figures show visits with time
 * entries, a checklist, and a paid invoice raised from the work.
 *
 * This prints what each candidate has so a subject can be chosen on evidence
 * rather than by opening twenty jobs by hand.
 *
 * Run:
 *   set -a; . ~/dhs_qa_workspace/.env; set +a
 *   node scripts/kb-screenshots/probe-job-subjects.mjs
 *
 * READ-ONLY. It opens jobs and reads their tabs. Nothing is created or changed.
 */
import { chromium } from "playwright";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const BASE = process.env.KB_BASE_URL || "https://app-staging.directhomeservice.com";
const MAX_OPEN = Number(process.env.KB_MAX_OPEN || 8);
void resolve, dirname, fileURLToPath;

const email = process.env.KB_EMAIL || process.env.STAGING_SP_LOGIN_EMAIL;
const password = process.env.KB_PASSWORD || process.env.STAGING_SP_LOGIN_PASSWORD;
if (!email || !password) {
  console.error("Missing STAGING_SP_LOGIN_EMAIL / STAGING_SP_LOGIN_PASSWORD (or KB_EMAIL / KB_PASSWORD).");
  process.exit(1);
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
await page.fill("#email", email);
await page.fill("#password", password);
await page.click('button:has-text("Sign In")');
await page.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 45000 });
await page.waitForTimeout(3500);

await page.locator('button:has-text("Jobs"), a:has-text("Jobs")').first().click();
await page.waitForSelector('[data-tour="jobs-page"]', { timeout: 30000 });
await page.waitForTimeout(4000);
const tip = page.locator(".react-joyride__tooltip");
if (await tip.count()) {
  await page.locator('button:has-text("Skip")').first().click({ timeout: 4000 }).catch(() => {});
  await page.waitForTimeout(1000);
}

// Ask the account, not the first page: filter by Completed and read the count
// the card header reports. "No completed job on page one" is a much weaker
// claim than "no completed job at all", and the figures depend on the answer.
try {
  const filterButton = page.locator('[data-tour="jobs-filters"] button, button:has-text("Status")').first();
  await filterButton.click({ timeout: 8000 });
  await page.waitForTimeout(1200);
  await page.locator('text=/^Completed$/').first().click({ timeout: 8000 });
  await page.waitForTimeout(3500);
  const header = await page.locator('[data-tour="jobs-list"]').first().innerText();
  const count = (header.split("\n").slice(0, 3).join(" ").match(/\d+/) || ["?"])[0];
  console.log(`\ncompleted jobs on the whole account: ${count}`);
  await page.keyboard.press("Escape").catch(() => {});
  await page.locator('button:has-text("Reset filter"), button:has-text("Reset Filter")').first().click({ timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(3000);
} catch (err) {
  console.log(`\ncould not read the completed count: ${err.message.split("\n")[0]}`);
}

// Read the whole first page of jobs, with their status and total, so the
// shortlist is picked from data rather than from the top of the list.
const rows = await page.locator('[data-tour="jobs-list"] table tbody tr').all();
console.log(`\n${rows.length} job(s) on the first page\n`);

const candidates = [];
for (const row of rows) {
  const text = (await row.innerText()).replace(/\s+/g, " ").trim();
  const completed = /completed/i.test(text);
  const money = text.match(/\$[\d,]+\.\d\d/);
  const amount = money ? Number(money[0].replace(/[$,]/g, "")) : 0;
  candidates.push({ text, completed, amount });
}

const shortlist = candidates
  .filter((c) => c.completed || c.amount > 0)
  .sort((a, b) => Number(b.completed) - Number(a.completed) || b.amount - a.amount)
  .slice(0, MAX_OPEN);

console.log(`completed on this page: ${candidates.filter((c) => c.completed).length}`);
console.log(`with a total above zero: ${candidates.filter((c) => c.amount > 0).length}`);
console.log(`opening ${shortlist.length} candidate(s)\n`);

for (const c of shortlist) {
  const name = c.text.split(" ").slice(0, 4).join(" ");
  const row = page.locator('[data-tour="jobs-list"] table tbody tr').filter({ hasText: c.text.split(" ")[0] }).first();
  await row.locator("button").first().click().catch(() => {});
  await page.waitForURL(/\/jobs\//, { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(9000);

  const body = (await page.locator("body").innerText()).replace(/\s+/g, " ");
  const tabs = await page.locator('[role=tab], button').allInnerTexts();
  const has = (t) => tabs.some((x) => x.trim().toLowerCase() === t);

  console.log(`${name}`);
  console.log(`   status in list : ${c.completed ? "Completed" : "not completed"}, total ${c.amount ? `$${c.amount}` : "0"}`);
  console.log(`   checklist tab  : ${has("checklist") ? "yes" : "no"}`);
  console.log(`   visits tab     : ${has("visits") ? "yes" : "no"}`);
  console.log(`   invoices tab   : ${has("invoices") ? "yes" : "no"}`);
  console.log(`   has a visit    : ${/no visits added yet/i.test(body) ? "no" : "probably"}`);
  console.log("");

  await page.goBack({ waitUntil: "domcontentloaded" }).catch(() => {});
  await page.waitForTimeout(4000);
}

await browser.close();
