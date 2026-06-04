# Fillit — Email Service

React Email component system for all Fillit transactional emails.
Built alongside the design lab so templates evolve in sync with the app.

## Stack

- [React Email](https://react.email) — component primitives and dev preview
- [Hono](https://hono.dev) — lightweight render server (POST /render → HTML + plain text)
- TypeScript with typed props per template

## Design system

Tokens in `src/tokens.ts` mirror the Nuxt app's CSS variables:

| Token | Value | Notes |
|-------|-------|-------|
| `colorPrimary` | `#ff637d` | Coral — CTAs only |
| `colorForeground` | `#111111` | Body text |
| `colorMuted` | `#6b7280` | Secondary text, footer |
| `colorSurface` | `#f9fafb` | Data card backgrounds |
| `fontFamily` | Inter → Arial fallback | @font-face injected in Layout |

## Commands

```bash
# Install
npm install

# Live preview (http://localhost:3001)
npm run dev

# Render server (http://localhost:3002)
npm run server

# Export static HTML to /dist
npm run export
```

## Render API

```
POST http://localhost:3002/render
Content-Type: application/json

{
  "template": "team-invite",
  "props": {
    "recipientName": "Sarah",
    "inviterName": "Carlos García",
    "teamName": "Nhood ES",
    "inviteUrl": "https://app.fillit.com/invite/abc123"
  }
}
```

Returns `{ html: string, text: string }`.

## Templates

| Email | Tag | Trigger |
|-------|-----|---------|
| `team-invite` | General (both brands) | Teams page → "Invite user" |
| `signatory-added` | eLeaseLoop | Teams page → centre signatories → "Add signatory" |

## Brand & language

Every email is tagged `fillit`, `eleaseloop`, or `general` (both) in
`src/registry.ts`. Each email is rendered per brand and per language:

- **Fillit** → English, Spanish
- **eLeaseLoop** → English, Spanish, French, Italian, Polish

`src/brand.ts` holds the per-brand theme (coral vs teal), logo and site;
`src/i18n.ts` holds the brand→locale map. Each email component (`src/emails/*`)
takes `{ brand, locale }`, pulls copy from its co-located translation table, and
themes itself from the brand config.

### Preview toggles

The sidebar is grouped **by brand** (`fillit/`, `eleaseloop/`) and then **by
email**, so each email shows once as a collapsible group (the brand is the
sidebar toggle). Language is switched **in the preview itself**: every email
renders a dev-only metadata card above it showing the **title**, a **context**
line, the **page it's triggered from**, the brand tag, and a **country/language
toggle** — clickable flag + language pills for every language the email exists
in. Clicking one re-renders the preview in that language.

Preview entries are auto-generated from the registry:

```bash
npm run generate   # writes src/templates/<brand>/<email>/<locale>.tsx
npm run dev        # regenerates, then starts the preview
```

## Adding a new email

1. Create `src/emails/your-email.tsx` — default export a component taking
   `{ brand, locale, preview, ...data }`, with a per-locale translation table.
2. Add its metadata (id, title, context, trigger, tag) to `src/registry.ts`.
3. Register it in `server.ts` for the render API.
4. `npm run generate && npm run dev` — variants appear in the sidebar.

## File structure

```
email-service/
  src/
    components/      # Shared building blocks (Layout, Header, Footer, Button,
                     #   Paragraph, Divider, DataCard, PreviewMeta)
    emails/          # Source emails — brand + locale aware, with translations
    templates/       # AUTO-GENERATED preview entries (<brand>/<email>-<locale>)
    brand.ts         # Brand themes, logos, sites, tag → brands
    i18n.ts          # Locales + brand → locale map
    registry.ts      # Email list + tags (single source of truth)
    tokens.ts        # Shared design tokens
  scripts/
    generate-previews.ts  # Emits the per-brand/locale preview files
  server.ts          # Hono render server (POST /render { template, props:{brand,locale,…} })
```
