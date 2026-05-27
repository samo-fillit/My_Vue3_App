# Changelog

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
