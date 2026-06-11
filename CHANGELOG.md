# Changelog

## 2026-06-12 — Renew creates a booking-link enquiry; booking-links company-first

- **Renew now follows the standard flow** — instead of directly creating a `quoted` booking, "Send renewal to tenant" hands the prefilled details (tenant, centre, dates, rate) to the **booking-links create overlay** and navigates there (`useState('renewal-draft')` → `/booking-links?create=1`, prefilled). It goes out as a booking-link **enquiry**; once the tenant completes it, it becomes a booking — same path as a normal Create booking. (The booking's space isn't in the catalog, so the landlord picks the space on the create form; everything else is prefilled.) The Renew button stays hidden after sending (`useState('renewal-sent')`).
- **Booking-links table is company-first** — swapped the columns so **Company** is the primary detail (bold, first) and the **Contact** (name + email) is secondary, matching the CRM company-first model.

## 2026-06-12 — Renewals: tenant links + a renew flow on bookings

- **Tenant renewal callout** now has **Message tenant** and **View booking** actions (the latter deep-links to the specific ending booking via `/bookings?q=<id>`).
- **Renew on the bookings page** — the notifications column (2nd-last, where the overdue/clash flags live) now shows an amber **Renew** button on renewable bookings (confirmed, ending ≤14 days, no later confirmed booking for the same tenant — mirrors the Tenants logic). Clicking opens a **Renew overlay**: proposes a new term (date-range picker that blocks dates already booked on that space) prefilled to follow straight on from the current term, with an editable rate (You-receive preview). "Send renewal to tenant" sends it out as a renewal (see the later entry — this was subsequently changed to create a booking-link enquiry rather than a direct quoted booking).

## 2026-06-12 — Tenants: directory + overlay refinements

- **Directory table** — gave the primary contact its **own "Primary contact" column** (name + role) in position 2, rather than crammed under the company; removed the **Centres** column. Columns are now Company · Primary contact · Category · Bookings · Lifetime value · Stage · renewal flag.
- **Category is now company-level** — a company's own sector (Sportswear, Beauty & cosmetics, Technology, Food & beverage, Luxury…) rather than a booking-type derived from its bookings (a company runs many booking types). Sourced from a new company master file: `server/data/companies.json` + `/api/companies` (keyed by company → `{ category, contacts }`), which also absorbs the contact rosters (the old `contacts.json`/`/api/contacts` is removed).
- **Transactions section in the tenant overlay** — replaces the standalone numbers block: shows the financial summary (lifetime value / bookings / outstanding / payment reliability), the **count of upcoming payments**, a list of **overdue payments** (label · booking ref · due date · amount), and a **View all → /transactions?q=<company>** link.

## 2026-06-12 — Tenants (CRM) section v1

New **landlord-specific "Tenants" section** (`/preview/tenants`) — positioned in the sidebar directly under Transactions, on both Fillit and eLeaseLoop landlord navs (renamed/repositioned the existing `crm` nav item; route `/preview/crm` → `/preview/tenants`).

- **Scope decision:** CRM = *one tenant's world* (relationship, history, their numbers in context); the upcoming Analytics page owns *portfolio aggregates* (revenue trends, occupancy, funnels). So this shows tenant-scoped data, not charts.
- **Tenant directory** — derived from `bookings.json` (grouped by company, scoped to the active landlord team) merged with seeded **prospects** from a new `server/data/tenants.json` + `/api/tenants`. Columns: company (+ contact, "Repeat" tag for ≥2 bookings), category, centres used, bookings, lifetime value (landlord net), stage. Search + stage tabs (All / Active / Leads / Prospects / Lapsed).
- **Pipeline stage** — derived from booking activity: Active (confirmed upcoming/live), Lead (open enquiry/quote/awaiting), Prospect (no bookings yet), Lapsed (past only). Shown via `StatusDot`.
- **Renewal prompts** — flags tenants with a confirmed booking ending within 14 days and no follow-on already booked; a "Renewals due" filter chip (with count), a row badge, and a callout in the overlay. (Direct hook into the bookings summary.)
- **Tenant 360 overlay** (centered modal) — contact details, lifetime value / bookings / outstanding / payment reliability, their bookings & enquiries list, per-tenant notes, and quick actions: Message, **View bookings** (deep-links to `/preview/bookings?q=<company>`), **Create booking** (→ booking-links create overlay).
- **Companies have multiple people** (chose company-first over a separate Users page): the directory stays company-level — the contact column shows the primary contact + "+N more" — and the overlay has **Overview / People tabs**. People lists every contact at the company (name, role, email, phone, "Primary" badge, and how many bookings each is the booker on). Contacts come from a new `server/data/contacts.json` (`/api/contacts`, keyed by company) merged with the booking contacts; seeded multi-person rosters for Nike (3), Glossier / Samsung / Fresh Co. (2). Designed as a strict subset of the two-page option, so a standalone Users page can be added later with no rework.
- Wired the bookings page to honour `?q=` (prefills search + jumps to the tab with the most matches) so the CRM → bookings deep-link lands on the tenant's bookings.

## 2026-06-11 — Bookings: status-change highlight

- After a status transition (send changes / accept quote / sign lease), the booking's **StatusDot briefly pulses its size** to draw the eye to what changed — a single-colour scale pulse (1 → 1.12 → 1), `1.36s` per cycle ×2 (`status-change-pulse` keyframe in `StatusDot.vue`, follows the existing `row-search-pulse` pattern). Added an optional `highlight` prop to `StatusDot`; the bookings page sets `statusPulseId` on transition (`pulseStatus`, auto-clears after ~2.9s) and passes `:highlight` to the list row + overlay strip dots. (Iterated from earlier colour/opacity flashes — the final effect keeps one colour and only animates size.)

## 2026-06-11 — Bookings: landlords can change space + dates on enquiries (with availability)

Extends enquiry editing (previously rate-only) so a landlord can also reassign the **space** and adjust the **dates** before sending an enquiry back — with live availability:

- **Editable dates** — a `RangeCalendar` popover in the overlay (landlord + enquiry). Dates already booked for the selected space are shown struck-through and **can't be selected** (`dateUnavailable` → reka-ui `is-date-unavailable`). Fixed the shared `RangeCalendarCellTrigger` unavailable style (was `text-destructive-foreground`, ~invisible on white) to a muted struck-through style
- **Editable space** — a popover picker of the centre's spaces (derived from the bookings dataset so availability stays consistent with the conflict logic). Each option shows a **Free / Booked** indicator for the tenant's currently-chosen dates (`spaceAvailableForDraft`)
- **Clash flag on reassignment** — if the landlord picks a space that's already booked for the chosen dates, the amber conflict banner now reads "{space} is unavailable for these dates" and lists the clashing booking(s); "Send changes to tenant" is disabled with a hint until they pick a free space or change the dates (`draftBlocking` / `overlayBlocking`)
- Space/date edits count as "changes" (CTA → "Send changes to tenant") and are persisted on send; `sendQuote` writes the drafted space + period back to the booking
- **Confirm step** — "Send changes to tenant" now opens a confirmation modal with a before→after summary of the edits (space / dates / rate / payment schedule) before committing (`changeSummary`); "Back" cancels, "Send to tenant" sends. The unchanged "Accept enquiry" path still sends directly with no modal
- Seeded enquiry 10098 (Patagonia, Westfield Pop-up Space P2, 6–20 Jul) as a clean demo: free on its own space, clashes if switched to Kiosk A2 (#12001) or Kiosk A3 (#10042)

## 2026-06-10 — Bookings: payment schedule on all summaries + CTA clarity

- **Payment schedule now appears on every booking** (incl. new enquiries). When no schedule is stored yet, a proposed single "Full payment" is derived from the (live) gross total via `displayPayments` — for an enquiry under negotiation it tracks the rate the landlord is setting
- **Editable only before the booking starts** — the Edit button is gated by `scheduleEditable` (landlord, not closed, `period.from` in the future); active/started, past and closed bookings are read-only. Within an open edit, already-paid instalments stay locked (only upcoming payments can be changed) — so once the first/any payment is made it can't be altered
- **Amounts aligned** — the schedule display is now a CSS grid so payment amounts (and statuses) line up vertically in their own columns regardless of trailing actions
- **Landlord enquiry CTA** — now reads **"Accept enquiry"** when nothing's been changed, and **"Send changes to tenant"** once the rate or payment schedule has been edited (`enquiryChanged`); the activity log reflects which happened
- **Copy** — the quoted/awaiting-signature "Cancel" CTAs now read **"Cancel booking"** for clarity (matching the confirmed states)

## 2026-06-09 — Bookings Wave 4 (Nhood / eLeaseLoop enterprise flow)

Gated on `platform === 'eleaseloop'`. Closes out the approved gap-analysis backlog (country/tax deferred).

- **DocuSign lease-signature state machine** — eLeaseLoop confirms via signature (Fillit still confirms directly). A new "Lease signature" section shows the envelope status (Not yet sent → Out for signature → Signed, plus Voided/Failed) with sent/signed dates and the envelope ID. Flow: tenant **Accept quote** → `awaiting_signature` (lease not yet sent) instead of straight to confirmed; landlord **Send for signature** → envelope sent; tenant **Sign lease** (enabled only once sent) → envelope completed → `confirmed`. The "Sign lease" button is disabled until the lease is sent, and waiting hints flip between parties accordingly
- **Bucketing** — a landlord whose lease is accepted-but-unsent now sees the booking in **Action needed** (they own the "send" step); the tenant sees it as waiting until it's sent (`isActionNeeded` accounts for the lease sub-state)
- **Yardi External Ref ID** — an inline editable field on the booking for Nhood landlords (the external accounting/ERP reference), seeded on a confirmed booking and editable on the rest
- **Void on cancel** — cancelling a booking with a live envelope (sent/created) voids it (`docusign.status → 'voided'`); combined with the Wave 1 post-signature cancel lock (signed eLeaseLoop bookings can't be cancelled in-app)
- Seeded a Nhood booking accepted-but-unsent (20020, to exercise Send for signature) and an external ref on 20001

## 2026-06-09 — Bookings Wave 3 (Nhood manager approval actions)

- **Manager approval is now actionable** (was read-only). On eLeaseLoop (Nhood), an approver can **Approve** or **Reject** a booking's approval chain from the overlay. Mirrors production's `ManagerApproval`:
  - **Role gate** — regional/commercial managers can approve; the accountant role can't. We map our roles: `role !== 'accounts'` can approve (`canApproveManager`). When an "accounts" user views a pending approval, the buttons are replaced with a note ("Accounts can view approvals but can't approve — needs a commercial or regional manager")
  - **2-stage escalation** — approving the asset-manager step stamps it and escalates to a senior approver (added to the chain, awaiting); approving the senior step completes the approval (header shows a green "Approved")
  - **Reject** opens the reason modal (Pricing not approved / Terms need revision / Space allocation issue / Other) and marks the step "Not approved", ending the chain
  - Each step shows its decision + date ("Approved · 9 Jun 2026" / "Not approved · …" / "Awaiting review"); all actions log to the activity timeline
  - Approvals only show on Nhood bookings (the `managerApproval` chain); Fillit bookings have none

## 2026-06-09 — Bookings Wave 2 (double-booking conflicts & price-on-application)

- **Double-booking conflicts** — mirrors production's `BookingConflictsService`: detects other live bookings on the *same space* with overlapping dates. A *blocking* conflict is an overlap with a **confirmed** booking. Landlords see an amber warning triangle in the list flag column (tooltip "Dates clash with a confirmed booking") and a conflict banner at the top of the overlay listing the clashing booking(s) (#id · tenant · dates). The **confirm-time guard**: on an enquiry with a blocking conflict, "Send to tenant" is disabled with a hint to adjust the dates first (mirrors production turning Accept into Edit / `disable_submit`). Seeded a clashing enquiry (10097, overlaps confirmed 12001 on Kiosk A2)
- **Price on application** — mirrors production's `listing.price_on_application` / "A consultar". A POA enquiry has no set price: the list shows "POA" instead of a rate, the overlay shows a "Price on application" badge and (for the tenant) a "Price on application" line instead of figures. The landlord must set a rate before "Send to tenant" enables (rate-gated, with a "Set a rate…" hint); sending clears the POA flag and derives VAT/fee/totals as normal. Ties into the existing rate-negotiation flow. Seeded a POA enquiry (10096, Rolex)

## 2026-06-09 — Production gap analysis + bookings Wave 1 (landlord action polish & auto badges)

Reviewed the production Fillit codebase for booking features/actions missing from the design-lab app (landlord vs tenant, Fillit vs eLeaseLoop/Nhood, edge cases) and produced a prioritized gap summary. Approved work is being built in waves; country/tax (IVA/IRPF, fiscal IDs) is deferred. **Wave 1:**

- **Auto-status badges** — closed bookings that were changed automatically now carry an `autoChanged` reason. The list shows a small "AUTO" tag (tooltip = full reason) under the status; the detail overlay shows a callout banner at the top (e.g. "Auto-cancelled — card payment failed" + the underlying reason + refund line). Reasons mirror production: auto_decline / auto_cancel / auto_cancel_no_card / auto_cancel_card_failed / auto_declined_date_passed. Seeded two demo records (10079 auto-declined, 10068 auto-cancelled/card-failed)
- **Closed-reason banner** — declined/cancelled bookings (manual or auto) now surface *why* they closed at the top of the overlay, with the reason and (for cancellations) the refund outcome
- **Cancellation flow** — the bare cancel/decline/withdraw stubs now open a reusable reason modal: role-specific reason options (+ free-text "Other"), and for cancelling a *confirmed* booking a **refund-window** notice (full refund up to 14 days before start, none after). Confirming records the reason + refund outcome on the booking and logs it to the activity timeline
- **Post-signature cancel lock** — on eLeaseLoop (Nhood), a confirmed booking whose lease is signed (`docusign.status === 'completed'`) hides the Cancel button and shows a footer hint to use messaging instead — mirrors production `restrict_cancel`
- **Report a problem** — new Report CTA on confirmed/closed bookings opens the reason modal (Payment issue / Dispute / Space condition / Other); submitting logs to the activity timeline and keeps the booking open
- **Mark payment received** ("paid to centre") — landlords can record an offline payment against a scheduled instalment of a confirmed booking: date received, payment method (bank transfer / card / direct debit / SEPA / cash), and an optional proof-of-payment upload. Flips the row to Paid, recomputes the booking payment status (clearing the overdue flag when settled), and logs it
- Overlay/modal hygiene: switching team or viewer role (dev switcher) closes any open overlay so it can't show stale data. New reason/mark-paid modals reuse the centered-overlay pattern (z-[60] above the detail overlay), never slide-overs

## 2026-06-09 — Bookings page, data model & status taxonomy

- Analyzed the production Fillit codebase (Rails, `vue3-vite-migration` branch) for the real booking lifecycle, then defined a redesigned 6-state taxonomy — `enquiry → quoted → awaiting_signature → confirmed`, plus `declined`/`cancelled` — with `upcoming`/`active`/`completed` derived from booking dates and action-ownership derived per viewer (replaces production's role-swapping status tabs)
- Re-seeded `server/data/bookings.json` with 22 records in a production-style nested shape (landlord, tenant, space, enquiry, financials, payments, documents, docusign, managerApproval, audit trail) and added the `/api/bookings` route
- Built the bookings list page (`/preview/bookings`): role-aware landlord/tenant views, Action needed / Upcoming / Past / Closed tabs, split Start/End date columns, centre + date-range + search filters, and a "Live now" indicator for active bookings
- Wired the previously dead Bookings sidebar item and moved Transactions to the 3rd nav position (behind Bookings) across all platform×role configs
- Overdue payments surface on the bookings list: an overdue booking is pulled into Action needed (even from Past — bad-debt collection) and shows an inline red flag icon (tooltip: "Payment overdue") beside its lifecycle status pill
- Copy: bookings CTA renamed "New booking" → "Create booking" (matches booking-links); booking-links "Completed" status relabelled "Enquiry created" (display only — clarifies that the link created an enquiry, not that the booking is finished)
- Modernised the bookings status indicators from tinted pills to a **dot + label** style (colour in the dot only, foreground label, pulsing dot on "Live now"), extracted as a shared `components/StatusDot.vue` and rolled out across bookings, booking-links, transactions (incl. editable payment-status buttons), teams, centres, and spaces — replacing the old tinted pills app-wide; the overdue flag is now a filled red icon. All table columns are left-aligned for consistency (data columns on teams' four sub-tables included; action columns and the roles permission matrix stay centered), and status columns get `pl-8` breathing room so they clear the preceding column (e.g. the right-aligned rate)
- Search now **filters** the list (excludes non-matching rows) on bookings, transactions, booking-links, centres, and spaces — replacing the highlight-and-cycle behaviour. Filtering is live as you type, with a "N results" count and an empty-results row (added one to centres). The `row-search-pulse` animation is retained only for the new-row flash on spaces. Transactions search also matches the centre column
- The landlord "Create booking" CTA on bookings now lands on booking-links with `?create=1` and auto-opens the create overlay after a 500ms beat (so the page change registers first)
- Added the **booking detail overlay** (click a row — a centered modal, not a right slide-over, so it doesn't clash with the notifications/assistant panel): role-aware sections (key facts, financials, payment schedule, documents, enquiry, Nhood manager approval, activity timeline, notes) and a status- + role-driven CTA footer built on action ownership — the primary CTA is the action the viewer owns (landlord: Accept enquiry; tenant: Accept quote / Sign lease), with a "waiting on…" hint when the ball is with the other party, an overdue-payment primary (Send reminder / Pay now), and Cancel only on cancellable states. Typography follows the Create booking overlay (h2 `text-lg` title, h3 `text-sm` section headings, muted field labels)
- Booking detail overlay — **transactions summary** (collected / outstanding) + a "View transactions" button that opens `/transactions` pre-filtered to the booking ID (`?q=<id>`)
- Booking detail overlay — landlords can **negotiate the rate** on an enquiry: adjust the rate (VAT / fee / totals re-derive live) and "Send to tenant" → `quoted`; the tenant then **Accept quote** (→ confirmed) or **Decline** (→ declined). Accept/decline/cancel transitions are wired across the overlay
- Booking detail overlay — landlords can **edit the payment schedule** inline (paid rows locked; add/remove rows; dates must be ordered and within the booking window; amounts must sum to the booking total — Save is gated, with a live "balanced / N left / N over" indicator), mirroring the production rules
- The overdue flag now sits in its own column (between Status and the notes column) rather than inline beside the status dot
- **Notes** — per-viewer note on every booking via a note icon in the final table column (outline → filled yellow when the viewer has added one) with an inline popover editor; the viewer's note also appears in the detail overlay

## 2026-06-05 — Email tool UI polish

- Removed scenario selector from email preview — simplified to fixture data only
- Moved view toggle (HTML / Variables) to top-right button group alongside dark mode toggle
- `PreviewMeta` and `LocaleTabs` components cleaned up to reflect the simplified toolbar
- Earlier session added: fixture system with real brand data, data/variables view toggle, persistent dark toggle, brand tag in card header, and light/dark appearance toggle per-card

## 2026-06-04 — Messages: simulated replies and push notifications

- Messages inbox now supports simulated replies — sending a message triggers a realistic reply after a short delay
- Push notifications fire on reply, matching the notification pattern from the broader app

## 2026-05-28 — Country system, messaging redesign, and empty states

### Country / multi-market architecture
- **Country selector** added to the eLeaseLoop sidebar (landlord + tenant) above the team switcher. Shows only countries where the user has active teams. Uses square CSS flag icons (`flag-icons` library, `fi fis fi-{code}`) matching the team avatar shape. A `SidebarSeparator` divides it from the team switcher
- **Country-scoped teams** — `useTeamContext` extended with `activeCountry`, `userCountries`, `hasCountryAccess`, `setActiveCountry`, and `createTeamInCountry`. `teams` computed is now filtered to the active country; `allUserTeams` covers all countries for mismatch detection
- **Country mismatch overlay** — when a user lands on a country where they have no team (landlord or tenant), a full-page overlay appears offering: switch to one of their active countries, or create a new team in the current country. Applies to both user types on eLeaseLoop
- **Inline team creation** — the overlay switches to a create-team form (with back arrow to return to the mismatch view) that pre-fills a sensible team name. On creation, the app navigates to `/preview/teams` and the new team starts with empty data on every page
- **DevSwitcher site-country section** — new segment in the DevSwitcher (eLeaseLoop only) to simulate switching URL country (`.com/es`, `.com/fr`, etc.) for testing the mismatch flow
- **Nhood FR North + FR South** — France now has two teams (`team-france` → "Nhood FR North", new `team-france-south` → "Nhood FR South", color `#1a5276`) to demonstrate multi-team country demo. Both teams in the default landlord membership
- **Team names updated**: Spain → Nhood ES, France → Nhood FR North/South, Italy → Nhood IT, Poland → Nhood PL (Germany removed from country list)

### Teams page
- **Team selector removed** from the page — team is now controlled solely via the sidebar. An **Edit team** button added to the page header in its place
- **Switch team scoped to country** — the "Switch team" dialog for both members and centres now only lists teams in the same country (eLeaseLoop). The button is hidden when there are no same-country targets (`otherTeams` computed is country-filtered)
- **Switch team button guard** changed from `allTeams.length > 1` to `otherTeams.length > 0`

### Messages — inbox card redesign
- **Conversation types** — `Conversation` now has `type: 'enquiry' | 'general' | 'booking'` plus `centreName`, `centreColor`, `bookingId`, `orgName`, `orgColor` fields
- **Airbnb-style composite avatars** — enquiry and booking conversations show a square centre logo with a floating circular org logo overlay (16×16, `border-2 border-background` ring). General conversations use a plain circle
- **Three-line inbox layout**: Line 1 = entity name (centre / org / company), Line 2 = contextual detail (booking ID, person name, or blank non-breaking space to preserve layout), Line 3 = message preview with "You:" prefix and unread badge
- **Landlord view display rules**: enquiry + general → circle (tenant org), line 1 = company, line 2 = person; booking → composite (centre square + tenant org float), line 1 = company, line 2 = booking ID
- **Tenant view display rules**: enquiry → composite (centre + own org float), line 1 = centre; booking → composite (centre + landlord org float), line 1 = centre, line 2 = booking ID; general → plain circle (landlord org), line 1 = org name
- **Thread header** updated to use the same composite avatar and display logic
- **Tenant conversations** — 3 new threads added for `team-tenant` (Fresh Co.): one enquiry, one booking (#10099), one general message from Nhood ES / Carlos García
- **All 11 existing conversations** tagged with type, centre, and org fields; France team threads updated to reference "Nhood FR North"

### Empty states and data isolation
- **`hasTeamData` bug fixed** across transactions, invoices, booking-links, centres, spaces, and teams pages — the `if (!activeTeamId.value) return true` short-circuit was causing all mock data to show on countries with no team. Changed to `return false` so pages correctly show "Nothing here yet" when no team is active
- **`teamId === null` guard removed** from transactions, invoices, and booking-links — changed from `t.teamId === null || t.teamId === activeTeamId.value` to strict `t.teamId === activeTeamId.value` so legacy unassigned records don't pollute new-team empty states
- **Nuxt `useState` shallow reactivity fix** — `setPlatform`, `setUserType`, `setRole` in `useAppContext` now replace the full `context.value` object (`{ ...context.value, key: v }`) instead of mutating a property, ensuring DevSwitcher labels re-render correctly

## 2026-05-27 — Search, centre filters, bookings data model, and UI consistency

- **Search bars** added to Transactions (landlord), Booking links, and Invoices (tenant) pages — same style as the Centres page search. Searches: Booking ID + tenant on transactions; tenant name, company, and booking ID on booking links; booking ID + company on invoices
- **Cmd+F-style match cycling** — Enter advances through matches with a "2 / 5" counter shown inline. `watch(searchQuery)` resets index so new queries start from the first match. Row pulses with the shared `row-search-pulse` blue animation on each jump
- **Centre filter** (multi-select Popover) added to Transactions toolbar (beside date picker) and Booking links toolbar (beside "Create booking"). Inline checkbox list; label collapses to "3 centres" when multiple selected; "Clear filter" footer link. Available centres are scoped to the active team
- **Bookings data model** — new `server/data/bookings.json` canonical booking records. Each booking links to a `landlordTeamId`, an optional `tenantTeamId` (null for external companies not yet on the platform), a `centreId`, and a `spaceId`. Booking ownership is at the team level, not the user, so it survives user churn. ~30 seed records covering all Fillit and eLeaseLoop teams plus Fresh Co. tenant bookings (12001–12002) and booking-link-derived records (11001–11006)
- **Booking ID consistency** — "Booking" column header renamed to "Booking ID" across all tables (transactions, invoices). All booking ref values are now 5 numerical digits only — stripped `FILL-`/`ELL-`/`BK-` prefixes from mock data in `transactions.get.ts` and `booking-links.json`
- **Reminder overlay** — note added: "An email and in-app notification has been sent to the tenant." Reminder tooltip second line shows email delivery status: Delivered · Opened · Clicked · Bounced (no colour coding, status in bold)
- **Reminder button bug fixes** — (1) Reka UI `Primitive` doesn't trigger Tailwind `disabled:` CSS pseudo-class variants; fixed with explicit `:class` binding for `opacity-40 pointer-events-none`. (2) SSR hydration mismatch when loading state from `localStorage` on the client; fixed by removing persistence entirely — reminder state is now in-memory only
- **Sidebar** — team initial avatar in team switcher trigger resized to `h-4 w-4 text-[9px]` to match nav icon size (`size-4`)
- **Filter button sizing** — All dates and All centres selector buttons resized to `h-8 px-3 text-xs` across Transactions, Booking links, and Invoices to match adjacent `size="sm"` buttons

## 2026-05-27 — Booking links page, transactions polish, and notification registry

- New **Booking links** page (`/preview/booking-links`) — Create Link sidebar item now routes here. Shows a history table of sent booking invitations (tenant, booking ID, centre/space, rate, status with tooltip attribution). Sortable columns; status tabs (All / Sent / Declined / Completed)
- **Create booking overlay** — multi-section form with tenant email autocomplete (existing users pre-fill name/company), booking period range picker, centre + space selects, and rate/deposit fields. Name/company fields appear on valid email entry with a slide-in transition
- **Booking links data layer** — `server/data/booking-links.json` fixture and `GET /api/booking-links` Nitro route; page uses `useAsyncData` with a local mutable copy for optimistic new-link inserts. Each record carries `centreId` and `teamId` for future team-filter support
- **Transactions** — payment in/out columns are now sortable. Manual status changes record who changed them and when; tooltip shows e.g. "Manually changed by Sarah Mitchell on 27 May 2026". Reminder button now shows when last reminder was sent while disabled
- **Notification registry** — added `booking_link.received` (tenant: new enquiry request from centre), `booking_link.completed`, and `booking_link.declined` (both landlord-facing) with payload shapes and Rails trigger annotations
- **Currency** — booking links default to EUR throughout (form labels, JSON fixture, `formatAmount` helper)
- **UI fixes** — centres overlay section headings corrected to `text-sm font-semibold text-foreground` (were `text-base` with reduced opacity); stale blob URL removed from Westfield London in `centres.json`; booking ID links use muted foreground instead of primary colour

## 2026-05-25 — Platform architecture, multi-user config, and UI polish

- Added platform config system supporting Fillit (coral) and eLeaseLoop (teal) themes, with nav items, org menu, and sidebar content filtered per platform and user type (landlord/tenant)
- Built `DevSwitcher` floating toolbar for toggling platform, user type, and role in-prototype without page reloads
- Added `FloatingLabelSelect` component matching `FloatingLabelInput` styling exactly, including a `#trigger-prefix` slot for team avatars and inline flex layouts
- Added `RightPanel` with notifications and AI assistant tabs; added `useTeamContext` composable for global team selection persisted across navigation
- New preview pages: Transactions (with date range picker and filters), Spaces, Payments/Payouts (Dialog-based add account), Organisation Profile (with tenant retargeting fields), and Notifications Settings (tenant-aware required/optional sets)
- Sidebar refactored: Account renamed to Organisation, Profile/Security moved to footer dropdown, global team switcher added, per-page team selectors removed across all pages

## 2026-05-14 — Initial project setup

- Scaffolded Nuxt 3 design lab with Tailwind CSS, shadcn-vue (New York style), and Tabler icons; coral primary color token and full light/dark token set defined
- Built `AppSidebar` with logo, grouped nav, sub-items, badge counts, and user footer dropdown
- Installed shadcn-vue component set: Button, Input (floating label), Badge, Card, Dialog, Dropdown, Table, Select, Tabs, and others
- Initial preview pages: Centres (sortable table), Lease Details, Teams (tabs, signatory column), Profile, Security, and preview index listing
- Server data layer with mock JSON for centres, spaces, transactions, and teams
