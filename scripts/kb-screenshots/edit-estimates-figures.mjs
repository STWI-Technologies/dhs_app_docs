/**
 * Retouches the published Estimates figures.
 *
 * Every other figure in this knowledge base is a straight recording of staging.
 * These four are not, and this script is the record of exactly what was changed
 * and where. It exists because Estimates on staging stopped loading and the
 * figures could not be re-shot with the data arranged; when it loads again,
 * arrange the record properly and re-shoot instead of running this.
 *
 * What it does, and why:
 *
 *   01-estimates-list, 02-estimates-filter
 *     , the first row's name reads "EST-1001" where the other nine rows carry a
 *       descriptive name, so the column published looking like missing data.
 *       Replaced with "Deep Cleaning".
 *     , Robert Smith is the one client in the list with the default blue
 *       silhouette. Replaced with one of the account's own portraits, the same
 *       set portraits.mjs paints from.
 *
 *   05-estimate-detail, 08-more-actions
 *     , the client has no phone on file, so the card published "Phone: —" next
 *       to a real email and read as a broken field. A 555 number is drawn in,
 *       the same one this client carries in the Appointments figures.
 *     , the Chat panel is empty ("No messages yet") and takes up a third of the
 *       figure. Two bubbles are drawn, one each way.
 *
 * Coordinates are in the figures' own pixels (2880x1800, a 2x capture of
 * 1440x900) and were measured off the images, not estimated.
 *
 * Run:  node scripts/kb-screenshots/edit-estimates-figures.mjs
 */
import { chromium } from "playwright";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { CLIENT_PHONES } from "./injections.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const DIR = resolve(ROOT, "public/images/estimates");
const PORTRAIT = "https://dhspublicstorage.blob.core.windows.net/dhs-staging-images/user-avatar-6a1ef19cb8af8b9d8cd25aec.png?v=2";
const PHONE = CLIENT_PHONES["emily johnson"];

const LIST_FIGURES = ["01-estimates-list.png", "02-estimates-filter.png"];
const DETAIL_FIGURES = ["05-estimate-detail.png", "08-more-actions.png"];

/** Measured off the figures. Both list figures share this geometry. */
const LIST = {
  // Wide enough for whatever was there AND for the longer name drawn over it:
  // a rect that only covered "EST-1001" left the tail of an earlier draw behind,
  // and the overlap read as bold. The NAME column runs to x 870.
  nameBox: { x: 218, y: 538, w: 500, h: 66 },
  nameAt: { x: 229, baseline: 579 },
  // "Kitchen repair" on the row below spans 180px; the new name is sized to match.
  reference: { text: "Kitchen repair", width: 180 },
  avatar: { cx: 941.5, cy: 691.5, r: 31.5 },
};

/** Measured off the figures. Both detail figures share this geometry. */
const DETAIL = {
  phoneBox: { x: 2220, y: 780, w: 520, h: 48 },
  phoneAt: { x: 2231, baseline: 812 },
  // The email line below it spans 298px; the number is sized to match.
  reference: { text: "emily@example.com", width: 298 },
  chat: { x: 2190, y: 1412, w: 622, h: 388 }, // to the figure edge: the empty state sat right on it
};

const CHAT = [
  { text: "Quote sent. The price holds for thirty days.", time: "Sep 11, 2026, 10:04 AM", mine: true },
  { text: "Looks good, go ahead and book it in.", time: "Sep 11, 2026, 10:52 AM", mine: false },
];

const portrait = Buffer.from(await (await fetch(PORTRAIT)).arrayBuffer()).toString("base64");

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(`<html><head>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500&display=swap" rel="stylesheet">
</head><body style="margin:0"></body></html>`);
await page.waitForTimeout(2500);

async function edit(file, kind) {
  const png = readFileSync(resolve(DIR, file)).toString("base64");
  const url = await page.evaluate(
    async ({ b64, portraitB64, kind, LIST, DETAIL, CHAT, PHONE }) => {
      // Inter, the app's own font, so drawn text matches the pixels around it
      // and the bubbles match the ones injected into the job figures.
      await document.fonts.load("400 30px Inter");
      await document.fonts.load("500 30px Inter");
      await document.fonts.ready;

      const load = (src) => new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.src = src; });
      const img = await load("data:image/png;base64," + b64);
      const c = document.createElement("canvas");
      c.width = img.width; c.height = img.height;
      const x = c.getContext("2d");
      x.drawImage(img, 0, 0);
      x.textBaseline = "alphabetic";

      /** Size a font so `text` comes out `width` wide, matching the line we copy. */
      const sizeToMatch = (text, width, weight = 400) => {
        x.font = `${weight} 30px Inter`;
        return (30 * width) / x.measureText(text).width;
      };

      if (kind === "list") {
        x.fillStyle = "#ffffff";
        x.fillRect(LIST.nameBox.x, LIST.nameBox.y, LIST.nameBox.w, LIST.nameBox.h);
        x.font = `400 ${sizeToMatch(LIST.reference.text, LIST.reference.width)}px Inter`;
        x.fillStyle = "rgb(13,13,18)";
        x.fillText("Deep Cleaning", LIST.nameAt.x, LIST.nameAt.baseline);

        const { cx, cy, r } = LIST.avatar;
        const face = await load("data:image/png;base64," + portraitB64);
        x.save();
        x.beginPath();
        x.arc(cx, cy, r + 0.5, 0, Math.PI * 2);
        x.fillStyle = "#ffffff";
        x.fill();
        x.clip();
        x.drawImage(face, cx - r, cy - r, r * 2, r * 2);
        x.restore();
      }

      if (kind === "detail") {
        // the phone
        x.fillStyle = "#ffffff";
        x.fillRect(DETAIL.phoneBox.x, DETAIL.phoneBox.y, DETAIL.phoneBox.w, DETAIL.phoneBox.h);
        x.font = `400 ${sizeToMatch(DETAIL.reference.text, DETAIL.reference.width)}px Inter`;
        x.fillStyle = "rgb(13,13,18)";
        x.fillText(PHONE, DETAIL.phoneAt.x, DETAIL.phoneAt.baseline);

        // the conversation
        const B = DETAIL.chat;
        x.fillStyle = "#ffffff";
        x.fillRect(B.x, B.y, B.w, B.h);

        const FONT = 27, LINE = 38, PAD_X = 28, PAD_Y = 20, GAP = 24, RADIUS = 28, TIME = 23;
        const maxBubble = Math.round(B.w * 0.78);
        const wrap = (text) => {
          x.font = `400 ${FONT}px Inter`;
          const words = text.split(" ");
          const lines = [];
          let line = "";
          for (const w of words) {
            const next = line ? `${line} ${w}` : w;
            if (x.measureText(next).width > maxBubble - PAD_X * 2 && line) { lines.push(line); line = w; }
            else line = next;
          }
          if (line) lines.push(line);
          return lines;
        };

        const laid = CHAT.map((m) => {
          const lines = wrap(m.text);
          x.font = `400 ${FONT}px Inter`;
          const w = Math.min(maxBubble, Math.max(...lines.map((l) => x.measureText(l).width)) + PAD_X * 2);
          return { ...m, lines, w, h: lines.length * LINE + PAD_Y * 2 };
        });
        const total = laid.reduce((n, m) => n + m.h + TIME + 10 + GAP, 0) - GAP;
        let y = B.y + B.h - 26 - total; // sit at the bottom of the panel, like a real thread

        const round = (rx, ry, rw, rh, r) => {
          x.beginPath();
          x.moveTo(rx + r, ry);
          x.arcTo(rx + rw, ry, rx + rw, ry + rh, r);
          x.arcTo(rx + rw, ry + rh, rx, ry + rh, r);
          x.arcTo(rx, ry + rh, rx, ry, r);
          x.arcTo(rx, ry, rx + rw, ry, r);
          x.closePath();
        };

        for (const m of laid) {
          const bx = m.mine ? B.x + B.w - 32 - m.w : B.x + 32;
          round(bx, y, m.w, m.h, RADIUS);
          x.fillStyle = m.mine ? "#3C40BC" : "#FFFFFF";
          x.fill();
          x.strokeStyle = m.mine ? "#3C40BC" : "rgba(39,39,74,0.10)";
          x.lineWidth = 2;
          x.stroke();

          x.font = `400 ${FONT}px Inter`;
          x.fillStyle = m.mine ? "#FFFFFF" : "#27274A";
          m.lines.forEach((l, i) => x.fillText(l, bx + PAD_X, y + PAD_Y + LINE * i + FONT));

          x.font = `400 ${TIME}px Inter`;
          x.fillStyle = "rgba(39,39,74,0.45)";
          const tw = x.measureText(m.time).width;
          x.fillText(m.time, m.mine ? bx + m.w - tw : bx, y + m.h + TIME + 6);

          y += m.h + TIME + 10 + GAP;
        }
      }

      return c.toDataURL("image/png");
    },
    { b64: png, portraitB64: portrait, kind, LIST, DETAIL, CHAT, PHONE }
  );
  writeFileSync(resolve(DIR, file), Buffer.from(url.split(",")[1], "base64"));
  console.log(`  ✓ ${file} (${kind})`);
}

for (const f of LIST_FIGURES) await edit(f, "list");
for (const f of DETAIL_FIGURES) await edit(f, "detail");
await browser.close();
console.log("\nRecorded in docs/FIGURES.md.");
