# Figures, how the screenshots are made, and what is adjusted in them

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
address, neither belongs in a published help centre, and we cannot delete it.

`clients.mjs` and `section.mjs` therefore remove matching rows from the DOM for
the length of the screenshot only. The app is not touched.

| Excluded | Why | Figures affected |
|---|---|---|
| `Lulu Lemon` | test data added to the shared staging account; the row also carried an internal `@stwitechnologies.com` address in the Email column | `clients/01-clients-list`, `clients/02-filters-popover`, `jobs/01-jobs-list`, `jobs/02-jobs-filter` |
| `Client Quick`, `awdsad asdasd` | the same, in the Dashboard's Inbox card: two conversations whose client is somebody's throwaway test account | `dashboard/01-dashboard`, `dashboard/05-dashboard-inbox` |
| the whole CLIENT column | every appointment on the first page belongs to a fixture: `GateUser Tester5d7530`, `ClientUser Contact2df9ce`, `UserContact Only Co eaf53a`. The column is given the SAME ten people the Estimates figure already publishes, in the same order, so the two articles agree about who this account's clients are. Only the name and the company are rewritten; the appointments, dates, crews and statuses are the account's own. See `APPOINTMENT_CLIENTS` in `section.mjs` | `appointments/01-appointments-list`, `appointments/02-appointments-filter` |

Override the list with `KB_EXCLUDE="Name One,Name Two"`, or `KB_EXCLUDE=` to
exclude nothing.

## Figures adjusted in the browser before the shot

Two figures in `job-and-invoice.mjs` are arranged before capture. Both are
deliberate, and both are here so a future reader does not take them for a
faithful recording of what that record contains.

| Figure | What was done | Why |
|---|---|---|
| `jobs/06-job-checklist` | the checklist rows are re-ordered into the sequence the work actually runs in | the app renders them in an order that is neither the order they were added nor the order they are worked; a figure in that order teaches the wrong thing. **This is an app defect, reported separately**, when it is fixed, delete the reorder and re-shoot. |
| Every figure showing the client sidebar of the job **Door Fitting** and of the invoice raised from it, `jobs/03-job-detail`, `04-job-visits`, `05-job-invoices`, `06-job-checklist`, `07-client-chat`, `09-more-actions`, `11-job-status`, `13-complete-job`, `invoices/07-invoice-paid`, `08-invoice-payments` | the same two bubbles are injected into the Chat panel, **both** of them, the provider's and the client's | this job's Client chat is empty (`No messages yet`), and no record on staging has a two-sided conversation: the client account's password could not be recovered to answer from the other side. The panel, the Client/Team switch and the timestamp formatting are the app's; the two messages are not. They go into every one of these figures rather than just the chat close-up, so the article doesn't show a conversation on one screen and an empty panel two figures later on the same job. Re-shoot from a real conversation as soon as one exists. |


| Every figure of the appointment **APT-1036**, `appointments/03-appointment-detail`, `06-visit-timesheets`, and `04-related-records` when it can be taken | the same two bubbles are injected into the Chat panel, and a phone number is written into the client card | the same reasons as the job above: the conversation is empty and the panel is a third of the figure. The client on this appointment also has no phone on file, so the card published `Phone: —` next to a real email and read as a broken field; the number put there is a 555 number, the shape every other client on this account carries, and it is not real. Both go into every figure of this appointment, never just one. The visit row is also expanded before the shot, that is the app's own control, nothing is faked by opening it. |

## The Estimates figures are retouched

Estimates stopped loading on staging before these could be re-shot with the
record arranged, so four published figures were edited in place by
`scripts/kb-screenshots/edit-estimates-figures.mjs`. That script is the record
of what was changed, down to the pixel coordinates; re-shoot and delete it as
soon as the section loads again.

| Figure | What was changed | Why |
|---|---|---|
| `estimates/01-estimates-list`, `02-estimates-filter` | the first row's name, "EST-1001", is redrawn as "Deep Cleaning"; Robert Smith's default blue silhouette is replaced with one of the account's own portraits | nine of the ten rows carry a descriptive name, so the tenth published looking like missing data, and his was the one blank face in a column of photographs. The new name is sized to match the row below it, letter for letter. |
| `estimates/05-estimate-detail`, `08-more-actions` | a phone number is drawn onto the client card, and two bubbles are drawn into the Chat panel | the client has no phone on file, so the card published `Phone: —` beside a real email and read as a broken field. The number is the 555 number this same client carries in the Appointments figures, from `injections.mjs`, so she has one number across both articles. The chat is empty on every record on staging, as it is for the job figures above. |

## The Dashboard, Scheduler and Map figures run on a re-dressed day

The three visual sections all answer the same question, "what is on today", and
on this account the honest answer is nothing worth a picture. The 183 real jobs
are almost all in the past; the busiest day runs from 1 AM to 3 AM with two jobs
overlapping at 7 PM, and every one of them is called `JOB-1037`. A figure of
that teaches nobody how a scheduler works.

So the day is **re-dressed, not invented**. `schedule-fixture.mjs` takes the
account's own jobs and keeps everything that makes them real, the property, the
address, the coordinates, the client, the phone, the crew and its lead, and
rewrites three things in the browser after the response arrives and before the
app reads it:

- the **name**, to the trade of the crew doing the work
- the **start and stop**, into business hours, nothing over two hours
- the **status**, so the figure shows more than one of them

Nothing is written to staging. A reload shows the account exactly as it is.

| Script | Operation it rewrites | What the figures show |
|---|---|---|
| `dashboard.mjs` | `GetDashboard` | the scheduler widget's day, the four cards' trend series, and the sender name and face on each Inbox row |
| `dashboard.mjs` | `GetJobsMinimal` | the Upcoming Jobs tab, which really holds one row, because everything else is in the past |
| `scheduler.mjs` | `GetJobsScheduler` | the Day and Week grids |
| `map.mjs` | `GetJobsMapView` | the pins, narrowed to Arizona |

Three details worth keeping, because each one cost an afternoon:

- **The trend series is replaced too.** The real one is almost all zeros around
  a single 80-job week, so the bars read as flat with one spike, and profit fell
  to zero last week, which paints a red "down 100%" badge on the very card whose
  figure is meant to explain what the badge means. The headline numbers on the
  cards are the account's own and are untouched.
- **The pins are Arizona only.** The account also has work in Denver, Houston,
  Chicago and Boston, and all of it at once zooms the map out to the United
  States, where every pin is a dot.
- **Source records are scored before being used.** Staging carries clients
  called `UserContact Only Co 5d7530` with `client_gate_@example.com` inboxes,
  and others whose contact email belongs to somebody else entirely, which in a
  popover reads as "Lucia Navarro, andres.morales@...". The best-scoring record
  goes in the slot the popover figure clicks.

`map/05-map-empty` is **not** arranged. It searches for something that matches
nothing and photographs what the app really says.

## Faces on the Inbox rows

The Inbox card shows who wrote the last message, and on this account that name
comes back empty, so every row published as "Someone:". The sender's own first
name is put back and a portrait goes with it, from the same set
`portraits.mjs` uses everywhere else.

The portrait is chosen by the first name. A name in **neither** list used to
fall through to simple alternation, which is how a message from **Marcus** was
published with a woman's face on it. The lists are now wider than the account
needs, `bucketFor` returns null rather than guessing, and `dashboard.mjs`
prints the names it could not place:

```
! no face rule for: Client, awdsad (add them to portraits.mjs)
```

If that line appears for a real person's name, add it before publishing.

## The Settings figures

Taken by `scripts/kb-screenshots/settings.mjs`, from the account's own
settings. Each section has its own URL, so they are reached by address.

`settings/05-settings-unsaved` is the only one that touches a form: it opens one
card for editing, types a single character to make the form dirty, photographs
the guard that fires on leaving, and then presses **Discard Changes**. Nothing
is saved, and no setting on the account changes.

Settings came off the coverage script's out-of-scope list on 2026-10-08. It had
been excluded while the redesign was in flight; staging now runs it, which the
script checks and prints on every run:

```
business section mentions: Invoice Instructions, Privacy, Information Sharing
```

## Copy from group: why these come from develop, and who took them

The control is photographed on **develop**, not staging, because on staging it
does not render at all. `api-staging` fails to resolve
`Group.serviceItems` whenever `isInventoryDisabled` is requested, which is a
field `GET_GROUPS` always asks for, so Apollo discards the data, the hook hands
the component an empty list, and `CopyFromGroupSection` removes itself:

```
if (!loading && groups.length === 0) return null;
```

Six estimates and six invoices were opened on staging and none showed the card.
Reported as **API-1217**, with the payloads. Re-shoot on staging once it is fixed.

`estimates/11-group-copy-preview` and `invoices/11-group-copy-preview` are from
the develop account `service-app@stwitechnologies.com`, chosen because its data
is presentable: real client names, real addresses, and groups called Safety
Equipment, Cooling Equipment and Electrical Supplies rather than "Name01" and
"dsdfs".

### Four figures were taken by hand

The add drawer's step two could not be reached by script. Getting there means
filling three custom selects, and the client one never commits: the field is
not an input until the dropdown opens, the placeholder text also exists on the
list page behind the drawer, and the picker's first row is "Quick Add: New
Client", which opens a client form inside the drawer when clicked by mistake.
After several attempts these were captured by hand instead and cropped to the
modal by brightness, the same framing the scripted panel figures use:

| Figure | What it shows |
|---|---|
| `estimates/03-add-estimate-panel` | step one, filled in, with Expiration Date switched on |
| `estimates/04-add-estimate-step2` | step two, Groups above Services and Products |
| `invoices/04-add-invoice-step2` | the same, on Create Invoice |
| `appointments/04-add-appointment-step2` | Schedule & Review: the switches, duration, date, time and summary |
| `appointments/07-send-to-client` | the Send to Client panel |

**`appointments/07-send-to-client` carries a defect in plain sight.** Its
message body prints a literal `\n\n` where the line breaks belong, and the
client link points at `client-app-develop`. The first is the fault this panel
was held back for in the first place, and it is still there. It is published
because the section needs a picture and the panel is otherwise accurate;
replace it the moment the newline is fixed.

### No avatar montage, a tighter crop instead

These two figures were taken on a different account, so the face in the top bar
was not the one the rest of the knowledge base shows. Painting the right face
over it was tried and looked exactly like what it was, so the figures are
cropped to the Groups card instead. The top bar is not in frame at all, which
is both cleaner and closer to what the section is about.

### One figure was dropped rather than published

The picker-open shot of the Groups card, on both the estimate and the invoice,
showed the same three group names twice over and taught nothing the preview
figure does not. Taken, reviewed, deleted.

## One figure opened by a different door

`scheduler/07-scheduler-reschedule` is the panel a drag opens, but it was not
opened by a drag. A synthetic pointer drag does not reach Syncfusion: it was
tried at several speeds and hold times, in both directions, into future slots
and past ones, and the scheduler never registered it, with no toast and no
overlay to show for it. The same panel, `RescheduleJobStepperModal`, is also on
a job's More Actions menu, which is where this one was opened.

The difference is visible and the caption says so: opened from the menu the
date fields are empty, where a drag arrives with the new start and end already
filled in. Re-shoot from a real drag if that ever becomes automatable.

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
| Take after photos | yes |, |
| Record materials used |, | yes |
| Get the client's sign off |, | yes |

## Figures deliberately not taken

Beyond the blocked list in the coverage script:

- **Tracking time** (Jobs), starting the timer writes a timesheet record. The
  `Start Timer` button itself is in the job detail figure's header; it only
  exists while the job is still open.
- **The Send to Client panel** (Jobs), captured and then held back, because its
  message body shows a literal `\n\n` where the line breaks should be. The same
  component on Estimates (`Submit estimate`) and Invoices (`Send Invoice`)
  renders those breaks correctly, and both of those panels ARE published, so the
  fault is specific to the job panel. The More Actions figure shows where the
  action lives instead. The capture is kept as evidence at
  `~/dhs_qa_workspace/screenshots/kb-findings/2026-09-11/job-send-to-client-panel.png`;
  re-shoot into the article once it is fixed.

## One thing wrong in three published figures

`estimates/06-submit-estimate`, `invoices/04-send-invoice` and the held-back job
panel all build the client's link against
`client-app-develop.directhomeservice.com`, from staging. The host comes from
the environment, so it is not something a reader can act on, but it is an
internal hostname sitting in two published figures. It is reported as a finding.
It is NOT a reason to hold one figure and not the others, and the earlier note
here that treated it that way was wrong: either all three go or none do. They
stay until someone decides otherwise, because the alternative is doctoring a URL
in a figure, which is worse than showing the real one.
