# Fillit Design Lab — Architecture

## Stack
- Nuxt 3 (compatibilityDate: 2024-04-03), Vue 3, TypeScript
- Tailwind CSS v3 with CSS variable tokens (PostCSS + autoprefixer)
- shadcn-vue components (New York style, Reka UI primitives) in `components/ui/`
- Tabler icons via `@tabler/icons-vue`
- Inter font
- `flag-icons` for country flag CSS classes

## Project structure

| Directory | Purpose |
|-----------|---------|
| `pages/` | Nuxt file-based routes; top-level pages (e.g. `index.vue`) |
| `pages/preview/` | Isolated prototype routes — all design work lives here |
| `components/` | App-level components (`AppSidebar`, `RightPanel`, `DevSwitcher`) — auto-imported (excluding `ui/`) |
| `components/ui/` | shadcn-vue primitives — imported explicitly, not auto-imported |
| `composables/` | Shared reactive state and logic (`useAppContext`, `useTeamContext`, `useRightPanel`, `notifications.registry.ts`) |
| `config/` | Static configuration — platform × userType nav/feature matrix and role permissions |
| `server/api/` | Nitro API routes — thin GET/PUT handlers that read/write JSON files |
| `server/data/` | Flat JSON files acting as the local data store (no database) |
| `assets/css/` | `tailwind.css` — all CSS variable design tokens, base styles, dark mode overrides |

## Platform configuration (`config/platforms.ts`)

The app supports two platforms (`fillit`, `eleaseloop`) and two user types (`landlord`, `tenant`). The combination determines which nav and org-settings items appear in the sidebar.

**Nav items** (`NavItemId`): `dashboard`, `bookings`, `calendar`, `messages`, `create-link`, `transactions`, `invoices`, `analytics`, `crm`

**Country system (eLeaseLoop only):** The sidebar exposes a country selector above the team switcher, scoped to countries where the user has active teams. Switching country filters the team switcher and re-scopes all page data. If the user has no team in the active country a full-page mismatch overlay is shown, offering a country-switch or inline team-creation flow. Country state lives in `useTeamContext` (`activeCountry`, `userCountries`, `hasCountryAccess`, `setActiveCountry`, `createTeamInCountry`). Country codes are ISO 3166-1 alpha-2; flag icons use the `flag-icons` CSS library with `fi fis fi-{code}` classes.

**Org items** (`OrgItemId`): `account-profile`, `account-teams`, `account-centres`, `account-spaces`, `account-lease-info`, `account-payments`, `account-notifications`

| Platform | User type | Nav items | Org items |
|----------|-----------|-----------|-----------|
| fillit | landlord | dashboard, bookings, transactions, calendar, messages, create-link | profile, teams, centres, spaces, notifications |
| fillit | tenant | dashboard, bookings, invoices, calendar, messages | profile, teams, lease-info, notifications |
| eleaseloop | landlord | dashboard, bookings, transactions, calendar, messages, create-link, **analytics**, **crm** | profile, teams, centres, spaces, payments, notifications |
| eleaseloop | tenant | dashboard, bookings, invoices, calendar, messages | profile, teams, lease-info, notifications |

Nav order: `transactions` (landlord) / `invoices` (tenant) sit in the 3rd slot, directly behind `bookings`. The sidebar renders in `allMainNav` order (`components/app-sidebar.vue`); `platformConfig` arrays mirror that order.

**Role permissions** (`Role`: `admin`, `member`, `accounts`):

| Permission | Roles |
|-----------|-------|
| `manage:team` | admin |
| `manage:payouts` | admin, accounts |
| `manage:spaces` | admin |
| `manage:centres` | admin |
| `view:transactions` | admin, accounts |
| `view:analytics` | admin, accounts, member |
| `manage:crm` | admin, member |
| `export:data` | admin, accounts |

## Pages

| Route | File | Description |
|-------|------|-------------|
| `/preview` | `pages/preview/index.vue` | Index listing all in-progress prototype routes |
| `/preview/sidebar` | `pages/preview/sidebar.vue` | Full app shell with sidebar, right panel, and DevSwitcher |
| `/preview/profile` | `pages/preview/profile.vue` | Account — personal profile settings |
| `/preview/security` | `pages/preview/security.vue` | Account — password and security settings |
| `/preview/org-profile` | `pages/preview/org-profile.vue` | Organisation — company profile settings |
| `/preview/lease-details` | `pages/preview/lease-details.vue` | Organisation — lease details (tenant) |
| `/preview/teams` | `pages/preview/teams.vue` | Organisation — teams and member permissions management |
| `/preview/centres` | `pages/preview/centres.vue` | Organisation — shopping centres list with sortable table |
| `/preview/spaces` | `pages/preview/spaces.vue` | Organisation — rentable spaces within centres; on eLeaseLoop, new spaces require a payout account assignment (auto-suggested when all existing centre spaces share one account) |
| `/preview/payouts` | `pages/preview/payouts.vue` | Organisation — payout accounts with banking/company details, Manage Spaces assignment UI, and multi-account unassigned-spaces flow (eLeaseLoop only) |
| `/preview/notifications-settings` | `pages/preview/notifications-settings.vue` | Organisation — notification preferences |
| `/preview/transactions` | `pages/preview/transactions.vue` | Transactions list with team filter, date range picker, centre filter, search bar, and sortable table (landlord) |
| `/preview/invoices` | `pages/preview/invoices.vue` | Invoices list with date range picker, search bar, and sortable table (tenant) |
| `/preview/booking-links` | `pages/preview/booking-links.vue` | Booking links history with Create booking overlay, centre filter, and search bar; linked from "Create Link" sidebar item. Arriving with `?create=1` (e.g. the bookings page CTA) auto-opens the create overlay after a 500ms delay. Statuses: Sent / Declined / **Enquiry created** (the last = tenant completed the link, creating an enquiry/booking; underlying status value remains `completed`) |
| `/preview/messages` | `pages/preview/messages.vue` | Messaging inbox with Airbnb-style composite avatars, three-line layout, conversation types (enquiry / booking / general), and team/country-scoped filtering |
| `/preview/bookings` | `pages/preview/bookings/index.vue` | Bookings list — role-aware (landlord scopes by active team + sees tenant identity + "Create booking" CTA; tenant sees own bookings, second-person status labels, no create). Tabs: Action needed / Upcoming / Past / Closed (mutually exclusive buckets derived from the taxonomy). Split Start/End date columns (independently sortable), centre + date-range + search filters, centre-colour avatars. Status shown as a **coloured dot + label** (colour lives in the dot, label stays foreground; neutral states use `bg-muted-foreground`), with a pulsing dot on active "Live now" bookings. Bookings with an overdue payment (`financials.paymentStatus === 'overdue'`) are pulled into Action needed regardless of temporal state, keeping their lifecycle pill plus an inline red flag icon (tooltip: "Payment overdue") beside it. Primary CTA "Create booking" (landlord). Clicking a row opens the **booking detail overlay** (centered modal — never a right slide-over, which would clash with the notifications/assistant right panel): header (centre/space + status + ID), key facts, financials (role-aware: tenant "Total" vs landlord "You receive" after the Fillit fee), payment schedule, documents, enquiry, manager-approval chain (Nhood), activity timeline, notes — and a status- and role-aware CTA footer (see below). The overlay also has: a **transactions summary** (collected/outstanding) + "View transactions" button that deep-links to `/transactions?q=<bookingId>` (pre-fills its search); inline **rate negotiation** on enquiries (landlord adjusts the rate — VAT/fee/totals re-derive live via `deriveFinancials` — then "Send to tenant" → `quoted`; tenant accepts → `confirmed` or declines → `declined`); and an inline **editable payment schedule** (landlord; paid rows locked, add/remove rows, amounts must sum to the booking total and dates be ordered/in-window, Save gated by `scheduleValid`). **Notes** are per-viewer (landlord/tenant each have their own): a note icon in the final table column fills yellow when the viewer has a note, with a popover editor; the viewer's note also shows in the overlay. Reads `/api/bookings`. |

## Shared components

### `AppSidebar`
- **File:** `components/app-sidebar.vue`
- **Purpose:** Full-width sidebar using shadcn-vue `Sidebar` primitives. Renders nav items and org sub-items driven by `useAppContext`'s `activeNav`/`activeOrg`, a team switcher dropdown, notification/assistant panel toggles, and a user footer.
- **Props:** `activeItem?: string` (highlights the current nav item)
- **Consumes:** `useAppContext`, `useTeamContext`, `useRightPanel`

### `RightPanel`
- **File:** `components/right-panel.vue`
- **Purpose:** Slide-in panel fixed to the right side of the viewport with two tabs — Notifications (feed of `AppNotification` items with read/mark-all-read actions) and Assistant (stub chat UI). Also renders a toast notification overlay.
- **No props** — entirely driven by `useRightPanel` singleton state.

### `DevSwitcher`
- **File:** `components/DevSwitcher.vue`
- **Purpose:** Development-only overlay that lets engineers switch platform, user type, role, and (on eLeaseLoop) site country at runtime to preview different sidebar configurations and country-mismatch flows.

### `FloatingLabelInput`
- **File:** `components/ui/input/FloatingLabelInput.vue`
- **Purpose:** Text input with a floating label that sits on the top border — the standard input for all forms in the design system.
- **Props:** `modelValue`, `label` (required), `required?: boolean`, `type?`, `placeholder?`, `disabled?`, `class?`
- **Slots:** `#suffix` — renders an icon or element inside the right edge of the input
- **Emits:** `update:modelValue`
- **Height:** `h-[72px]`; border thickens to 1.5px on focus

### `FloatingLabelSelect`
- **File:** `components/ui/select/FloatingLabelSelect.vue`
- **Purpose:** Dropdown select with the same floating label, height, and border style as `FloatingLabelInput`. Wraps Reka UI `SelectRoot`/`SelectTrigger` primitives.
- **Props:** `modelValue`, `label` (required), `required?: boolean`, `placeholder?`, `disabled?`, `class?`
- **Slots:** `#trigger-prefix` — optional content rendered before the selected value (e.g. team avatar, country flag); default slot receives `SelectItem` children
- **Emits:** `update:modelValue`

### `StatusDot`
- **File:** `components/StatusDot.vue`
- **Purpose:** Shared status indicator — coloured dot + foreground label (see "Status dot + label" under UI patterns). Replaces the old tinted-pill status badges.
- **Props:** `label` (required), `dotClass` (required, e.g. `bg-green-500` / `bg-muted-foreground`), `pulse?: boolean` (adds an `animate-ping` halo for active states)

## Composables

### `useAppContext`
- **File:** `composables/useAppContext.ts`
- **Purpose:** Global singleton (via `useState`) holding the active `platform`, `userType`, and `role`. Drives sidebar content and permission checks.
- **Key exports:**
  - `context` — reactive `AppContext` (`platform`, `userType`, `role`)
  - `setPlatform`, `setUserType`, `setRole` — setters
  - `isPlatform`, `isUserType`, `isRole` — boolean helpers
  - `can(permission: Permission): boolean` — role-based permission check
  - `activeNav` — computed list of `NavItemId` for current platform × userType
  - `activeOrg` — computed list of `OrgItemId` for current platform × userType

### `useTeamContext`
- **File:** `composables/useTeamContext.ts`
- **Purpose:** Global singleton holding the teams the user belongs to, the active team, and (on eLeaseLoop) the active country and country-access state.
- **Key exports:**
  - `teams` — reactive `TeamSummary[]` scoped to the active country (eLeaseLoop) or platform (Fillit)
  - `allUserTeams` — all teams across all countries the user belongs to
  - `activeTeamId` — currently selected team ID
  - `activeTeam` — computed `TeamSummary | null`
  - `setActiveTeam(id: string)` — switches the active team
  - `activeCountry` — active ISO country code (eLeaseLoop only)
  - `userCountries` — countries where the user has active teams
  - `hasCountryAccess` — `true` when the user has at least one team in `activeCountry`
  - `setActiveCountry(code: string)` — switches country and resets active team
  - `createTeamInCountry(country, name)` — creates a fresh team with a predictable ID (`team-new-{country}` / `team-tenant-{country}`) that never matches mock API data, ensuring new teams start with empty pages

### `useRightPanel`
- **File:** `composables/useRightPanel.ts`
- **Purpose:** Module-level singleton (plain `ref`s, not `useState`) controlling the right panel's open/closed state, active tab, notification list, chat messages, and toast overlay. Notification seed data and assistant prompts/replies are role-aware — switching `userType` via the DevSwitcher swaps the feed automatically.
- **Key exports:**
  - `isOpen`, `activeTab` (`'notifications' | 'assistant'`), `notifications`, `messages`, `unreadCount`, `toastNotification`
  - `open(tab?)`, `close()`, `toggle(tab)` — panel visibility
  - `markRead(id)`, `markAllRead()` — notification read state
  - `pushNotification(n)` — adds a new notification and triggers a 5-second toast
  - `dismissToast()` — clears the toast immediately
  - `resetNotificationsForUserType(userType)` — swaps the notification feed to the landlord or tenant seed set
  - `clearMessages()` — resets the assistant chat history

### `usePayoutAccounts`
- **File:** `composables/usePayoutAccounts.ts`
- **Purpose:** Module-level singleton holding all payout account data, shared between the Payouts settings page and the Add Space form. Also holds a supplementary `masterSpaces` ref for within-session space additions that haven't yet been written to the JSON.
- **Key exports:**
  - `allAccounts: ref<PayoutAccount[]>` — reactive list of all payout accounts across all countries; mutated directly by the Payouts page (add, edit, remove, manage spaces)
  - `masterSpaces: ref<Record<string, …>>` — in-session supplement; starts empty; populated by `addToMasterSpaces` when a space is created without a page reload
  - `addToMasterSpaces(country, centreName, spaceName)` — registers a newly created space so the Manage Spaces dialog sees it immediately within the same session
- **Types exported:** `PayoutAccount`, `PayoutCentre`
- **Space assignment flow:** the Payouts page derives its `masterSpacesForCountry` from the live `/api/spaces` + `/api/teams` API data (fetched on mount) so it always reflects the JSON files. In-session additions are merged on top from `masterSpaces`. The Spaces page calls `addToMasterSpaces` after saving a new space so the Payouts page doesn't need a reload.

### `notifications.registry.ts`
- **File:** `composables/notifications.registry.ts`
- **Purpose:** Single source of truth for every notification event type the platform can produce. Exports `NotificationEventType` (union of string literals), per-event payload interfaces, and `NOTIFICATION_REGISTRY` mapping each type to its display label, body template, icon category, optional CTA label, Rails trigger location, and whether a corresponding email is sent.
- **Notification types by category:**

| Type | Recipient | Trigger |
|------|-----------|---------|
| `team.invitation_sent` | Invitee | Landlord/tenant invites a new user |
| `team.member_joined` | Team admins | Invited user accepts |
| `team.signatory_added` | Team admins | Signatory added to a centre |
| `booking_link.received` | **Tenant** | Landlord creates a booking link — *"New enquiry request from {centreName}"* with link to complete |
| `booking_link.completed` | **Landlord team** | Tenant completes the booking link enquiry |
| `booking_link.declined` | **Landlord team** | Tenant declines the booking link |
| `enquiry.received` | Landlord | Organic enquiry submitted |
| `enquiry.updated` | Landlord | Tenant updates enquiry |
| `enquiry.expired` | Landlord | Enquiry passes expiry date |
| `booking.confirmed` | Both | Booking moves to confirmed |
| `booking.ending_soon` | Both | 7 and 2 days before end date |
| `booking.ended` | Both | Booking end date passes |
| `booking.cancelled` | Both | Booking cancelled |
| `payment.received` | Landlord | Payment successfully charged |
| `payment.overdue` | Landlord | Payment past due date |
| `payment.refunded` | Landlord | Refund issued |
| `message.received` | Recipient | New message in thread |
| `document.awaiting_signature` | Signatory | DocuSign envelope sent |
| `document.signed` | Landlord | All signatures complete |
| `document.declined` | Landlord | Signatory declines |

## Data layer

All server routes are thin Nitro handlers that read from or write to JSON files in `server/data/`. There is no database — PUT routes mutate the JSON files directly.

| Method | Route | Data file | Description |
|--------|-------|-----------|-------------|
| GET | `/api/centres` | `server/data/centres.json` | Returns all centres |
| PUT | `/api/centres` | `server/data/centres.json` | Replaces the entire centres array |
| GET | `/api/spaces` | `server/data/spaces.json` | Returns all spaces |
| PUT | `/api/spaces` | `server/data/spaces.json` | Replaces the entire spaces array |
| GET | `/api/teams` | `server/data/teams.json` | Returns all teams |
| PUT | `/api/teams` | `server/data/teams.json` | Replaces the entire teams array |
| GET | `/api/booking-links` | `server/data/booking-links.json` | Returns all booking links; Rails endpoint TBD |
| GET | `/api/transactions` | `server/api/transactions.get.ts` | Returns mock transaction records; all booking refs are 5-digit numeric strings |
| GET | `/api/bookings` | `server/data/bookings.json` | 22 booking records on the redesigned booking-status taxonomy (below). Production-style nested shape: `landlord`, `tenant`, `space`(+centre), `enquiry`(pitch), `financials`, `payments[]`, `documents[]`, `docusign`, `managerApproval` (Nhood), `actions[]` audit trail, `notes`. Served by `server/api/bookings.get.ts` — valid JSON (no `//` comments) so it `JSON.parse`s directly. |

### Booking status taxonomy
Grounded in the production Fillit lifecycle (`for_review`/`for_acceptance`/`approved`/`confirmed`/`declined`/`cancelled`) but redesigned to separate three concerns production tangles into one string:
- **Lifecycle state** (stored): `enquiry` → `quoted` → `awaiting_signature` → `confirmed`, plus terminal `declined` / `cancelled`.
- **Temporal sub-state of `confirmed`** (derived from `period.from`/`period.to` vs today): `upcoming` / `active` (live now) / `completed`. Production never stores these.
- **Action ownership** (derived per viewer): `enquiry`→landlord, `quoted`/`awaiting_signature`→tenant. Drives an "Action needed" filter instead of production's role-swapping "Pending"/"Awaiting response" tabs.
Orthogonal flags carried as data, not states: `docusignStatus`, `paymentStatus`, `preConfirmed`, `approvalType` (`single`/`pay_stages`/`booking_link`), `managerApproval` (Nhood asset-manager sign-off).

## UI patterns

### Floating label inputs
All form text inputs use `FloatingLabelInput` and all dropdowns use `FloatingLabelSelect`. Both components position the label text on the top border of a `72px`-tall field. The label is rendered as an absolutely-positioned `<span>` with a `bg-background` fill so it sits over the border line. Never use raw `<Input>` + `<Label>` peer patterns.

### Button variants
- **Primary** (`<Button>` default) — filled coral, used for the one main action per page
- **Outline** (`variant="outline"`) — border + transparent, secondary actions
- **Ghost** (`variant="ghost"`) — no border/background, tertiary actions and cancel buttons
- **Destructive** (`variant="destructive"`) — destructive actions
- All labels use sentence case (e.g. "Save changes", "Invite user")

### Table header style
Column headers use `text-xs font-semibold uppercase tracking-wide text-muted-foreground`. Sortable columns wrap the label in a `<button>` with sort icons from Tabler (`IconSelector`, `IconChevronUp`, `IconChevronDown`).

### Filter / selector button style
All filter trigger buttons (date range picker, centre filter, team selector) use a consistent small-button style that matches `size="sm"` components:
```
class="flex h-8 w-fit items-center gap-2 rounded-lg border border-border bg-background px-3 text-xs font-medium text-foreground transition-colors hover:bg-muted"
```
Icons inside these triggers use `size=13` (leading icon) and `size=12` (chevron). **Do not use `h-9` or `text-sm` for filter buttons** — they will be taller than adjacent action buttons.

### Team selector dropdown pattern
Used wherever a team filter is needed. A `DropdownMenu` trigger using the filter button style above. Team avatar is a `h-5 w-5 rounded` square with the team's `color` and initial letter; "All teams" uses `IconUsersGroup`; chevron uses `IconChevronDown` with `rotate-180` when open.

### Date range picker
A `Popover` trigger (filter button style above) containing a `RangeCalendar` from `@/components/ui/range-calendar` with `:number-of-months="2"`. Value typed as `DateRange | undefined` from `reka-ui`; `CalendarDate` values are converted to ISO strings for filtering.

### Centre filter (multi-select)
A `Popover` trigger (filter button style) with a `w-[220px]` `PopoverContent` listing centre names as inline checkbox rows. `selectedCentreNames: ref<string[]>([])` tracks selection; `toggleCentre(name)` adds/removes. Label collapses to `"N centres"` when multiple selected. Available names are computed from the team-filtered data set so the list stays in sync with the active team. See `transactions.vue` and `booking-links.vue` for reference.

### Search (filter)
Pages with a search bar **filter** the list to matching rows: the `searchQuery` ref feeds a predicate into the page's displayed-rows computed (`filteredBookings` / `filteredTransactions` / `filteredLinks` / `sortedCentres` / `filteredSpaces`), so non-matching rows are excluded live as you type. Where present, a small "N results" / "No results" label sits beside the input, and the table's empty-results row explains when nothing matches. Searchable fields vary per page — bookings: id / tenant / contact / centre / space; transactions: booking ref / tenant; booking-links: tenant name / company / booking id; centres: name / city / centre id; spaces: name / id. Used on bookings, transactions, booking-links, centres, and spaces. (Replaced the earlier highlight-and-cycle pattern — `jumpToMatch`/`matchIndex`/`row-highlight`; the `row-search-pulse` keyframe now only powers the newly-added-row flash on `spaces.vue`.)

### Booking ID format
All booking IDs are 5-digit numeric strings (e.g. `"10042"`, `"11001"`). No prefixes (`FILL-`, `BK-`, `ELL-`). The column header is always "Booking ID".

### Status badges
`<Badge>` component with pill shape and light semantic background tints: green for active/success, muted pink for inactive, light blue for pending. Used by transactions/invoices/booking-links.

### Status dot + label (`StatusDot`)
The standard status treatment, via the shared `components/StatusDot.vue` component (`label`, `dotClass`, optional `pulse`): a small `h-2 w-2 rounded-full` coloured dot + a `text-sm font-medium text-foreground` label. Colour lives only in the dot (blue/amber/purple/green/sky/red, `bg-muted-foreground` for neutral/terminal states); the label stays foreground for a clean, restrained look. `pulse` adds a second pinging dot (`animate-ping`) for active/"Live now" states. Now used across bookings, booking-links, transactions (incl. the editable payment-status buttons), teams, centres, and spaces. **Preferred over tinted pills / `<Badge>` for all status UI** — each page maps its own status vocabulary to a `dotClass`.

### Booking detail CTAs (status- + role-driven)
The booking detail overlay footer shows actions driven by `detailActions(booking)` in `bookings/index.vue`, built on **action ownership** (`actionOwner`): the **primary** CTA is the action the *current viewer* owns; when the ball is with the other party there is no primary and a `detailWaitingHint` line explains the wait. CTAs are ordered with the primary last (right-most).

| Status | Landlord | Tenant |
|--------|----------|--------|
| `enquiry` | **Accept enquiry** · Decline · Message | Edit enquiry · Withdraw · Message — *waiting on the centre* |
| `quoted` | Send reminder · Edit terms · Cancel · Message — *waiting on tenant* | **Accept quote** · Decline · Message |
| `awaiting_signature` | Resend for signature · View lease · Cancel · Message — *waiting on tenant* | **Sign lease** · View lease · Cancel · Message |
| `confirmed` (upcoming/active) | View documents · Cancel (upcoming only) · Message | Download invoice · View documents · Cancel (upcoming only) · Message |
| `confirmed` + overdue | **Send payment reminder** (+ the above) | **Pay now** (+ the above) |
| `confirmed` (completed) | View documents · Message | Download invoice · View documents · Message |
| `declined` / `cancelled` | Message | Find another space · Message |

Rules: an overdue payment always surfaces a payment-focused primary (landlord chases, tenant pays) even on completed bookings; **Cancel** appears only for cancellable states (upcoming confirmed + open pipeline), never for active/completed/terminal; terminal states collapse to view/message.

### Dark mode
Handled entirely through CSS variable tokens in `assets/css/tailwind.css`. Semantic Tailwind classes (`bg-background`, `text-foreground`, etc.) adapt automatically under the `.dark` class. No `dark:` color prefixes are used in component templates.

### Overlays (always centered, never slide-over)
Information and detail views are shown in **centered modal overlays**, never a right-side slide-over — the right edge is reserved for the notifications/assistant `RightPanel`, so a slide-over would clash with it. The convention (see the Create booking overlay and the booking detail overlay): `Teleport to="body"` + `<Transition name="modal">` (opacity fade), a `bg-black/50` backdrop that closes on click, and a centered panel `relative z-10 flex w-full max-w-[…] flex-col rounded-xl border border-border bg-background shadow-2xl` with `style="max-height: 90vh"` and a `flex-1 overflow-y-auto` body between a shrink-0 header and footer.

### Non-dismissable dialogs
When a dialog must be completed before the user can continue (e.g. the "Assign unassigned spaces" overlay on the Payouts page), pass `:hide-close="true"` to `DialogContent` (suppresses the × button) and bind `:open` one-way with `@update:open="() => {}"` to block overlay-click dismissal. Only use this for mandatory gates — most dialogs should remain freely dismissable.

### Payout account — Manage Spaces pattern
The Manage Spaces dialog on the Payouts page uses a `draftSpaces: ref<Set<string>>` of `centreName::spaceName` keys as working state. On open the set is seeded from the account's current `centres` array. Custom `<button>` checkboxes (not Reka UI `Checkbox`) drive selection to avoid controlled-state sync issues. Centre headers show a partial/full state indicator (dash vs tick) and toggle all child spaces. On save, claimed spaces are stripped from other accounts to prevent duplicates; any spaces that end up in no account trigger the "Assign unassigned spaces" overlay, which is non-dismissable until every orphaned space is assigned. The master space list is derived from the live API (not hardcoded) so newly created spaces appear automatically.

### Messages inbox card pattern
Conversations have a `type` field (`'enquiry' | 'general' | 'booking'`) that drives avatar shape and line-layout:
- **Composite avatar** (enquiry / booking): 40×40 square main logo (centre) + 20×20 floating circle overlay (org logo), separated by `border-2 border-background`
- **Simple circle** (general): plain 40×40 circle
- **Three-line layout**: entity name → contextual detail (booking ID or person name) → message preview

Display varies by viewer role — see `getConvDisplay()` in `pages/preview/messages.vue` for the full mapping.

_Last updated: 2026-06-09_
