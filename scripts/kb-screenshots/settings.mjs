/**
 * Knowledge base figures for the Settings article.
 *
 * Settings is one page with a sidebar, and each section has its own URL
 * (`/settings-business`, `/settings-dashboard`, ...), so the sections are
 * reached by address rather than by clicking down the list.
 *
 * Run:
 *   set -a; . ~/dhs_qa_workspace/.env; set +a
 *   node scripts/kb-screenshots/settings.mjs
 *   KB_ONLY=04 node scripts/kb-screenshots/settings.mjs
 *
 * READ-ONLY. The unsaved-changes figure types one character into a field and
 * then DISCARDS it. Nothing is saved: no setting on the account is changed.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const DIR = resolve(ROOT, "public/images/settings");
const BASE = process.env.KB_BASE_URL || "https://app-staging.directhomeservice.com";
const VIEWPORT = { width: 1440, height: 900 };

const email = process.env.KB_EMAIL || process.env.STAGING_SP_LOGIN_EMAIL;
const password = process.env.KB_PASSWORD || process.env.STAGING_SP_LOGIN_PASSWORD;
if (!email || !password) { console.error("Missing credentials."); process.exit(1); }
const ONLY = (process.env.KB_ONLY || "").split(",").map((s) => s.trim()).filter(Boolean);
const wanted = (n) => !ONLY.length || ONLY.includes(n);

mkdirSync(DIR, { recursive: true });
const results = [];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: VIEWPORT, deviceScaleFactor: 2 });

async function hideChrome() {
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

async function openSection(path) {
  await page.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(7000);
  await hideChrome();
  await page.locator('button:has-text("Skip")').first().click({ timeout: 2500 }).catch(() => {});
  await page.waitForTimeout(800);
}

async function shoot(name) {
  await page.waitForTimeout(700);
  await page.screenshot({ path: resolve(DIR, `${name}.png`) });
  results.push({ name, status: "ok" });
  console.log(`  ✓ ${name}.png`);
}

async function figure(num, name, fn) {
  if (!wanted(num)) return;
  try { await fn(name); }
  catch (err) {
    const first = err.message.split("\n")[0];
    results.push({ name, status: "failed", reason: first });
    console.log(`  ✗ ${name}, ${first}`);
  }
}

await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
await page.fill("#email", email);
await page.fill("#password", password);
await page.click('button:has-text("Sign In")');
await page.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 60000 });
await page.waitForTimeout(7000);

await figure("01", "01-settings", async (n) => {
  await openSection("/settings");
  await shoot(n);
});

await figure("02", "02-settings-dashboard", async (n) => {
  await openSection("/settings-dashboard");
  await shoot(n);
});

await figure("03", "03-settings-business", async (n) => {
  await openSection("/settings-business");
  // Report what the section actually carries, so a stale figure is obvious in
  // the log rather than three weeks later in the article.
  const body = await page.locator("body").innerText();
  console.log(`    business section mentions: ${["Invoice Instructions", "Payment Disclaimer", "Privacy", "Information Sharing"]
    .filter((k) => new RegExp(k, "i").test(body)).join(", ") || "none of the expected headings"}`);
  await shoot(n);
});

await figure("04", "04-settings-business-privacy", async (n) => {
  await openSection("/settings-business");
  // The lower half of the section: Crew settings and Privacy settings, which a
  // viewport shot of the top cannot reach.
  const box = await page.evaluate(() => {
    const h = [...document.querySelectorAll("h1,h2,h3,h4,div,span,p")].find(
      (x) => x.children.length === 0 && /^Privacy settings$/i.test((x.textContent || "").trim())
    );
    if (!h) return null;
    let card = h;
    while (card && card.parentElement) {
      const r = card.getBoundingClientRect();
      if (r.width > 700) break;
      card = card.parentElement;
    }
    card.scrollIntoView({ block: "center" });
    return true;
  });
  if (!box) throw new Error("no Privacy settings block in the Business section");
  await page.waitForTimeout(1200);
  await shoot(n);
});

await figure("05", "05-settings-unsaved", async (n) => {
  await openSection("/settings-business");
  // Make the form dirty without saving. The fields are read-only until a card
  // is put into edit mode, which is why clicking straight at an input timed
  // out: there is no input on the page until Edit is pressed.
  await page.locator('button:has-text("Edit")').first().click({ timeout: 12000 });
  await page.waitForTimeout(1800);
  const field = page.locator('input:visible, textarea:visible').first();
  await field.click({ timeout: 10000 });
  await page.keyboard.type("1");
  await page.waitForTimeout(1200);
  // Try to leave the section. The guard is what we are after; the edit is
  // discarded immediately after and never reaches the account.
  await page.locator('text=/^\\s*Dashboard\\s*$/').first().click({ timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(2200);
  const box = await page.evaluate(() => {
    const h = [...document.querySelectorAll("h1,h2,h3,h4,div,span,p")].find(
      (x) => x.children.length === 0 && /unsaved|discard/i.test(x.textContent || "")
    );
    let el = h;
    while (el && el.parentElement) {
      const r = el.getBoundingClientRect();
      if (r.width > 340 && r.height > 140) break;
      el = el.parentElement;
    }
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: Math.max(0, r.x - 2), y: Math.max(0, r.y - 2), width: r.width + 4, height: r.height + 4 };
  });
  if (!box) {
    const seen = await page.evaluate(() => document.body.innerText.slice(0, 200).replace(/\s+/g, " "));
    throw new Error(`the unsaved-changes guard never appeared; page says: ${seen}`);
  }
  await page.screenshot({ path: resolve(DIR, `${n}.png`), clip: box });
  results.push({ name: n, status: "ok" });
  console.log(`  \u2713 ${n}.png`);
  await page.locator('button:has-text("Discard"), button:has-text("Leave")').first()
    .click({ timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(1200);
});

console.log("\n" + results.map((r) => `${r.status === "ok" ? "ok    " : "FAILED"} ${r.name}${r.reason ? ` , ${r.reason}` : ""}`).join("\n"));
await browser.close();
