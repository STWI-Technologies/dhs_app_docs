# Hidden content: what was hidden, and how to put it back

Some knowledge base content is **hidden, not deleted**. It was taken out of the
navigation because the feature wasn't ready to be public, and it has to go back
when it is.

Everything listed here is recoverable. Nothing was deleted except where this
document says so explicitly.

Hidden as part of **WC-32** (branch `bugfix/WC-32-Knowledgebase-Updates`).

---

## How hiding works in this repo

`src/data/articles.js` is the single source of truth for what exists. It drives
the cards on the home page **and** the routes: `App.js` resolves
`/articles/:articleId` with `articles.find(a => a.id === articleId)`, so an
article missing from that file has no card *and* no reachable URL.

That means removing the entry is enough to hide an article completely. The
content file and its search-index entry can stay where they are. The article
becomes unreachable, and putting the entry back restores it as it was.

The search index is keyed by article id and `SearchBar` iterates `articles`, so
an index entry with no matching article is never read. A leftover key is inert.

---

## 1. WhatsApp AI

**Hidden in:** commit `328a884`

**Kept on disk (do not delete):**

- `public/content/whatsapp-ai.html`
- the `whatsapp-ai` key in `public/content/search-index.json`

**To restore**, add this back to `src/data/articles.js`. Import `WhatsappIcon`
from `hugeicons-react` again, and place the entry where it was, after
`ai-assistant`:

```js
{
  id: 'whatsapp-ai',
  icon: WhatsappIcon,
  en: {
    title: 'WhatsApp AI Assistant',
    category: 'AI & Automation',
    overview: 'Manage your entire DHS business from WhatsApp. Send text or voice messages to search records, create appointments, track time, send invoices, and more — all in English or Spanish.'
  },
  es: {
    title: 'Asistente IA de WhatsApp',
    category: 'IA y Automatización',
    overview: 'Administre todo su negocio DHS desde WhatsApp. Envíe mensajes de texto o voz para buscar registros, crear citas, rastrear tiempo, enviar facturas y más — todo en inglés o español.'
  },
  keywords: ['whatsapp', 'ai', 'assistant', 'asistente', 'voice', 'voz', 'chat', 'bilingual', 'bilingüe', 'tools', 'herramientas', 'automation']
},
```

**References removed from other articles. These must be written back by hand.**
They were edited out of Google Docs exports, so there is no clean revert:

| File | What was removed |
|---|---|
| `public/content/ai-assistant.html` | The sentence saying the assistant "uses the same powerful AI engine as the DHS WhatsApp integration". And WhatsApp was dropped from the list of channels a magic link works from. It read "whether you tap it from WhatsApp, SMS, the in-app chat panel, or a web browser preview". |
| `public/content/plans-pricing.html` | Two comparison-table rows labelled "WhatsApp AI". Three places reading "In-app AI and WhatsApp AI" (included / for all users / …assistant) reduced to "In-app AI". The voice-memo row no longer says the messages go "via WhatsApp". |

The exact previous wording is in the commit diff: `git show 328a884 -- public/content/ai-assistant.html public/content/plans-pricing.html`

---

## 2. Appointment Line (IVR)

**Hidden in:** commits `930e8c0` (article) and this one (references)

**Kept on disk (do not delete):**

- `public/content/appointment-line.html`
- the `appointment-line` key in `public/content/search-index.json`

**To restore**, add this back to `src/data/articles.js`. Import `TelephoneIcon`
from `hugeicons-react` again:

```js
{
  id: 'appointment-line',
  icon: TelephoneIcon,
  en: {
    title: 'Appointment Line (IVR)',
    category: 'AI & Automation',
    overview: 'An AI-powered phone system that lets callers find service providers, schedule appointments, manage bookings, and request callbacks — all by voice or keypad, in English or Spanish.'
  },
  es: {
    title: 'Línea de Citas (IVR)',
    category: 'IA y Automatización',
    overview: 'Un sistema telefónico con IA que permite a quien llama encontrar proveedores de servicio, agendar citas, gestionar reservas y solicitar devoluciones de llamada — por voz o teclado, en inglés o español.'
  },
  keywords: ['ivr', 'appointment line', 'línea de citas', 'phone', 'teléfono', 'call', 'llamada', 'booking', 'reserva', 'voice', 'voz', 'callback', 'ai']
},
```

**References removed from other articles. Write these back by hand:**

| File | What was removed |
|---|---|
| `public/content/appointments-management.html` | A bullet under "Where appointments connect": "**Appointment Line** — the phone line that books appointments for you. See its own article." |
| `public/content/plans-pricing.html` | **Seven table rows** and two prose mentions. See below. This one matters, because it changes what the plans appear to include. |

### What plans-pricing said about the Appointment Line

This is the important part to get right on restore. The Appointment Line is a
**paid plan feature**, and while it is hidden the pricing tables understate what
each plan includes. Restore all of it together:

| Table | Row label | Values |
|---|---|---|
| Solo plan | Appointment Line | "Callback mode — clients call in and request a callback" |
| Team plan | Appointment Line | "Full AI booking — clients can schedule appointments by phone" |
| Enterprise plan | Dedicated IVR Number | "Your own phone number for the AI Appointment Line" |
| Enterprise plan | Appointment Line | "Unlimited AI-powered appointment bookings" |
| Comparison matrix | Appointment Line | Callback · AI Booking · AI Booking (unlimited) |
| Comparison matrix | Dedicated Phone Number | (per-plan values) |
| Feature catalogue | IVR Appointment Line | "AI-powered phone system where clients call to schedule, check, or manage appointments", available on "Solo (callback), Team & Enterprise (full AI)" |

Prose removed:

- Enterprise description: the sentence ended "…including SMS/MMS and a dedicated
  IVR (Interactive Voice Response) phone number." It now ends "…including
  SMS/MMS." Put the IVR clause back.
- An FAQ entry, heading and answer both:
  **"What is the Appointment Line callback vs AI booking?"** Answer: "In **callback
  mode** (Solo), clients call the appointment line and leave a callback request
  — you get notified and call them back. In **AI booking mode**
  (Team/Enterprise), the AI handles the entire conversation — it checks your
  availability, schedules the appointment, and confirms with the client, all
  without you needing to pick up the phone."

The full previous markup is in the diff for this commit.

---

## 3. Availability: DELETED, not hidden

The one exception. `availability-management` stopped being a standalone article
because it is being folded into the Settings article instead, so it was removed
properly: the articles.js entry, the search-index key and
`public/content/availability-management.html` are all gone, along with the
unused `Calendar03Icon` import.

The old content is still in git history if it's wanted as raw material:

```
git show 328a884^:public/content/availability-management.html
```

Its one incoming reference was fixed rather than left dangling: the Crews
article used to say "see the Availability Management article" and now points at
**Manage Availability Settings** inside the crew's own Availability section.

---

## Checklist for un-hiding a section

1. Put the `articles.js` entry back, including its icon import.
2. Check the category still exists in `categoryOrder` in the same file.
3. Write the cross-article references back by hand, from the tables above.
4. Rebuild the search index for every article you touched:
   `node scripts/build-search-index.mjs <article-id> …`
5. Check nothing is left dangling the other way: an article that points at
   something still hidden.
6. Run the app and confirm the card appears, the URL resolves, and search finds
   the body text.
