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

**Org items** (`OrgItemId`): `account-profile`, `account-teams`, `account-centres`, `account-spaces`, `account-lease-info`, `account-payments`, `account-notifications`

| Platform | User type | Nav items | Org items |
|----------|-----------|-----------|-----------|
| fillit | landlord | dashboard, bookings, calendar, messages, create-link, transactions | profile, teams, centres, spaces, payments, notifications |
| fillit | tenant | dashboard, bookings, calendar, messages, invoices | profile, teams, lease-info, notifications |
| eleaseloop | landlord | dashboard, bookings, calendar, messages, create-link, transactions, **analytics**, **crm** | profile, teams, centres, spaces, payments, notifications |
| eleaseloop | tenant | dashboard, bookings, calendar, messages, invoices | profile, teams, lease-info, notifications |

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
| `/preview/spaces` | `pages/preview/spaces.vue` | Organisation — rentable spaces within centres |
| `/preview/payments` | `pages/preview/payments.vue` | Organisation — payout settings and bank details |
| `/preview/notifications-settings` | `pages/preview/notifications-settings.vue` | Organisation — notification preferences |
| `/preview/transactions` | `pages/preview/transactions.vue` | Transactions list with team filter, date range picker, and sortable table |

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
- **Purpose:** Development-only overlay that lets engineers switch platform, user type, and role at runtime to preview different sidebar configurations.

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
- **Purpose:** Global singleton holding the list of teams the user belongs to and the currently selected team. Seeded from mock data matching `server/data/teams.json`; in production this would come from the authenticated session.
- **Key exports:**
  - `teams` — reactive `TeamSummary[]` (`id`, `name`, `color`)
  - `activeTeamId` — currently selected team ID
  - `activeTeam` — computed `TeamSummary | null`
  - `setActiveTeam(id: string)` — switches the active team

### `useRightPanel`
- **File:** `composables/useRightPanel.ts`
- **Purpose:** Module-level singleton (plain `ref`s, not `useState`) controlling the right panel's open/closed state, active tab, notification list, chat messages, and toast overlay.
- **Key exports:**
  - `isOpen`, `activeTab` (`'notifications' | 'assistant'`), `notifications`, `messages`, `unreadCount`, `toastNotification`
  - `open(tab?)`, `close()`, `toggle(tab)` — panel visibility
  - `markRead(id)`, `markAllRead()` — notification read state
  - `pushNotification(n)` — adds a new notification and triggers a 5-second toast
  - `dismissToast()` — clears the toast immediately

### `notifications.registry.ts`
- **File:** `composables/notifications.registry.ts`
- **Purpose:** Single source of truth for every notification event type the platform can produce. Exports `NotificationEventType` (union of string literals), per-event payload interfaces, and `NOTIFICATION_REGISTRY` mapping each type to its display label, body template, icon category, optional CTA label, Rails trigger location, and whether a corresponding email is sent.

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

### Team selector dropdown pattern
Used wherever a team filter is needed. A `DropdownMenu` trigger with class `flex h-9 w-fit items-center gap-2 rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground`. Team avatar is a `h-5 w-5 rounded` square with the team's `color` and initial letter; "All teams" uses `IconUsersGroup`; chevron uses `IconChevronDown` with `rotate-180` when open.

### Date range picker
A `Popover` trigger (same button style as team selector) containing a `RangeCalendar` from `@/components/ui/range-calendar` with `:number-of-months="2"`. Value typed as `DateRange | undefined` from `reka-ui`; `CalendarDate` values are converted to ISO strings for filtering.

### Status badges
`<Badge>` component with pill shape and light semantic background tints: green for active/success, muted pink for inactive, light blue for pending.

### Dark mode
Handled entirely through CSS variable tokens in `assets/css/tailwind.css`. Semantic Tailwind classes (`bg-background`, `text-foreground`, etc.) adapt automatically under the `.dark` class. No `dark:` color prefixes are used in component templates.

_Last updated: 2026-05-25_
