/**
 * Knowledge base figures for the Scheduler article.
 *
 * Run:
 *   set -a; . ~/dhs_qa_workspace/.env; set +a
 *   node scripts/kb-screenshots/scheduler.mjs
 *   KB_ONLY=04,05 node scripts/kb-screenshots/scheduler.mjs
 *
 * READ-ONLY, and strictly so. The reschedule figure drags a card, which opens a
 * confirmation panel; the panel is photographed and then CANCELLED. Nothing in
 * it is ever submitted, and the drag itself writes nothing until it is.
 *
 * The day on screen is real work re-dressed, see schedule-fixture.mjs.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDay, buildWeek, accountToday } from "./schedule-fixture.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const DIR = resolve(ROOT, "public/images/scheduler");
const BASE = process.env.KB_BASE_URL || "https://app-staging.directhomeservice.com";
const VIEWPORT = { width: 1680, height: 1050 };

const email = process.env.STAGING_SP_LOGIN_EMAIL;
const password = process.env.STAGING_SP_LOGIN_PASSWORD;
if (!email || !password) { console.error("Missing STAGING_SP_LOGIN_EMAIL / STAGING_SP_LOGIN_PASSWORD."); process.exit(1); }
const ONLY = (process.env.KB_ONLY || "").split(",").map((s) => s.trim()).filter(Boolean);
const wanted = (n) => !ONLY.length || ONLY.includes(n);

mkdirSync(DIR, { recursive: true });
const results = [];

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 2, timezoneId: "America/Phoenix" });
const page = await context.newPage();

let apiUrl = null, auth = null;
page.on("request", (r) => {
  if (!/graphql/.test(r.url())) return;
  apiUrl ||= r.url();
  const a = r.headers().authorization;
  if (a) auth = a;
});

let DAY = [], WEEK = [], SET = "day";

await page.route("**/graphql**", async (route) => {
  let body = null;
  try { body = JSON.parse(route.request().postData() || "null"); } catch {}
  if (body?.operationName !== "GetJobsScheduler") return route.continue();
  const res = await route.fetch();
  let json;
  try { json = await res.json(); } catch { return route.fulfill({ response: res }); }
  const jobs = SET === "week" ? WEEK : DAY;
  if (jobs.length && json?.data?.getJobs) {
    json.data.getJobs.jobs = jobs;
    if (json.data.getJobs.paginationInfo) {
      json.data.getJobs.paginationInfo.totalRecords = jobs.length;
      json.data.getJobs.paginationInfo.totalReturnedRecords = jobs.length;
    }
  }
  await route.fulfill({ response: res, json });
});

await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
await page.fill("#email", email);
await page.fill("#password", password);
await page.click('button:has-text("Sign In")');
await page.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 60000 });
await page.waitForTimeout(9000);

// __typename at EVERY level, deliberately. Apollo adds it to the app's own
// queries and drops any object that comes back without it, so a pool fetched
// without it produced jobs the scheduler silently refused to render.
const POOL_QUERY = `query KbPool($data: SearchJobsInput) {
  getJobs(data: $data) { ... on GetJobs { jobs {
    __typename
    id name status isLocked scheduledStartDatetime scheduledStopDatetime
    client_account_id property_id isRecurringTemplate parent_job_id
    recurringSchedule { __typename isRecurring }
    crew { __typename id name color users { __typename id firstName lastName isCrewLead avatarUrl } }
    property { __typename id address1 address2 city state zip photoUrl }
    client { __typename companyName companyEmail companyPhone users { __typename phone email } }
    isQuickAdd
  } } ... on Error { message } } }`;
const CREWS_QUERY = `query KbCrews($data: SearchCrewsInput) {
  getCrews(data: $data) { ... on GetCrews { crews { id name color } } ... on Error { message } } }`;

const fetched = await page.evaluate(async ([url, token, pq, cq]) => {
  const call = async (operationName, query, variables) => {
    const r = await fetch(url, { method: "POST", headers: { "content-type": "application/json", authorization: token },
      body: JSON.stringify({ operationName, query, variables }) });
    return r.json();
  };
  const jobs = await call("KbPool", pq, { data: { limitPerPage: 300, page: 1 } });
  const crews = await call("KbCrews", cq, { data: { limitPerPage: 60, page: 1 } });
  return { jobs: jobs?.data?.getJobs?.jobs || [], crews: crews?.data?.getCrews?.crews || [] };
}, [apiUrl, auth, POOL_QUERY, CREWS_QUERY]);

DAY = buildDay(fetched.jobs, { day: accountToday(), crews: fetched.crews, maxCrews: 7 });
WEEK = buildWeek(fetched.jobs, { day: accountToday(), crews: fetched.crews });
const RESCHEDULE_JOB_ID = (fetched.jobs.find((j) => j.status === "SCHEDULED" && j.crew?.id) || fetched.jobs[0])?.id || null;
console.log(`pool: ${fetched.jobs.length} jobs, ${fetched.crews.length} crews`);
console.log(`day: ${DAY.length} jobs | week: ${WEEK.length} jobs`);

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

/** Syncfusion opens the day at the current hour; start it at 9 AM. */
async function scrollTo9() {
  await page.evaluate(() => {
    const content = document.querySelector(".e-content-wrap");
    const header = document.querySelector(".e-date-header-wrap");
    if (!content || !header) return;
    const x = (content.scrollWidth / 24) * 9;
    content.scrollLeft = x;
    header.scrollLeft = x;
  });
  await page.waitForTimeout(1000);
}

async function setView(label) {
  SET = label === "Week" ? "week" : "day";
  await page.locator(`button:has-text("${label}"), [role=button]:has-text("${label}")`).first().click();
  await page.waitForTimeout(6000);
}

async function shoot(name, target, opts = {}) {
  const path = resolve(DIR, `${name}.png`);
  await page.waitForTimeout(opts.settle ?? 900);
  if (target) { await target.scrollIntoViewIfNeeded(); await page.waitForTimeout(300); await target.screenshot({ path }); }
  else await page.screenshot({ path });
  results.push({ name, status: "ok" });
  console.log(`  ✓ ${name}.png`);
}

/** Crop to a measured box, for anything that animates in. */
async function shootBox(name, finder) {
  const box = await page.evaluate(finder);
  if (!box) throw new Error("the element never appeared");
  await page.screenshot({ path: resolve(DIR, `${name}.png`), clip: box });
  results.push({ name, status: "ok" });
  console.log(`  ✓ ${name}.png`);
}

async function figure(num, name, fn) {
  if (!wanted(num)) return;
  try { await fn(name); }
  catch (err) {
    const lines = err.message.split("\n").map((l) => l.trim()).filter(Boolean);
    results.push({ name, status: "failed", reason: lines[0] });
    console.log(`  ✗ ${name}, ${lines[0]}`);
  } finally {
    await page.keyboard.press("Escape").catch(() => {});
    await page.waitForTimeout(600);
  }
}

await page.goto(`${BASE}/scheduler`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(12000);
await hideChrome();
await page.locator('button:has-text("Skip")').first().click({ timeout: 3000 }).catch(() => {});
await page.waitForTimeout(800);
await setView("Day");
await scrollTo9();
console.log(`rendered: ${await page.locator(".e-appointment").count()} cards`);

await figure("01", "01-scheduler-day", async (n) => { await scrollTo9(); await shoot(n); });

await figure("02", "02-scheduler-controls", async (n) => {
  await shootBox(n, () => {
    const btn = [...document.querySelectorAll("button")].find((b) => b.textContent.trim() === "Today");
    const bar = btn?.closest("div[class*='border-b']") || btn?.parentElement?.parentElement;
    if (!bar) return null;
    const r = bar.getBoundingClientRect();
    return { x: Math.max(0, r.x - 1), y: Math.max(0, r.y - 1), width: r.width + 2, height: r.height + 2 };
  });
});

await figure("03", "03-scheduler-week", async (n) => {
  await setView("Week");
  await shoot(n);
  await setView("Day");
  await scrollTo9();
});

await figure("04", "04-scheduler-popover", async (n) => {
  await scrollTo9();
  await page.locator(".e-appointment").first().click();
  await page.waitForTimeout(2500);
  // The popover renders through a floating portal into an overlay marked z-[60];
  // its card is that overlay's only child. Hunting for "an absolutely positioned
  // box of about the right size" found a 4px sliver instead.
  await shootBox(n, () => {
    const overlay = document.querySelector('div[class*="z-[60]"]');
    const card = overlay?.firstElementChild;
    if (!card) return null;
    const r = card.getBoundingClientRect();
    if (r.width < 100) return null;
    return { x: Math.max(0, r.x - 2), y: Math.max(0, r.y - 2), width: r.width + 4, height: r.height + 4 };
  });
  await page.mouse.click(8, 8).catch(() => {});
  await page.waitForTimeout(900);
});

await figure("05", "05-scheduler-create-event", async (n) => {
  await scrollTo9();
  // An empty slot: a work cell in a row that has no card in it. Picked by
  // measuring, because nth(40) landed under an existing card more than once.
  // The slot has to be in the FUTURE. openEventTypeModalForSchedulerCell
  // returns early for a date in the past unless Override Availability is on, so
  // every click on a 9 AM cell at half past three did nothing at all. Pick an
  // empty cell to the right of the current-time line.
  const clicked = await page.evaluate(() => {
    const now = document.querySelector(".e-current-time, .e-current-timeline, .e-previous-timeline");
    const nowX = now ? now.getBoundingClientRect().x : 0;
    const cells = [...document.querySelectorAll(".e-work-cells")];
    const cards = [...document.querySelectorAll(".e-appointment")].map((a) => a.getBoundingClientRect());
    for (const c of cells) {
      const r = c.getBoundingClientRect();
      if (r.width < 20 || r.height < 20) continue;
      if (r.x < nowX + 30) continue;
      if (r.right > window.innerWidth - 60 || r.bottom > window.innerHeight - 40) continue;
      const hit = cards.some((b) => !(b.right < r.x || b.x > r.right || b.bottom < r.y || b.y > r.bottom));
      if (hit) continue;
      return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2), nowX: Math.round(nowX) };
    }
    return null;
  });
  if (!clicked) throw new Error("no empty work cell to click");
  await page.mouse.click(clicked.x, clicked.y);
  await page.waitForTimeout(3000);
  const box = await page.evaluate(() => {
    const h = [...document.querySelectorAll("h1,h2,h3,h4,div")].find(
      (x) => x.children.length === 0 && /create new event/i.test(x.textContent || "")
    );
    let el = h;
    while (el && el.parentElement) {
      const r = el.getBoundingClientRect();
      if (r.width > 420 && r.height > 240) break;
      el = el.parentElement;
    }
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: Math.max(0, r.x - 2), y: Math.max(0, r.y - 2), width: r.width + 4, height: r.height + 4 };
  });
  if (!box) {
    const seen = await page.evaluate(() =>
      [...document.querySelectorAll("h1,h2,h3,h4")].map((e) => e.textContent.trim()).filter(Boolean).slice(-8)
    );
    throw new Error(`no Create New Event dialog; headings on screen: ${JSON.stringify(seen)}`);
  }
  await page.screenshot({ path: resolve(DIR, `${n}.png`), clip: box });
  results.push({ name: n, status: "ok" });
  console.log(`  \u2713 ${n}.png`);
  await page.locator('button:has-text("Cancel")').first().click({ timeout: 4000 }).catch(() => {});
});

await figure("06", "06-scheduler-crew-filter", async (n) => {
  await page.locator('[data-tour="scheduler-crew-filter"]').first().click();
  await page.waitForTimeout(1600);
  await shootBox(n, () => {
    const host = document.querySelector('[data-tour="scheduler-crew-filter"]');
    if (!host) return null;
    const r = host.getBoundingClientRect();
    // The open list renders below the control, outside its own box.
    let bottom = r.bottom;
    for (const el of document.querySelectorAll("div,ul")) {
      const s = getComputedStyle(el);
      if (s.position !== "absolute" && s.position !== "fixed") continue;
      const b = el.getBoundingClientRect();
      if (b.top < r.bottom - 4 || b.top > r.bottom + 40) continue;
      if (Math.abs(b.x - r.x) > 60) continue;
      bottom = Math.max(bottom, b.bottom);
    }
    return { x: Math.max(0, r.x - 8), y: Math.max(0, r.y - 8), width: r.width + 16, height: bottom - r.y + 16 };
  });
});

await figure("08", "08-scheduler-availability", async (n) => {
  // The hours a crew is not available are shaded, and the switch that ignores
  // them sits in the same bar. Scroll back to the early morning, where the
  // shading is, instead of photographing a working day that is all white.
  await page.evaluate(() => {
    const content = document.querySelector(".e-content-wrap");
    const header = document.querySelector(".e-date-header-wrap");
    if (!content || !header) return;
    const x = (content.scrollWidth / 24) * 4;
    content.scrollLeft = x;
    header.scrollLeft = x;
  });
  await page.waitForTimeout(1400);
  const shaded = await page.evaluate(() => {
    let n = 0;
    for (const c of document.querySelectorAll(".e-work-cells")) {
      const bg = getComputedStyle(c).backgroundColor;
      const m = bg.match(/\d+/g);
      if (!m) continue;
      // Anything that is not plain white counts as marked.
      if (!(Number(m[0]) > 248 && Number(m[1]) > 248 && Number(m[2]) > 248)) n++;
    }
    return n;
  });
  console.log(`    shaded cells in view: ${shaded}`);
  if (!shaded) throw new Error("nothing is shaded, so there is no availability to photograph");
  await shootBox(n, () => {
    const btn = [...document.querySelectorAll("button")].find((b) => b.textContent.trim() === "Today");
    const bar = btn?.closest("div[class*='border-b']");
    const grid = document.querySelector(".e-content-wrap");
    if (!bar || !grid) return null;
    const b = bar.getBoundingClientRect();
    const g = grid.getBoundingClientRect();
    const bottom = Math.min(g.y + 420, window.innerHeight - 10);
    return { x: Math.max(0, b.x - 1), y: Math.max(0, b.y - 1), width: b.width + 2, height: bottom - b.y };
  });
  await scrollTo9();
});

await figure("07", "07-scheduler-reschedule", async (n) => {
  // The panel a drag opens, photographed from the other door that opens it.
  //
  // Dragging a card is what the article describes, and it is what a reader
  // does, but a synthetic drag does not reach Syncfusion: the pointer walk
  // below was tried at several speeds and hold times and the scheduler never
  // registered it, with no toast and no overlay to show for it. The SAME panel
  // is RescheduleJobStepperModal, which a job's More Actions menu also opens,
  // so the figure is the real panel either way.
  //
  // Opened and then CANCELLED. Nothing is submitted.
  const jobId = RESCHEDULE_JOB_ID;
  if (!jobId) throw new Error("no job to open");
  await page.goto(`${BASE}/jobs/${jobId}`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(11000);
  await hideChrome();
  await page.locator('button:has-text("More Actions"), [data-tour*="more-actions"] button, button[aria-label*="more" i]')
    .first().click({ timeout: 15000 });
  await page.waitForTimeout(1500);
  await page.locator('text=/^\\s*Reschedule/i').first().click({ timeout: 10000 });
  await page.waitForTimeout(3000);
  const box = await page.evaluate(() => {
    const h = [...document.querySelectorAll("h1,h2,h3,h4,div,span,p")].find(
      (x) => x.children.length === 0 && /schedule job|reschedul|desired date and time/i.test(x.textContent || "")
    );
    let el = h;
    while (el && el.parentElement) {
      const r = el.getBoundingClientRect();
      if (r.width > 420 && r.height > 260) break;
      el = el.parentElement;
    }
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: Math.max(0, r.x - 2), y: Math.max(0, r.y - 2), width: r.width + 4, height: Math.min(r.height + 4, 1046 - Math.max(0, r.y - 2)) };
  });
  if (!box) throw new Error("the reschedule panel never opened");
  await page.screenshot({ path: resolve(DIR, `${n}.png`), clip: box });
  results.push({ name: n, status: "ok" });
  console.log(`  \u2713 ${n}.png`);
  await page.locator('button:has-text("Cancel")').first().click({ timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(1000);
  await page.keyboard.press("Escape").catch(() => {});
});

console.log("\n" + results.map((r) => `${r.status === "ok" ? "ok    " : "FAILED"} ${r.name}${r.reason ? ` , ${r.reason}` : ""}`).join("\n"));
await browser.close();
