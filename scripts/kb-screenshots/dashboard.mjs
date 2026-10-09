/**
 * Knowledge base figures for the Dashboard article.
 *
 * Run:
 *   set -a; . ~/dhs_qa_workspace/.env; set +a
 *   node scripts/kb-screenshots/dashboard.mjs
 *   KB_ONLY=01,03 node scripts/kb-screenshots/dashboard.mjs
 *
 * READ-ONLY. Nothing is created, changed or deleted on staging. The dashboard's
 * own GraphQL response is rewritten in the browser before the app reads it, so
 * the scheduler widget shows a day worth photographing; see schedule-fixture.mjs
 * for exactly what is rewritten and why, and docs/FIGURES.md for the disclosure.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { paintSampleAvatars, PORTRAITS, bucketFor } from "./portraits.mjs";
import { buildDay, buildUpcomingPlan, accountToday, TREND_SERIES } from "./schedule-fixture.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const DIR = resolve(ROOT, "public/images/dashboard");
const BASE = process.env.KB_BASE_URL || "https://app-staging.directhomeservice.com";
const VIEWPORT = { width: 1680, height: 1050 };

const email = process.env.KB_EMAIL_DASH || process.env.STAGING_SP_LOGIN_EMAIL;
const password = process.env.KB_PASSWORD_DASH || process.env.STAGING_SP_LOGIN_PASSWORD;
if (!email || !password) {
  console.error("Missing STAGING_SP_LOGIN_EMAIL / STAGING_SP_LOGIN_PASSWORD.");
  process.exit(1);
}
const ONLY = (process.env.KB_ONLY || "").split(",").map((s) => s.trim()).filter(Boolean);
const wanted = (n) => !ONLY.length || ONLY.includes(n);

mkdirSync(DIR, { recursive: true });
const results = [];

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: VIEWPORT,
  deviceScaleFactor: 2,
  timezoneId: "America/Phoenix",
});
const page = await context.newPage();

// The API endpoint and the bearer token, learned from the app's own traffic
// rather than built by hand, so this follows whatever the app is really using.
let apiUrl = null, auth = null;
page.on("request", (r) => {
  if (!/graphql/.test(r.url())) return;
  apiUrl ||= r.url();
  const a = r.headers().authorization;
  if (a) auth = a;
});

// ── The day the figures show ─────────────────────────────────────────────────
const unplaced = new Set();
/** Conversations with somebody's test data on them, kept out of the figure. */
const INBOX_EXCLUDE = /client quick|awdsad|lulu lemon|mario bros|^\s*test|asdasd/i;
let dropped = 0;
let DAY_JOBS = [];
let UPCOMING_PLAN = [];

function rewriteDashboard(json) {
  const payload = json?.data?.getDashboard?.payload;
  if (!payload) return json;
  const sections = payload.sections;

  if (DAY_JOBS.length) sections.scheduler.jobs = DAY_JOBS;

  sections.trend = (sections.trend || []).map((point, i) => ({
    ...point,
    totalJobs: TREND_SERIES.totalJobs[i],
    realProfit: TREND_SERIES.realProfit[i],
    pendingInvoices: TREND_SERIES.pendingInvoices[i],
    totalPotentialProfit: TREND_SERIES.totalPotentialProfit[i],
  }));

  // Staging is shared, and its Inbox carries conversations with clients called
  // "Client Quick" and "awdsad asdasd". Same rule as the list figures: the row
  // is left out of the picture, nothing is touched in the app.
  if (sections.inbox?.candidates) {
    const before = sections.inbox.candidates.length;
    sections.inbox.candidates = sections.inbox.candidates.filter((c) => {
      const name = `${c.clientAccountName || ""} ${c.clientUserFullName || ""}`;
      return !INBOX_EXCLUDE.test(name);
    });
    dropped = before - sections.inbox.candidates.length;
  }

  // Inbox rows read "Someone:" because lastMessageUserFirstName comes back
  // empty. Give them the client's own first name, and a face.
  const assigned = {};
  const next = { female: 0, male: 0 };
  let k = 0;
  for (const c of sections.inbox?.candidates || []) {
    if (!c.lastMessageText) continue;
    const full = (c.clientUserFullName || c.clientAccountName || "").trim();
    const first = full.split(/\s+/)[0] || "";
    c.lastMessageUserFirstName = first;
    if (!assigned[full]) {
      let bucket = bucketFor(first);
      if (!bucket) { unplaced.add(first); bucket = k % 2 ? "male" : "female"; }
      assigned[full] = PORTRAITS[bucket][next[bucket]++ % PORTRAITS[bucket].length];
      k++;
    }
    c.lastMessageUserAvatarUrl = c.clientAccount?.users?.[0]?.avatarUrl || assigned[full];
  }
  return json;
}

await page.route("**/graphql**", async (route) => {
  let body = null;
  try { body = JSON.parse(route.request().postData() || "null"); } catch {}
  const op = body?.operationName;
  if (!["GetDashboard", "GetJobsScheduler", "GetJobsMinimal"].includes(op)) return route.continue();
  const res = await route.fetch();
  let json;
  try { json = await res.json(); } catch { return route.fulfill({ response: res }); }
  if (op === "GetDashboard") json = rewriteDashboard(json);
  if (op === "GetJobsScheduler" && DAY_JOBS.length && json?.data?.getJobs?.jobs) {
    json.data.getJobs.jobs = DAY_JOBS;
  }
  // The open-items card reads this one. Almost every real job on the account is
  // in the past, so the Upcoming tab comes back with a single row.
  //
  // The rows are CLONED FROM THE RESPONSE'S OWN JOB, not built from the pool:
  // this query selects a different fragment, and an object assembled by hand is
  // missing fields Apollo asked for, so every row rendered as "Untitled Job"
  // with em dashes. Cloning guarantees the shape, __typename included, and only
  // the name, dates, status and crew are rewritten.
  if (op === "GetJobsMinimal" && json?.data?.getJobs?.jobs?.length && UPCOMING_PLAN.length) {
    const template = json.data.getJobs.jobs[0];
    const rows = UPCOMING_PLAN.map((p, i) => ({
      ...structuredClone(template),
      id: `${template.id}-kb-${i}`,
      name: p.name,
      status: p.status,
      scheduledStartDatetime: p.start,
      scheduledStopDatetime: p.stop,
      crew: template.crew
        ? { ...structuredClone(template.crew), id: p.crew.id, name: p.crew.name, color: p.crew.color }
        : template.crew,
    }));
    json.data.getJobs.jobs = rows;
    if (json.data.getJobs.paginationInfo) {
      json.data.getJobs.paginationInfo.totalRecords = rows.length;
      json.data.getJobs.paginationInfo.totalReturnedRecords = rows.length;
    }
  }
  await route.fulfill({ response: res, json });
});

// ── Sign in ──────────────────────────────────────────────────────────────────
await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
await page.fill("#email", email);
await page.fill("#password", password);
await page.click('button:has-text("Sign In")');
await page.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 60000 });
await page.waitForTimeout(9000);

// ── Build the day from the account's own jobs ────────────────────────────────
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
    const r = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: token },
      body: JSON.stringify({ operationName, query, variables }),
    });
    return r.json();
  };
  const jobs = await call("KbPool", pq, { data: { limitPerPage: 300, page: 1 } });
  const crews = await call("KbCrews", cq, { data: { limitPerPage: 60, page: 1 } });
  return {
    jobs: jobs?.data?.getJobs?.jobs || [],
    crews: crews?.data?.getCrews?.crews || [],
    error: jobs?.errors?.[0]?.message || crews?.errors?.[0]?.message || null,
  };
}, [apiUrl, auth, POOL_QUERY, CREWS_QUERY]);

if (fetched.error) console.log(`  ! pool query said: ${fetched.error}`);
DAY_JOBS = buildDay(fetched.jobs, { day: accountToday(), crews: fetched.crews, maxCrews: 7 });
UPCOMING_PLAN = buildUpcomingPlan(fetched.crews, 8);
console.log(`pool: ${fetched.jobs.length} real jobs, ${fetched.crews.length} crews`);
console.log(`day:  ${accountToday()}, ${DAY_JOBS.length} jobs across ${new Set(DAY_JOBS.map((j) => j.crew.name)).size} crews`);
console.log(`upcoming: ${UPCOMING_PLAN.length} rows planned`);
if (!DAY_JOBS.length) console.log("  ! the day is empty; the scheduler figures will show an empty grid");

// ── Page chrome that does not belong in a figure ─────────────────────────────
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

/** The day view opens at the current hour; start it at 9 AM, like the reference. */
async function scrollDayTo9() {
  const r = await page.evaluate(() => {
    const w = document.querySelector('[data-tour="dashboard-scheduler-widget"]');
    const content = w?.querySelector(".e-content-wrap");
    const header = w?.querySelector(".e-date-header-wrap");
    if (!content || !header) return "no scroller";
    const x = (content.scrollWidth / 24) * 9;
    content.scrollLeft = x;
    header.scrollLeft = x;
    return `ok ${Math.round(x)}px`;
  });
  await page.waitForTimeout(1200);
  return r;
}

async function shoot(name, target, opts = {}) {
  const path = resolve(DIR, `${name}.png`);
  await page.waitForTimeout(opts.settle ?? 900);
  if (target) {
    await target.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await target.screenshot({ path });
  } else {
    await page.screenshot({ path });
  }
  results.push({ name, status: "ok" });
  console.log(`  ✓ ${name}.png`);
}

async function figure(num, name, fn) {
  if (!wanted(num)) return;
  try { await fn(name); }
  catch (err) {
    const lines = err.message.split("\n").map((l) => l.trim()).filter(Boolean);
    const cause = lines.find((l) => /intercept|not visible|not stable|resolved to|waiting for/i.test(l));
    results.push({ name, status: "failed", reason: cause ? `${lines[0]}, ${cause}` : lines[0] });
    console.log(`  ✗ ${name}, ${lines[0]}`);
  }
}

// ── The figures ──────────────────────────────────────────────────────────────
await page.goto(`${BASE}/dashboard`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(13000);
await hideChrome();
await page.locator('button:has-text("Skip")').first().click({ timeout: 3000 }).catch(() => {});
await page.waitForTimeout(800);
await paintSampleAvatars(page).catch(() => {});
console.log("scheduler scroll:", await scrollDayTo9());

const events = await page.locator(".e-appointment").count();
const someone = await page.locator("text=/^Someone:/").count();
// Say which senders we could not place, rather than let the fallback decide in
// silence: that is how a message from Marcus got a woman's portrait.
if (dropped) console.log(`  \u00b7 ${dropped} test conversation(s) left out of the Inbox figure`);
if (unplaced.size) console.log(`  ! no face rule for: ${[...unplaced].join(", ")} (add them to portraits.mjs)`);
console.log(`rendered: ${events} scheduler cards, ${someone} inbox rows still saying "Someone:"`);

await figure("01", "01-dashboard", async (n) => { await shoot(n); });
await figure("02", "02-dashboard-topbar", async (n) => {
  await shoot(n, page.locator(".dhs-greeting").first());
});
await figure("03", "03-dashboard-stats", async (n) => {
  await shoot(n, page.locator('[data-tour="dashboard-stats"]').first());
});
await figure("04", "04-dashboard-scheduler", async (n) => {
  await scrollDayTo9();
  await shoot(n, page.locator('[data-tour="dashboard-scheduler-widget"]').first());
});
await figure("05", "05-dashboard-inbox", async (n) => {
  await shoot(n, page.locator('[data-tour="dashboard-inbox-widget"]').first());
});
await figure("06", "06-dashboard-open-items", async (n) => {
  await shoot(n, page.locator('[data-tour="dashboard-open-items"]').first());
});
await figure("07", "07-dashboard-settings", async (n) => {
  await page.locator(".dhs-clock-settings").first().click();
  await page.waitForTimeout(2500);
  // The modal animates in, so a crop that asks for stability times out against
  // its transform. Find the dialog's own card by the heading it carries and
  // measure it, then clip the page to that box: no stability wait, no crop of
  // a moving element.
  const box = await page.evaluate(() => {
    const heads = [...document.querySelectorAll("h1,h2,h3,h4")];
    const h = heads.find((x) => /dashboard settings/i.test(x.textContent || ""));
    let el = h;
    while (el && el.parentElement) {
      const r = el.getBoundingClientRect();
      if (r.width > 380 && r.height > 260) break;
      el = el.parentElement;
    }
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: Math.max(0, r.x - 2), y: Math.max(0, r.y - 2), width: r.width + 4, height: r.height + 4 };
  });
  if (!box) throw new Error("the Dashboard Settings dialog never appeared");
  await page.screenshot({ path: resolve(DIR, `${n}.png`), clip: box });
  results.push({ name: n, status: "ok" });
  console.log(`  \u2713 ${n}.png`);
  await page.keyboard.press("Escape").catch(() => {});
  await page.waitForTimeout(900);
});

console.log("\n" + results.map((r) => `${r.status === "ok" ? "ok    " : "FAILED"} ${r.name}${r.reason ? ` , ${r.reason}` : ""}`).join("\n"));
await browser.close();
