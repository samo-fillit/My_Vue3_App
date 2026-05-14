# Fillit Design Lab

## Purpose
This is the design system and prototyping workspace for Fillit. The production codebase is separate and is currently being migrated to Vue 3. Components, tokens, and patterns built here are designed to port cleanly to production once that migration completes.

## What Fillit does
Fillit is a B2B SaaS platform for specialty leasing in shopping centres. It connects landlords (centre operators) with tenants (brands renting short-term spaces — pop-ups, sampling, marketing events, advertising, sales kiosks). The product automates the leasing process end-to-end: enquiries, contracts, payments, communications, and analytics. We're shifting toward an enterprise offering, so the platform is becoming more complex — analytics, CRM, booking management, messaging, and notifications are all in scope.

## Stack
- Nuxt 3 (Vue 3) with App Router
- TypeScript with `<script setup lang="ts">`
- Tailwind CSS v3 with CSS variables for theming
- shadcn-vue components in `components/ui/` (New York style, Reka UI primitives)
- Tabler icons via `@tabler/icons-vue` — NOT Lucide
- Inter font

## Design aesthetic
Clean, white, professional. Generous whitespace. Functional and confident — not flashy.

Design priorities, in order:
1. Clarity — content hierarchy is obvious, actions are unambiguous
2. Breathing room — pages can be long; cramping is worse than scrolling
3. Restraint — visual elements earn their place; decoration without function is removed
4. Speed of comprehension — users are professionals doing work, not browsing

Avoid: heavy borders, gratuitous shadows, decorative gradients, over-cardification, dense layouts, icons-for-decoration.

## Color usage rules
Our primary color is a coral pink. Use it sparingly:
- Primary CTAs only (Save, Submit, Next, Confirm — the one main action on a page)
- Active state indicators in navigation
- Brand marks
- Never for secondary actions, decoration, or general highlights

Secondary actions use outlined buttons (border + transparent background). Tertiary actions use ghost buttons or text links.

Use semantic tokens always: `bg-primary`, `text-primary`, `bg-background`, `text-foreground`, `border-border`, `bg-muted`, `text-muted-foreground`. Never use Tailwind's default color palette directly (no `bg-pink-500`, no `text-gray-700`, no `bg-white`). All values flow from CSS variables in `assets/css/tailwind.css`.

## Component conventions

### Vue patterns
- Composition API only — `<script setup lang="ts">`
- Single-file `.vue` components with kebab-case filenames
- PascalCase when used in templates (`<UserCard />`)
- Props via `defineProps` with TypeScript interfaces
- Use existing components in `components/ui/` before creating new ones
- Compose primitives — don't build monoliths

### shadcn-vue components
You have permission to install new shadcn-vue components as needed. Workflow:
1. Check `components/ui/` to see what's already installed
2. If a needed component is missing, run: `npx shadcn-vue@latest add [component-name]`
3. Import and use normally
4. Always prefer installing an existing shadcn component over building a custom one

Available components include: accordion, alert, avatar, badge, breadcrumb, button, calendar, card, checkbox, collapsible, combobox, command, context-menu, dialog, dropdown-menu, form, hover-card, input, label, menubar, navigation-menu, pagination, popover, progress, radio-group, resizable, scroll-area, select, separator, sheet, skeleton, slider, sonner (toast), switch, table, tabs, textarea, toggle, toggle-group, tooltip.

### Buttons
- Primary action per page uses default `<Button>` (filled coral)
- Secondary actions use `variant="outline"`
- Tertiary actions use `variant="ghost"`
- Destructive actions use `variant="destructive"`
- Sentence case for all button variants (e.g., "Invite user", "Remove", "Save changes", "Update password")

### Inputs
Our forms use **outlined inputs with floating labels** — this is distinctive and important to our look. The default shadcn-vue Input is a bottom-line style; we override it. When building forms:
- Use the existing `<Input>` and `<Label>` components
- Float the label inside the input border, top-left, with the asterisk for required fields
- Generous height (around `h-14`) to allow the floating label
- Border thickens slightly on focus, primary color on focus state

If our floating-label Input variant doesn't exist yet, ask before generating one — we'll likely customize the base Input component itself rather than make a parallel one.

### Status badges
Pill-shaped, light backgrounds, semantic colors:
- Active / success → green tint
- Inactive / muted → muted pink
- Pending → light blue
- Use `<Badge>` with appropriate variant or className

### Forms
- Section headings (e.g., "Personal Details") sit above the inputs without a card wrapper unless the form spans multiple columns
- Generous vertical spacing between fields (`gap-4` minimum, often `gap-6`)
- Submit button left-aligned at the bottom, primary variant
- Helper text muted, below section heading

### Navigation
- Sidebar nav uses Tabler icons + label
- Current page gets a soft `bg-muted` fill, no border
- Sub-navigation in account-style pages uses a left rail with the same pattern

## Layout principles
- Don't wrap every section in `<Card>`. Cards are for elevated/contained content (modals, key data, isolated forms). Most pages use the page itself as the surface.
- Use white space for hierarchy before reaching for borders or backgrounds
- Tables for tabular data — use `<Table>` from shadcn, generous row heights
- For multi-step flows, show a step indicator at the top (numbered circles + thin connector line)

## Tokens
All design tokens live in `assets/css/tailwind.css` as CSS variables. Reference them via Tailwind's semantic classes:
- `bg-background`, `text-foreground` — page surfaces
- `bg-card`, `text-card-foreground` — elevated surfaces
- `bg-primary`, `text-primary-foreground` — primary actions
- `bg-secondary`, `text-secondary-foreground` — secondary surfaces
- `bg-muted`, `text-muted-foreground` — quiet/helper content
- `bg-accent`, `text-accent-foreground` — accent surfaces
- `bg-destructive`, `text-destructive-foreground` — destructive actions
- `border-border` — borders
- `ring-ring` — focus rings

Never hardcode hex values, raw px values, or arbitrary Tailwind values without strong justification.

## Dark mode
Both light and dark modes are supported. Use semantic tokens; they automatically adapt. The `.dark` class block in `tailwind.css` handles the dark variants. Don't write `dark:` prefixed Tailwind classes for color — semantic tokens already handle that.

For visual properties that don't have a token (e.g., shadow opacity), use `dark:` prefixes carefully.

## Working with Figma context
- Designs come in via Figma node links pasted into prompts (Cmd+L in Figma copies a link)
- The MCP plugin doesn't reliably read selection state — always use explicit links
- For multi-screen flows, expect multiple links in one prompt
- When pulling from Figma, prefer existing components over generating new ones
- Match the design's intent and structure, not pixel-perfect positioning — translate into our component system

## Preview routes
Redesigns and prototypes live under `pages/preview/[name].vue`. Don't modify pages outside `pages/preview/` without explicit instruction. There's a `pages/preview/index.vue` that lists all in-progress designs.

## Brand voice
Direct, capable, confident — but not stiff. We help busy professionals do their jobs faster. Microcopy is short and imperative. Headlines are clear, not clever. We avoid jargon and corporate hedging. We don't use emoji in the UI. We use British or US English consistently within a feature (default to US English unless context indicates otherwise).

## Anti-patterns
Don't:
- Wrap every section in `<Card>`
- Use coral primary for anything other than the primary action on a page
- Hardcode colors, spacing, or radii — always use tokens
- Use Tailwind's default palette directly (`bg-blue-500`, `text-gray-700`)
- Generate custom components when shadcn-vue offers an equivalent
- Use Lucide icons — we use Tabler
- Use `<div @click>` for actions — use semantic `<button>`
- Add `dark:` color prefixes — semantic tokens handle dark mode
- Add inline styles
- Use emoji in UI
- Use the Options API (Composition API only)
- Cram content to fit a fold — long pages with breathing room are fine

## Examples of "good"
As we build out the design lab, this section will reference exemplar components:
- Button patterns: `components/ui/button/Button.vue`
- (Add more as built)

When you generate something new, match the rhythm and conventions of the closest existing component.
