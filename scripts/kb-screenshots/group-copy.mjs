/**
 * Knowledge base figures for "Copy from group" on estimates and invoices.
 *
 * The control has two homes and they do not look the same:
 *   - the ADD drawer, a sub-panel with a picker and no item list, because the
 *     Services and Products panels under it already show what arrived
 *   - the RECORD, a card that lists the group's items before you commit
 *
 * Run (develop, where the feature works; on staging api-staging fails to
 * resolve Group.serviceItems, see API-1217):
 *
 *   node scripts/kb-screenshots/group-copy.mjs
 *   KB_ONLY=estimate-record node scripts/kb-screenshots/group-copy.mjs
 *
 * Env: KB_BASE_URL, KB_EMAIL, KB_PASSWORD, KB_GROUP (the group to show),
 *      KB_ESTIMATE_ID / KB_INVOICE_ID (open a known record directly).
 *
 * READ-ONLY. The add drawer is filled in to reach step two and is CANCELLED.
 * Copy is photographed, never pressed. Save is never pressed.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const BASE = process.env.KB_BASE_URL || "https://app-develop.directhomeservice.com";
const VIEWPORT = { width: 1440, height: 980 };

const email = process.env.KB_EMAIL;
const password = process.env.KB_PASSWORD;
if (!email || !password) { console.error("Missing KB_EMAIL / KB_PASSWORD."); process.exit(1); }
const ONLY = (process.env.KB_ONLY || "").split(",").map((s) => s.trim()).filter(Boolean);
const wanted = (n) => !ONLY.length || ONLY.includes(n);
const TARGET_GROUP = process.env.KB_GROUP || null;

const results = [];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: VIEWPORT, deviceScaleFactor: 2 });
page.setDefaultNavigationTimeout(90000);

/**
 * The Groups panel, found by WHAT IT CONTAINS.
 *
 * The sidebar has an Inventory > Groups link whose text is also exactly
 * "Groups". Ruling it out by x position needs a threshold, and the one used
 * before (x > 330) was wider than the sidebar at 1440, so it declared the card
 * missing on records that plainly had it. The card always carries the picker
 * or its one-line explanation; that is the test.
 */
const FIND_CARD = `
  (() => {
    // When a drawer is open the page behind it keeps its own Groups card in
    // the DOM. Searching the whole document found that one through the
    // overlay and reported a step the drawer had never reached.
    const drawer = [...document.querySelectorAll("div")].find((d) => {
      const r = d.getBoundingClientRect();
      return r.width > 380 && r.width < 900 && r.height > 500 && r.right > window.innerWidth - 40
        && /Step \\d of \\d|Service Items/i.test(d.innerText || "");
    });
    const scope = drawer || document;
    // The heading may wrap its text in a span, so leaf-only matching missed the
    // real card and left only the sidebar link, whose ancestors are the whole
    // page: that is how this figure came out full-page twice.
    const heads = [...scope.querySelectorAll("div,span,p,h2,h3,h4")].filter(
      (e) => /^Groups$/.test((e.textContent || "").trim()) &&
             e.children.length <= 1 &&
             !e.closest("nav, aside, a") &&
             e.getBoundingClientRect().height > 0
    );
    // The TIGHTEST ancestor that still holds the picker, not the first one
    // wide enough: climbing greedily returned the whole content column, so
    // the figure came out as a full page with the top bar in it.
    let best = null;
    for (const head of heads) {
      let el = head;
      for (let up = 0; up < 10 && el.parentElement; up++) {
        el = el.parentElement;
        const r = el.getBoundingClientRect();
        if (r.width < 320) continue;
        // Once a group is chosen the picker shows its name and the hint is
        // replaced by the item list, so neither of the two original markers is
        // on the card any more. The summary line is.
        if (!/Select Group|Add items from a group|will be copied|Nothing to copy/i.test(el.innerText || "")) continue;
        const area = r.width * r.height;
        if (!best || area < best.area) best = { head, card: el, area };
        break;
      }
    }
    return best ? { head: best.head, card: best.card } : null;
  })()`;

const hasCard = () => page.evaluate(new Function(`
  const f = ${FIND_CARD};
  if (!f) return false;
  f.head.scrollIntoView({ block: "center" });
  return true;
`));

const cardBox = (pad = 6) => page.evaluate(new Function(`
  const f = ${FIND_CARD};
  if (!f) return null;
  const r = f.card.getBoundingClientRect();
  const y = Math.max(0, r.y - ${pad});
  return { x: Math.max(0, r.x - ${pad}), y, width: r.width + ${pad} * 2,
           height: Math.min(r.height + ${pad} * 2, window.innerHeight - y - 2) };
`));

/**
 * The drawer alone, not the page behind it.
 *
 * A full-page shot of a drawer publishes at the article's column width, where
 * the panel is a third of the frame and nothing in it is legible.
 */
const drawerBox = (pad = 4) => page.evaluate(new Function(`
  const panels = [...document.querySelectorAll("div")].filter((d) => {
    const r = d.getBoundingClientRect();
    return r.width > 360 && r.width < 1000 && r.height > 480
      && r.right > window.innerWidth - 60 && /Step \\d of \\d|Add new|Create Invoice|Edit /i.test(d.innerText || "");
  });
  if (!panels.length) return null;
  // The outermost of the nested matches, so the header and footer come too.
  const r = panels.reduce((a, b) => (a.getBoundingClientRect().height >= b.getBoundingClientRect().height ? a : b))
                  .getBoundingClientRect();
  const x = Math.max(0, r.x - ${pad}), y = Math.max(0, r.y - ${pad});
  return { x, y, width: Math.min(r.width + ${pad} * 2, window.innerWidth - x),
           height: Math.min(r.height + ${pad} * 2, window.innerHeight - y) };
`));

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

function save(dir, name, clip) {
  // A null clip used to fall through to a full-page shot without a word, which
  // is how two card figures were published as whole screens.
  if (clip === null) console.log(`    ! no box measured for ${name}, falling back to the whole page`);
  mkdirSync(resolve(ROOT, `public/images/${dir}`), { recursive: true });
  return page.screenshot({ path: resolve(ROOT, `public/images/${dir}/${name}.png`), ...(clip ? { clip } : {}) })
    .then(() => { results.push({ name: `${dir}/${name}`, status: "ok" }); console.log(`  ✓ ${dir}/${name}.png`); });
}

/**
 * Choose from one of the app's custom selects.
 *
 * Clicked by position: locator.click waits for actionability and hangs on
 * controls inside the drawer. Options are matched against a snapshot taken
 * before the click, and the picker's own "Quick Add: New Client" row is
 * excluded, because clicking it opens a client form inside the drawer.
 */
/**
 * Choose from one of the drawer's selects.
 *
 * The field is an <input> carrying the placeholder, e.g.
 * `input[placeholder="Select client"]`. Matching the placeholder as page TEXT
 * instead found the estimates table behind the drawer and clicked a column
 * header, which is why the client never got set however the option was
 * clicked afterwards.
 */
/**
 * Choose from one of the drawer's selects.
 *
 * Two traps here, both of which cost a run each:
 *
 *  - the field is NOT an input until you open it. Closed, it is a div showing
 *    the placeholder; opened, a search input with the same placeholder
 *    appears. So the click has to go to the div and the typing to the input.
 *  - the placeholder text also exists on the page BEHIND the drawer (the list
 *    view's own column headers and cells), and an unscoped text match clicked
 *    a table header. Everything is scoped to the drawer's box.
 */
async function pick(placeholder, preferred = null) {
  // On a record page there is no drawer, so the scope is the whole viewport
  // minus the sidebar. Requiring a drawer made this time out on the record.
  const panel = page.locator("div.relative.transform.overflow-hidden.shadow-xl").last();
  const drawer = (await panel.count())
    ? await panel.boundingBox().catch(() => null)
    : null;
  const scope = drawer || { x: 300, y: 0, width: 1140, height: 980 };

  const spot = await page.evaluate(({ text, d }) => {
    const hit = [...document.querySelectorAll("div,span,p,input")].find((e) => {
      const own = e.tagName === "INPUT" ? (e.placeholder || "") : (e.children.length ? "" : e.textContent || "");
      if (own.trim().toLowerCase() !== text.toLowerCase()) return false;
      const r = e.getBoundingClientRect();
      return r.x >= d.x - 4 && r.right <= d.x + d.width + 4 && r.y >= d.y && r.height > 0;
    });
    if (!hit) return null;
    const r = hit.getBoundingClientRect();
    return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) };
  }, { text: placeholder, d: scope });
  if (!spot) return "(not in the drawer)";

  await page.mouse.click(spot.x, spot.y);
  await page.waitForTimeout(1300);

  if (preferred) {
    const input = page.getByPlaceholder(placeholder, { exact: false }).first();
    if (await input.count()) {
      await input.type(preferred.slice(0, 16), { delay: 45 }).catch(() => {});
      await page.waitForTimeout(1600);
    }
  }

  const option = await page.evaluate(({ a, d }) => {
    const CREATE = /quick add|add new|create new/i;
    const JUNK = /^a{3,}|qa\d|api\d|^name\s*\d+$|^test|\d{6,}|asd|malqmq|^zzz|^dsdfs/i;
    const rows = [...document.querySelectorAll('li, [role="option"], [role="listbox"] div, ul > div')]
      .map((el) => ({ el, r: el.getBoundingClientRect(), text: (el.innerText || "").trim() }))
      .filter(({ el, r, text }) => {
        if (!text || text.length > 90 || CREATE.test(text)) return false;
        if (el.closest("nav, aside") || r.width < 60 || r.height < 12 || r.height > 90) return false;
        if (r.x < d.x - 40) return false;                 // never the page behind
        return r.top > a.y - 10 && r.top < a.y + 440;
      })
      .sort((p, q) => p.r.top - q.r.top);
    const clean = rows.filter(({ text }) => !JUNK.test(text));
    const hit = (clean.length ? clean : rows)[0];
    if (!hit) return null;
    const r = hit.el.getBoundingClientRect();
    return { x: Math.round(r.x + Math.min(r.width / 2, 120)), y: Math.round(r.y + r.height / 2), text: hit.text };
  }, { a: spot, d: scope });

  if (!option) return "(no options appeared)";
  await page.mouse.click(option.x, option.y);
  await page.waitForTimeout(1700);
  return option.text;
}

/** Open the group picker and leave it open. Returns how many options showed. */
async function openGroupPicker() {
  const a = await page.evaluate(() => {
    const hit = [...document.querySelectorAll("div,span,p,input")].find((e) => {
      const own = e.tagName === "INPUT" ? (e.placeholder || "") : (e.children.length ? "" : e.textContent || "");
      return own.trim() === "Select Group" && e.getBoundingClientRect().height > 0;
    });
    if (!hit) return null;
    const r = hit.getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width, height: r.height };
  });
  if (!a) throw new Error("no Select Group control on screen");
  await page.mouse.click(Math.round(a.x + a.width / 2), Math.round(a.y + a.height / 2));
  await page.waitForTimeout(1900);
  return page.evaluate((a) => [...document.querySelectorAll('li, [role="option"], [role="listbox"] div, ul > div')]
    .filter((el) => {
      const r = el.getBoundingClientRect();
      return (el.innerText || "").trim() && r.width > 60 && r.height > 12 && r.height < 90
        && r.bottom > a.y - 520 && r.top < a.y + a.height + 520;
    }).length, a);
}

/** The card plus whatever dropped out of it, since the list escapes the card. */
async function cardWithListBox() {
  return page.evaluate(new Function(`
    const f = ${FIND_CARD};
    if (!f) return null;
    const cr = f.card.getBoundingClientRect();
    const rows = [...document.querySelectorAll('li, [role="option"], [role="listbox"] div, ul > div')]
      .map((el) => el.getBoundingClientRect())
      .filter((r) => r.width > 60 && r.height > 12 && r.height < 90 && r.top > cr.y - 40 && r.top < cr.bottom + 520);
    const left = Math.min(cr.x, ...rows.map((r) => r.left));
    const right = Math.max(cr.right, ...rows.map((r) => r.right));
    const bottom = Math.max(cr.bottom, ...rows.map((r) => r.bottom));
    const x = Math.max(0, left - 8), y = Math.max(0, cr.y - 8);
    return { x, y, width: Math.min(right - x + 8, window.innerWidth - x),
             height: Math.min(bottom - y + 8, window.innerHeight - y - 2) };
  `));
}

/**
 * Open the picker and click a group by name.
 *
 * Reuses openGroupPicker, which is the one path that reliably opens the list;
 * typing into the field to filter it kept ending with no options at all.
 */
async function chooseGroup(name) {
  const count = await openGroupPicker();
  const picked = await page.evaluate((target) => {
    const rows = [...document.querySelectorAll('li, [role="option"], [role="listbox"] div, ul > div')]
      .map((el) => ({ el, r: el.getBoundingClientRect(), text: (el.innerText || "").trim() }))
      .filter(({ el, r, text }) => text && !el.closest("nav, aside") && r.width > 60 && r.height > 12 && r.height < 90);
    const hit = rows.find(({ text }) => text === target) || rows[0];
    if (!hit) return null;
    const r = hit.el.getBoundingClientRect();
    return { x: Math.round(r.x + Math.min(r.width / 2, 120)), y: Math.round(r.y + r.height / 2), text: hit.text };
  }, name);
  if (!picked) throw new Error(`the picker opened with ${count} rows but none could be clicked`);
  await page.mouse.click(picked.x, picked.y);
  await page.waitForTimeout(2500);
  const says = await page.evaluate(() => {
    const line = document.body.innerText.split("\n").find((l) =>
      /will be copied|already (on|have)|out of stock|no items|nothing to copy/i.test(l));
    return line ? line.trim() : "(no summary line)";
  });
  console.log(`    group "${picked.text}" -> ${says}`);
  if (/no items|nothing to copy/i.test(says)) throw new Error(`that group is empty here: ${says}`);
}

async function openRecord(section) {
  const id = section === "estimates" ? process.env.KB_ESTIMATE_ID : process.env.KB_INVOICE_ID;
  if (id) {
    await page.goto(`${BASE}/${section}/${id}`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(13000);
    await hideChrome();
    if (!(await hasCard())) throw new Error(`${section}/${id} shows no Groups card (record locked, or no groups on the account)`);
    await page.waitForTimeout(1000);
    return;
  }

  // No id given: walk the list. The card is absent on a read-only record, and
  // an estimate is read-only in Ready for Review, Approved and Expired, so the
  // rows whose status looks open are tried first.
  for (let attempt = 0; attempt < 8; attempt++) {
    await page.goto(`${BASE}/${section}`, { waitUntil: "domcontentloaded" });
    await page
      .waitForFunction(() => {
        const trs = [...document.querySelectorAll("table tbody tr")];
        return trs.length > 1 && trs[0].innerText.trim().length > 3;
      }, null, { timeout: 40000 })
      .catch(() => {});
    await page.waitForTimeout(2500);
    await hideChrome();
    const order = await page.evaluate(() => {
      const re = /draft|changes requested|unpaid|overdue|sent|viewed/i;
      const trs = [...document.querySelectorAll("table tbody tr")];
      const open = [], rest = [];
      trs.forEach((tr, i) => (re.test(tr.innerText || "") ? open : rest).push(i));
      return [...open, ...rest];
    });
    if (attempt >= order.length) break;
    await page.locator("table tbody tr").nth(order[attempt]).click({ timeout: 15000 });
    await page.waitForTimeout(12000);
    await hideChrome();
    if (await hasCard()) {
      console.log(`    opened ${page.url().split("/").pop()} (row ${order[attempt] + 1})`);
      return;
    }
  }
  throw new Error(`no ${section} record with a Groups card in the first rows`);
}

async function dismissDrawer() {
  for (let i = 0; i < 3; i++) {
    const cancel = page.locator('button:has-text("Cancel")').last();
    if (!(await cancel.count())) break;
    await cancel.click({ timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(900);
  }
  await page.keyboard.press("Escape").catch(() => {});
}

async function figure(key, fn) {
  if (!wanted(key)) return;
  try { await fn(); }
  catch (err) {
    const first = err.message.split("\n")[0];
    results.push({ name: key, status: "failed", reason: first });
    console.log(`  ✗ ${key}, ${first}`);
    await dismissDrawer();
  }
}

// ── sign in ──────────────────────────────────────────────────────────────────
await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
await page.fill("#email", email);
await page.fill("#password", password);
await page.click('button:has-text("Sign In")');
await page.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 60000 });
await page.waitForTimeout(7000);
console.log(`group in the figures: ${TARGET_GROUP || "(the first with items)"}`);

// ── the add drawer: step one filled, step two, and the Groups sub-panel ──────
/**
 * Step two of the add/edit drawer, reached through EDIT.
 *
 * Add and edit are the same drawer; edit opens it with the record's client,
 * property and crew already in it. Filling them from a blank form meant
 * driving three custom pickers whose option rows do not reliably commit, and
 * the invoice drawer additionally wants a Job, an issue date and a due date.
 * Edit skips all of it and shows the same sub-panel.
 *
 * Nothing is saved: the drawer is cancelled.
 */
/**
 * Step two of the ADD drawer, which is the only drawer that has the Groups
 * sub-panel: Edit is a single-step form (client, title, property, crew,
 * expiration) with no line items and no groups at all.
 *
 * Nothing is saved. The drawer is cancelled.
 */
async function addDrawer(section, dir, stepOne, stepTwo, groupsCrop, fields) {
  await page.goto(`${BASE}/${section}?add=true`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(9000);
  await hideChrome();
  await page.locator('button:has-text("Skip")').first().click({ timeout: 2500 }).catch(() => {});

  for (const [label, preferred] of fields) {
    console.log(`    ${label.split("|")[0]}: ${await pick(label, preferred)}`);
  }

  // Expiration Date is a switch, off by default.
  const sw = await page.evaluate(() => {
    const label = [...document.querySelectorAll("div,span,p,label")].find(
      (e) => e.children.length === 0 && /^Expiration Date$/i.test((e.textContent || "").trim()));
    const btn = label?.parentElement && [...label.parentElement.querySelectorAll("button, [role=switch]")][0];
    if (!btn) return null;
    const r = btn.getBoundingClientRect();
    return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) };
  });
  if (sw) { await page.mouse.click(sw.x, sw.y); await page.waitForTimeout(1500); console.log("    expiration: switched on"); }

  if (stepOne) {
    const panel = page.locator("div.relative.transform.overflow-hidden.shadow-xl").last();
    mkdirSync(resolve(ROOT, `public/images/${dir}`), { recursive: true });
    await panel.screenshot({ path: resolve(ROOT, `public/images/${dir}/${stepOne}.png`) });
    results.push({ name: `${dir}/${stepOne}`, status: "ok" });
    console.log(`  \u2713 ${dir}/${stepOne}.png`);
  }

  const next = await page.locator('button:has-text("Next Step")').last().boundingBox();
  if (!next) throw new Error("no Next Step button");
  await page.mouse.click(Math.round(next.x + next.width / 2), Math.round(next.y + next.height / 2));
  await page.waitForTimeout(5500);
  if (!(await hasCard())) {
    const asking = await page.evaluate(() => {
      const d = [...document.querySelectorAll("div")]
        .filter((x) => { const r = x.getBoundingClientRect(); return r.width > 380 && r.height > 400 && r.right > window.innerWidth - 40; })
        .sort((x, y) => x.innerText.length - y.innerText.length)
        .find((x) => /Step \d of/i.test(x.innerText || ""));
      return (d?.innerText || "").split("\n").map((l) => l.trim()).filter(Boolean).slice(0, 22);
    });
    throw new Error(`never reached the line items step; the drawer shows ${JSON.stringify(asking)}`);
  }

  if (stepTwo) {
    const panel = page.locator("div.relative.transform.overflow-hidden.shadow-xl").last();
    mkdirSync(resolve(ROOT, `public/images/${dir}`), { recursive: true });
    await panel.screenshot({ path: resolve(ROOT, `public/images/${dir}/${stepTwo}.png`) });
    results.push({ name: `${dir}/${stepTwo}`, status: "ok" });
    console.log(`  \u2713 ${dir}/${stepTwo}.png`);
  }
  if (groupsCrop) {
    console.log(`    dropdown: ${await openGroupPicker()} option(s)`);
    await save(dir, groupsCrop, await cardWithListBox());
    await page.keyboard.press("Escape").catch(() => {});
  }
  await dismissDrawer();
}

const CLIENT = process.env.KB_CLIENT || null;
await figure("estimate-add", () =>
  addDrawer("estimates", "estimates", "03-add-estimate-panel", "04-add-estimate-step2", "09-group-copy-add",
    [["Select client", CLIENT], ["Select Property", null], ["Select Crew", null]]));
await figure("invoice-add", () =>
  addDrawer("invoices", "invoices", null, "04-add-invoice-step2", "09-group-copy-add",
    [["Select client", CLIENT], ["Select Property", null], ["Select Job", null]]));

// ── the record: the picker open, and a group chosen with its items listed ────
await figure("estimate-record", async () => {
  await openRecord("estimates");
  console.log(`    dropdown: ${await openGroupPicker()} option(s)`);
  await save("estimates", "10-group-copy-record", await cardWithListBox());
  await page.keyboard.press("Escape").catch(() => {});
});

await figure("estimate-preview", async () => {
  await openRecord("estimates");
  await chooseGroup(TARGET_GROUP);
  await save("estimates", "11-group-copy-preview", await cardBox());
});

await figure("invoice-record", async () => {
  await openRecord("invoices");
  console.log(`    dropdown: ${await openGroupPicker()} option(s)`);
  await save("invoices", "10-group-copy-record", await cardWithListBox());
  await page.keyboard.press("Escape").catch(() => {});
});

await figure("invoice-preview", async () => {
  await openRecord("invoices");
  await chooseGroup(TARGET_GROUP);
  await save("invoices", "11-group-copy-preview", await cardBox());
});

console.log("\n" + results.map((r) => `${r.status === "ok" ? "ok    " : "FAILED"} ${r.name}${r.reason ? ` , ${r.reason}` : ""}`).join("\n"));
await browser.close();
