/**
 * Figure coverage report.
 *
 * Answers one question per article: which sections describe something the reader
 * has to DO, and of those, which have no figure?
 *
 * The rule, so this stops being ad hoc: a section gets a figure when it walks
 * the reader through a distinct UI surface, a list, a panel, a dialog, a tab, a
 * page. Sections that explain a concept, list where something is used, or
 * summarise actions do not.
 *
 * Headings are classified by their own wording. A heading that starts with a
 * verb of the kind a manual uses ("Adding a client", "Archiving and restoring")
 * is a surface; "Where invoices come from" or "Common actions" is not. The
 * SKIP list below is for the handful that read like actions but aren't.
 *
 *   node scripts/kb-figure-coverage.mjs            # every article
 *   node scripts/kb-figure-coverage.mjs clients-management
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// Headings that describe a surface the reader acts on.
const ACTION = /^(add|adding|creat|edit|editing|archiv|restor|delet|deleting|send|sending|import|export|updat|invit|inviting|assign|complet|track|attach|manag|resolv|turn|book|convert|duplicat|record|sharing|share|the .* list|the [a-z ]*record|the [a-z ]*panel|[a-z]+ added in a hurry|search|filter|sort)/i;

// Reads like an action but is prose, a concept, or a recap.
const SKIP = [
  /^overview$/i,
  /^common actions$/i,
  /^where .* (used|connect|show up|come from)/i,
  /^how .* (work|fit together)/i,
  /^statuses?$/i,
  /^columns?$/i,
  /^roles?$/i,
  /^vendor or manufacturer\?$/i,
  /^a note on/i,
  /^products you don't count$/i,
  /^the guided tour$/i,          // a tour that starts by itself; nothing to show
  /^the password$/i,
  /^the essentials$/i,
  /^the details$/i,
  /^sorting/i,                  // clicking a column header needs no picture
  /^search and (filters?|the role filter)$/i,
];

/**
 * Gaps we know about and cannot close from the current environment. Keeping them
 * here, with the reason, is what separates "nobody has done this yet" from
 * "this cannot be photographed today", otherwise the report cries wolf and
 * stops being read.
 */
const BLOCKED = {
  "clients-management": {
    "Inviting a client to the portal": "staging has no pending client invites, so there is no Invites tab or pending panel to photograph",
    "Importing clients from a CSV": "Import/Export CSV is hidden on the staging account by the isImportExportClientsHidden flag, so the buttons never render",
    "Exporting your client list": "same feature flag as the import above",
  },
  "services-management": {
    "Importing and exporting": "import/export is behind isImportExportServiceItemEnabled and is off on staging",
  },
  "products-management": {
    "Importing and exporting": "same feature flag as services",
    "Products added in a hurry": "the top-bar Quick Add panel has no Product tile, only Service Item. A product can only be quick-added from inside a product picker, which means being mid-estimate",
  },
  "estimates-management": {
    "Sharing a PDF": "Download Pdf is an item in the More Actions menu, shown in that figure",
    "Archiving and deleting": "both are items in the More Actions menu, shown in that figure",
  },
  "invoices-management": {
    "Sharing a PDF": "Download Pdf is an item in the More Actions menu, shown in that figure",
  },
  "jobs-management": {
    "Sending job details to the client": "the Send to Client panel itself is not published: its message body renders a literal \\n\\n instead of line breaks, and the client link it builds points at client-app-DEVELOP from staging. Both are reported as defects. The More Actions figure covers where the action lives; re-shoot the panel once they are fixed",
    "Tracking time": "starting the timer would write a timesheet record, and these scripts are read-only. Start Timer itself is visible in the job detail figure, in the header, it only exists while the job is still open",
  },
  "crews-management": {
    "Deleting a crew": "every crew on staging is assigned to work, so the delete button is disabled on all 26 rows and the confirmation cannot be opened",
  },
  "vendors-manufacturers-groups": {
    "Adding a vendor": "staging's sidebar does not expose Vendors, Manufacturers or Groups at all; develop does",
    "Adding a manufacturer": "same as above",
    "Creating a group": "same as above",
    "Deleting any of the three": "same as above",
  },
};

/**
 * Articles this report has nothing useful to say about.
 *
 * - Hidden articles are not in articles.js, so they have no card and no URL.
 *   Reporting gaps in something the reader cannot reach is how a report stops
 *   being read. They are skipped automatically, by reading articles.js.
 * - The mobile app is a Flutter app on a phone. Its figures cannot come from
 *   these Playwright scripts at all; they need a device or a simulator.
 */
const OUT_OF_SCOPE = {
  "mobile-app": "a Flutter app, its figures need a device or simulator, not these browser scripts",
};

const published = new Set(
  [...readFileSync(resolve(ROOT, "src/data/articles.js"), "utf8").matchAll(/id:\s*'([^']+)'/g)].map((m) => m[1])
);

const args = process.argv.slice(2).filter((a) => !a.startsWith("-"));
const files = args.length
  ? args.map((a) => a.replace(/\.html$/, "") + ".html")
  : readdirSync(resolve(ROOT, "public/content"))
      .filter((f) => f.endsWith(".html") && !f.endsWith("-es.html"));

let totalGaps = 0;
const report = [];

for (const file of files) {
  const path = resolve(ROOT, "public/content", file);
  if (!existsSync(path)) { console.error(`no such article: ${file}`); continue; }
  const id = file.replace(/\.html$/, "");
  const html = readFileSync(path, "utf8");

  // Only articles that have been rewritten carry figures at all; a Google Docs
  // export is a separate problem and is reported as such rather than as gaps.
  const isExport = /class="c\d/.test(html) || /images\/image\d+/.test(html);

  // Walk the document in order, tracking the current heading and whether a
  // figure or an anchor appeared before the next one.
  const tokens = [...html.matchAll(/<(h2|h3)>([^<]+)<\/\1>|<img [^>]*src="\/images\/[^"]+"|<!-- figure: ([^ ]+) -->/g)];
  const sections = [];
  let current = null;
  for (const t of tokens) {
    if (t[1]) {
      current = { level: t[1], title: t[2].trim(), figures: 0, anchors: 0 };
      sections.push(current);
    } else if (current) {
      if (t[3]) current.anchors++;
      else current.figures++;
    }
  }

  // A figure under an h3 covers the h2 it belongs to: "Adding a client" is
  // illustrated by the figures inside its own step sub-sections. Roll them up
  // before deciding what is missing, or every parent heading reads as a gap.
  for (let i = 0; i < sections.length; i++) {
    if (sections[i].level !== "h2") continue;
    let rolled = sections[i].figures;
    for (let j = i + 1; j < sections.length && sections[j].level === "h3"; j++) {
      rolled += sections[j].figures;
    }
    sections[i].rolled = rolled;
  }

  const gaps = sections.filter(
    (s) =>
      ACTION.test(s.title) &&
      !SKIP.some((re) => re.test(s.title)) &&
      (s.rolled ?? s.figures) === 0
  );

  if (!published.has(id)) {
    report.push({ id, hidden: true });
    continue;
  }
  if (OUT_OF_SCOPE[id]) {
    report.push({ id, outOfScope: OUT_OF_SCOPE[id] });
    continue;
  }

  const blocked = BLOCKED[id] || {};
  const open = gaps.filter((g) => !blocked[g.title]);
  const known = gaps.filter((g) => blocked[g.title]);
  report.push({ id, isExport, sections: sections.length, figures: sections.reduce((n, s) => n + s.figures, 0), open, known, blocked });
  if (!isExport) totalGaps += open.length;
}

for (const r of report) {
  if (r.hidden) {
    console.log(`\n${r.id} , hidden (not in articles.js), so not assessed`);
    continue;
  }
  if (r.outOfScope) {
    console.log(`\n${r.id} , out of scope: ${r.outOfScope}`);
    continue;
  }
  if (r.isExport) {
    console.log(`\n${r.id} , still a Google Docs export, not assessed`);
    continue;
  }
  if (!r.figures && !r.open.length && !r.known.length) continue;
  console.log(`\n${r.id}  ${r.figures} figure(s) across ${r.sections} section(s)`);
  if (!r.open.length) console.log("  every action section that CAN be photographed has a figure");
  for (const g of r.open) {
    console.log(`  MISSING  ${g.title}${g.anchors ? `  (anchor waiting: ${g.anchors})` : ""}`);
  }
  for (const g of r.known) {
    console.log(`  blocked  ${g.title}, ${r.blocked[g.title]}`);
  }
}

console.log(`\n${totalGaps} action section(s) missing a figure that could be taken today`);
