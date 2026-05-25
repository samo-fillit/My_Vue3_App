# Changelog

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
