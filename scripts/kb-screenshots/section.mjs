/**
 * Knowledge base screenshots, generic list-section capturer.
 *
 * Every list section in the SP app is built from the same parts: a page wrapper,
 * a list card, a search box, a filter control, an add button, and a panel that
 * slides in from the right. They also carry the same data-tour attributes, named
 * after the section. So rather than a script per section, this one is driven by
 * the table below.
 *
 * crews.mjs and clients.mjs stay separate: they capture things unique to them
 * (a hover popover, an invite flow, a client record page). Read crews.mjs first
 * for the selector traps this pattern has already hit.
 *
 * Run:
 *   set -a; . ~/dhs_qa_workspace/.env; set +a
 *   node scripts/kb-screenshots/section.mjs users services products
 *   node scripts/kb-screenshots/section.mjs            # every section below
 *
 * READ-ONLY. Panels are opened to photograph them and always cancelled, never
 * submitted, the platform is mid-migration and create operations are off.
 *
 * KB_EXCLUDE names rows to leave out of the list figures, see EXCLUDE_ROWS.
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
 * key     , folder under public/images and the name used on the command line
 * nav     , the sidebar item to click. Inventory sections need their parent opened first.
 * parent  , sidebar group to expand before `nav` is reachable
 * tour    , data-tour prefix, which is the section name in every case so far
 * add     , the Add button's label, used to wait for the panel it opens
 * panel   , the heading the panel shows, so we know it actually opened
 * filter  , "popover" (a Filter button) | "select" (a dropdown in the card header) | null
 * figures , which numbered figures to take for this section
 */
const SECTIONS = {
  users: { nav: "Users", tour: "users", add: "Add User", panel: "Add New User", filter: "popover", filterTour: "users-role-filter" },
  services: { nav: "Services", parent: "Inventory", tour: "services", add: "Add Service", panel: "Add New Service", filter: "popover" },
  products: { nav: "Products", parent: "Inventory", tour: "products", add: "Add Product", panel: "Add New Product", filter: "popover" },
  vendors: { nav: "Vendors", parent: "Inventory", tour: "vendors", add: "Add Vendor", panel: "Add Vendor", filter: null },
  manufacturers: { nav: "Manufacturers", parent: "Inventory", tour: "manufacturers", add: "Add Manufacturer", panel: "Add Manufacturer", filter: null },
  groups: { nav: "Groups", parent: "Inventory", tour: "groups", add: "Add Group", panel: "Add Group", filter: null },
  estimates: { nav: "Estimates", tour: "estimates", add: "Add Estimate", panel: "Add new estimate", filter: "popover" },
  jobs: { nav: "Jobs", tour: "jobs", add: "Add Job", panel: "Add New Job", filter: "popover" },
  invoices: { nav: "Invoices", tour: "invoices", add: "Add Invoice", panel: "Create Invoice", filter: "popover" },
  appointments: { nav: "Appointments", tour: "appointments", add: "Add Appointment", panel: "Add Appointment", filter: "popover" },
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

/**
 * The onboarding wizard docks over the page for accounts that haven't finished
 * setup, and the support-chat launcher floats over the bottom-right corner, where
 * it lands on the pagination of a tall list. Neither belongs to the section being
 * documented. Matched on computed style, since the class names are generated.
 */
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

/**
 * Rows kept out of the published list figures.
 *
 * Staging is a shared account and anyone can add records to it. A row whose
 * client name or email is somebody's real test data, or an internal staff
 * address, does not belong in a published help centre, and we can neither
 * delete it (the platform is mid-migration, and this script is read-only) nor
 * leave it in. So the row is removed from the DOM for the length of the
 * screenshot. Nothing is changed in the app.
 *
 * Override with KB_EXCLUDE="Name One,Name Two".
 */
const EXCLUDE_ROWS = (process.env.KB_EXCLUDE ?? "Lulu Lemon")
  .split(",").map((x) => x.trim()).filter(Boolean);

async function dropExcludedRows() {
  if (!EXCLUDE_ROWS.length) return;
  const n = await page.evaluate((labels) => {
    let removed = 0;
    for (const tr of document.querySelectorAll("table tbody tr")) {
      if (labels.some((l) => tr.textContent.includes(l))) { tr.remove(); removed++; }
    }
    return removed;
  }, EXCLUDE_ROWS);
  if (n) console.log(`    · ${n} excluded row(s) left out of this figure`);
}

async function dismissTour() {
  const tip = page.locator(".react-joyride__tooltip");
  if (await tip.count()) {
    await page.locator('button:has-text("Skip")').first().click({ timeout: 4000 }).catch(() => {});
    await page.waitForTimeout(1200);
  }
}

/** Close any open panel, so a failed figure can't block the next one. */
async function dismissAnyPanel() {
  for (let i = 0; i < 3; i++) {
    const panel = page.locator("div.relative.transform.overflow-hidden.shadow-xl");
    if (!(await panel.count())) return;
    const cancel = page.locator('button:has-text("Cancel"), button:has-text("Back")').last();
    if (await cancel.count()) await cancel.click({ timeout: 5000 }).catch(() => {});
    await page.keyboard.press("Escape").catch(() => {});
    await page.waitForTimeout(900);
  }
}

async function shoot(dir, name, target, opts = {}) {
  const path = resolve(ROOT, `public/images/${dir}/${name}.png`);
  await page.waitForTimeout(opts.settle ?? 800);
  if (target) {
    await target.scrollIntoViewIfNeeded();
    await page.waitForTimeout(250);
    await target.screenshot({ path });
  } else {
    await page.screenshot({ path });
  }
  results.push({ section: dir, name, status: "ok" });
  console.log(`    ✓ ${name}.png`);
}

async function figure(dir, name, fn) {
  try {
    await fn();
  } catch (err) {
    // Keep the line that names the cause. Playwright puts "Timeout exceeded" on
    // line 1 and the actual reason ("intercepts pointer events", "not visible")
    // further down, so truncating to the first line throws the diagnosis away.
    const lines = err.message.split("\n").map((l) => l.trim()).filter(Boolean);
    const cause = lines.find((l) => /intercept|not visible|not stable|resolved to|waiting for/i.test(l));
    const reason = cause ? `${lines[0]}, ${cause}` : lines[0];
    results.push({ section: dir, name, status: "failed", reason });
    console.log(`    ✗ ${name}, ${reason}`);
  } finally {
    await dismissAnyPanel();
  }
}

// ── Sign in once, then walk the sections ──────────────────────────────────────
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

  try {
    // A panel left open from the previous section keeps its backdrop over the
    // sidebar, and the next nav click then times out looking un-clickable. Wait
    // for the drawer to be gone before navigating, not just ask it to close.
    for (let i = 0; i < 12; i++) {
      if (!(await page.locator("div.relative.transform.overflow-hidden.shadow-xl").count())) break;
      await dismissAnyPanel();
      await page.waitForTimeout(500);
    }

    // Inventory sections sit behind a collapsible sidebar group, and the group
    // collapses with max-height rather than display:none. So its children keep a
    // bounding box and isVisible() returns TRUE while they are collapsed, which
    // is why testing visibility never opened the group, and the click then timed
    // out on an element another button was sitting on top of.
    //
    // Ask the real question instead: is the child the topmost element at its own
    // centre? If not, toggle the group and check again.
    if (s.parent) {
      const reachable = () =>
        page.evaluate((name) => {
          const btn = [...document.querySelectorAll("button")].find(
            (b) => b.innerText.trim() === name
          );
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
    // Match the sidebar entry by its exact accessible name and retry: the click
    // fails when a previous panel's backdrop is still fading over the sidebar,
    // and the element itself is fine a second later. Retrying beats guessing
    // which leftover overlay it was.
    const navItem = page.locator(`button:has-text("${s.nav}"), a:has-text("${s.nav}")`).first();
    let navigated = false;
    for (let attempt = 1; attempt <= 3 && !navigated; attempt++) {
      try {
        await navItem.click({ timeout: 8000 });
        await page.waitForSelector(`[data-tour="${s.tour}-page"]`, { timeout: 20000 });
        navigated = true;
      } catch (err) {
        if (attempt === 3) throw err;
        await page.keyboard.press("Escape").catch(() => {});
        await dismissAnyPanel();
        await page.waitForTimeout(1500);
      }
    }
    await page.waitForTimeout(4000);
    await hideAccountChrome();
    await dismissTour();
    await hideAccountChrome();
  } catch (err) {
    const lines = err.message.split("\n").map((l) => l.trim()).filter(Boolean);
    const cause = lines.find((l) => /intercept|not visible|not stable|resolved to|waiting for/i.test(l));
    const reason = cause ? `${lines[0]}, ${cause}` : lines[0];
    results.push({ section: key, name: "(navigation)", status: "failed", reason });
    console.log(`    ✗ could not reach the section, ${reason}`);
    continue;
  }

  const listCard = page.locator(`[data-tour="${s.tour}-list"]`);

  await figure(key, "01-list", async () => {
    if (!(await listCard.count())) throw new Error("the list card isn't on the page (an empty list drops its data-tour)");
    await page.waitForTimeout(1500);
    await dropExcludedRows();
    await shoot(key, `01-${key}-list`, listCard, { settle: 300 });
  });

  if (s.filter === "popover") {
    await figure(key, "02-filter", async () => {
      const tour = s.filterTour || `${s.tour}-filters`;
      const trigger = page.locator(`[data-tour="${tour}"] button`).first();
      if (!(await trigger.count())) throw new Error(`no filter control at [data-tour="${tour}"]`);
      await trigger.click();
      await page.waitForTimeout(1200);
      // The popover hangs outside the card's box, so clip a region instead.
      const cardBox = await listCard.boundingBox();
      // This figure clips the top of the list too, so the same rows come out.
      await dropExcludedRows();
      const pop = page.locator(`[data-tour="${tour}"] > div`).last();
      const popBox = await pop.boundingBox().catch(() => null);
      if (!cardBox) throw new Error("could not measure the list card");
      await page.screenshot({
        path: resolve(ROOT, `public/images/${key}/02-${key}-filter.png`),
        clip: {
          x: cardBox.x,
          y: cardBox.y,
          width: cardBox.width,
          height: popBox
            ? Math.min(popBox.y + popBox.height - cardBox.y + 20, VIEWPORT.height - cardBox.y)
            : 520,
        },
      });
      results.push({ section: key, name: `02-${key}-filter`, status: "ok" });
      console.log(`    ✓ 02-${key}-filter.png`);
      await page.locator(`[data-tour="${s.tour}-page"]`).click({ position: { x: 5, y: 5 } }).catch(() => {});
      await page.waitForTimeout(700);
    });
  }

  await figure(key, "03-add-panel", async () => {
    await page.locator(`[data-tour="${s.tour}-add-btn"] button`).first().click();
    // Wait for the PANEL, not for its title. The title text is also the label of
    // the button that opens it in some sections, and in others it renders a beat
    // after the panel does, either way the drawer itself is the thing being
    // photographed, so that is what to wait for.
    const drawer = page.locator("div.relative.transform.overflow-hidden.shadow-xl").last();
    await drawer.waitFor({ state: "visible", timeout: 20000 });
    await page.waitForTimeout(1800);
    const heading = (await drawer.innerText().catch(() => "")).split("\n")[0].trim();
    if (s.panel && !heading.toLowerCase().includes(s.panel.toLowerCase())) {
      console.log(`      (heading is "${heading}", expected "${s.panel}", check the config)`);
    }
    await shoot(key, `03-add-${key.replace(/s$/, "")}-panel`, drawer);
  });
}

await browser.close();

console.log("\n, summary ,");
const ok = results.filter((r) => r.status === "ok").length;
for (const r of results) {
  console.log(`${r.status.padEnd(8)} ${r.section}/${r.name}${r.reason ? ` (${r.reason})` : ""}`);
}
console.log(`\n${ok} figure(s) captured, ${results.length - ok} failed`);
process.exit(results.some((r) => r.status === "failed") ? 1 : 0);
