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
| `jobs/07-client-chat` | **both** bubbles are injected into the conversation panel — the provider's and the client's | this job's Client chat is empty (`No messages yet`), and no job on staging has a two-sided conversation: the client account's password could not be recovered to answer from the other side. The panel, the Client/Team switch and the timestamps' formatting are the app's; the two messages are not. Re-shoot from a real conversation as soon as one exists. |

## Figures deliberately not taken

Beyond the blocked list in the coverage script:

- **Tracking time** (Jobs) — starting the timer writes a timesheet record, and
  the button only exists while the job is still open, so the completed job the
  other Jobs figures come from doesn't show it either.
- **The Send to Client panel** (Jobs) — captured, then held back: the message it
  composes shows a literal `\n\n` where the line breaks should be, and the
  client link it builds points at `client-app-develop.directhomeservice.com`
  from staging. Both are reported as defects, and publishing the panel would
  publish them. The More Actions figure shows where the action lives instead.
  The capture is kept as evidence at
  `~/dhs_qa_workspace/screenshots/kb-findings/2026-09-11/job-send-to-client-panel.png`;
  re-shoot into the article once the defects are fixed.
