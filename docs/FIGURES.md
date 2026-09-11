# Figures — how the screenshots are made, and what is adjusted in them

Every image under `public/images/` is captured by a script in
`scripts/kb-screenshots/` against **staging**
(`https://app-staging.directhomeservice.com`). Nothing is drawn, mocked up or
composited from pieces of other screens.

The scripts are **read-only**. The platform is mid-migration and create
operations are unavailable, so panels are opened to be photographed and always
cancelled: no record is created, sent, paid, completed or deleted.

`node scripts/kb-figure-coverage.mjs` reports which article sections describe an
action and have no figure, and which of those cannot be photographed today with
the reason.

## Rows left out of list figures

Staging is a shared account. Anyone on the team can add records to it, and some
of what is there is somebody's real test data or an internal staff email
address — neither belongs in a published help centre, and we cannot delete it.

`clients.mjs` and `section.mjs` therefore remove matching rows from the DOM for
the length of the screenshot only. The app is not touched.

| Excluded | Why | Figures affected |
|---|---|---|
| `Lulu Lemon` | test data added to the shared staging account; the row also carried an internal `@stwitechnologies.com` address in the Email column | `clients/01-clients-list`, `clients/02-filters-popover`, `jobs/01-jobs-list`, `jobs/02-jobs-filter` |

Override the list with `KB_EXCLUDE="Name One,Name Two"`, or `KB_EXCLUDE=` to
exclude nothing.

## Figures adjusted in the browser before the shot

Two figures in `job-and-invoice.mjs` are arranged before capture. Both are
deliberate, and both are here so a future reader doesn't take them for a
faithful recording of what that record contains.

| Figure | What was done | Why |
|---|---|---|
| `jobs/06-job-checklist` | the checklist rows are re-ordered into the sequence the work actually runs in | the app renders them in an order that is neither the order they were added nor the order they are worked; a figure in that order teaches the wrong thing. **This is an app defect, reported separately** — when it is fixed, delete the reorder and re-shoot. |
| Every figure showing the client sidebar of the job **Door Fitting** and of the invoice raised from it — `jobs/03-job-detail`, `04-job-visits`, `05-job-invoices`, `06-job-checklist`, `07-client-chat`, `09-more-actions`, `11-job-status`, `13-complete-job`, `invoices/07-invoice-paid`, `08-invoice-payments` | the same two bubbles are injected into the Chat panel — **both** of them, the provider's and the client's | this job's Client chat is empty (`No messages yet`), and no record on staging has a two-sided conversation: the client account's password could not be recovered to answer from the other side. The panel, the Client/Team switch and the timestamp formatting are the app's; the two messages are not. They go into every one of these figures rather than just the chat close-up, so the article doesn't show a conversation on one screen and an empty panel two figures later on the same job. Re-shoot from a real conversation as soon as one exists. |

## A contradiction between two published figures

`jobs/06-job-checklist` and `jobs/13-complete-job` are the same job's checklist
and they **do not agree**: the Checklist tab lists six items, the Complete job
dialog lists seven, and only five of them are the same. This is the app's
behaviour, not a mistake in the figures, and it is reported as a defect. Both
figures are published because each is the right picture for its section; when
the defect is fixed, re-shoot both.

| | Checklist tab (says 6) | Complete job dialog (7) |
|---|---|---|
| Adjust the hinges and strike plate | yes | yes |
| Check the seal and weatherstripping | yes | yes |
| Update job notes | yes | yes |
| Send the invoice and confirm the payment | yes | yes |
| Load unused materials back in the van | yes | yes |
| Take after photos | yes | — |
| Record materials used | — | yes |
| Get the client's sign off | — | yes |

## Figures deliberately not taken

Beyond the blocked list in the coverage script:

- **Tracking time** (Jobs) — starting the timer writes a timesheet record. The
  `Start Timer` button itself is in the job detail figure's header; it only
  exists while the job is still open.
- **The Send to Client panel** (Jobs) — captured, then held back: the message it
  composes shows a literal `\n\n` where the line breaks should be, and the
  client link it builds points at `client-app-develop.directhomeservice.com`
  from staging. Both are reported as defects, and publishing the panel would
  publish them. The More Actions figure shows where the action lives instead.
  The capture is kept as evidence at
  `~/dhs_qa_workspace/screenshots/kb-findings/2026-09-11/job-send-to-client-panel.png`;
  re-shoot into the article once the defects are fixed.
