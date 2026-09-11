/**
 * Knowledge base screenshots, row-level figures.
 *
 * section.mjs captures what a section looks like from the outside: the list, the
 * filter, the add panel. This one captures what you get from a ROW: the edit
 * panel, the confirmation a destructive action asks for, and the Quick Add
 * variant. Same shape across sections, so same config-driven approach.
 *
 * Run:
 *   set -a; . ~/dhs_qa_workspace/.env; set +a
 *   node scripts/kb-screenshots/rowactions.mjs users
 *
 * READ-ONLY, and it must stay that way, the platform is mid-migration. The edit
 * panel is cancelled, and the confirmation dialog is photographed and then
 * DISMISSED, never confirmed. Nothing here disables, archives or deletes.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const BASE = process.env.KB_BASE_URL || "https://app-staging.directhomeservice.com";
const VIEWPORT = { width: 1440, height: 900 };
const SCALE = 2;

/**
 * nav/tour , as in section.mjs
 * edit     , { figure, expect } the pencil on a row and the heading it opens with
 * confirm  , { figure, button, expect } a row button that opens a confirmation
 * quickAdd , { figure, item, expect } the entry to pick in the Quick Add menu
 */
const SECTIONS = {
  users: {
    nav: "Users",
    tour: "users",
    edit: { figure: "04-edit-user-panel", expect: "Edit User" },
    // The disable button carries no accessible label of its own, so it is found
    // by position: the last action button in the row, after the pencil.
    confirm: { figure: "05-disable-confirmation", expect: "Disable" },
    quickAdd: { figure: "06-quick-add-user", item: "User", expect: "Quick Add: New User" },
  },
  services: {
    nav: "Services",
    parent: "Inventory",
    tour: "services",
    menu: [
      { figure: "04-edit-service-panel", item: "Edit service", expect: "Edit service" },
      { figure: "05-service-attachments", item: "Attachments", expect: "Attachments" },
      { figure: "06-archive-service", item: "Archive", expect: "Archive", viewport: true },
    ],
    quickAdd: { figure: "07-quick-add-service", item: "Service Item", expect: "Quick Add" },
  },
  products: {
    nav: "Products",
    parent: "Inventory",
    tour: "products",
    menu: [
      { figure: "04-edit-product-panel", item: "Edit product", expect: "Edit product" },
      { figure: "05-archive-product", item: "Archive", expect: "Archive", viewport: true },
    ],
    bulk: { figure: "06-bulk-edit", rows: 3 },
    // No Quick Add here: the top-bar panel offers nine tiles and Product is not
    // one of them. A product can only be quick-added from inside a product
    // picker, which means being mid-estimate, not a figure this script takes.
  },
};

const email = process.env.KB_EMAIL || process.env.STAGING_SP_LOGIN_EMAIL;
const password = process.env.KB_PASSWORD || process.env.STAGING_SP_LOGIN_PASSWORD;
if (!email || !password) {
  console.error("Missing STAGING_SP_LOGIN_EMAIL / STAGING_SP_LOGIN_PASSWORD (or KB_EMAIL / KB_PASSWORD).");
  process.exit(1);
}

const requested = process.argv.slice(2).filter((a) => !a.startsWith("-"));
const targets = requested.length ? requested : Object.keys(SECTIONS);
const unknown = targets.filter((t) => !SECTIONS[t]);
if (unknown.length) {
  console.error(`Unknown section(s): ${unknown.join(", ")}\nKnown: ${Object.keys(SECTIONS).join(", ")}`);
  process.exit(1);
}

const results = [];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: VIEWPORT, deviceScaleFactor: SCALE });
const PANEL = "div.relative.transform.overflow-hidden.shadow-xl";

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
    const cancel = page.locator('button:has-text("Cancel"), button:has-text("Back")').last();
    if (await cancel.count()) await cancel.click({ timeout: 5000 }).catch(() => {});
    await page.keyboard.press("Escape").catch(() => {});
    await page.waitForTimeout(900);
  }
}

async function shoot(dir, name, target, opts = {}) {
  await page.waitForTimeout(opts.settle ?? 900);
  const path = resolve(ROOT, `public/images/${dir}/${name}.png`);
  if (target) {
    await target.scrollIntoViewIfNeeded();
    await page.waitForTimeout(250);
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
    results.push({ name: label, status: "failed", reason: cause ? `${lines[0]}, ${cause}` : lines[0] });
    console.log(`    ✗ ${label}, ${cause || lines[0]}`);
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

for (const key of targets) {
  const s = SECTIONS[key];
  console.log(`\n${key}`);
  mkdirSync(resolve(ROOT, `public/images/${key}`), { recursive: true });

  // Same collapsed-group trap as section.mjs: a collapsed sidebar group keeps
  // its children's bounding boxes, so ask whether the child is really on top.
  if (s.parent) {
    const reachable = () =>
      page.evaluate((name) => {
        const btn = [...document.querySelectorAll("button")].find((b) => b.innerText.trim() === name);
        if (!btn) return false;
        const r = btn.getBoundingClientRect();
        if (!r.width || !r.height) return false;
        const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
        return Boolean(top && btn.contains(top));
      }, s.nav);
    for (let i = 0; i < 3 && !(await reachable()); i++) {
      await page.locator(`button:has-text("${s.parent}")`).first().click().catch(() => {});
      await page.waitForTimeout(1200);
    }
  }

  await page.locator(`button:has-text("${s.nav}")`).first().click();
  await page.waitForSelector(`[data-tour="${s.tour}-page"]`, { timeout: 30000 });
  await page.waitForTimeout(4000);
  await hideAccountChrome();
  const tip = page.locator(".react-joyride__tooltip");
  if (await tip.count()) {
    await page.locator('button:has-text("Skip")').first().click({ timeout: 4000 }).catch(() => {});
    await page.waitForTimeout(1200);
  }

  // Which row the figures come from. Named where it matters (a draft job, so the
  // edit panel isn't a wall of locked fields) rather than "whatever is first".
  const targetRow = s.row
    ? page.locator(`[data-tour="${s.tour}-list"] table tbody tr`).filter({ hasText: s.row }).first()
    : page.locator(`[data-tour="${s.tour}-list"] table tbody tr`).first();
  if (s.row && !(await targetRow.count())) {
    console.log(`    ✗ no row matching "${s.row}" on the first page, set KB_JOB_ROW`);
    continue;
  }
  const rowButtons = targetRow.locator("button");

  if (s.edit) {
    await figure(`${key}/${s.edit.figure}`, async () => {
      await rowButtons.first().click();
      const panel = page.locator(PANEL).last();
      await panel.waitFor({ state: "visible", timeout: 20000 });
      await page.waitForTimeout(1800);
      const heading = (await panel.innerText().catch(() => "")).split("\n")[0].trim();
      if (!heading.toLowerCase().includes(s.edit.expect.toLowerCase())) {
        console.log(`      (heading is "${heading}", expected "${s.edit.expect}")`);
      }
      await shoot(key, s.edit.figure, panel);
    });
  }

  if (s.confirm) {
    await figure(`${key}/${s.confirm.figure}`, async () => {
      const n = await rowButtons.count();
      if (n < 2) throw new Error(`the first row has ${n} action button(s); expected the pencil plus one more`);
      await rowButtons.nth(n - 1).click();
      const dialog = page.locator(PANEL).last();
      await dialog.waitFor({ state: "visible", timeout: 20000 });
      await page.waitForTimeout(1400);
      const heading = (await dialog.innerText().catch(() => "")).split("\n")[0].trim();
      if (!heading.toLowerCase().includes(s.confirm.expect.toLowerCase())) {
        console.log(`      (heading is "${heading}", expected "${s.confirm.expect}")`);
      }
      // The dialog is small and centred; the viewport frames it better than a
      // tight crop, and shows what it is interrupting.
      await shoot(key, s.confirm.figure, null);
    });
  }

  // The three-dot menu on a row is where edit, attachments and archive live in
  // the Inventory sections. Same shape every time, so one step covers them all.
  //
  // Archive opens a CONFIRMATION and is photographed, then dismissed. Nothing is
  // archived, the platform is mid-migration and this script only reads.
  for (const m of s.menu || []) {
    await figure(`${key}/${m.figure}`, async () => {
      const n = await rowButtons.count();
      if (!n) throw new Error("the first row has no action buttons");
      await rowButtons.nth(n - 1).click();
      await page.waitForTimeout(1200);
      const item = page.locator(`text="${m.item}"`).last();
      if (!(await item.count())) throw new Error(`no "${m.item}" in the row menu`);
      await item.click();
      const surface = page.locator(PANEL).last();
      await surface.waitFor({ state: "visible", timeout: 20000 });
      await page.waitForTimeout(1600);
      const heading = (await surface.innerText().catch(() => "")).split("\n")[0].trim();
      if (m.expect && !heading.toLowerCase().includes(m.expect.toLowerCase())) {
        console.log(`      (heading is "${heading}", expected "${m.expect}")`);
      }
      // A small centred dialog reads better framed by the page it interrupts.
      await shoot(key, m.figure, m.viewport ? null : surface);
    });
  }

  if (s.bulk) {
    await figure(`${key}/${s.bulk.figure}`, async () => {
      // The row checkbox renders a hidden <input> inside a styled div, so the
      // input is never clickable. The div carrying data-checkbox-root is.
      const boxes = page.locator(`[data-tour="${s.tour}-list"] table tbody tr [data-checkbox-root="true"]`).first().locator("xpath=.");
      const allBoxes = page.locator(`[data-tour="${s.tour}-list"] table tbody tr > td:first-child [data-checkbox-root="true"]`);
      const take = Math.min(s.bulk.rows, await allBoxes.count());
      if (!take) throw new Error("no row checkboxes, this list isn't selectable");
      for (let i = 0; i < take; i++) {
        await allBoxes.nth(i).click();
        await page.waitForTimeout(400);
      }
      await page.waitForTimeout(900);
      const trigger = page.locator('button:has-text("Bulk Edit"), button:has-text("Edit")').last();
      await trigger.click();
      const panel = page.locator(PANEL).last();
      await panel.waitFor({ state: "visible", timeout: 20000 });
      await page.waitForTimeout(1600);
      await shoot(key, s.bulk.figure, panel);
    });
  }

  if (s.quickAdd) {
    await figure(`${key}/${s.quickAdd.figure}`, async () => {
      await page.locator('button:has-text("Quick Add")').first().click();
      await page.waitForTimeout(1400);
      await page.locator(`text="${s.quickAdd.item}"`).last().click();
      const panel = page.locator(PANEL).last();
      await panel.waitFor({ state: "visible", timeout: 20000 });
      await page.waitForTimeout(1800);
      await shoot(key, s.quickAdd.figure, panel);
    });
  }
}

await browser.close();

console.log("\n, summary ,");
const ok = results.filter((r) => r.status === "ok").length;
for (const r of results) console.log(`${r.status.padEnd(8)} ${r.name}${r.reason ? ` (${r.reason})` : ""}`);
console.log(`\n${ok} captured, ${results.length - ok} failed`);
process.exit(results.some((r) => r.status === "failed") ? 1 : 0);
