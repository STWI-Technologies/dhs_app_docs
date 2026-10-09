/**
 * Knowledge base screenshots, one appointment and what came out of it.
 *
 * The Appointments article's whole argument is that a visit turns into an
 * estimate, a job or an invoice, and the Related Records tab is where that
 * trail lives. A figure of that tab is worthless if the appointment produced
 * nothing: it would be three empty sections teaching the opposite.
 *
 * So this script does not take "the first row". It opens appointments in turn,
 * reads the Related Records tab, and photographs the first one that actually
 * has records. If none do, it says so and exits without writing a figure,
 * rather than publishing an empty tab.
 *
 * The detail and its three-dot menu come from ONE named appointment instead,
 * KB_APPOINTMENT_ID, so the figures in the article are all the same visit.
 *
 * Two things are arranged before those shots, both recorded in docs/FIGURES.md:
 * the Visits card is waited out (it paints a skeleton for about twelve seconds
 * and an earlier figure published that skeleton), and the Chat panel gets two
 * injected bubbles, because the conversation on this record is empty and the
 * panel is a third of the figure.
 *
 * Run:
 *   set -a; . ~/dhs_qa_workspace/.env; set +a
 *   node scripts/kb-screenshots/appointment-detail.mjs
 *   KB_APPOINTMENT_ID=<id> node scripts/kb-screenshots/appointment-detail.mjs
 *   KB_APPOINTMENT="Annual inspection" node scripts/kb-screenshots/appointment-detail.mjs
 *
 * READ-ONLY. It opens and reads; nothing is created, converted or sent.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { injectChat as injectChatInto, injectClientPhone as injectPhoneInto, APPOINTMENT_CHAT } from "./injections.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const OUT_DIR = resolve(ROOT, "public/images/appointments");
const BASE = process.env.KB_BASE_URL || "https://app-staging.directhomeservice.com";
const VIEWPORT = { width: 1440, height: 900 };
const SCALE = 2;
const MAX_TRIED = Number(process.env.KB_MAX_TRIED || 12);

/** The appointment the detail figures come from. A visit with services on it. */
const SUBJECT_ID = process.env.KB_APPOINTMENT_ID || "6a6cf0f4b9ba8dd8c1205195";

const email = process.env.KB_EMAIL || process.env.STAGING_SP_LOGIN_EMAIL;
const password = process.env.KB_PASSWORD || process.env.STAGING_SP_LOGIN_PASSWORD;
if (!email || !password) {
  console.error("Missing STAGING_SP_LOGIN_EMAIL / STAGING_SP_LOGIN_PASSWORD (or KB_EMAIL / KB_PASSWORD).");
  process.exit(1);
}

mkdirSync(OUT_DIR, { recursive: true });
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

/**
 * Wait for the detail to stop being a skeleton.
 *
 * The Visits card renders placeholder bars for about twelve seconds after the
 * page paints, longer than any fixed wait we had, and a figure taken inside
 * that window published a card of grey rectangles. Pulsing placeholders carry
 * animate-pulse, so waiting for the last one to go is the reliable signal.
 */
async function waitForSkeletons() {
  // Zero placeholders can also mean "nothing has rendered yet", which is how an
  // earlier run sailed past this check and photographed an empty page. Wait for
  // the record's own furniture first.
  await page.locator('button:has-text("Related Records")').first().waitFor({ state: "visible", timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(1500);
  for (let i = 0; i < 30; i++) {
    const pulses = await page.locator('[class*="animate-pulse"]').count();
    if (!pulses) return true;
    await page.waitForTimeout(1000);
  }
  console.log("    ! placeholders were still on screen after 30s");
  return false;
}

/**
 * The chat and the phone come from injections.mjs so this appointment's client
 * shows the same number here as she does in the Estimates figures. See
 * docs/FIGURES.md for what is written and why.
 */
const injectChat = () => injectChatInto(page, APPOINTMENT_CHAT);
const injectClientPhone = () => injectPhoneInto(page);

/**
 * Open the visit row before the shot.
 *
 * The Visits card lists each visit collapsed, and collapsed it shows a date and
 * nothing else, which is not what the article is describing. Expanding it is
 * the app's own control: nothing is faked by clicking it.
 */
async function expandVisit() {
  const opened = await page.evaluate(() => {
    const card = [...document.querySelectorAll("div")].find(
      (d) => /^Visits/.test((d.innerText || "").trim()) && d.querySelector("button")
    );
    if (!card) return "no Visits card";
    // The row's expander is the chevron button at the end of the row, not the
    // Add Visit button in the header.
    const buttons = [...card.querySelectorAll("button")].filter(
      (b) => !/add visit/i.test(b.innerText || "")
    );
    const chevron = buttons.find((b) => b.querySelector("svg") && !(b.innerText || "").trim());
    const target = chevron || buttons[0];
    if (!target) return "no expander on the visit row";
    target.click();
    return "clicked";
  });
  console.log(`    visit row: ${opened}`);
  await page.waitForTimeout(2500);
  await waitForSkeletons();
}

async function gotoAppointments() {
  await page.locator('button:has-text("Appointments"), a:has-text("Appointments")').first().click();
  await page.waitForSelector('[data-tour="appointments-page"]', { timeout: 30000 });
  await page.waitForTimeout(3500);
  await hideAccountChrome();
  const tip = page.locator(".react-joyride__tooltip");
  if (await tip.count()) {
    await page.locator('button:has-text("Skip")').first().click({ timeout: 4000 }).catch(() => {});
    await page.waitForTimeout(1000);
  }
}

await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
await page.fill("#email", email);
await page.fill("#password", password);
await page.click('button:has-text("Sign In")');
await page.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 45000 });
await page.waitForTimeout(3500);
await hideAccountChrome();
await gotoAppointments();

// The Related Records scan is off by default. No appointment on this account
// has produced an estimate, job or invoice yet, so it walks ten records to
// conclude the same thing every time, and it is the slow, flaky half of this
// script. KB_SCAN=1 runs it again once a converted appointment exists.
const SCAN = process.env.KB_SCAN === "1";

const rows = page.locator('[data-tour="appointments-list"] table tbody tr');
await rows.first().waitFor({ state: "visible", timeout: 30000 });
const total = await rows.count();
console.log(`\n${total} appointment(s) on the first page, trying up to ${Math.min(total, MAX_TRIED)}`);

const wanted = process.env.KB_APPOINTMENT;
const tried = [];
let captured = false;

for (let i = 0; SCAN && i < Math.min(total, MAX_TRIED) && !captured; i++) {
  await gotoAppointments();
  const row = page.locator('[data-tour="appointments-list"] table tbody tr').nth(i);
  const label = (await row.innerText()).replace(/\s+/g, " ").trim().slice(0, 60);
  if (wanted && !label.includes(wanted)) continue;

  await row.locator("button").first().click();
  await page.waitForURL(/\/appointments\//, { timeout: 30000 });
  // Detail pages on staging need their data before the header and tabs paint.
  await page.waitForTimeout(9500);
  await hideAccountChrome();

  const tab = page.locator('button:has-text("Related Records"), [role=tab]:has-text("Related Records")').first();
  if (!(await tab.count())) {
    tried.push(`${label} , no Related Records tab`);
    continue;
  }
  await tab.click();
  await page.waitForTimeout(3500);

  // "Nothing came of this visit yet" reads as several empty sections. Anything
  // real shows up as a row with a record number or a name.
  const body = (await page.locator("main, body").first().innerText()).replace(/\s+/g, " ");
  // The empty states are singular ("No estimate created from this appointment
  // yet."), and an earlier plural match here reported an empty tab as full and
  // published a figure of three empty sections.
  const emptyMarkers = (body.match(/No (estimate|job|invoice) created from this appointment/gi) || []).length;
  const notYetCompleted = /enabled once this appointment is completed/i.test(body);
  const hasRecords = emptyMarkers < 3 && !notYetCompleted;

  tried.push(`${label} , ${hasRecords ? "HAS related records" : "empty"}`);

  if (hasRecords) {
    // Same injected conversation as the detail figure: this tab keeps the same
    // client sidebar, and one figure with a chat beside another without one on
    // the same record reads as a mistake.
    await injectChat();
    await injectClientPhone();
    await page.screenshot({ path: resolve(OUT_DIR, "04-related-records.png") });
    console.log(`    ✓ 04-related-records.png (${label})`);
    captured = true;
  }

}

// ── The detail figures, from one named appointment ────────────────────────────
//
// Not "whichever one the scan opened first": the article shows this record on
// several figures, so they all have to be the same visit, and it has to be one
// with a visit on it and services under it.
// Staging drops the connection often enough that one run published the app's
// "You're Offline" screen as the appointment figure. So: open, check we got the
// record and not that screen, and try again if we did not.
let opened = false;
for (let attempt = 1; attempt <= 4 && !opened; attempt++) {
  await page.goto(`${BASE}/appointments/${SUBJECT_ID}`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(4000);
  const body = await page.locator("body").innerText().catch(() => "");
  if (/You're Offline|Please check your internet connection/i.test(body)) {
    console.log(`    ! the app is showing its offline screen, retrying (${attempt}/4)`);
    await page.waitForTimeout(5000);
    continue;
  }
  await hideAccountChrome();
  await waitForSkeletons();
  await page.waitForTimeout(1200);
  opened = /Related Records/i.test(await page.locator("body").innerText().catch(() => ""));
  if (!opened) console.log(`    ! the record did not paint, retrying (${attempt}/4)`);
}
if (!opened) {
  console.error("\nCould not open the appointment, no figure written.");
  await browser.close();
  process.exit(1);
}

const overview = page.locator('button:has-text("Overview"), [role=tab]:has-text("Overview")').first();
if (await overview.count()) {
  await overview.click();
  await page.waitForTimeout(2000);
  await waitForSkeletons();
}
await hideAccountChrome();
await expandVisit();
await injectChat();
await injectClientPhone();
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(800);
await page.screenshot({ path: resolve(OUT_DIR, "03-appointment-detail.png") });
console.log(`    ✓ 03-appointment-detail.png (${SUBJECT_ID})`);

// The Visits card on its own, open, for the time-tracking section: a viewport
// shot of the top of the record cannot show the timesheet records under it.
// Matching "the div that says Visits" picked the card's HEADER, and published
// a 40px strip with the title and the Add Visit button and no table at all.
// Climb from the heading until the box is big enough to hold the rows under it.
const visitsBox = await page.evaluate(() => {
  const head = [...document.querySelectorAll("h1,h2,h3,h4,div,span,p")].find(
    (e) => e.children.length === 0 && /^Visits$/.test((e.textContent || "").trim())
  );
  if (!head) return null;
  let el = head;
  while (el && el.parentElement) {
    const r = el.getBoundingClientRect();
    if (r.width > 600 && r.height > 240 && /Timesheet records|Work Time/i.test(el.innerText || "")) break;
    el = el.parentElement;
  }
  if (!el) return null;
  el.scrollIntoView({ block: "center" });
  return true;
});
if (visitsBox) {
  await page.waitForTimeout(900);
  const clip = await page.evaluate(() => {
    const head = [...document.querySelectorAll("h1,h2,h3,h4,div,span,p")].find(
      (e) => e.children.length === 0 && /^Visits$/.test((e.textContent || "").trim())
    );
    let el = head;
    while (el && el.parentElement) {
      const r = el.getBoundingClientRect();
      if (r.width > 600 && r.height > 240 && /Timesheet records|Work Time/i.test(el.innerText || "")) break;
      el = el.parentElement;
    }
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const top = Math.max(0, r.y - 4);
    return { x: Math.max(0, r.x - 4), y: top, width: r.width + 8, height: Math.min(r.height + 8, window.innerHeight - top - 4) };
  });
  if (clip) {
    await page.screenshot({ path: resolve(OUT_DIR, "06-visit-timesheets.png"), clip });
    console.log(`    ✓ 06-visit-timesheets.png (${SUBJECT_ID})`);
  } else {
    console.log("    ! could not measure the Visits card");
  }
} else {
  console.log("    ! could not find the Visits card to crop");
}
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(600);

// Reschedule, Send to Client, Cancel and Delete all live in the three-dot menu.
// One figure of it open covers the lot; a figure per item would be four
// pictures of the same dropdown.
const dots = page
  .locator('button[aria-haspopup], button:has(svg.tabler-icon-dots-vertical), button[aria-label*="More"]')
  .first();
if (await dots.count()) {
  await dots.click({ timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(1500);
  await page.screenshot({ path: resolve(OUT_DIR, "05-appointment-more-actions.png") });
  console.log(`    ✓ 05-appointment-more-actions.png (${SUBJECT_ID})`);
  await page.keyboard.press("Escape").catch(() => {});
} else {
  console.log("    ! no three-dot menu found on the appointment header");
}

console.log("\n, what was tried ,");
for (const t of tried) console.log(`  ${t}`);

await browser.close();

if (SCAN && !captured) {
  console.log(
    "\nNo appointment on the first page has produced an estimate, job or invoice yet,\n" +
    "so the Related Records figure would be three empty sections. Create one from an\n" +
    "appointment and run this again, or point it at a record with KB_APPOINTMENT."
  );
  process.exit(1);
}
