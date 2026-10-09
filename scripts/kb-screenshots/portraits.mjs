/**
 * SAMPLE PORTRAITS for list figures.
 *
 * Most clients on staging carry the same default silhouette
 * (dhs-develop-images/avatar.drawio.png), so a client column publishes as a row
 * of identical grey blobs and the avatar teaches nothing. Client photos cannot
 * be seeded either: they belong to the client's own user, and the platform is
 * read-only during the migration.
 *
 * So a portrait is swapped in on each row right before the shot. THE IMAGES ARE
 * THIS ACCOUNT'S OWN, the user avatars its crew members already use, served from
 * the same blob storage the app serves them from, at the same round size the
 * column renders. Only the pairing of face to client is made up, and it is made
 * by apparent gender of the first name so the figure does not read as nonsense.
 *
 * Nothing is written anywhere; a reload clears it.
 *
 * Shared between clients.mjs and section.mjs so the same client keeps the same
 * face across articles: the pairing is keyed by name, not by row position.
 */
const BLOB = "https://dhspublicstorage.blob.core.windows.net/dhs-staging-images";

export const PORTRAITS = {
  female: [
    "user-avatar-6a18a4abb8af8b9d8ccd11c6.png?v=2",
    "user-avatar-67cb8547caa95f7543a5d06d.jpg?v=7",
    "user-avatar-6a203a66f5cc0db871bd883a.png?v=2",
    "user-avatar-6a105f936c0e583179209c1e.png?v=2",
    "user-avatar-6a10568d52b70378c68645be.png?v=2",
    "user-avatar-6a18a276f5cc0db871b6b28a.png?v=2",
    "user-avatar-67cb998fcaa95f7543a7f8b8.png?v=2",
  ].map((f) => `${BLOB}/${f}`),
  male: [
    "user-avatar-6a18a12bf5cc0db871b69ccc.png?v=2",
    "user-avatar-67cb9866caa95f7543a7d851.png?v=2",
    "user-avatar-6a1ef19cb8af8b9d8cd25aec.png?v=2",
    "user-avatar-6a10552052b70378c6863cf5.png?v=2",
    "user-avatar-67cb9928caa95f7543a7f8a1.png?v=2",
  ].map((f) => `${BLOB}/${f}`),
};

/**
 * Which face goes with which name.
 *
 * A name that is in NEITHER list falls back to alternating, and the fallback
 * is how a conversation from "Marcus" was published with a woman's portrait on
 * it. So the lists are deliberately wider than the names currently on the
 * account, and callers should report what they could not place rather than let
 * the fallback decide quietly. See `bucketFor`.
 */
export const FEMALE_FIRST_NAMES = [
  "sandra", "anna", "samantha", "megan", "jessica", "maria", "laura", "emily", "olivia",
  "sophia", "ava", "isabella", "lucia", "valentina", "sofia", "zoe", "lisa", "amelia",
  "mia", "charlotte", "grace", "hannah", "rachel", "sarah", "karen", "nancy", "linda",
  "patricia", "barbara", "elizabeth", "susan", "carol", "michelle", "angela", "melissa",
  "rebecca", "stephanie", "nicole", "katherine", "diana", "paula", "carmen", "rosa",
  "elena", "clara", "julia", "natalia", "daniela", "gabriela", "andrea", "beatriz",
];
export const MALE_FIRST_NAMES = [
  "shawn", "ethan", "christopher", "omar", "liam", "noah", "david", "brian", "mike",
  "tyler", "daniel", "marcus", "andres", "mark", "john", "james", "robert", "michael",
  "william", "richard", "joseph", "thomas", "charles", "steven", "paul", "andrew",
  "joshua", "kevin", "george", "edward", "ryan", "jason", "jeffrey", "gary", "nicholas",
  "eric", "stephen", "jacob", "larry", "frank", "scott", "justin", "brandon", "samuel",
  "raymond", "patrick", "jack", "dennis", "jerry", "carlos", "miguel", "javier", "diego",
  "luis", "pedro", "antonio", "rafael", "sergio", "hector", "ricardo",
];

/**
 * The bucket a first name belongs to, or null when we genuinely do not know.
 *
 * Returning null instead of guessing is the point: the caller decides whether
 * to alternate, and can say out loud which names it had to guess at.
 */
export function bucketFor(firstName) {
  const key = (firstName || "").trim().toLowerCase();
  if (FEMALE_FIRST_NAMES.includes(key)) return "female";
  if (MALE_FIRST_NAMES.includes(key)) return "male";
  return null;
}

/**
 * Paint the portraits, and KEEP them painted.
 *
 * Setting img.src directly is invisible to React, so any later render of the
 * table puts the default silhouette back. That is what left one row (a client
 * whose row re-rendered late) as the single blank face in an otherwise
 * photographed column. So the pairing is stored per name, the repaint runs
 * again on every mutation of the table and on a short interval, and each client
 * keeps the same face for the whole step.
 *
 * `rowsSelector` is the table body rows to walk; the client name is read from
 * the first bit of text in the row's avatar cell, so the same call works for a
 * Client Name column and for a Client column beside other data.
 */
export async function paintSampleAvatars(page, rowsSelector) {
  const painted = await page.evaluate(
    ({ rowsSelector, portraits, female, male }) => {
      const assigned = (window.__kbPortraits = window.__kbPortraits || {});
      const next = { female: 0, male: 0 };

      const urlFor = (name, index) => {
        if (assigned[name]) return assigned[name];
        const first = name.split(/\s+/)[0];
        const bucket = female.includes(first)
          ? "female"
          : male.includes(first)
          ? "male"
          : index % 2
          ? "male"
          : "female";
        const list = portraits[bucket];
        assigned[name] = list[next[bucket]++ % list.length];
        return assigned[name];
      };

      const paint = () => {
        let i = 0;
        for (const tr of document.querySelectorAll(rowsSelector)) {
          const img = tr.querySelector("td img");
          if (!img) continue;
          // ONLY the default silhouette. A client who has a real photo keeps it,
          // otherwise the same person would wear one face in the list figure and
          // another on their own detail figure. After a re-render React puts the
          // silhouette back, which is exactly what makes this test repaintable.
          if (!/avatar\.drawio/.test(img.src)) continue;
          // The name is whatever text sits in the cell holding the avatar.
          const cell = img.closest("td");
          const name = (cell?.innerText || "").trim().split("\n")[0].trim().toLowerCase();
          if (!name) continue;
          const url = urlFor(name, i++);
          if (img.src !== url) img.src = url;
        }
      };

      paint();
      const table = document.querySelector(rowsSelector.split(" table")[0]);
      if (table && !window.__kbPortraitWatch) {
        window.__kbPortraitWatch = new MutationObserver(paint);
        window.__kbPortraitWatch.observe(table, {
          subtree: true,
          childList: true,
          attributes: true,
          attributeFilter: ["src"],
        });
        window.__kbPortraitTick = setInterval(paint, 250);
      }
      return Object.keys(assigned).length;
    },
    { rowsSelector, portraits: PORTRAITS, female: FEMALE_FIRST_NAMES, male: MALE_FIRST_NAMES }
  );
  console.log(`    · ${painted} sample portrait(s) painted for this figure`);
  await page.waitForTimeout(1500);
  return painted;
}
