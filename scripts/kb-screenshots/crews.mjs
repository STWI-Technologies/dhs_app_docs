/**
 * Knowledge base screenshots — Crews section.
 *
 * Captures the figures used by public/content/crews-management.html, so the
 * article can be refreshed by re-running this file instead of re-exporting a
 * Google Doc. When the UI changes, run it again and the images are replaced.
 *
 * Run:
 *   set -a; . ~/dhs_qa_workspace/.env; set +a
 *   node scripts/kb-screenshots/crews.mjs
 *
 * Shoots against STAGING, whose account carries realistic data (named crews with
 * descriptions, colours and 4-5 members). Credentials come from
 * STAGING_SP_LOGIN_EMAIL / STAGING_SP_LOGIN_PASSWORD and are never written to
 * disk or logged.
 *
 * Every interaction is read-only: forms are filled to photograph them and then
 * cancelled, so no crew is created, modified or deleted.
 *
 * Two figures are deliberately absent because the staging account cannot produce
 * them: the delete confirmation dialog (all 26 crews are assigned to work, so the
 * trash icon is disabled on every row) and the Quick Add "Complete Info" marker
 * (no crew there has isQuickAdd set). Both behaviours are covered in prose.
 *
 * ONE FIGURE COMES FROM DEVELOP, NOT STAGING. Staging still ships the old single
 * "No crews found matching your keyword" line; the three separate empty states
 * (SP-UI-705) are only on develop — verified by the locale keys emptyStateNoMatching
 * and noCrewsAddedYet being absent from the staging bundle. An empty state contains
 * no account data, so develop's ugly test crews cannot leak into it:
 *
 *   KB_ONLY="Empty search state" \
 *   KB_BASE_URL=https://app-develop.directhomeservice.com \
 *   KB_EMAIL="$TEST_SP_LOGIN_EMAIL" KB_PASSWORD="$TEST_SP_LOGIN_PASSWORD" \
 *   node scripts/kb-screenshots/crews.mjs
 *
 * Re-shoot it on staging once SP-UI-705 lands there, and drop this note.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const OUT_DIR = resolve(ROOT, "public/images/crews");
const BASE = process.env.KB_BASE_URL || "https://app-staging.directhomeservice.com";

// A crew with enough members that the avatar stack overflows into a "+N" badge.
const SUBJECT_CREW = process.env.KB_CREW || "Emergency Repair Team";

// 2x so the figures stay sharp on the displays the help centre is read on.
const VIEWPORT = { width: 1440, height: 900 };
const SCALE = 2;

const results = [];
mkdirSync(OUT_DIR, { recursive: true });

const email = process.env.KB_EMAIL || process.env.STAGING_SP_LOGIN_EMAIL;
const password = process.env.KB_PASSWORD || process.env.STAGING_SP_LOGIN_PASSWORD;
if (!email || !password) {
  console.error("Missing STAGING_SP_LOGIN_EMAIL / STAGING_SP_LOGIN_PASSWORD (or KB_EMAIL / KB_PASSWORD) in the environment.");
  process.exit(1);
}

/**
 * Comma-separated step labels to run, for re-shooting one figure without
 * touching the rest. Used for the empty-state figure, which has to come from a
 * different environment (see the note at the top of this file).
 */
const ONLY = process.env.KB_ONLY ? process.env.KB_ONLY.split(",").map((s) => s.trim()) : null;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: VIEWPORT, deviceScaleFactor: SCALE });

/** Photograph a locator, or the whole viewport when target is null. */
async function shoot(name, target, opts = {}) {
  const path = resolve(OUT_DIR, `${name}.png`);
  await page.waitForTimeout(opts.settle ?? 600);
  if (target) {
    await target.scrollIntoViewIfNeeded();
    await page.waitForTimeout(250);
    await target.screenshot({ path });
  } else {
    await page.screenshot({ path });
  }
  results.push({ name, status: "ok" });
  console.log(`  ✓ ${name}.png`);
}

/**
 * The onboarding wizard docks itself over the page content for accounts that
 * haven't finished setup. It belongs to no section, so it is hidden rather than
 * photographed into every figure.
 */
async function hideAccountChrome() {
  await page.evaluate(() => {
    // The onboarding wizard docks itself over the page for accounts that haven't
    // finished setup, and the support-chat launcher floats over the bottom-right
    // corner — on a tall list it lands on top of the pagination. Neither belongs
    // to the section being documented. Matched on computed style rather than
    // class names, which are generated.
    document.querySelectorAll(".onboarding-widget").forEach((el) => {
      el.style.display = "none";
    });
    for (const el of document.querySelectorAll("body *")) {
      if (getComputedStyle(el).position !== "fixed") continue;
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height || r.width > 160) continue;
      if (r.right > window.innerWidth - 140 && r.bottom > window.innerHeight - 160) {
        el.style.display = "none";
      }
    }
  });
}

/** One figure, or one group of them. A failure is recorded, never fatal. */
async function step(label, fn) {
  if (ONLY && !ONLY.includes(label)) return;
  console.log(label);
  try {
    await fn();
  } catch (err) {
    const reason = err.message.split("\n")[0];
    results.push({ name: label, status: "failed", reason });
    console.log(`  ✗ ${reason}`);
  } finally {
    // A step that dies mid-panel would otherwise leave it open and every
    // later step would time out clicking through it.
    await dismissAnyPanel();
  }
}

/** Close whatever panel is open, whether this step opened it or not. */
async function dismissAnyPanel() {
  for (let i = 0; i < 3; i++) {
    const panel = page.locator("div.relative.transform.overflow-hidden.shadow-xl");
    if (!(await panel.count())) return;
    const cancel = page.locator('button:has-text("Cancel")').last();
    if (await cancel.count()) {
      await cancel.click({ timeout: 5000 }).catch(() => {});
    } else {
      await page.keyboard.press("Escape").catch(() => {});
    }
    await page.waitForTimeout(1000);
  }
}

async function closePanel() {
  await page.locator('button:has-text("Cancel")').last().click();
  await page.waitForTimeout(1200);
}


/**
 * SYNTHETIC RATINGS — for the list figure only.
 *
 * No crew on staging has customer feedback, so the Rating column is a column of
 * em dashes and the figure teaches nothing about it. Seeding real ratings is not
 * an option: feedback is created by clients against a completed job, the SP API
 * exposes no feedback mutation at all, and the platform is read-only during the
 * migration.
 *
 * So the stars are injected into the cells right before the shot. The MARKUP IS
 * THE APP'S OWN — the @tabler/icons-react v3.41.1 star-filled path, at the 18px
 * size and with the text-yellow-400 class and opacity steps that
 * pages/Crews/tableColumns.tsx uses — so what is photographed is the real
 * component's appearance. Only the numbers behind it are made up.
 *
 * Stars only, no numeric average: the number beside the stars is a known defect.
 *
 * Nothing is written anywhere; a reload clears it.
 */
const STAR_PATH =
  "M8.243 7.34l-6.38 .925l-.113 .023a1 1 0 0 0 -.44 1.684l4.622 4.499l-1.09 6.355l-.013 .11a1 1 0 0 0 1.464 .944l5.706 -3l5.693 3l.1 .046a1 1 0 0 0 1.352 -1.1l-1.091 -6.355l4.624 -4.5l.078 -.085a1 1 0 0 0 -.633 -1.62l-6.38 -.926l-2.852 -5.78a1 1 0 0 0 -1.794 0l-2.853 5.78z";

// A plausible spread rather than a column of fives.
const SAMPLE_RATINGS = [4.5, 5, 4, 4.5, 5, 3.5, 4.5, 5, 4, 4.5];

async function paintSampleRatings() {
  const painted = await page.evaluate(
    ({ starPath, ratings }) => {
      const star = (opacity) =>
        `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none" class="tabler-icon tabler-icon-star-filled text-yellow-400${opacity ? ` ${opacity}` : ""}"><path d="${starPath}"></path></svg>`;

      // Mirrors renderStars() in pages/Crews/tableColumns.tsx.
      const stars = (rating) => {
        const out = [];
        const full = Math.floor(rating);
        for (let i = 0; i < full; i++) out.push(star(null));
        if (rating % 1 >= 0.5 && full < 5) out.push(star("opacity-50"));
        for (let i = 0; i < 5 - Math.ceil(rating); i++) out.push(star("opacity-20"));
        return out.join("");
      };

      const rows = [...document.querySelectorAll('[data-tour="crews-list"] table tbody tr')];
      let n = 0;
      rows.forEach((row, i) => {
        const cell = row.querySelectorAll("td")[2];
        if (!cell) return;
        const rating = ratings[i % ratings.length];
        cell.innerHTML = `<div class="flex items-center gap-2"><div class="flex items-center gap-1">${stars(rating)}</div></div>`;
        n++;
      });
      return n;
    },
    { starPath: STAR_PATH, ratings: SAMPLE_RATINGS }
  );
  console.log(`    (sample ratings painted into ${painted} rows — see the note in this file)`);
}

// ── Sign in ───────────────────────────────────────────────────────────────────
await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
await page.fill("#email", email);
await page.fill("#password", password);
await page.click('button:has-text("Sign In")');
await page.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 45000 });
await page.waitForTimeout(3500);
await hideAccountChrome();

// ── Crews list ────────────────────────────────────────────────────────────────
await page.click('button:has-text("Crews")');
await page.waitForSelector('[data-tour="crews-list"]', { timeout: 30000 });
await page.waitForTimeout(4000);
await hideAccountChrome();

const listCard = page.locator('[data-tour="crews-list"]');
const searchBox = page.locator('[data-tour="crews-search"] input');
// The Headless UI dialog ROOT has no height of its own (1440x0), so it can never
// be photographed. The DialogPanel underneath it is the 600px drawer. .last()
// picks the topmost panel when Quick Add stacks a second one.
const drawer = page.locator("div.relative.transform.overflow-hidden.shadow-xl").last();

// The Quick Tour starts by itself the first time an account opens the page.
await step("Quick Tour", async () => {
  const tooltip = page.locator(".react-joyride__tooltip");
  if (!(await tooltip.count())) {
    results.push({ name: "11-quick-tour", status: "skipped", reason: "tour already completed for this account" });
    console.log("  – already completed for this account");
    return;
  }
  await shoot("11-quick-tour", null);
  await page.locator('button:has-text("Skip")').first().click({ timeout: 3000 });
  await page.waitForTimeout(1200);
});

await step("List view", async () => {
  await paintSampleRatings();
  await shoot("01-crews-list", listCard, { settle: 1200 });
});

await step("Members +N popover", async () => {
  await searchBox.fill(SUBJECT_CREW);
  await page.waitForTimeout(3000);
  const badge = page
    .locator('[data-tour="crews-list"] table tbody tr')
    .filter({ hasText: SUBJECT_CREW })
    .locator("div.bg-ds-bg-subtle")
    .first();
  if (!(await badge.count())) throw new Error(`"${SUBJECT_CREW}" shows no +N badge`);
  await badge.hover();
  await page.waitForTimeout(1000);
  // The popover is painted BELOW the row, outside the card's own box, so a
  // card-clipped screenshot cuts it in half. Clip a region instead: the card's
  // width, from just above the column headers down past the popover.
  // Anchor on the table so the clip starts cleanly at the column headers,
  // then extend past the row far enough to take in the popover.
  const cardBox = await listCard.boundingBox();
  const tableBox = await listCard.locator("table").boundingBox();
  const rowBox = await page
    .locator('[data-tour="crews-list"] table tbody tr')
    .filter({ hasText: SUBJECT_CREW })
    .first()
    .boundingBox();
  if (!cardBox || !tableBox || !rowBox) throw new Error("could not measure the card, table or row");
  await page.screenshot({
    path: resolve(OUT_DIR, "02-members-popover.png"),
    clip: {
      x: cardBox.x,
      y: tableBox.y,
      width: cardBox.width,
      height: rowBox.y + rowBox.height - tableBox.y + 150,
    },
  });
  results.push({ name: "02-members-popover", status: "ok" });
  console.log("  ✓ 02-members-popover.png (clipped past the card edge)");
});

// ── Edit Crew panel ───────────────────────────────────────────────────────────
// Runs while the list is still filtered to the subject crew, so the first row
// is the one we want.
await step("Edit Crew panel", async () => {
  await page.locator('[data-tour="crews-list"] table tbody tr').first()
    .locator("button").first().click();
  await page.waitForSelector("text=Edit Crew", { timeout: 15000 });
  await page.waitForTimeout(2000);
  await shoot("06-edit-crew-panel", drawer);

  const availability = drawer.locator('div:has(> div > h3:text-is("Availability"))').last();
  await shoot("07-availability", (await availability.count()) ? availability : drawer);
  await closePanel();
});

await step("Empty search state", async () => {
  await searchBox.fill("zzzz");
  await page.waitForTimeout(3500);
  const emptyCard = page
    .locator("text=No matching crews")
    .locator('xpath=ancestor::div[contains(@class,"rounded-[10px]")][1]');
  await shoot("10-no-search-results", (await emptyCard.count()) ? emptyCard.first() : null);
  await searchBox.fill("");
  await page.waitForTimeout(2500);
});

// ── Add New Crew panel ────────────────────────────────────────────────────────
await step("Add New Crew panel", async () => {
  await page.locator('[data-tour="crews-add-btn"] button').click();
  await page.waitForSelector("text=Add New Crew", { timeout: 15000 });
  await page.waitForTimeout(1500);
  await shoot("03-add-crew-panel", drawer);

  await page.locator('[role="button"][aria-label="Add Crew Member"]').click();
  await page.waitForTimeout(1200);
  await shoot("04-member-picker", drawer);

  // Three members, so the table shows the Crew Lead radios and the remove action.
  const options = page.locator('[role="option"], li[class*="cursor-pointer"]');
  const take = Math.min(3, await options.count());
  for (let i = 0; i < take; i++) {
    await options.nth(i).click();
    await page.waitForTimeout(350);
  }
  // NOT Escape: Headless UI reads it as "close the dialog" and the whole drawer
  // goes away. Clicking the panel heading dismisses just the dropdown.
  await drawer.locator("h2").first().click();
  await page.waitForTimeout(900);
  await page.locator('input[placeholder="Crew Name"]').fill("Install Team A");
  await page.waitForTimeout(600);
  const memberRows = await drawer.locator("table tbody tr").count();
  if (memberRows === 0) throw new Error("member picker selected nothing — options selector is wrong");
  console.log(`    (${memberRows} members in the table)`);
  await shoot("05-members-table", drawer);
  await closePanel();
});

// ── Quick Add ─────────────────────────────────────────────────────────────────
await step("Quick Add: New Crew", async () => {
  await page.locator('button:has-text("Quick Add")').first().click();
  await page.waitForTimeout(1500);
  await page.locator('text="Crew"').last().click();
  await page.waitForSelector("text=Quick Add: New Crew", { timeout: 15000 });
  await page.waitForTimeout(1800);
  await shoot("09-quick-add-crew", drawer);
});

// ── The Users filter on the crews list ───────────────────────────────────────
// The "Searching and filtering" section described the filter without showing
// it. Found by scripts/kb-figure-coverage.mjs rather than by someone reading
// the published article.
await step("Users filter", async () => {
  await page.locator('[data-tour="crews-users-filter"]').click();
  await page.waitForTimeout(1200);
  // The dropdown opens below the card header, outside the card's own box.
  const cardBox = await listCard.boundingBox();
  if (!cardBox) throw new Error("could not measure the list card");
  await page.screenshot({
    path: resolve(OUT_DIR, "12-users-filter.png"),
    clip: { x: cardBox.x, y: cardBox.y, width: cardBox.width, height: Math.min(560, VIEWPORT.height - cardBox.y) },
  });
  results.push({ name: "12-users-filter", status: "ok" });
  console.log("  ✓ 12-users-filter.png");
});

await browser.close();

console.log("\n— summary —");
for (const r of results) {
  console.log(`${r.status.padEnd(8)} ${r.name}${r.reason ? ` (${r.reason})` : ""}`);
}
process.exit(results.some((r) => r.status === "failed") ? 1 : 0);
