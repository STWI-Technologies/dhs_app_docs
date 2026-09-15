/**
 * Knowledge base screenshot, the product Quick Add panel.
 *
 * Its own script because products are the one catalogue item with no Quick Add
 * tile in the top bar: the shortcut exists ONLY inside a product picker, which
 * means being mid-record. So this opens an estimate, opens its product picker,
 * and photographs the Quick Add panel from there. rowactions.mjs cannot reach
 * it, which is why products has no `quickAdd` entry in that file.
 *
 * Run:
 *   set -a; . ~/dhs_qa_workspace/.env; set +a
 *   node scripts/kb-screenshots/product-quick-add.mjs
 *
 * READ-ONLY. Nothing is added to the estimate and no product is created: the
 * Quick Add panel is photographed empty and every panel is cancelled on the way
 * out. KB_ESTIMATE names the estimate to work from, otherwise the first one on
 * the list is used, the figure is a crop of the panel so the record behind it
 * does not show.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const OUT_DIR = resolve(ROOT, "public/images/products");
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
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: VIEWPORT, deviceScaleFactor: SCALE });

await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
await page.fill("#email", email);
await page.fill("#password", password);
await page.click('button:has-text("Sign In")');
await page.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 45000 });
await page.waitForTimeout(3500);

await page.goto(`${BASE}/estimates`, { waitUntil: "domcontentloaded" });
await page.waitForSelector('[data-tour="estimates-list"]', { timeout: 30000 });
await page.waitForTimeout(4000);

// The row itself does not navigate; the estimate number inside it does.
const rows = page.locator('[data-tour="estimates-list"] table tbody tr');
const wanted = process.env.KB_ESTIMATE;
const row = wanted ? rows.filter({ hasText: wanted }).first() : rows.first();
if (!(await row.count())) {
  console.error(wanted ? `No estimate matching "${wanted}" on the first page.` : "No estimates on the first page.");
  await browser.close();
  process.exit(1);
}
await row.locator("button").filter({ hasText: /EST-/ }).first().click();
await page.waitForURL(/\/estimates\/[a-f0-9]{8,}/, { timeout: 30000 });
await page.waitForTimeout(5000);

await page.locator('button:has-text("Add Products")').first().click();
const picker = page.locator(PANEL).last();
await picker.waitFor({ state: "visible", timeout: 20000 });
await page.waitForTimeout(2500);

await picker.locator('button:has-text("Quick Add")').first().click();
const quickAdd = page.locator(PANEL).last();
await quickAdd.waitFor({ state: "visible", timeout: 20000 });
await page.waitForTimeout(2000);

const heading = (await quickAdd.innerText().catch(() => "")).split("\n")[0].trim();
if (!/quick add/i.test(heading)) console.log(`  (heading is "${heading}", expected a Quick Add panel)`);

const out = resolve(OUT_DIR, "07-quick-add-product.png");
await quickAdd.screenshot({ path: out });
console.log(`  ✓ 07-quick-add-product.png  (${heading})`);

// Out the way we came in: cancel every panel, create nothing.
for (let i = 0; i < 3; i++) {
  const cancel = page.locator('button:has-text("Cancel")').last();
  if (await cancel.count()) await cancel.click({ timeout: 5000 }).catch(() => {});
  await page.keyboard.press("Escape").catch(() => {});
  await page.waitForTimeout(800);
}
await browser.close();
