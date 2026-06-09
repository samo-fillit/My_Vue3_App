# Changelog

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
- Added the **booking detail slide-over** (click a row): role-aware sections (key facts, financials, payment schedule, documents, enquiry, Nhood manager approval, activity timeline, notes) and a status- + role-driven CTA footer built on action ownership — the primary CTA is the action the viewer owns (landlord: Accept enquiry; tenant: Accept quote / Sign lease), with a "waiting on…" hint when the ball is with the other party, an overdue-payment primary (Send reminder / Pay now), and Cancel only on cancellable states

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
