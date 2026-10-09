/**
 * Knowledge base figures for the Map article.
 *
 * Run:
 *   set -a; . ~/dhs_qa_workspace/.env; set +a
 *   node scripts/kb-screenshots/map.mjs
 *   KB_ONLY=03 node scripts/kb-screenshots/map.mjs
 *
 * READ-ONLY. The map's own query is rewritten in the browser so today has work
 * on it: real jobs, real addresses, real coordinates, re-dated and renamed. The
 * pins are where the properties actually are. See schedule-fixture.mjs.
 *
 * The empty-state figure is NOT arranged. It searches for something that
 * matches nothing and photographs what the app really says.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { JOB_NAMES, SKIP_CLIENTS, accountToday, at } from "./schedule-fixture.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const DIR = resolve(ROOT, "public/images/map");
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

let PINS = [];
let PASS_THROUGH = false;   // the empty-state figure wants the real answer

await page.route("**/graphql**", async (route) => {
  let body = null;
  try { body = JSON.parse(route.request().postData() || "null"); } catch {}
  if (body?.operationName !== "GetJobsMapView") return route.continue();
  const res = await route.fetch();
  let json;
  try { json = await res.json(); } catch { return route.fulfill({ response: res }); }
  if (!PASS_THROUGH && PINS.length && json?.data?.getJobs) {
    json.data.getJobs.jobs = PINS;
    if (json.data.getJobs.paginationInfo) {
      json.data.getJobs.paginationInfo.totalRecords = PINS.length;
      json.data.getJobs.paginationInfo.totalReturnedRecords = PINS.length;
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

// The map's own fragment, __typename at every level so Apollo keeps the rows.
const POOL_QUERY = `query KbMapPool($data: SearchJobsInput) {
  getJobs(data: $data) { ... on GetJobs { jobs {
    __typename id name scheduledStartDatetime scheduledStopDatetime
    geoCoordinates { __typename latitude longitude }
    property { __typename address1 address2 city state zip photoUrl }
    crew { __typename id name color }
    client { __typename id companyName }
    isRecurringTemplate parent_job_id isQuickAdd
    recurringSchedule { __typename isRecurring }
  } } ... on Error { message } } }`;

const pool = await page.evaluate(async ([url, token, q]) => {
  const r = await fetch(url, { method: "POST", headers: { "content-type": "application/json", authorization: token },
    body: JSON.stringify({ operationName: "KbMapPool", query: q, variables: { data: { limitPerPage: 300, page: 1 } } }) });
  const j = await r.json();
  return j?.data?.getJobs?.jobs || [];
}, [apiUrl, auth, POOL_QUERY]);

/**
 * One service area, not the whole country.
 *
 * The account has work in Denver, Houston, Chicago and Boston as well as
 * Arizona. All of it at once zooms the map out to the United States, where
 * every pin is a dot and the figure says nothing. Arizona alone reads like a
 * day's dispatch.
 */
const day = accountToday();
const seenAddress = new Set();
PINS = pool
  .filter((j) => /arizona|^az$/i.test(j.property?.state || ""))
  .filter((j) => j.geoCoordinates?.latitude && j.geoCoordinates?.longitude)
  .filter((j) => j.client?.companyName && !SKIP_CLIENTS.test(j.client.companyName))
  .filter((j) => {
    const k = `${j.geoCoordinates.latitude},${j.geoCoordinates.longitude},${j.name}`;
    if (seenAddress.has(k)) return false;
    seenAddress.add(k);
    return true;
  })
  .slice(0, 14)
  .map((j, i) => {
    const names = JOB_NAMES[j.crew?.name] || ["Service Visit", "Follow-up Visit"];
    const h = 8 + (i % 8);
    return {
      ...j,
      name: names[i % names.length],
      scheduledStartDatetime: at(day, h, 0),
      scheduledStopDatetime: at(day, h + 2, 0),
    };
  });
console.log(`pool: ${pool.length} jobs | pins: ${PINS.length} in Arizona`);

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

async function shoot(name, target) {
  const path = resolve(DIR, `${name}.png`);
  await page.waitForTimeout(900);
  if (target) { await target.scrollIntoViewIfNeeded(); await page.waitForTimeout(300); await target.screenshot({ path }); }
  else await page.screenshot({ path });
  results.push({ name, status: "ok" });
  console.log(`  ✓ ${name}.png`);
}

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
  }
}

await page.goto(`${BASE}/map`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(14000);
await hideChrome();
await page.locator('button:has-text("Skip")').first().click({ timeout: 3000 }).catch(() => {});
await page.waitForTimeout(1500);

const markerCount = await page.evaluate(() =>
  document.querySelectorAll('.gm-style img[src*="data:image"], .gm-style [role="button"] img').length
);
console.log(`markers on the canvas: ${markerCount}`);

await figure("01", "01-map", async (n) => { await shoot(n); });

await figure("02", "02-map-filters", async (n) => {
  await shootBox(n, () => {
    const tabs = document.querySelector('[data-tour="map-type-tabs"]');
    const bar = tabs?.parentElement;
    if (!bar) return null;
    const r = bar.getBoundingClientRect();
    return { x: Math.max(0, r.x - 1), y: Math.max(0, r.y - 1), width: r.width + 2, height: r.height + 2 };
  });
});

/**
 * The pins whose LABEL says what we want, nearest first.
 *
 * A marker carries a label under it: "Job" when it is one record, "4 jobs"
 * when several share an address. Which one you click is the difference between
 * the single card and the group list, and those are two different figures, so
 * the label is what we aim at. The pin sits above its own label, hence the
 * offset.
 *
 * Several candidates are returned because the card opens UPWARDS from the pin
 * and Google does not pan to make room: a pin near the top of the canvas gets a
 * card with its head cut off. The caller clicks them in turn until one fits.
 */
async function pinsLabelled(match) {
  return page.evaluate((pattern) => {
    const re = new RegExp(pattern);
    const style = document.querySelector(".gm-style");
    const canvas = style?.getBoundingClientRect();
    if (!canvas) return [];
    // The label is a BUTTON with a SPAN inside it, not a bare div. Querying
    // only divs found nothing at all.
    const labels = [...style.querySelectorAll("button")].filter((b) =>
      re.test((b.textContent || "").trim())
    );
    // Lower on the canvas is better: that is where there is room above.
    return labels
      .map((l) => l.getBoundingClientRect())
      .filter((r) => r.width > 0 && r.height > 0)
      .sort((a, b) => b.y - a.y)
      .slice(0, 6)
      .map((r) => ({ x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) }));
  }, match);
}

/** The card the map floats over a pin, whichever of the two it is. */
const popupBox = () => {
  const pop = document.querySelector('div[data-popup="true"]');
  const el = pop?.querySelector("div > div") || pop?.firstElementChild || pop;
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (r.width < 120) return null;
  return { x: Math.max(0, r.x - 4), y: Math.max(0, r.y - 4), width: r.width + 8, height: r.height + 8 };
};

async function closePopup() {
  await page.mouse.click(360, 1000).catch(() => {});
  await page.waitForTimeout(1000);
}

/** Click pins of this kind until one opens a card that fits on screen. */
async function openCard(match) {
  const spots = await pinsLabelled(match);
  if (!spots.length) throw new Error(`no pin labelled /${match}/ on the canvas`);
  for (const spot of spots) {
    await page.mouse.click(spot.x, spot.y);
    await page.waitForTimeout(2400);
    const box = await page.evaluate(popupBox);
    if (box && box.y > 4 && box.y + box.height < 1046) return;
    await closePopup();
  }
  throw new Error(`a card opened for /${match}/ but never fitted on screen`);
}

await figure("03", "03-map-marker", async (n) => {
  await openCard("^Job$");
  await shootBox(n, popupBox);
  await closePopup();
});

await figure("04", "04-map-group", async (n) => {
  await openCard("^\\d+ jobs$");
  await shootBox(n, popupBox);
  await closePopup();
});

await figure("05", "05-map-empty", async (n) => {
  PASS_THROUGH = true;      // photograph what the app really says
  const search = page.locator('[data-tour="map-search"] input').first();
  await search.click();
  await search.fill("skylight");
  await page.waitForTimeout(4500);
  await shootBox(n, () => {
    const banner = document.querySelector('[role="status"]');
    if (!banner) return null;
    const bar = document.querySelector('[data-tour="map-type-tabs"]')?.parentElement;
    const top = bar ? bar.getBoundingClientRect() : banner.getBoundingClientRect();
    const r = banner.getBoundingClientRect();
    return { x: Math.max(0, top.x - 1), y: Math.max(0, top.y - 1), width: top.width + 2, height: r.bottom - top.y + 2 };
  });
  PASS_THROUGH = false;
});

console.log("\n" + results.map((r) => `${r.status === "ok" ? "ok    " : "FAILED"} ${r.name}${r.reason ? ` , ${r.reason}` : ""}`).join("\n"));
await browser.close();
