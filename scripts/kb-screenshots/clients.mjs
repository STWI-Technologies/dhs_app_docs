/**
 * Knowledge base screenshots, Clients section.
 *
 * Captures the figures used by public/content/clients-management.html. Same
 * shape as crews.mjs; read that file first for the selector traps this pattern
 * has already run into.
 *
 * Run:
 *   set -a; . ~/dhs_qa_workspace/.env; set +a
 *   node scripts/kb-screenshots/clients.mjs
 *
 * Shoots against STAGING. Credentials come from STAGING_SP_LOGIN_EMAIL /
 * STAGING_SP_LOGIN_PASSWORD and are never written to disk or logged.
 *
 * READ-ONLY, and it has to stay that way: the platform is mid-migration and
 * create operations are not available. The Add Client panel is filled in only to
 * photograph it and is always cancelled, never submitted. The email typed in is
 * deliberately one that cannot match a real client, so the panel doesn't swap
 * itself for the existing-client flow.
 *
 * KB_ONLY="List view,Filters panel" re-shoots just those steps.
 *
 * KB_EXCLUDE is a comma-separated list of rows to leave out of the list
 * figures, see dropRows(). Staging is shared, and not every record on it is
 * fit to publish.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const OUT_DIR = resolve(ROOT, "public/images/clients");
const BASE = process.env.KB_BASE_URL || "https://app-staging.directhomeservice.com";

const VIEWPORT = { width: 1440, height: 900 };
const SCALE = 2;

// An email that already belongs to a DHS client, so the Add Client form shows the
// existing-client / send-invite panel. Override with KB_EXISTING_EMAIL.
const EXISTING_CLIENT_EMAIL = process.env.KB_EXISTING_EMAIL || "annelee90@example.com";

/**
 * The client whose record is photographed. Named on purpose rather than "whatever
 * is first in the list", the figure carries this person's name, address and
 * phone into the published help centre, so it is a choice, not an accident.
 *
 * Prefer a subject whose row actions are ENABLED: a client who has signed into
 * their portal owns their own details, which greys out Edit and Delete and makes
 * the figure look broken to a reader who doesn't know why.
 */
const SUBJECT_CLIENT = process.env.KB_CLIENT || "Anna Clark";

const results = [];
mkdirSync(OUT_DIR, { recursive: true });

const email = process.env.KB_EMAIL || process.env.STAGING_SP_LOGIN_EMAIL;
const password = process.env.KB_PASSWORD || process.env.STAGING_SP_LOGIN_PASSWORD;
if (!email || !password) {
  console.error("Missing STAGING_SP_LOGIN_EMAIL / STAGING_SP_LOGIN_PASSWORD (or KB_EMAIL / KB_PASSWORD).");
  process.exit(1);
}

const ONLY = process.env.KB_ONLY ? process.env.KB_ONLY.split(",").map((s) => s.trim()) : null;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: VIEWPORT, deviceScaleFactor: SCALE });

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

async function hideAccountChrome() {
  await page.evaluate(() => {
    // The onboarding wizard docks itself over the page for accounts that haven't
    // finished setup, and the support-chat launcher floats over the bottom-right
    // corner, on a tall list it lands on top of the pagination. Neither belongs
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

/**
 * Drop rows from the list before photographing it.
 *
 * Staging is a shared account and anyone can add records to it. A row whose
 * name or email is somebody's real test data, or an internal staff address ,
 * does not belong in a published help centre, and we cannot delete it (the
 * platform is mid-migration and this script is read-only besides). So the row
 * is removed from the DOM for the duration of the screenshot only. Nothing is
 * changed in the app.
 */
async function dropRows(labels) {
  const dropped = await page.evaluate((labels) => {
    let n = 0;
    for (const tr of document.querySelectorAll("table tbody tr")) {
      if (labels.some((l) => tr.textContent.includes(l))) { tr.remove(); n++; }
    }
    return n;
  }, labels);
  if (dropped !== labels.length) {
    console.log(`  ! dropRows matched ${dropped} of ${labels.length} (${labels.join(", ")})`);
  }
}

/**
 * Collapse the sidebar, and leave it collapsed.
 *
 * List figures show the whole window, chrome included, so a reader can see
 * where in the app they are. Expanded, the sidebar eats a fifth of the width;
 * collapsed, you still get the icons and the section you are in, and the table
 * keeps its room. Idempotent: once collapsed the control reads "Expand
 * sidebar" and there is nothing to find.
 */
async function collapseSidebar() {
  await page.evaluate(() => {
    const b = [...document.querySelectorAll("button,[role=button]")].find(
      (x) => x.getAttribute("aria-label") === "Collapse sidebar"
    );
    if (b) b.click();
  });
  await page.waitForTimeout(900);
}

/** Rows kept out of the published figures. See dropRows above. */
const EXCLUDE_ROWS = (process.env.KB_EXCLUDE || "Lulu Lemon").split(",").map((s) => s.trim()).filter(Boolean);

/** Close whatever panel is open, so a failed step can't block the next one. */
async function dismissAnyPanel() {
  for (let i = 0; i < 3; i++) {
    const panel = page.locator("div.relative.transform.overflow-hidden.shadow-xl");
    if (!(await panel.count())) return;
    const cancel = page.locator('button:has-text("Cancel"), button:has-text("Back")').last();
    if (await cancel.count()) {
      await cancel.click({ timeout: 5000 }).catch(() => {});
    } else {
      await page.keyboard.press("Escape").catch(() => {});
    }
    await page.waitForTimeout(900);
  }
}

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
    await dismissAnyPanel();
  }
}

/**
 * Back to the Clients list on the Connected tab, from wherever a step ended up.
 *
 * Waits on the PAGE wrapper, not on [data-tour="clients-list"]: DataGrid takes an
 * early return for an empty list that never spreads cardWrapperAttrs, so that
 * attribute vanishes on a tab with no rows (Invites, on staging) and waiting for
 * it hangs for the full timeout and takes the following steps down with it.
 */
async function backToClientsList() {
  const onList = /\/clients(\?|$)/.test(page.url());
  if (!onList) {
    await page.click('button:has-text("Clients"), a:has-text("Clients")');
  }
  await page.waitForSelector('[data-tour="clients-page"]', { timeout: 30000 });
  await page.waitForTimeout(1500);
  const connected = page
    .locator('[data-tour="clients-status-tabs"] button')
    .filter({ hasText: "Connected" })
    .first();
  if (await connected.count()) {
    await connected.click().catch(() => {});
    await page.waitForTimeout(3000);
  }
  await page.waitForSelector('[data-tour="clients-list"]', { timeout: 30000 });
  // Clear any search a previous step left behind, so the next one doesn't
  // inherit a filtered list.
  if (await searchBox.count()) {
    const current = await searchBox.inputValue().catch(() => "");
    if (current) {
      await searchBox.fill("");
      await page.waitForTimeout(2500);
    }
  }
  await page.waitForTimeout(1200);
  await hideAccountChrome();
}

// ── Sign in ───────────────────────────────────────────────────────────────────
await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
await page.fill("#email", email);
await page.fill("#password", password);
await page.click('button:has-text("Sign In")');
await page.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 45000 });
await page.waitForTimeout(3500);
await hideAccountChrome();

await page.click('button:has-text("Clients")');
await page.waitForSelector('[data-tour="clients-list"]', { timeout: 30000 });
await page.waitForTimeout(4500);
await hideAccountChrome();

// A tour may start by itself on a first visit; get it out of the way.
const tourTooltip = page.locator(".react-joyride__tooltip");
if (await tourTooltip.count()) {
  await page.locator('button:has-text("Skip")').first().click({ timeout: 4000 }).catch(() => {});
  await page.waitForTimeout(1200);
}

const listCard = page.locator('[data-tour="clients-list"]');
const searchBox = page.locator('[data-tour="clients-search"] input');
const drawer = page.locator("div.relative.transform.overflow-hidden.shadow-xl").last();

await step("List view", async () => {
  await page.waitForTimeout(1500);
  await collapseSidebar();
  await dropRows(EXCLUDE_ROWS);
  // The whole window, not a crop of the card: the top bar and the collapsed
  // sidebar are how the reader knows where they are.
  await shoot("01-clients-list", null, { settle: 300 });
});

await step("Filters panel", async () => {
  await page.locator('[data-tour="clients-filters"] button').first().click();
  await page.waitForTimeout(1200);
  // This figure shows the top of the list too, so the same rows come out.
  await dropRows(EXCLUDE_ROWS);
  await page.waitForTimeout(300);
  await page.screenshot({ path: resolve(OUT_DIR, "02-filters-popover.png") });

  results.push({ name: "02-filters-popover", status: "ok" });
  console.log("  ✓ 02-filters-popover.png");
  await page.keyboard.press("Escape").catch(() => {});
  await page.locator('[data-tour="clients-page"]').click({ position: { x: 5, y: 5 } }).catch(() => {});
  await page.waitForTimeout(800);
});

// ── Add Client panel ──────────────────────────────────────────────────────────
await step("Add Client panel", async () => {
  await page.locator('[data-tour="clients-add-btn"] button').click();
  await page.waitForSelector("text=Add New Client", { timeout: 15000 });
  await page.waitForTimeout(1500);
  await shoot("03-add-client-step1", drawer);

  // Step 2 needs step 1 to validate. The email is deliberately unique so the
  // existing-client panel can't take over the step.
  const stamp = Date.now();
  await page.fill('input[name="firstName"]', "Dana");
  await page.fill('input[name="lastName"]', "Whitfield");
  await page.fill('input[placeholder="Phone number"]', "9073353331").catch(() => {});
  await page.fill('input[name="email"]', `kb-doc-${stamp}@example.invalid`);
  await page.fill('input[name="companyName"]', "Whitfield Property Group").catch(() => {});
  await page.waitForTimeout(600);

  await page.locator('button:has-text("Next Step")').first().click();
  await page.waitForTimeout(2500);
  await shoot("04-add-client-step2", drawer, { settle: 1200 });

  await page.locator('button:has-text("Cancel")').last().click();
  await page.waitForTimeout(1500);
});

// ── A client with a pending invite ────────────────────────────────────────────
await step("Pending invite panel", async () => {
  await backToClientsList();
  await page.locator('[data-tour="clients-status-tabs"] button')
    .filter({ hasText: "Invites" })
    .first()
    .click();
  await page.waitForTimeout(3500);
  const rows = page.locator('[data-tour="clients-list"] table tbody tr');
  if (!(await rows.count())) throw new Error("staging has no client invites to photograph");
  await shoot("05a-invites-tab", listCard, { settle: 1200 });
  await rows.first().click();
  await page.waitForTimeout(2000);
  await shoot("05-client-pending-panel", drawer);
});

// ── The existing-client / send-invite panel ───────────────────────────────────
// Typing an email that already belongs to a DHS client swaps the step for this
// panel. The lookup fires on BLUR of the email field, so the field has to be
// left before the panel appears.
//
// "Send invite" is NEVER clicked: it would send a real invitation to a real
// person. The panel is only photographed, then the form is cancelled.
await step("Existing client invite", async () => {
  await backToClientsList();
  await page.locator('[data-tour="clients-add-btn"] button').click();
  await page.waitForSelector("text=Add New Client", { timeout: 15000 });
  await page.waitForTimeout(1200);

  await page.fill('input[name="firstName"]', "Shawn");
  await page.fill('input[name="lastName"]', "Green");
  await page.fill('input[name="email"]', EXISTING_CLIENT_EMAIL);
  // Blur to fire the lookup.
  await page.locator('input[name="lastName"]').click();
  await page.waitForSelector("text=This client already has an account", { timeout: 20000 });
  await page.waitForTimeout(1500);
  await shoot("05-send-invite-panel", drawer);
});

// ── The client record ─────────────────────────────────────────────────────────
await step("Client record", async () => {
  await backToClientsList();
  // Back to Connected before opening a client.
  await page.locator('[data-tour="clients-status-tabs"] button')
    .filter({ hasText: "Connected" })
    .first()
    .click()
    .catch(() => {});
  await page.waitForTimeout(3000);

  // Find the named subject rather than taking the first row.
  await searchBox.fill(SUBJECT_CLIENT);
  await page.waitForTimeout(3500);
  const subjectRow = page
    .locator('[data-tour="clients-list"] table tbody tr')
    .filter({ hasText: SUBJECT_CLIENT })
    .first();
  if (!(await subjectRow.count())) {
    throw new Error(`no client matching "${SUBJECT_CLIENT}", set KB_CLIENT to one that exists`);
  }
  await subjectRow.click();
  await page.waitForURL(/\/clients\/[^/]+$/, { timeout: 20000 });
  await page.waitForTimeout(4500);
  await hideAccountChrome();
  await shoot("06-client-detail", null, { settle: 1500 });

  // Properties is the default tab; capture it on its own for the properties chapter.
  const propertiesPanel = page.locator('div:has(> div > h3:text-is("Properties"))').last();
  await shoot("07-properties-tab", (await propertiesPanel.count()) ? propertiesPanel : null);
});

// ── CSV import ────────────────────────────────────────────────────────────────
await step("CSV import", async () => {
  await backToClientsList();
  const importBtn = page.locator('button:has-text("Import CSV")').first();
  if (!(await importBtn.count())) throw new Error("Import CSV is hidden for this account");
  await importBtn.click();
  await page.waitForTimeout(4000);
  await hideAccountChrome();
  await shoot("08-import-csv", null, { settle: 1200 });
});

// ── Row-level figures: edit, archive, attachments, Quick Add ──────────────────
// These were missing, and their absence was the real defect: the sections that
// tell a reader how to change or retire a client had no picture at all. The
// coverage report (scripts/kb-figure-coverage.mjs) is what surfaces gaps like
// this now, instead of someone finding them by reading the published article.
//
// READ-ONLY: the edit panel is cancelled, and the archive dialog is
// photographed and then DISMISSED. No client is edited or archived.
await step("Editing a client", async () => {
  await backToClientsList();
  await searchBox.fill(SUBJECT_CLIENT);
  await page.waitForTimeout(3500);
  await page.locator('[data-tour="clients-list"] table tbody tr').first().click();
  await page.waitForURL(/\/clients\/[^/]+$/, { timeout: 20000 });
  await page.waitForTimeout(4000);
  await hideAccountChrome();
  // The pencil sits in the header of the Client Contact Information card. Scope
  // to that card rather than guessing at an icon class, the previous attempt
  // took "the last button with an svg on the page", which is not a selector.
  const contactCard = page
    .locator('div:has(> div > h3), div:has(> h3)')
    .filter({ hasText: "Client Contact Information" })
    .last();
  const pencil = contactCard.locator("button").first();
  if (!(await pencil.count())) throw new Error("no button in the Client Contact Information card");
  await pencil.click();
  const panel = page.locator("div.relative.transform.overflow-hidden.shadow-xl").last();
  await panel.waitFor({ state: "visible", timeout: 15000 });
  await page.waitForTimeout(1800);
  await shoot("09-edit-client-panel", panel);
});

await step("Archive confirmation", async () => {
  await backToClientsList();
  const menu = page
    .locator('[data-tour="clients-list"] table tbody tr')
    .first()
    .locator("button")
    .last();
  await menu.click();
  await page.waitForTimeout(1200);
  await page.locator('text="Archive"').last().click();
  const dialog = page.locator("div.relative.transform.overflow-hidden.shadow-xl").last();
  await dialog.waitFor({ state: "visible", timeout: 15000 });
  await page.waitForTimeout(1400);
  await shoot("10-archive-confirmation", null);
});

await step("Attachments panel", async () => {
  await backToClientsList();
  const menu = page
    .locator('[data-tour="clients-list"] table tbody tr')
    .first()
    .locator("button")
    .last();
  await menu.click();
  await page.waitForTimeout(1200);
  await page.locator('text="Attachments"').last().click();
  const panel = page.locator("div.relative.transform.overflow-hidden.shadow-xl").last();
  await panel.waitFor({ state: "visible", timeout: 15000 });
  await page.waitForTimeout(1800);
  await shoot("11-attachments-panel", panel);
});

await step("Quick Add: New Client", async () => {
  await backToClientsList();
  await page.locator('button:has-text("Quick Add")').first().click();
  await page.waitForTimeout(1400);
  await page.locator('text="Client"').last().click();
  const panel = page.locator("div.relative.transform.overflow-hidden.shadow-xl").last();
  await panel.waitFor({ state: "visible", timeout: 15000 });
  await page.waitForTimeout(1800);
  await shoot("12-quick-add-client", panel);
});

await browser.close();

console.log("\n, summary ,");
for (const r of results) {
  console.log(`${r.status.padEnd(8)} ${r.name}${r.reason ? ` (${r.reason})` : ""}`);
}
process.exit(results.some((r) => r.status === "failed") ? 1 : 0);
