/**
 * A clean, populated day for the Dashboard, Scheduler and Map figures.
 *
 * The account has 183 real jobs, with real properties, clients, crews and
 * coordinates. What it does not have is a day that READS well: the names are
 * "JOB-1037", and the busiest day runs from 1 AM to 3 AM with two jobs
 * overlapping at 7 PM. A figure of that teaches nobody how the scheduler works.
 *
 * So the real jobs are re-dressed rather than invented: the property, the
 * client, the phone, the coordinates, the crew and its lead all stay exactly as
 * they are on staging. Only three things are rewritten, in the browser, after
 * the response arrives and before the app reads it:
 *
 *   - the name, to the trade of the crew doing it
 *   - the start and stop, into business hours, nothing over two hours
 *   - the status, so the figure shows more than one
 *
 * Nothing is written to staging. A reload shows the account as it is. This is
 * recorded in docs/FIGURES.md, with the rest of the arranged figures.
 */

/** Trade-appropriate names, keyed by the crew doing the work. */
export const JOB_NAMES = {
  "Plumbing Crew": ["Sink Leak Repair", "Heater Flush"],
  "Plumbing Team": ["Toilet Install", "Disposal Install"],
  "Furniture Assembly Team": ["Wardrobe Build", "Desk Setup"],
  "Emergency Repair Team": ["Burst Pipe Repair", "Storm Damage Fix"],
  "Property Services": ["Unit Turnover", "Site Inspection"],
  "Electrical Services": ["Fan Install", "Outlet Repair"],
  "Drywall & Paint Team": ["Drywall Patch", "Wall Repaint"],
  "Carpentry Crew": ["Door Fitting", "Deck Repair"],
  "Remodeling Team": ["Vanity Swap", "Backsplash Tiling"],
  "Maintenance Crew": ["Routine Visit", "Filter Change"],
  "Installation Team": ["TV Mounting", "Thermostat Install"],
  "Home Repair Crew": ["Hinge Repair", "Screen Repair"],
  "Day Porter Crew": ["Lobby Porter Shift", "Common Area Tidy"],
  "Laundry & Linen Crew": ["Linen Pickup", "Towel Restock"],
  "Trash & Recycling Crew": ["Bin Cleaning", "Recycling Pickup"],
  "Event Cleanup Crew": ["Event Cleanup", "Venue Reset"],
  "Gutter Guard Team": ["Gutter Cleaning", "Guard Install"],
  "Climate Control Team": ["AC Tune-Up", "Thermostat Check"],
  "Movers Team": ["Apartment Move", "Delivery Run"],
  "Roofing team": ["Leak Inspection", "Shingle Repair"],
  "HVAC Team": ["Furnace Check", "Duct Cleaning"],
  "Vacation Home Cleaning": ["Turnover Clean", "Check-In Prep"],
  "Upholstery & Fabric Care": ["Sofa Clean", "Rug Shampoo"],
  "Post-Construction": ["Site Clean", "Debris Removal"],
  "Standard Cleaning": ["House Cleaning", "Weekly Clean"],
  "Deep Cleaning": ["Deep Clean", "Move-Out Clean"],
};

/**
 * Slots as [startH, startM, endH, endM].
 *
 * Nothing over two hours, everything inside business hours, and a mix of
 * one-job and two-job crews so the day reads like a real schedule and not like
 * a pattern. Deliberately staggered, so the figure shows the columns offset
 * from each other rather than in a block.
 */
export const PATTERNS = [
  [[9, 0, 11, 0], [12, 30, 14, 0]],
  [[9, 30, 11, 0], [13, 0, 15, 0]],
  [[10, 0, 12, 0]],
  [[9, 0, 10, 30], [11, 30, 13, 30]],
  [[10, 30, 12, 0], [14, 0, 15, 30]],
  [[11, 0, 13, 0]],
  [[9, 0, 10, 30], [12, 0, 14, 0]],
];

/** A spread of statuses, so the figure is not a wall of one colour. */
const STATUSES = ["SCHEDULED", "CONFIRMED", "STARTED", "SCHEDULED", "EN_ROUTE", "SCHEDULED", "ARRIVED"];

/**
 * Rows that are somebody's test data and do not belong in a published figure.
 *
 * Staging is shared, so the client list carries fixtures other people left
 * behind: names like "UserContact Only Co 5", addresses that resolve to
 * nothing, and `client_gate_5d7530@example.com` inboxes. A popover showing one
 * of those is the first thing a reader notices.
 */
export const SKIP_CLIENTS = /mario bros|lulu lemon|client quick|awdsad|john doe|test|usercontact|only co|^client\b|gate|example\.com|qa\b|demo\b|asd|\d{4,}/i;

/**
 * How presentable a real job is as the source for a figure.
 *
 * Higher is better. A job that scores zero still gets used if nothing else is
 * left, but the first crew's first slot, which is the card the popover figure
 * clicks, should be the best one available.
 */
function score(job) {
  let n = 0;
  const client = job.client || {};
  if (client.companyName && !SKIP_CLIENTS.test(client.companyName)) n += 4;
  if (client.companyPhone || client.users?.[0]?.phone) n += 2;
  const email = client.companyEmail || client.users?.[0]?.email || "";
  if (email && !SKIP_CLIENTS.test(email)) n += 2;
  // Staging has clients whose contact email belongs to somebody else, which in
  // a popover reads as "Lucia Navarro, andres.morales@...". Prefer a record
  // whose email at least shares a name with the client on it.
  const localPart = email.split("@")[0].toLowerCase();
  const tokens = (client.companyName || "").toLowerCase().split(/\s+/).filter((t) => t.length > 2);
  if (localPart && tokens.some((t) => localPart.includes(t))) n += 3;
  if (job.property?.address1 && job.property?.city && job.property?.state) n += 2;
  if (job.property?.photoUrl) n += 2;
  if (job.crew?.users?.some((u) => u.isCrewLead)) n += 1;
  return n;
}

const pad = (n) => String(n).padStart(2, "0");

/** The account is America/Phoenix, which does not observe DST, so the offset is fixed. */
export const TZ_OFFSET = "-07:00";

export const at = (day, h, m) => `${day}T${pad(h)}:${pad(m)}:00${TZ_OFFSET}`;

/** Today in the account's timezone, as YYYY-MM-DD. */
export function accountToday() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Phoenix", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date());
  const get = (t) => parts.find((p) => p.type === t).value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/**
 * Re-dress a pool of real jobs into one well-filled day.
 *
 * `pool` is what the API returned, untouched. `crewOrder` decides which crews
 * get a column and in what order; pass the crews you want on screen, because a
 * day view with 26 columns is unreadable.
 */
export function buildDay(pool, { day = accountToday(), crews, maxCrews = 7 } = {}) {
  const usable = pool
    .filter((j) => j.property?.address1 && j.client?.companyName && !SKIP_CLIENTS.test(j.client.companyName))
    .sort((a, b) => score(b) - score(a));
  if (!usable.length) return [];

  // Prefer crews we have a trade name for, so no column is called "Service Visit".
  const named = (crews || []).filter((c) => JOB_NAMES[c.name]);
  const chosen = (named.length ? named : crews || []).slice(0, maxCrews);

  const out = [];
  let k = 0;
  chosen.forEach((crew, i) => {
    const slots = PATTERNS[i % PATTERNS.length];
    const names = JOB_NAMES[crew.name] || ["Service Visit", "Follow-up Visit"];
    slots.forEach(([sh, sm, eh, em], j) => {
      const source = usable[k % usable.length];
      k++;
      out.push({
        ...source,
        id: source.id,
        name: names[j % names.length],
        status: STATUSES[(i + j) % STATUSES.length],
        scheduledStartDatetime: at(day, sh, sm),
        scheduledStopDatetime: at(day, eh, em),
        crew: { ...(source.crew || {}), id: crew.id, name: crew.name, color: crew.color,
                users: source.crew?.users || [], __typename: "Crew" },
        isRecurringTemplate: false,
        parent_job_id: null,
        isQuickAdd: false,
      });
    });
  });
  return out;
}

/**
 * The stat-card series.
 *
 * The real trend is almost all zeros around one 80-job week, so the bars read
 * as flat with a single spike and profit fell to zero last week, which paints a
 * red "down 100%" badge on a card whose job is to explain what the badge means.
 * A plausible quarter instead, every card ending on an up week.
 */
export const TREND_SERIES = {
  totalJobs:            [11, 14, 12, 17, 15, 19, 16, 21, 18, 20, 17, 19],
  realProfit:           [298000, 452000, 361000, 518000, 402000, 587000, 455000, 621000, 498000, 574000, 506000, 598000],
  pendingInvoices:      [4, 6, 5, 7, 5, 8, 6, 7, 5, 6, 5, 6],
  totalPotentialProfit: [121000, 196000, 158000, 232000, 171000, 249000, 188000, 262000, 207000, 241000, 219000, 233000],
};


/**
 * The PLAN for a believable "Upcoming Jobs" list: name, dates, status and crew
 * per row, and nothing else.
 *
 * Deliberately not whole job objects. The open-items card reads a different
 * fragment from the scheduler, so a hand-built object is missing fields Apollo
 * asked for and every row renders as "Untitled Job". The caller clones a real
 * row from the response and applies one of these to it.
 */
export function buildUpcomingPlan(crews, count = 8) {
  const named = (crews || []).filter((c) => JOB_NAMES[c.name]);
  if (!named.length) return [];
  const statuses = ["SCHEDULED", "CONFIRMED", "SCHEDULED", "PENDING", "SCHEDULED", "CONFIRMED"];
  const base = new Date(`${accountToday()}T12:00:00${TZ_OFFSET}`);
  const rows = [];
  for (let i = 0; i < count; i++) {
    const crew = named[i % named.length];
    const names = JOB_NAMES[crew.name];
    const d = new Date(base);
    d.setDate(d.getDate() + Math.floor(i / 2) + 1);
    if (d.getDay() === 0) d.setDate(d.getDate() + 1);
    const day = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const h = i % 2 ? 13 : 9;
    rows.push({
      name: names[i % names.length],
      status: statuses[i % statuses.length],
      start: at(day, h, 0),
      stop: at(day, h + 2, 0),
      crew: { id: crew.id, name: crew.name, color: crew.color },
    });
  }
  return rows.sort((a, b) => a.start.localeCompare(b.start));
}

/**
 * The same day's work, spread across the working week.
 *
 * A Week figure built from the Day fixture puts every card in one column, which
 * is the one thing the week view is not for. Monday to Friday of the week that
 * contains `day`, two or three jobs a day.
 */
export function buildWeek(pool, { day = accountToday(), crews } = {}) {
  const base = new Date(`${day}T12:00:00${TZ_OFFSET}`);
  const monday = new Date(base);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));

  const out = [];
  for (let d = 0; d < 5; d++) {
    const date = new Date(monday);
    date.setDate(date.getDate() + d);
    const iso = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    // Rotate the crew list per day, or every column is the same three crews
    // doing the same three jobs.
    const named = (crews || []).filter((c) => JOB_NAMES[c.name]);
    const rotated = named.length ? [...named.slice(d * 2), ...named.slice(0, d * 2)] : crews;
    const made = buildDay(pool, { day: iso, crews: rotated, maxCrews: d % 2 ? 2 : 3 });
    out.push(...made.map((j, i) => ({ ...j, id: `${j.id}-w${d}-${i}` })));
  }
  return out;
}
