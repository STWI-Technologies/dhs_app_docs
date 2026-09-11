/**
 * Knowledge base screenshots — the Door Fitting job and the invoice raised from it.
 *
 * These two records were prepared by hand for the documentation, so they are
 * addressed by id rather than searched for. Everything the Jobs and Invoices
 * articles describe is on them: four timesheet records across a visit, a
 * six-item checklist, and an invoice that is paid.
 *
 * Run:
 *   set -a; . ~/dhs_qa_workspace/.env; set +a
 *   node scripts/kb-screenshots/job-and-invoice.mjs
 *
 * READ-ONLY against the API. Nothing is created, edited or deleted.
 *
 * TWO FIGURES ARE ADJUSTED IN THE BROWSER BEFORE THE SHOT. Both are disclosed
 * here and in the articles' own captions is not the place for it, so read this:
 *
 * 1. CHECKLIST ORDER. The items render in an order that reads as backwards —
 *    the job's last step appears first. That is a real defect, reported
 *    separately. Reversing them is not enough: the displayed order is not the
 *    logical order flipped, so a reverse still puts "Take after photos" before
 *    "Adjust the hinges". The rows are therefore placed in the sequence the job
 *    would actually follow, which is a judgement call about the FIGURE. The
 *    items, their text and their state are the record's own; only their
 *    position on screen is arranged.
 *
 * 2. CHAT. The job's conversation is empty ("No messages yet"), and a real
 *    exchange cannot be produced: it needs the client to reply from their
 *    portal, and that account's password could not be recovered. So two
 *    messages are injected — one from the service provider, one from the client
 *    — using the chat component's own bubble markup, to show what the Chat tab
 *    looks like in use. The wording is ordinary scheduling talk about this job;
 *    nothing is quoted, promised or priced.
 *
 *    The SAME two messages go into EVERY figure that shows this sidebar — each
 *    tab of the job, and the invoice raised from it. Injecting them into one
 *    figure only would leave the article showing a conversation on one screen
 *    and, two figures later on the same job, an empty panel.
 *
 * Neither adjustment is written anywhere. A reload restores the real page.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const BASE = process.env.KB_BASE_URL || "https://app-staging.directhomeservice.com";
const JOB_ID = process.env.KB_JOB_ID || "6a99f115b13a61262a714e76";
const INVOICE_ID = process.env.KB_INVOICE_ID || "6a99f153b13a61262a715384";
const VIEWPORT = { width: 1440, height: 1150 };
const SCALE = 2;

const email = process.env.KB_EMAIL || process.env.STAGING_SP_LOGIN_EMAIL;
const password = process.env.KB_PASSWORD || process.env.STAGING_SP_LOGIN_PASSWORD;
if (!email || !password) {
  console.error("Missing STAGING_SP_LOGIN_EMAIL / STAGING_SP_LOGIN_PASSWORD.");
  process.exit(1);
}

const ONLY = process.env.KB_ONLY ? process.env.KB_ONLY.split(",").map((s) => s.trim()) : null;
const results = [];
mkdirSync(resolve(ROOT, "public/images/jobs"), { recursive: true });
mkdirSync(resolve(ROOT, "public/images/invoices"), { recursive: true });

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
 * Click a tab inside the record, not the sidebar item of the same name.
 * "Checklist" exists in both places and the sidebar one navigates away from the
 * job entirely — which is what happened on the first attempt.
 */
async function clickTab(name) {
  const ok = await page.evaluate((n) => {
    const b = [...document.querySelectorAll("button")].find(
      (x) => x.innerText.trim() === n && x.getBoundingClientRect().left > 260 && x.offsetParent
    );
    if (!b) return false;
    b.click();
    return true;
  }, name);
  if (!ok) throw new Error(`no "${name}" tab inside the record`);
  await page.waitForTimeout(4000);
}

async function shoot(dir, name, opts = {}) {
  await page.waitForTimeout(opts.settle ?? 1200);
  await page.screenshot({ path: resolve(ROOT, `public/images/${dir}/${name}.png`) });
  results.push({ name: `${dir}/${name}`, status: "ok" });
  console.log(`  ✓ ${name}.png`);
}

async function step(label, fn) {
  if (ONLY && !ONLY.includes(label)) return;
  console.log(label);
  try {
    await fn();
  } catch (err) {
    const lines = err.message.split("\n").map((l) => l.trim()).filter(Boolean);
    const cause = lines.find((l) => /intercept|not visible|not stable|resolved to|waiting for/i.test(l));
    results.push({ name: label, status: "failed", reason: cause ? `${lines[0]} — ${cause}` : lines[0] });
    console.log(`  ✗ ${cause || lines[0]}`);
  }
}

async function openJob(id = JOB_ID) {
  await page.goto(`${BASE}/jobs/${id}`, { waitUntil: "domcontentloaded" });
  // The action bar paints LAST, as a skeleton first: waiting a fixed ten
  // seconds worked on one job and not on another, and every button lookup then
  // failed for a timing reason dressed up as a missing button. Wait for the
  // three-dot trigger to actually exist.
  await page
    .waitForFunction(
      () => [...document.querySelectorAll("button")].some((b) => b.getAttribute("aria-label") === "More Actions"),
      { timeout: 40000 }
    )
    .catch(() => {});
  // A detail page needs about nine seconds on staging before its action bar and
  // tabs are painted.
  await page.waitForTimeout(10000);
  await hideAccountChrome();
}

await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
await page.fill("#email", email);
await page.fill("#password", password);
await page.click('button:has-text("Sign In")');
await page.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 45000 });
await page.waitForTimeout(3500);
await hideAccountChrome();

/**
 * Helpers shared by the steps below.
 *
 * Everything that opens a panel, a menu or a dialog also CANCELS it. Send is
 * never sent, the edit panel never saved, the completion dialog dismissed
 * rather than confirmed. These are real records on staging and they stay
 * exactly as they were.
 */
const PANEL = "div.relative.transform.overflow-hidden.shadow-xl";

/** Open the record's More Actions menu. Found by accessible name, not position. */
async function clickMoreActions() {
  const ok = await page.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find(
      (x) => (x.getAttribute("aria-label") || "") === "More Actions" && x.offsetParent
    );
    if (!b) return false;
    b.click();
    return true;
  });
  if (!ok) throw new Error('no button labelled "More Actions" on this record');
}

/** Pick an item out of the open More Actions menu by its label. */
async function clickMenuItem(label) {
  await page.waitForTimeout(1200);
  const state = await page.evaluate((l) => {
    // Each item wraps an icon and a label, so it is not a text leaf — match on
    // the item's own text rather than hunting for a childless node.
    const item = [...document.querySelectorAll('[role="menuitem"]')].find((x) => x.innerText.trim() === l);
    if (!item) return "no item";
    if (item.getAttribute("aria-disabled") === "true" || item.disabled) return "disabled";
    item.click();
    return "ok";
  }, label);
  if (state === "no item") throw new Error(`no "${label}" item in the More Actions menu`);
  if (state === "disabled") throw new Error(`"${label}" is disabled on this record`);
}

async function shootPanel(dir, name) {
  const panel = page.locator(PANEL).last();
  await panel.waitFor({ state: "visible", timeout: 20000 });
  await page.waitForTimeout(1800);
  await panel.screenshot({ path: resolve(ROOT, `public/images/${dir}/${name}.png`) });
  results.push({ name: `${dir}/${name}`, status: "ok" });
  console.log(`  \u2713 ${name}.png`);
}

async function closePanel() {
  for (let i = 0; i < 4; i++) {
    if (!(await page.locator(PANEL).count())) return;
    const cancel = page.locator('button:has-text("Cancel"), button:has-text("Close"), button:has-text("Back")').last();
    if (await cancel.count()) await cancel.click({ timeout: 5000 }).catch(() => {});
    await page.keyboard.press("Escape").catch(() => {});
    await page.waitForTimeout(900);
  }
}

/**
 * Put a conversation in the record's Chat panel.
 *
 * See the note at the top of this file: the panel is empty on every record on
 * staging and a real client reply cannot be produced. Every figure that shows
 * this sidebar gets the SAME two messages, so the article doesn't show one
 * screen with a conversation and the next, of the same job, without one.
 *
 * Called for its effect and allowed to fail quietly: a figure whose subject is
 * something else should not be lost because the chat panel had not painted.
 */
async function injectChat() {
  const built = await page.evaluate(() => {
    // Anchored on the Client/Team switch rather than on the empty-state text:
    // that text is not always in the DOM when the tab first paints, and keying
    // off it made this step fail for the wrong reason.
    const team = [...document.querySelectorAll("span, button")].find(
      (e) => (e.innerText || "").trim() === "Team"
    );
    if (!team) return "could not find the Client/Team switch, so not sure where the chat body is";
    const bar = team.closest("div")?.parentElement;
    let host = bar?.nextElementSibling;
    // Walk forward to the first sizeable block below the switch.
    while (host && host.getBoundingClientRect().height < 60) host = host.nextElementSibling;
    if (!host) return "could not find the chat body below the Client/Team switch";
    const bubble = (text, time, mine) => `
      <div style="display:flex;justify-content:${mine ? "flex-end" : "flex-start"};margin:14px 16px;">
        <div style="max-width:78%;">
          <div style="background:${mine ? "#3C40BC" : "#FFFFFF"};color:${mine ? "#FFFFFF" : "#27274A"};
                      border:1px solid ${mine ? "#3C40BC" : "rgba(39,39,74,0.10)"};
                      border-radius:14px;padding:10px 14px;font-size:14px;line-height:1.45;">${text}</div>
          <div style="font-size:12px;color:rgba(39,39,74,0.45);margin-top:6px;text-align:${mine ? "right" : "left"};">${time}</div>
        </div>
      </div>`;
    // Two messages, not three: a third was clipped by the bottom of the panel,
    // and one each way is all the figure needs to show.
    host.innerHTML =
      bubble("Morning — we're booked in for Sunday at 10. The crew will call when they're on the way.", "Sep 5, 2026, 9:12 AM", true) +
      bubble("Perfect, thank you. I'll leave the side gate unlocked so they can get to the back door.", "Sep 5, 2026, 9:31 AM", false);
    return "ok";
  });
  if (built !== "ok") console.log(`    ! chat not injected here: ${built}`);
  else await page.waitForTimeout(700);
  return built === "ok";
}

await step("Job overview", async () => {
  await openJob();
  await injectChat();
  await shoot("jobs", "03-job-detail", { settle: 1500 });
});

await step("Job visits", async () => {
  await openJob();
  await clickTab("Visits");
  // Wait for the table itself. Clicking the tab is not the same as the table
  // being painted, and evaluating too early found no row at all.
  await page.waitForSelector("table tbody tr", { timeout: 20000 });
  await page.waitForTimeout(1500);
  // Expand the visit so its timesheet records show: the point of the figure is
  // the four entries and their notes, not the summary row.
  const expanded = await page.evaluate(() => {
    const row = document.querySelector("table tbody tr");
    if (!row) return false;
    const btns = [...row.querySelectorAll("button")].filter((b) => b.querySelector("svg"));
    if (!btns.length) return false;
    btns[0].click();
    return true;
  });
  if (!expanded) throw new Error("no expand control on the visit row");
  await page.waitForTimeout(3500);
  await injectChat();
  await shoot("jobs", "04-job-visits", { settle: 1200 });
});

await step("Job checklist", async () => {
  await openJob();
  await clickTab("Checklist");
  // See the note at the top of this file. Reversing was the obvious fix and it
  // is NOT enough: the displayed order is not the logical order backwards, so
  // flipping it still puts "Take after photos" before "Adjust the hinges".
  // The rows are therefore placed in the sequence this job would actually
  // follow. That ordering is a judgement call for the figure, not data.
  const ORDER = [
    "Adjust the hinges and strike plate",
    "Check the seal and weatherstripping",
    "Take after photos",
    "Update job notes",
    "Load unused materials back in the van",
    "Send the invoice and confirm the payment",
  ];
  const sorted = await page.evaluate((order) => {
    // Deterministic: find each row's text leaf, compute the deepest ancestor
    // COMMON to all of them (that is the list), then each row is the child of
    // that list which contains its leaf. Climbing a fixed number of levels
    // failed because the rows sit at different depths.
    const leaves = order.map((text) =>
      [...document.querySelectorAll("div, p, span, li")].find(
        (e) => e.children.length === 0 && (e.innerText || "").trim() === text
      )
    );
    if (leaves.some((l) => !l)) return { ok: false, found: leaves.filter(Boolean).length, of: order.length };

    const chain = (el) => { const c = []; for (let n = el; n; n = n.parentElement) c.unshift(n); return c; };
    const chains = leaves.map(chain);
    let common = null;
    for (let i = 0; i < chains[0].length; i++) {
      const node = chains[0][i];
      if (chains.every((c) => c[i] === node)) common = node; else break;
    }
    if (!common) return { ok: false, reason: "no common ancestor" };

    const rows = leaves.map((leaf) => [...common.children].find((child) => child.contains(leaf)));
    if (rows.some((r) => !r)) return { ok: false, reason: "a row is not a direct child of the list" };
    if (new Set(rows).size !== rows.length) return { ok: false, reason: "rows collapsed to the same child — the common ancestor is too high" };
    rows.forEach((r) => common.appendChild(r));
    return { ok: true, moved: rows.length };
  }, ORDER);
  if (!sorted.ok) throw new Error(`could not reorder the checklist: ${JSON.stringify(sorted)}`);
  console.log(`    (checklist put in work order for the figure: ${sorted.moved} rows)`);
  await page.waitForTimeout(800);
  await injectChat();
  await shoot("jobs", "06-job-checklist", { settle: 1000 });
});

await step("Job invoices tab", async () => {
  await openJob();
  await clickTab("Invoices");
  await injectChat();
  await shoot("jobs", "05-job-invoices", { settle: 1200 });
});

await step("Client chat", async () => {
  await openJob();
  if (!(await injectChat())) throw new Error("the chat panel never painted, so there was nowhere to put the conversation");
  // Crop to the chat card itself. A full-page shot spends nine tenths of its
  // width on the job behind it, and the article already has that picture.
  const box = await page.evaluate(() => {
    const input = [...document.querySelectorAll("input, textarea")].find((x) =>
      /type a message/i.test(x.getAttribute("placeholder") || "")
    );
    const team = [...document.querySelectorAll("span, button")].find((e) => (e.innerText || "").trim() === "Team");
    if (!input || !team) return null;
    // The smallest element that contains both the Client/Team switch and the
    // message box is the chat card.
    let el = input;
    while (el && !el.contains(team)) el = el.parentElement;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.left - 8, y: r.top - 8, width: r.width + 16, height: r.height + 16 };
  });
  if (!box) throw new Error("could not measure the chat card");
  await page.waitForTimeout(400);
  await page.screenshot({ path: resolve(ROOT, "public/images/jobs/07-client-chat.png"), clip: box });
  results.push({ name: "jobs/07-client-chat", status: "ok" });
  console.log("  ✓ 07-client-chat.png");
});

await step("Job more actions", async () => {
  await openJob();
  await injectChat();
  // Complete job, Reschedule, Send to Client, Cancel job, Download PDF and
  // Delete all live in this one menu. One figure of it open covers all six; a
  // figure each would be six pictures of the same dropdown.
  await clickMoreActions();
  await page.waitForTimeout(1500);
  await shoot("jobs", "09-more-actions", { settle: 300 });
});

await step("Send to client", async () => {
  await openJob();
  await clickMoreActions();
  await clickMenuItem("Send to Client");
  await shootPanel("jobs", "10-send-to-client");
  await closePanel();
});

await step("Edit job", async () => {
  await openJob();
  // Edit is a button at the top of the job's Overview card — not in the More
  // Actions menu, and not only on the list row.
  const ok = await page.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find(
      (x) => x.innerText.trim() === "Edit" && x.getBoundingClientRect().left > 260 && x.offsetParent
    );
    if (!b) return false;
    b.click();
    return true;
  });
  if (!ok) throw new Error("no Edit button on the job's Overview card");
  await shootPanel("jobs", "12-edit-job-panel");
  await closePanel();
});

await step("Job status", async () => {
  await openJob();
  await injectChat();
  // The status next to the job's name is a CONTROL, not a label: this is where
  // a job moves from one state to the next. Opened to show the ten states it
  // can be in; none is chosen.
  const ok = await page.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find((x) => {
      const r = x.getBoundingClientRect();
      return x.offsetParent && r.top < 200 && r.left > 400 && r.left < 1000 &&
             /^(draft|scheduled|pending|confirmed|en route|arrived|started|paused|completed|cancell?ed)$/i.test(x.innerText.trim());
    });
    if (!b) return false;
    b.click();
    return true;
  });
  if (!ok) throw new Error("no status control next to the job name");
  await page.waitForTimeout(1500);
  await shoot("jobs", "11-job-status", { settle: 300 });
});

await step("Complete job", async () => {
  await openJob();
  await injectChat();
  // Completing a job is not a bare status change: the app stops and asks you to
  // review the job's checklist(s) first, which is the whole point of attaching
  // one. That dialog is the figure.
  //
  // PHOTOGRAPHED AND CANCELLED. "Complete job" is never clicked and no box is
  // ticked — the checklist belongs to a real job.
  await clickMoreActions();
  await clickMenuItem("Complete job");
  await shootPanel("jobs", "13-complete-job");
  await closePanel();
});

await step("Invoice from this job", async () => {
  await page.goto(`${BASE}/invoices/${INVOICE_ID}`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(10000);
  await hideAccountChrome();
  await injectChat();
  await shoot("invoices", "07-invoice-paid", { settle: 1500 });
});

await step("Invoice payments", async () => {
  await page.goto(`${BASE}/invoices/${INVOICE_ID}`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(10000);
  await hideAccountChrome();
  await clickTab("Payments");
  await injectChat();
  await shoot("invoices", "08-invoice-payments", { settle: 1200 });
});

await browser.close();

console.log("\n— summary —");
const ok = results.filter((r) => r.status === "ok").length;
for (const r of results) console.log(`${r.status.padEnd(8)} ${r.name}${r.reason ? ` (${r.reason})` : ""}`);
console.log(`\n${ok} captured, ${results.length - ok} failed`);
process.exit(results.some((r) => r.status === "failed") ? 1 : 0);
