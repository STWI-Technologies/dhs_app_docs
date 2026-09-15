/**
 * Things written into a record's DOM before a figure is taken.
 *
 * Every one of these exists because the record on staging shows an empty field
 * or an empty panel where the article needs to point at something, and the
 * platform is read-only during the migration so the data cannot be seeded.
 * They are DOM-only: no request is made to the app, nothing is saved, and a
 * reload clears them. Each one is listed in docs/FIGURES.md.
 *
 * They live here, shared, so the SAME client shows the SAME phone and the same
 * kind of conversation in every article. One figure with a phone and the next
 * with a dash on the same person is worse than either.
 */

/**
 * Phone numbers by client name.
 *
 * Written the way the client card actually renders a phone: E.164, no spaces,
 * no brackets, no dashes (`+12192423534`). They are 555 numbers, so none of
 * them is real. Keyed by name so a client who appears in Appointments and again
 * in Estimates carries one number across both.
 */
export const CLIENT_PHONES = {
  "emily johnson": "+16025550148",
};

/** The fallback for a client with no entry above. */
const DEFAULT_PHONE = "+16025550173";

/**
 * Put a phone number on the client card when the app renders a dash.
 *
 * A card that reads "Phone: —" beside a real email looks like a broken field
 * rather than an empty one, and the article tells the reader this is the record
 * they will have open when they call to confirm.
 *
 * Only ever replaces a dash. A client who has a real number keeps it.
 */
export async function injectClientPhone(page, phones = CLIENT_PHONES) {
  const done = await page.evaluate(
    ({ phones, fallback }) => {
      const label = [...document.querySelectorAll("p, span, div")].find(
        (e) => (e.textContent || "").trim() === "Phone:"
      );
      if (!label) return "no Phone label on the client card";
      let value = label.nextElementSibling;
      if (!value) {
        const parent = label.parentElement;
        value = parent && parent.children.length > 1 ? parent.children[1] : null;
      }
      if (!value) return "found the Phone label but not its value";
      if (!/^[—-]$/.test((value.textContent || "").trim())) return "ok";

      // The client's name is the heading of the same card.
      const card = label.closest("div")?.parentElement?.parentElement;
      const name = (card?.innerText || "").trim().split("\n")[0].trim().toLowerCase();
      value.textContent = phones[name] || fallback;
      return "ok";
    },
    { phones, fallback: DEFAULT_PHONE }
  );
  if (done !== "ok") console.log(`    ! phone not injected here: ${done}`);
  return done === "ok";
}

/**
 * Put a conversation in the record's Chat panel.
 *
 * Every Client chat on staging is empty ("No messages yet") and no record has a
 * two-sided conversation: the client account's password could not be recovered
 * to answer from the other side. The panel, the Client/Team switch and the
 * timestamp formatting are the app's; the messages are not.
 *
 * Called for its effect and allowed to fail quietly: a figure whose subject is
 * something else should not be lost because the chat panel had not painted.
 */
export async function injectChat(page, messages) {
  const built = await page.evaluate((messages) => {
    // Anchored on the Client/Team switch rather than on the empty-state text:
    // that text is not always in the DOM when the tab first paints.
    const team = [...document.querySelectorAll("span, button")].find(
      (e) => (e.innerText || "").trim() === "Team"
    );
    if (!team) return "could not find the Client/Team switch, so not sure where the chat body is";
    const bar = team.closest("div")?.parentElement;
    let host = bar?.nextElementSibling;
    while (host && host.getBoundingClientRect().height < 60) host = host.nextElementSibling;
    if (!host) return "could not find the chat body below the Client/Team switch";
    const bubble = ({ text, time, mine }) => `
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
    host.innerHTML = messages.map(bubble).join("");
    return "ok";
  }, messages);
  if (built !== "ok") console.log(`    ! chat not injected here: ${built}`);
  else await page.waitForTimeout(700);
  return built === "ok";
}

/** The conversation used on an appointment: confirming a booked visit. */
export const APPOINTMENT_CHAT = [
  { text: "We're booked in for Sunday morning. The crew will call when they're on the way.", time: "Sep 12, 2026, 4:20 PM", mine: true },
  { text: "Great. Anyone can let them in, someone will be home all morning.", time: "Sep 12, 2026, 4:38 PM", mine: false },
];

/** The conversation used on an estimate: a quote sent and answered. */
export const ESTIMATE_CHAT = [
  { text: "I've sent the quote over. It covers the full clean, and the price holds for thirty days.", time: "Sep 11, 2026, 10:04 AM", mine: true },
  { text: "Looks good to me. Go ahead and book it in for the week after next.", time: "Sep 11, 2026, 10:52 AM", mine: false },
];

/** The conversation used on an invoice: a bill sent and acknowledged. */
export const INVOICE_CHAT = [
  { text: "The invoice for the work is on its way to you, payable in fourteen days.", time: "Sep 10, 2026, 2:15 PM", mine: true },
  { text: "Got it, thanks. I'll get that paid this week.", time: "Sep 10, 2026, 3:02 PM", mine: false },
];
