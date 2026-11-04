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

Removed later, when WhatsApp was taken out of everything a visitor or a search
engine can see (version 2.5.2). Write these back too when WhatsApp AI returns:

| File | What was removed |
|---|---|
| `public/content/settings-configuration.html` | **WhatsApp** from the Notifications channels. It read "**Email**, **SMS**, **WhatsApp**, **Mobile** and **Desktop**". Rebuild its search entry afterwards. |
| `public/content/settings-configuration-es.html` | The same in Spanish: "**Correo**, **SMS**, **WhatsApp**, **Móvil** y **Escritorio**". |
| `public/index.html` | "WhatsApp" at the end of the `keywords` meta tag, and the structured-data list item `{"@type": "ListItem", "position": 14, "name": "WhatsApp AI Assistant", "url": "https://docs.directhomeservice.com/articles/whatsapp-ai"}`. The items after it moved up one and `numberOfItems` went from 16 to 15. |
| `public/sitemap.xml` | The `<url>` entry for `https://docs.directhomeservice.com/articles/whatsapp-ai` (priority 0.9). |

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
| `public/content/settings-configuration.html` | The **Appointment Line** section of Settings. It lives in the Workspace group of the settings sidebar, between Dashboard and Timesheet. The rewritten article lists that group as "Dashboard, Timesheet" only, has no section describing it, and no row for it in the closing "Where things are" table. On restore, add it back in all three places. |
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

## 3. Client Portal: Inbox and Messages

**Hidden in:** this commit

**Kept on disk (do not delete):**

- `public/content/client-inbox.html` and `public/content/client-inbox-es.html`
- the `client-inbox` key in `public/content/search-index.json`

The Inbox itself is NOT hidden from clients: it is still a page in the portal
menu, and the other client articles still send the reader to it ("ask in the
Inbox", "every estimate has its own conversation"). Only its article is out of
the knowledge base, so nothing is left pointing at a card that does not exist.

**To restore**, put this back in `src/data/articles.js`, before
`client-profile-settings`, and import `Message01Icon` from `hugeicons-react`
again (the import was removed with it):

```js
{
    id: 'client-inbox',
    audience: 'client',
    platforms: ['client'],
    icon: Message01Icon,
    contentPath: {
      en: '/content/client-inbox.html',
      es: '/content/client-inbox-es.html',
    },
    en: {
      title: 'Inbox and Messages',
      category: 'Client Portal',
      overview: 'Every conversation with your providers, kept with the estimate, job, invoice or appointment it is about. Starting one, attaching files, and archiving.'
    },
    es: {
      title: 'Bandeja de Entrada y Mensajes',
      category: 'Portal del Cliente',
      overview: 'Cada conversación con sus proveedores, junto al presupuesto, trabajo, factura o cita del que trata. Iniciar una, adjuntar archivos y archivarla.'
    },
    keywords: ['inbox', 'bandeja', 'chat', 'message', 'mensaje', 'conversation', 'conversación', 'attach', 'adjuntar', 'archive', 'archivar']
  },
```

No cross-article references were edited, so there is nothing to write back by
hand for this one.

---

## 4. Clients: importing and exporting CSV

**Hidden in:** this commit

Import CSV and Export CSV do not render on staging: the account has
`isImportExportClientsHidden` on, so neither button exists for a reader to
find. The feature is real, it is just not reachable, and a manual that explains
a button nobody can see is a manual that looks wrong.

**Removed from `public/content/clients-management.html` and its Spanish twin:**

| Where | What |
|---|---|
| Overview list | the bullet "**Import and export** your client list as CSV." |
| Body | the whole section **Importing clients from a CSV**, its four numbered steps, and the note that both buttons can be turned off for an account |
| Body | the whole section **Exporting your client list** |
| Common actions | the rows "Bring in a list of clients" and "Take your list out" |

Nothing else referenced them: neither section had a figure, and the figure
coverage report already listed both as blocked by the same flag.

**To restore**, write those four pieces back and delete the two
`clients-management` entries from `BLOCKED` in
`scripts/kb-figure-coverage.mjs`, then shoot the two panels.

The exact previous wording is in the diff for this commit.

The same was done to **Services** and **Products**, which hide their import and
export behind `isImportExportServiceItemEnabled`: the section **Importing and
exporting**, the Overview bullet, and the Common actions row in each ("Load a
catalogue in" in Products; in Services the pricing row lost its ", or Export
CSV" tail and now reads "Sort by Rate").

---

## 5. Availability: DELETED, not hidden

The one exception. `availability-management` stopped being a standalone article
because it was folded into the Settings article instead, so it was removed
properly: the articles.js entry, the search-index key and
`public/content/availability-management.html` are all gone, along with the
unused `Calendar03Icon` import.

The old content is still in git history if it's wanted as raw material:

```
git show 328a884^:public/content/availability-management.html
```

The fold is done: availability is now the **Availability** section of
`public/content/settings-configuration.html`, written from the code rather than
from the old article.

Its one incoming reference was fixed rather than left dangling: the Crews
article used to say "see the Availability Management article" and now points at
**Manage Availability Settings** inside the crew's own Availability section.

---

## 6. AI Assistant: coming soon, not removed

**Hidden as part of WC-218** (branch `bugfix/WC-218-Hide-AI-Assistant`).

This one works differently from the four above, and the difference is
deliberate. The AI Assistant card **stays on the home page**, muted and badged
**Coming soon**, because the feature is announced, not withdrawn. What is closed
is the access to the content.

### The `comingSoon` flag

`src/data/articles.js` carries `comingSoon: true` on the `ai-assistant` entry.
Three places read it:

| File | What the flag does |
|---|---|
| `src/components/ArticleCard/ArticleCard.jsx` | drops `onClick`, `role="button"` and `tabIndex`, sets `aria-disabled`, adds the badge |
| `src/App.js` (`ArticlePage`) | returns the Coming soon panel instead of `ArticleView`, so the direct URL `/articles/ai-assistant` does not open the body either |
| `src/components/SearchBar/SearchBar.jsx` | skips the article, so search never offers a result that leads nowhere |

The badge text lives in `src/context/LanguageContext.js` as `comingSoon`,
`comingSoonTitle` and `comingSoonBody`, in both languages.

**To restore**, delete the single line `comingSoon: true,` from the
`ai-assistant` entry. Nothing else has to be undone for the article itself: the
card, the route, the search entry and the content file were never touched. The
flag stays in the codebase for the next article that needs it.

**Kept on disk (do not delete):**

- `public/content/ai-assistant.html` and `public/content/ai-assistant-es.html`
- the `ai-assistant` and `ai-assistant:es` keys in
  `public/content/search-index.json`

### References removed from other articles. Write these back by hand.

**`public/content/mobile-app.html` and `public/content/mobile-app-es.html`**

| Where | What was removed |
|---|---|
| `src/data/articles.js`, the Mobile App card | the tail of both overviews. English ended "…your catalog, timesheets, messaging, and the AI Assistant on iOS and Android." and now ends "…your catalog, timesheets and messaging on iOS and Android." Spanish ended "…su catálogo, hojas de tiempo, mensajería y el Asistente de IA en iOS y Android." |
| Overview list | the bullet's tail. It read "**Message clients and your team**, and ask the built-in **AI Assistant** in English or Spanish." and now ends after "your team". The Spanish read "**Enviar mensajes a los clientes y a tu equipo**, y preguntarle al **Asistente de IA** integrado en inglés o español." |
| Getting Started, bottom-navigation list | the slot "**AI** — the AI Assistant." / "**IA** — el Asistente de IA." It sat between **Work Hub** and **More**. |
| Your Account & Profile, Change your language | the tip "**Tip:** The AI Assistant also understands both languages — just type in whichever you prefer." / "**Consejo:** El Asistente de IA también entiende ambos idiomas — solo escribe en el que prefieras." |
| Body | the whole **AI Assistant** section, 26 lines in each language: the two intro paragraphs and the subsections Open the AI Assistant, Ask by text, Ask by voice, Ask with a photo, Suggested prompts and Tips. It sat between **Inbox (Messaging)** and **Quick Add**. |

**`public/content/mobile-offline.html` and `public/content/mobile-offline-es.html`**

| Where | What was removed |
|---|---|
| "What works offline" table | the last row: `AI Assistant · No · N/A · "The AI assistant needs an internet connection. Reconnect to ask a question."` The Spanish row read `Asistente de IA · No · No aplica · "El asistente de IA necesita conexión a internet. Reconéctese para hacer una pregunta".` |

The exact previous markup is in the diff for this commit.

After writing any of these back, rebuild the index for the articles touched:

```
node scripts/build-search-index.mjs mobile-app mobile-offline
```

### `public/content/plans-pricing.html` and `public/content/plans-pricing-es.html`

Every AI reference was taken out, both the assistant itself and the generic
"AI features / AI queries" claims, because a plan that advertises AI capacity
while the assistant is unreachable promises something the reader cannot use.
This is the part to restore most carefully: it changes what each plan appears
to include.

**Rows deleted outright.** Put them back in the position shown.

| Table | Row, English | Row, Spanish |
|---|---|---|
| DHS Solo, after Users | `AI Assistant · In-app AI included` | `Asistente de IA · IA dentro de la app incluida` |
| DHS Team, after Users | `AI Assistant · In-app AI for all users` | `Asistente de IA · IA dentro de la app para todos los usuarios` |
| Enterprise, after Users | `AI Queries · Unlimited` | `Consultas de IA · Ilimitadas` |
| Side-by-Side Comparison, after Jobs & Estimates | `In-App AI · Yes · Yes · Yes` | `IA en la app · Sí · Sí · Sí` |
| Communication Channels, before SMS/MMS | `In-App AI · Text, voice, and image input directly in the web or mobile app · All plans (including Free)` | `IA en la app · Entrada de texto, voz e imagen directo en la app web o móvil · Todos los planes (incluido el gratuito)` |

**Other deletions.**

| Where | What |
|---|---|
| Free Trial, list of what the free plan includes | the bullet "In-app AI assistant" / "Asistente de IA dentro de la app", between the jobs limit and attachment storage |
| Frequently Asked Questions, between "What happens if I reach my limit?" and "How do I get Enterprise?" | the whole entry. Heading: "Do all team members get AI access?" Answer: "Yes. Every user on a Team or Enterprise account has access to the In-App AI assistant." Spanish heading: "¿Todos los integrantes del equipo tienen IA?" Answer: "Sí. Cada usuario de una cuenta Team o Enterprise tiene acceso al Asistente de IA dentro de la app." |

**Prose reworded. The previous wording is on the left.**

| Where | Was | Is now |
|---|---|---|
| Intro paragraph | "Both app versions include the same powerful AI features — the difference is in user capacity, team management tools, and communication channels." | "The difference between the two app versions is in user capacity, team management tools, and communication channels." |
| Intro paragraph, Spanish | "Las dos versiones incluyen las mismas funciones de IA: la diferencia está en la capacidad de usuarios…" | "La diferencia entre las dos versiones está en la capacidad de usuarios…" |
| DHS Solo, Voice Memos row | `Yes — send voice messages to the AI` / `Sí, puede mandarle mensajes de voz a la IA` | `Yes` / `Sí`. The row was kept rather than deleted, so it still matches the Voice Memos row in the comparison matrix. |
| DHS Solo, Perfect for | "…who want AI-powered business management without the complexity of team features" | "…who want to run their business from one place without the complexity of team features" |
| DHS Solo, Ideal para | "…que quieren administrar su negocio con IA sin la complejidad…" | "…que quieren administrar su negocio desde un solo lugar sin la complejidad…" |
| DHS Team description | "…multi-user reports, and expanded AI and communication capabilities." | "…multi-user reports, and expanded communication capabilities." |
| DHS Team, Spanish | "…reportes multiusuario y más capacidad de IA y de comunicación." | "…reportes multiusuario y más capacidad de comunicación." |
| Enterprise description | "…unlimited users, unlimited AI queries, unlimited clients, and access to…" | "…unlimited users, unlimited clients, and access to…" |
| Enterprise, Spanish | "…usuarios, consultas de IA y clientes sin límite, y acceso a…" | "…usuarios y clientes sin límite, y acceso a…" |
| Communication Channels, intro line | "DHS provides multiple ways to interact with the AI and communicate with clients:" / "DHS ofrece varias formas de interactuar con la IA y de comunicarse con los clientes:" | "DHS provides the following ways to communicate with clients:" / "DHS ofrece las siguientes formas de comunicarse con los clientes:" |
| Choosing the Right Version > Choose Enterprise if | "You need unlimited capacity for users, clients, and AI queries" / "Necesita capacidad ilimitada de usuarios, clientes y consultas de IA" | "You need unlimited capacity for users and clients" / "Necesita capacidad ilimitada de usuarios y clientes" |

**One fix that is not WC-218.** `Choosing the Right Version > Choose Team if`
still read "You need clients to book appointments directly via the AI phone
system" in English only. That is the Appointment Line, hidden back in section 2
of this document, and the Spanish twin had already been rewritten to "Necesita
que sus clientes puedan agendar citas por su cuenta". The English bullet now
reads "You need clients to book appointments on their own", matching Spanish.
When the Appointment Line comes back, restore it from section 2, not from here.

**After restoring any of this**, rebuild the index:

```
node scripts/build-search-index.mjs plans-pricing
```

### What the Communication Channels section looks like while this is hidden

One row, SMS/MMS, Enterprise only. WhatsApp was already removed in section 1
and the in-app AI row here, so the table is down to a single channel. If the
section looks too thin to keep, that is why; do not delete it, because both
rows come back.

---

## 7. Leftovers closed after WC-218 (AI, Appointment Line, WhatsApp AI)

Added in version 2.5.4. Sections 1, 2 and 6 hid the articles, but a few things
outside the articles still pointed at them. These were turned off too. Nothing
was deleted; undo each item below when its feature comes back.

### AI Assistant card text (restore with section 6)

`src/data/articles.js`, the `ai-assistant` entry. The overview was shortened to
a teaser while the card shows Coming soon. Put the original back:

| | Teaser now | Original, restore this |
|---|---|---|
| `en.overview` | "Your AI helper for Direct Home Service. Coming soon to web and mobile." | "Ask in plain English or Spanish and it does the work: finding records, creating and updating them, tracking time, reading a photo you send it, and handing you a one-tap link straight into the app." |
| `es.overview` | "Su asistente de IA para Direct Home Service. Próximamente en web y móvil." | "Pídalo en español o en inglés y lo hace: buscar registros, crearlos y actualizarlos, registrar tiempo, leer una foto que le mande y entregarle un enlace directo a la app." |

### Raw content files return 404

`public/staticwebapp.config.json` has one route per file with
`"statusCode": 404`, so these files cannot be opened by direct link or indexed
by search engines. The files themselves are still on disk.

| Route | Remove when |
|---|---|
| `/content/ai-assistant.html` | AI Assistant comes back (section 6) |
| `/content/ai-assistant-es.html` | AI Assistant comes back (section 6) |
| `/content/appointment-line.html` | Appointment Line comes back (section 2) |
| `/content/whatsapp-ai.html` | WhatsApp AI comes back (section 1) |

**This one is required, not optional.** The article page loads its body from
these same files, so if the route stays, the restored article opens empty with
a "not found" error.

### Home page SEO tags (`public/index.html`)

| Where | Was | Is now |
|---|---|---|
| `<meta name="description">` | "…estimates, jobs, invoices, timesheets, and AI-powered features." | "…estimates, jobs, invoices, and timesheets." |
| `<meta name="keywords">` | ended "…crews, clients, AI assistant" | ends "…crews, clients" |
| JSON-LD `ItemList` | `"numberOfItems": 15`, plus the two items below | `"numberOfItems": 13` |

The two JSON-LD items, to put back after position 13 (Checklists Management),
updating `numberOfItems` to match:

```json
{"@type": "ListItem", "position": 14, "name": "AI Assistant (Web & Mobile)", "url": "https://docs.directhomeservice.com/articles/ai-assistant"},
{"@type": "ListItem", "position": 15, "name": "Appointment Line (IVR)", "url": "https://docs.directhomeservice.com/articles/appointment-line"}
```

### Sitemap (`public/sitemap.xml`)

Two entries removed. Put back the one for each feature that returns:

```xml
<url>
  <loc>https://docs.directhomeservice.com/articles/ai-assistant</loc>
  <lastmod>2026-04-03</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.9</priority>
</url>
<url>
  <loc>https://docs.directhomeservice.com/articles/appointment-line</loc>
  <lastmod>2026-04-03</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.9</priority>
</url>
```

Set `lastmod` to the launch date. Search engines take days to weeks to list the
page again; requesting indexing in Google Search Console speeds it up.

### Appointment Line in the Settings Getting Started panels (restore with section 2)

`public/en/settings.html` and `public/es/settings.html`:

| Where | What was removed |
|---|---|
| "What you can do" list, after the timesheets bullet | EN "Set up your appointment line for incoming client calls" / ES "Configurar tu línea de citas para las llamadas entrantes de clientes" |
| Workspace group, last line | EN "Your appointment line for client calls" / ES "Tu línea de citas para llamadas de clientes". The Timesheet line above it took over its `margin: 0 0 16px 0`; give that back to the restored last line and set the Timesheet line to `0 0 8px 0`. |

---

## Checklist for un-hiding a section

1. Put the `articles.js` entry back, including its icon import.
2. Check the category still exists in `categoryOrder` in the same file.
3. Write the cross-article references back by hand, from the tables above.
4. Rebuild the search index for every article you touched:
   `node scripts/build-search-index.mjs <article-id> …`
5. Check nothing is left dangling the other way: an article that points at
   something still hidden.
5a. Undo the matching items in section 7: the 404 route (required, or the
   article opens empty), the sitemap entry, the home page SEO tags and any
   panel text.
6. Run the app and confirm the card appears, the URL resolves, and search finds
   the body text.
